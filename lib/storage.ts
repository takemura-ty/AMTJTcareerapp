import { getSupabaseServerClient } from './supabase'

const STORAGE_BUCKET = 'career-files'
const STORAGE_PATH_PREFIXES = ['job-hunting-tips/', 'information-sessions/']

export function isSupabaseStorageUrl(url?: string | null) {
  return Boolean(getSupabaseStoragePath(url))
}

export function getSupabaseStoragePath(url?: string | null) {
  if (!url) return null
  if (STORAGE_PATH_PREFIXES.some((prefix) => url.startsWith(prefix))) return url

  const markers = [
    `/storage/v1/object/public/${STORAGE_BUCKET}/`,
    `/storage/v1/object/sign/${STORAGE_BUCKET}/`
  ]
  const marker = markers.find((candidate) => url.includes(candidate))
  return marker ? decodeURIComponent(url.split(marker)[1].split('?')[0]) : null
}

export async function createSignedStorageUrl(url?: string | null) {
  const path = getSupabaseStoragePath(url)
  if (!path) return url || undefined

  const supabase = getSupabaseServerClient()
  if (!supabase) return undefined

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 60 * 60)
  if (error) {
    console.error('Failed to create signed storage URL:', error)
    return undefined
  }

  return data.signedUrl
}

export async function deleteStorageFileIfNeeded(url?: string | null) {
  const path = getSupabaseStoragePath(url)
  const supabase = getSupabaseServerClient()
  if (!path || !supabase) {
    return
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  if (error) {
    throw error
  }
}