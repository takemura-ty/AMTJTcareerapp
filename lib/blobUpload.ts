import { upload } from '@vercel/blob/client'

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

async function ensureBlobUploadReady() {
  const response = await fetch('/api/blob/upload')

  if (!response.ok) {
    try {
      const data = await response.json()
      throw new Error(data?.error || 'Vercel Blob の設定確認に失敗しました。')
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Vercel Blob の設定確認に失敗しました。')
    }
  }
}

export async function uploadToBlob(pathPrefix: string, file: File) {
  await ensureBlobUploadReady()
  const pathname = `${pathPrefix}/${Date.now()}-${sanitizeFilename(file.name)}`
  return upload(pathname, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/upload'
  })
}