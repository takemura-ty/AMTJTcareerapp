import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseServerClient } from './supabase'
import { getUserRole, UserRole } from './userRole'

export async function requireApiRole(req: NextApiRequest, res: NextApiResponse, roles: UserRole[]) {
  const authorization = req.headers.authorization
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  const supabase = getSupabaseServerClient()
  if (!token || !supabase) {
    res.status(401).json({ error: 'ログインが必要です。' })
    return null
  }

  const { data, error } = await supabase.auth.getUser(token)
  const role = error ? null : getUserRole(data.user)
  if (!role || !roles.includes(role)) {
    res.status(403).json({ error: 'この操作を行う権限がありません。' })
    return null
  }

  return role
}