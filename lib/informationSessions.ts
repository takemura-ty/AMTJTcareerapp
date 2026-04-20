import { Workshop } from './data'

export type InformationSession = Workshop & {
  fileName?: string
  updatedAt?: string
}

export const INFORMATION_SESSIONS_STORAGE_KEY = 'amtjt_information_sessions'

export function mergeInformationSessions(base: Workshop[], saved: Partial<InformationSession>[] | null | undefined): InformationSession[] {
  const normalizedSaved = (saved || [])
    .filter((item): item is InformationSession => Boolean(item?.id && item?.title && item?.date && item?.pdfUrl))
    .map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date,
      pdfUrl: item.pdfUrl,
      fileName: item.fileName,
      updatedAt: item.updatedAt
    }))

  const savedIds = new Set(normalizedSaved.map((item) => item.id))
  const normalizedBase = base
    .filter((item) => !savedIds.has(item.id))
    .map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date,
      pdfUrl: item.pdfUrl
    }))

  return [...normalizedSaved, ...normalizedBase]
}

export function isImageAsset(url?: string) {
  if (!url) return false
  return /^data:image\//.test(url) || /\.(png|jpe?g|gif|webp|svg)$/i.test(url)
}