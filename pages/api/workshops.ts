import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteBlobIfNeeded } from '../../lib/blob'
import { createWorkshop, deleteWorkshop, getWorkshops } from '../../lib/repositories'
import { isSupabaseConfigured } from '../../lib/supabase'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (_req.method === 'GET') {
    const workshops = await getWorkshops()
    return res.status(200).json(workshops)
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase is not configured' })
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

  if (_req.method === 'DELETE') {
    const id = String(_req.query.id || '')
    if (!id) {
      return res.status(400).json({ error: 'id is required' })
    }

    try {
      const deleted = await deleteWorkshop(id)
      await deleteBlobIfNeeded(deleted?.pdfUrl)
      return res.status(200).json({ ok: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to delete workshop' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
