import type { NextApiRequest, NextApiResponse } from 'next'
import { list } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

function getBlobTokenErrorMessage() {
  const isVercelRuntime = Boolean(process.env.VERCEL || process.env.VERCEL_ENV)

  if (isVercelRuntime) {
    return 'BLOB_READ_WRITE_TOKEN が未設定です。Vercel Project Settings の Environment Variables に追加し、再デプロイしてください。'
  }

  return 'BLOB_READ_WRITE_TOKEN が未設定です。ローカル確認中なら .env.local に追加し、開発サーバーを再起動してください。'
}

async function getBlobConfigurationError() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return getBlobTokenErrorMessage()
  }

  try {
    await list({ limit: 1 })
    return null
  } catch (error) {
    console.error('Vercel Blob token validation failed', error)
    return 'BLOB_READ_WRITE_TOKEN が無効か、このVercel Blobストアにアクセスできません。Vercel Blobで発行したRead/Write Tokenを設定し、再デプロイしてください。'
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const configurationError = await getBlobConfigurationError()
  if (configurationError) {
    return res.status(503).json({ error: configurationError })
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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