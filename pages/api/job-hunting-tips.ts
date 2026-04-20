import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteBlobIfNeeded } from '../../lib/blob'
import { deleteJobHuntingTip, getJobHuntingTips, upsertJobHuntingTip } from '../../lib/repositories'
import { defaultJobHuntingTips, JobHuntingTipKey } from '../../lib/jobHuntingTips'
import { isSupabaseConfigured } from '../../lib/supabase'

function getTipTitle(key: JobHuntingTipKey) {
  return defaultJobHuntingTips.find((tip) => tip.key === key)?.title || ''
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const tips = await getJobHuntingTips()
    return res.status(200).json(tips)
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase is not configured' })
  }

  if (req.method === 'POST') {
    const { key, pdfUrl, fileName } = req.body || {}
    if (!key || !pdfUrl) {
      return res.status(400).json({ error: 'key and pdfUrl are required' })
    }

    try {
      const tip = await upsertJobHuntingTip({
        key,
        title: getTipTitle(key),
        pdfUrl,
        fileName
      })
      return res.status(200).json(tip)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to save job hunting tip' })
    }
  }

  if (req.method === 'DELETE') {
    const key = String(req.query.key || '') as JobHuntingTipKey
    if (!key) {
      return res.status(400).json({ error: 'key is required' })
    }

    try {
      const deleted = await deleteJobHuntingTip(key)
      await deleteBlobIfNeeded(deleted?.pdfUrl)
      return res.status(200).json({ ok: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to delete job hunting tip' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}