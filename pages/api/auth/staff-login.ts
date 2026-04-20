import type { NextApiRequest, NextApiResponse } from 'next'
import { validateStaffLogin } from '../../../lib/repositories'
import { isSupabaseConfigured } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase is not configured' })
  }

  const { loginId, password } = req.body || {}
  if (!loginId || !password) {
    return res.status(400).json({ error: 'loginId and password are required' })
  }

  const isValid = await validateStaffLogin(String(loginId), String(password))
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  return res.status(200).json({ ok: true })
}