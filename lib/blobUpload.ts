import { upload } from '@vercel/blob/client'

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

export async function uploadToBlob(pathPrefix: string, file: File) {
  const pathname = `${pathPrefix}/${Date.now()}-${sanitizeFilename(file.name)}`
  return upload(pathname, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/upload'
  })
}