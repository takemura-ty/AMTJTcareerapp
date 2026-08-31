import type { NextApiRequest, NextApiResponse } from 'next'
import { clearStudentSessionCookie, createStudentSessionCookie, isValidStudentLogin } from '../../lib/studentAuth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { loginId, password } = req.body || {}
    if (!isValidStudentLogin(loginId, password)) {
      return res.status(401).json({ error: '学生IDまたはパスワードが正しくありません。' })
    }

    res.setHeader('Set-Cookie', createStudentSessionCookie())
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearStudentSessionCookie())
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Method not allowed' })
}