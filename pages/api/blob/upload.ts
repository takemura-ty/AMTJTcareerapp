import type { NextApiRequest, NextApiResponse } from 'next'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(503).json({ error: 'BLOB_READ_WRITE_TOKEN が未設定です。Vercel Project Settings の Environment Variables に追加してください。' })
    }

    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'BLOB_READ_WRITE_TOKEN が未設定のため、ファイルをアップロードできません。' })
  }

  try {
    const body = req.body as HandleUploadBody
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        addRandomSuffix: true
      }),
      onUploadCompleted: async () => {
      }
    })

    return res.status(200).json(jsonResponse)
  } catch (error) {
    console.error('Blob upload token generation failed', error)
    return res.status(400).json({ error: 'Failed to generate upload token' })
  }
}