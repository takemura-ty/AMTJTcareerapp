import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteStorageFileIfNeeded } from '../../lib/storage'
import { createWorkshop, deleteWorkshop, getWorkshops, updateWorkshop } from '../../lib/repositories'
import { isSupabaseConfigured, isSupabaseWriteConfigured } from '../../lib/supabase'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (_req.method === 'GET') {
    const workshops = await getWorkshops()
    return res.status(200).json(workshops)
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: 'NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。' })
  }

  if (!isSupabaseWriteConfigured()) {
    return res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY が未設定のため、INFORMATION SESSION を保存できません。' })
  }

  if (_req.method === 'POST') {
    const { title, date, pdfUrl, fileName } = _req.body || {}
    if (!title || !date || !pdfUrl) {
      return res.status(400).json({ error: 'title, date and pdfUrl are required' })
    }

    try {
      const workshop = await createWorkshop({ title, date, pdfUrl, fileName })
      return res.status(200).json(workshop)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to create workshop' })
    }
  }

  if (_req.method === 'PATCH') {
    const id = String(_req.query.id || '')
    const { title, date } = _req.body || {}
    if (!id || !title || !date) {
      return res.status(400).json({ error: 'id, title and date are required' })
    }

    try {
      const workshop = await updateWorkshop(id, { title, date })
      return res.status(200).json(workshop)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to update workshop' })
    }
  }

  if (_req.method === 'DELETE') {
    const id = String(_req.query.id || '')
    if (!id) {
      return res.status(400).json({ error: 'id is required' })
    }

    try {
      const deleted = await deleteWorkshop(id)
      await deleteStorageFileIfNeeded(deleted?.pdfUrl)
      return res.status(200).json({ ok: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to delete workshop' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
