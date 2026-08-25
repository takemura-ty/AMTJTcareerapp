import type { NextApiRequest, NextApiResponse } from 'next'
import * as XLSX from 'xlsx'
import { Report } from '../../lib/data'
import { getReports, importReports, ReportImportRow, ReportUpdate, updateReports } from '../../lib/repositories'
import { normalizePrefecture } from '../../lib/reportGroups'
import { isSupabaseConfigured, isSupabaseWriteConfigured } from '../../lib/supabase'

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

export const config = {
  api: {
    bodyParser: false
  }
}

type SpreadsheetRow = Record<string, unknown>

function normalizeHeader(value: string) {
  return value.replace(/[\s　]/g, '').replace(/[()（）]/g, '').trim()
}

function findValue(row: SpreadsheetRow, names: string[]) {
  const normalizedNames = names.map(normalizeHeader)
  const columns = Object.keys(row).map(column => ({ column, normalized: normalizeHeader(column) }))
  const key = normalizedNames
    .map(name => columns.find(column => column.normalized === name)?.column)
    .find(Boolean)
    || normalizedNames
      .map(name => columns.find(column => column.normalized.includes(name) || name.includes(column.normalized))?.column)
      .find(Boolean)
  const value = key ? row[key] : undefined
  return value === undefined || value === null ? '' : value
}

function formatDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parts = XLSX.SSF.parse_date_code(value)
    if (parts) {
      return `${parts.y}-${String(parts.m).padStart(2, '0')}-${String(parts.d).padStart(2, '0')}`
    }
  }

  const text = String(value || '').trim()
  const match = text.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)
  if (!match) {
    return ''
  }

  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
}

function parseMajor(value: string): Report['major'] | null {
  const normalized = value.toLowerCase().replace(/\s/g, '')
  if (normalized === 'shinkyu' || normalized.includes('鍼灸')) {
    return 'shinkyu'
  }
  if (normalized === 'judo' || normalized.includes('柔整') || normalized.includes('柔道整復')) {
    return 'judo'
  }
  return null
}

function parseRows(buffer: Buffer, type: Report['type']) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) {
    throw new Error('シートが見つかりません。')
  }

  const rows = XLSX.utils.sheet_to_json<SpreadsheetRow>(sheet, { defval: '', raw: true })
  if (!rows.length) {
    throw new Error('データ行が見つかりません。')
  }

  const reports: ReportImportRow[] = []
  const errors: string[] = []

  rows.forEach((row, index) => {
    const company = String(findValue(row, ['見学先名', '面接先名', '治療院名', '院名', '会社名'])).trim()
    const region = normalizePrefecture(String(findValue(row, ['所在地', '都道府県', '地域'])))
    const date = formatDate(findValue(row, ['見学日', '面接日', '日付']))
    const major = parseMajor(String(findValue(row, ['学科名', '学科', '識別ID', '専攻'])).trim())

    if (!company || !region || !date || !major) {
      const missingFields = [
        !company ? '施設名' : '',
        !date ? '日付' : '',
        !region ? '所在地' : '',
        !major ? '学科名' : ''
      ].filter(Boolean)
      errors.push(`${index + 2} 行目: ${missingFields.join('、')}を確認してください。`)
      return
    }

    reports.push({
      company,
      subCompany: undefined,
      region,
      city: String(findValue(row, ['市町村', '市区町村', '市区'])).trim(),
      date,
      major,
      supervisorImpression: String(findValue(row, ['院長先生や見学担当者の方の印象', '院長の印象', '院長・責任者の印象'])).trim(),
      staffImpression: String(findValue(row, ['スタッフの印象'])).trim(),
      clinicImpression: String(findValue(row, ['院全体の印象', '治療院の印象', '院内の印象'])).trim(),
      otherNotes: String(findValue(row, ['その他（印象に残ったことなど）', 'その他', 'その他の感想'])).trim(),
      interviewWish: String(findValue(row, ['面接希望（３年生のみ）（１.２年生は希望者のみ）', '面接希望'])).trim(),
      advice: String(findValue(row, ['今後面接を希望する後輩へのアドバイス', '今後見学を希望する後輩へのアドバイス', 'アドバイス'])).trim(),
      interviewerCount: String(findValue(row, ['面接官の人数', '面接官数'])).trim(),
      interviewer: String(findValue(row, ['面接担当者', '面接官'])).trim(),
      examContents: String(findValue(row, ['試験内容'])).trim(),
      questionsAsked: String(findValue(row, ['質問を受けた内容', '質問内容'])).trim(),
      writtenPracticalExam: String(findValue(row, ['筆記試験・実技試験があった場合その内容', '筆記試験実技試験があった場合その内容', '筆記試験', '実技試験'])).trim(),
      result: String(findValue(row, ['結果'])).trim(),
      resultNotification: String(findValue(row, ['結果が後日の場合、いつどのような形で届くのか', '結果が後日の場合いつどのような形で届くのか', '結果通知'])).trim()
    })
  })

  return { reports, errors }
}

async function readRequestBody(req: NextApiRequest) {
  const chunks: Buffer[] = []
  let totalBytes = 0

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    totalBytes += buffer.length
    if (totalBytes > MAX_UPLOAD_BYTES) {
      throw new Error('FILE_TOO_LARGE')
    }
    chunks.push(buffer)
  }

  return Buffer.concat(chunks)
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    const missingColumn = error.message.match(/Could not find the '([^']+)' column of 'reports'/)
    if (missingColumn) {
      return `Supabase の reports テーブルに ${missingColumn[1]} 列がありません。SQL Editor で supabase/schema.sql の reports 列追加 SQL を実行してください。`
    }

    return error.message
  }

  return '報告書一覧を更新できませんでした。'
}

function parseReportUpdate(value: unknown): ReportUpdate {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('更新内容を確認してください。')
  }

  const source = value as Record<string, unknown>
  const textFields = [
    'company', 'region', 'city', 'date', 'supervisorImpression', 'staffImpression',
    'clinicImpression', 'otherNotes', 'interviewWish', 'advice', 'interviewerCount',
    'interviewer', 'examContents', 'questionsAsked', 'writtenPracticalExam',
    'result', 'resultNotification'
  ] as const
  const update: Record<string, string> = {}

  for (const field of textFields) {
    if (field in source) {
      if (typeof source[field] !== 'string') {
        throw new Error('更新内容を確認してください。')
      }
      update[field] = source[field].trim()
    }
  }

  if ('major' in source) {
    if (source.major !== 'shinkyu' && source.major !== 'judo') {
      throw new Error('学科を確認してください。')
    }
    update.major = source.major
  }

  if ('company' in update && !update.company) {
    throw new Error('治療院名を入力してください。')
  }
  if ('region' in update && !update.region) {
    throw new Error('都道府県を入力してください。')
  }
  if ('date' in update && !/^\d{4}-\d{2}-\d{2}$/.test(update.date)) {
    throw new Error('日付を確認してください。')
  }

  return update as ReportUpdate
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const reports = await getReports()
    return res.status(200).json(reports)
  }

  if (req.method === 'PATCH') {
    if (!isSupabaseConfigured() || !isSupabaseWriteConfigured()) {
      return res.status(503).json({ error: '報告書の編集には Supabase の接続設定と SUPABASE_SERVICE_ROLE_KEY が必要です。' })
    }

    try {
      const body = JSON.parse((await readRequestBody(req)).toString('utf8')) as { ids?: unknown, update?: unknown }
      if (!Array.isArray(body.ids) || !body.ids.length || !body.ids.every(id => typeof id === 'string')) {
        throw new Error('更新対象の報告書を確認してください。')
      }

      const reports = await updateReports(body.ids, parseReportUpdate(body.update))
      return res.status(200).json(reports)
    } catch (error) {
      return res.status(400).json({ error: getErrorMessage(error) })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isSupabaseConfigured() || !isSupabaseWriteConfigured()) {
    return res.status(503).json({ error: '報告書一覧の更新には Supabase の接続設定と SUPABASE_SERVICE_ROLE_KEY が必要です。' })
  }

  const reportType = String(req.headers['x-report-type'] || '')
  if (reportType !== 'visit' && reportType !== 'interview') {
    return res.status(400).json({ error: '見学または面接報告書のアップロード画面から実行してください。' })
  }

  try {
    const { reports, errors } = parseRows(await readRequestBody(req), reportType)
    const result = await importReports(reports, reportType)
    return res.status(200).json({ total: reports.length + errors.length, ...result, errors })
  } catch (error) {
    if (error instanceof Error && error.message === 'FILE_TOO_LARGE') {
      return res.status(413).json({ error: 'ファイルサイズは4MB以下にしてください。' })
    }

    console.error('Failed to import reports', error)
    return res.status(500).json({ error: getErrorMessage(error) })
  }
}
