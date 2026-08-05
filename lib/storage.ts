import { getSupabaseServerClient } from './supabase'

const STORAGE_BUCKET = 'career-files'

export function isSupabaseStorageUrl(url?: string | null) {
  return Boolean(url && url.includes(`/storage/v1/object/public/${STORAGE_BUCKET}/`))
}

export async function deleteStorageFileIfNeeded(url?: string | null) {
  if (!isSupabaseStorageUrl(url)) {
    return
  }

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
  const path = url?.split(marker)[1]
  const supabase = getSupabaseServerClient()
  if (!path || !supabase) {
    return
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([decodeURIComponent(path)])
  if (error) {
    throw error
  }
}