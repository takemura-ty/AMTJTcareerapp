import type { User } from '@supabase/supabase-js'

const STUDENT_EMAIL = 'amtjt@class.toyoiryo.ac.jp'
const STAFF_EMAIL = 'career@toyoiryo.ac.jp'

export type UserRole = 'student' | 'staff'

export function getUserRole(user: User | null | undefined): UserRole | null {
  if (!user) return null
  if (user.email?.toLowerCase() === STUDENT_EMAIL) return 'student'
  return user.email?.toLowerCase() === STAFF_EMAIL ? 'staff' : null
}