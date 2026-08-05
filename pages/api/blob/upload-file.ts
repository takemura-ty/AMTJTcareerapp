import type { NextApiRequest, NextApiResponse } from 'next'
import { put } from '@vercel/blob'

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'BLOB_READ_WRITE_TOKEN が未設定です。' })
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
    const blob = await put(`${pathPrefix}/${Date.now()}-${filename}`, body, {
      access: 'public',
      contentType
    })
    return res.status(200).json({ url: blob.url })
  } catch (error) {
    if (error instanceof Error && error.message === 'FILE_TOO_LARGE') {
      return res.status(413).json({ error: 'ファイルサイズは4MB以下にしてください。' })
    }

    console.error('Blob file upload failed', error)
    return res.status(500).json({ error: 'Vercel Blobへのファイル保存に失敗しました。' })
  }
}