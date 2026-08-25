import { Report, Workshop, workshops as mockWorkshops } from './data'
import { defaultJobHuntingTips, JobHuntingTip, JobHuntingTipKey, mergeJobHuntingTips } from './jobHuntingTips'
import { normalizePrefecture } from './reportGroups'
import { getSupabaseServerClient, isSupabaseConfigured } from './supabase'

type ReportRow = {
  id: string
  company: string
  sub_company: string | null
  region: string
  city: string | null
  type: Report['type']
  date: string
  major: Report['major']
  updated_at: string | null
  supervisor_impression: string | null
  staff_impression: string | null
  clinic_impression: string | null
  other_notes: string | null
  interview_wish: string | null
  advice: string | null
}

type WorkshopRow = {
  id: string
  title: string
  date: string
  pdf_url: string | null
  file_name: string | null
  updated_at: string | null
}

type JobHuntingTipRow = {
  key: JobHuntingTipKey
  title: string
  blob_url: string | null
  file_name: string | null
  updated_at: string | null
}

const mockWorkshopKeys = new Set([
  '最新治療事例|2026-06-01',
  '治療技術セミナー|2026-05-10',
  '就職対策講座|2026-03-15'
])

function mapReportRow(row: ReportRow): Report {
  return {
    id: row.id,
    company: row.company,
    subCompany: row.sub_company || undefined,
    region: normalizePrefecture(row.region),
    city: row.city || undefined,
    type: row.type,
    date: row.date,
    major: row.major,
    updatedAt: row.updated_at || undefined,
    supervisorImpression: row.supervisor_impression || undefined,
    staffImpression: row.staff_impression || undefined,
    clinicImpression: row.clinic_impression || undefined,
    otherNotes: row.other_notes || undefined,
    interviewWish: row.interview_wish || undefined,
    advice: row.advice || undefined
  }
}

function mapWorkshopRow(row: WorkshopRow): Workshop {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    pdfUrl: row.pdf_url?.startsWith('/pdfs/') ? undefined : row.pdf_url || undefined,
    fileName: row.file_name || undefined,
    updatedAt: row.updated_at || undefined
  }
}

function mapJobHuntingTipRow(row: JobHuntingTipRow): JobHuntingTip {
  return {
    key: row.key,
    title: row.title,
    pdfUrl: row.blob_url || undefined,
    fileName: row.file_name || undefined,
    updatedAt: row.updated_at || undefined
  }
}

export async function getReports() {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('reports')
    .select('id, company, sub_company, region, city, type, date, major, updated_at, supervisor_impression, staff_impression, clinic_impression, other_notes, interview_wish, advice')
    .order('date', { ascending: false })

  if (error || !data) {
    console.error('Failed to fetch reports from Supabase:', error)
    return []
  }

  return data.map(mapReportRow)
}

export type ReportImportRow = Omit<Report, 'id' | 'type' | 'updatedAt'>

export type ReportImportResult = {
  inserted: number
  skipped: number
}

export async function importVisitReports(reports: ReportImportRow[]): Promise<ReportImportResult> {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data: existingReports, error: selectError } = await supabase
    .from('reports')
    .select('company, date, major')
    .eq('type', 'visit')

  if (selectError) {
    throw selectError
  }

  const reportKey = (report: Pick<Report, 'company' | 'date' | 'major'>) => `${report.company}\u0000${report.date}\u0000${report.major}`
  const existingKeys = new Set((existingReports || []).map(reportKey))
  const newReports = reports.filter((report) => {
    const key = reportKey(report)
    if (existingKeys.has(key)) {
      return false
    }
    existingKeys.add(key)
    return true
  })

  if (!newReports.length) {
    return { inserted: 0, skipped: reports.length }
  }

  const updatedAt = new Date().toISOString()
  const rows = newReports.map((report) => ({
    id: crypto.randomUUID(),
    company: report.company,
    sub_company: null,
    region: report.region,
    city: report.city || null,
    type: 'visit',
    date: report.date,
    major: report.major,
    updated_at: updatedAt,
    supervisor_impression: report.supervisorImpression || null,
    staff_impression: report.staffImpression || null,
    clinic_impression: report.clinicImpression || null,
    other_notes: report.otherNotes || null,
    interview_wish: report.interviewWish || null,
    advice: report.advice || null
  }))

  const { error: insertError } = await supabase.from('reports').insert(rows)
  if (insertError) {
    throw insertError
  }

  return { inserted: rows.length, skipped: reports.length - rows.length }
}

export async function getWorkshops() {
  if (!isSupabaseConfigured()) {
    return mockWorkshops
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return mockWorkshops
  }

  const { data, error } = await supabase
    .from('workshops')
    .select('id, title, date, pdf_url, file_name, updated_at')
    .order('date', { ascending: false })

  if (error || !data) {
    console.error('Failed to fetch workshops from Supabase:', error)
    return mockWorkshops
  }

  return data
    .map(mapWorkshopRow)
    .filter((workshop) => !mockWorkshopKeys.has(`${workshop.title}|${workshop.date}`))
}

export async function createWorkshop(input: { title: string; date: string; pdfUrl: string; fileName?: string }) {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const row = {
    id: crypto.randomUUID(),
    title: input.title,
    date: input.date,
    pdf_url: input.pdfUrl,
    file_name: input.fileName || null,
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('workshops')
    .insert(row)
    .select('id, title, date, pdf_url, file_name, updated_at')
    .single()

  if (error || !data) {
    throw error || new Error('Failed to create workshop')
  }

  return mapWorkshopRow(data)
}

export async function updateWorkshop(id: string, input: { title: string; date: string }) {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase
    .from('workshops')
    .update({
      title: input.title,
      date: input.date,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('id, title, date, pdf_url, file_name, updated_at')
    .single()

  if (error || !data) {
    throw error || new Error('Failed to update workshop')
  }

  return mapWorkshopRow(data)
}

export async function deleteWorkshop(id: string) {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase
    .from('workshops')
    .delete()
    .eq('id', id)
    .select('id, title, date, pdf_url, file_name, updated_at')
    .single()

  if (error) {
    throw error
  }

  return data ? mapWorkshopRow(data) : null
}

export async function getJobHuntingTips() {
  if (!isSupabaseConfigured()) {
    return defaultJobHuntingTips
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return defaultJobHuntingTips
  }

  const { data, error } = await supabase
    .from('job_hunting_tips')
    .select('key, title, blob_url, file_name, updated_at')

  if (error || !data) {
    console.error('Failed to fetch job hunting tips from Supabase:', error)
    return defaultJobHuntingTips
  }

  return mergeJobHuntingTips(data.map(mapJobHuntingTipRow))
}

export async function upsertJobHuntingTip(input: { key: JobHuntingTipKey; title: string; pdfUrl: string; fileName?: string }) {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const row = {
    key: input.key,
    title: input.title,
    blob_url: input.pdfUrl,
    file_name: input.fileName || null,
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('job_hunting_tips')
    .upsert(row, { onConflict: 'key' })
    .select('key, title, blob_url, file_name, updated_at')
    .single()

  if (error || !data) {
    throw error || new Error('Failed to upsert job hunting tip')
  }

  return mapJobHuntingTipRow(data)
}

export async function deleteJobHuntingTip(key: JobHuntingTipKey) {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase
    .from('job_hunting_tips')
    .delete()
    .eq('key', key)
    .select('key, title, blob_url, file_name, updated_at')
    .single()

  if (error) {
    throw error
  }

  return data ? mapJobHuntingTipRow(data) : null
}