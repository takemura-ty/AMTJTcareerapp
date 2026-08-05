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
  const response = await fetch('/api/blob/upload-file', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'x-file-name': encodeURIComponent(file.name),
      'x-upload-path-prefix': pathPrefix
    },
    body: file
  })

  if (!response.ok) {
    try {
      const data = await response.json()
      throw new Error(data?.error || 'ファイルのアップロードに失敗しました。')
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('ファイルのアップロードに失敗しました。')
    }
  }

  return response.json() as Promise<{ url: string }>
}