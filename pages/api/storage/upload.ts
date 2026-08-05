import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseServerClient, isSupabaseWriteConfigured } from '../../../lib/supabase'

const STORAGE_BUCKET = 'career-files'
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const ALLOWED_PATH_PREFIXES = new Set(['job-hunting-tips', 'information-sessions'])
const ALLOWED_CONTENT_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif'
])

export const config = {
  api: {
    bodyParser: false
  }
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(isSupabaseWriteConfigured() ? 200 : 503).json(
      isSupabaseWriteConfigured()
        ? { ok: true }
        : { error: 'SUPABASE_SERVICE_ROLE_KEY が未設定です。' }
    )
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isSupabaseWriteConfigured()) {
    return res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY が未設定です。' })
  }

  const pathPrefix = String(req.headers['x-upload-path-prefix'] || '')
  const encodedFileName = String(req.headers['x-file-name'] || '')
  const contentType = String(req.headers['content-type'] || '').split(';')[0]

  if (!ALLOWED_PATH_PREFIXES.has(pathPrefix) || !encodedFileName || !ALLOWED_CONTENT_TYPES.has(contentType)) {
    return res.status(400).json({ error: 'アップロードするファイルまたは保存先が正しくありません。' })
  }

  try {
    const body = await readRequestBody(req)
    const filename = sanitizeFilename(decodeURIComponent(encodedFileName))
    const path = `${pathPrefix}/${Date.now()}-${filename}`
    const supabase = getSupabaseServerClient()
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }

    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, body, {
      contentType,
      upsert: false
    })
    if (error) {
      throw error
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    return res.status(200).json({ url: data.publicUrl })
  } catch (error) {
    if (error instanceof Error && error.message === 'FILE_TOO_LARGE') {
      return res.status(413).json({ error: 'ファイルサイズは4MB以下にしてください。' })
    }

    console.error('Supabase Storage upload failed', error)
    return res.status(500).json({ error: 'Supabase Storageへのファイル保存に失敗しました。バケット設定を確認してください。' })
  }
}