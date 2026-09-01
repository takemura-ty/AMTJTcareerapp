import type { User } from '@supabase/supabase-js'

const STUDENT_EMAIL = 'amtjt@class.toyoiryo.ac.jp'

export type UserRole = 'student' | 'staff'

export function getUserRole(user: User | null | undefined): UserRole | null {
  if (!user) return null
  if (user.email?.toLowerCase() === STUDENT_EMAIL) return 'student'
  return user.app_metadata?.role === 'staff' ? 'staff' : null
}