import type { NextApiRequest, NextApiResponse } from 'next'
import { requireApiRole } from '../../lib/apiAuth'
import { getLoginHistory, recordLogin } from '../../lib/loginHistory'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const role = await requireApiRole(req, res, ['student', 'staff'])
    if (!role) return

    try {
      await recordLogin(role)
      return res.status(204).end()
    } catch (error) {
      console.error('Failed to record login history:', error)
      return res.status(500).json({ error: 'ログイン履歴を保存できませんでした。' })
    }
  }

  if (req.method === 'GET') {
    if (!await requireApiRole(req, res, ['staff'])) return

    try {
      return res.status(200).json(await getLoginHistory())
    } catch (error) {
      console.error('Failed to load login history:', error)
      return res.status(500).json({ error: 'ログイン履歴を取得できませんでした。' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}