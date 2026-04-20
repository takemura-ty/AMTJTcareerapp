import { Report, reports as mockReports, Workshop, workshops as mockWorkshops } from './data'
import { defaultJobHuntingTips, JobHuntingTip, JobHuntingTipKey, mergeJobHuntingTips } from './jobHuntingTips'
import { getSupabaseServerClient, isSupabaseConfigured } from './supabase'

type ReportRow = {
  id: string
  company: string
  sub_company: string | null
  region: string
  type: Report['type']
  date: string
  major: Report['major']
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

function mapReportRow(row: ReportRow): Report {
  return {
    id: row.id,
    company: row.company,
    subCompany: row.sub_company || undefined,
    region: row.region,
    type: row.type,
    date: row.date,
    major: row.major
  }
}

function mapWorkshopRow(row: WorkshopRow): Workshop {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    pdfUrl: row.pdf_url || undefined,
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
    return mockReports
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return mockReports
  }

  const { data, error } = await supabase
    .from('reports')
    .select('id, company, sub_company, region, type, date, major')
    .order('date', { ascending: false })

  if (error || !data) {
    console.error('Failed to fetch reports from Supabase:', error)
    return mockReports
  }

  return data.map(mapReportRow)
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

  return data.map(mapWorkshopRow)
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