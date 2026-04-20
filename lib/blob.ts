import { del } from '@vercel/blob'

export function isVercelBlobUrl(url?: string | null) {
  return Boolean(url && /blob\.vercel-storage\.com/.test(url))
}

export async function deleteBlobIfNeeded(url?: string | null) {
  if (!isVercelBlobUrl(url)) {
    return
  }

  await del(url as string)
}