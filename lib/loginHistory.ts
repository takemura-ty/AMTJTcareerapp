import { UserRole } from './userRole'
import { getSupabaseServerClient } from './supabase'

export type LoginHistoryEntry = {
  id: string
  role: UserRole
  logged_in_at: string
}

export async function recordLogin(role: UserRole) {
  const supabase = getSupabaseServerClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { error } = await supabase.from('login_history').insert({ role })
  if (error) throw error
}

export async function getLoginHistory() {
  const supabase = getSupabaseServerClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('login_history')
    .select('id, role, logged_in_at')
    .order('logged_in_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return (data || []) as LoginHistoryEntry[]
}