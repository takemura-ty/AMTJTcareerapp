import type { NextApiRequest, NextApiResponse } from 'next'
import * as XLSX from 'xlsx'
import { Report } from '../../lib/data'
import { getReports, importVisitReports, ReportImportRow } from '../../lib/repositories'
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
  const key = Object.keys(row).find((column) => normalizedNames.includes(normalizeHeader(column)))
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

function parseRows(buffer: Buffer) {
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
    const company = String(findValue(row, ['見学先名', '治療院名', '院名', '会社名'])).trim()
    const region = normalizePrefecture(String(findValue(row, ['所在地', '都道府県', '地域'])))
    const date = formatDate(findValue(row, ['見学日', '日付']))
    const major = parseMajor(String(findValue(row, ['学科名', '学科', '識別ID', '専攻'])).trim())

    if (!company || !region || !date || !major) {
      errors.push(`${index + 2} 行目: 見学先名、所在地、見学日、学科名を確認してください。`)
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
      advice: String(findValue(row, ['今後見学を希望する後輩へのアドバイス', 'アドバイス'])).trim()
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const reports = await getReports()
    return res.status(200).json(reports)
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isSupabaseConfigured() || !isSupabaseWriteConfigured()) {
    return res.status(503).json({ error: '報告書一覧の更新には Supabase の接続設定と SUPABASE_SERVICE_ROLE_KEY が必要です。' })
  }

  if (String(req.headers['x-report-type'] || '') !== 'visit') {
    return res.status(400).json({ error: '見学報告書のアップロード画面から実行してください。' })
  }

  try {
    const { reports, errors } = parseRows(await readRequestBody(req))
    const result = await importVisitReports(reports)
    return res.status(200).json({ total: reports.length + errors.length, ...result, errors })
  } catch (error) {
    if (error instanceof Error && error.message === 'FILE_TOO_LARGE') {
      return res.status(413).json({ error: 'ファイルサイズは4MB以下にしてください。' })
    }

    console.error('Failed to import reports', error)
    return res.status(500).json({ error: getErrorMessage(error) })
  }
}
