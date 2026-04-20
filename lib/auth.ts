import { useEffect } from 'react'
import { NextRouter } from 'next/router'

export type UserRole = 'student' | 'staff'

type StoredUser = {
  role: UserRole
  authenticated: boolean
}

const STORAGE_KEY = 'amtjt_user'

export function setStoredUser(user: StoredUser) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function useRequireAuth(router: NextRouter, role?: UserRole) {
  useEffect(() => {
    const user = getStoredUser()
    if (!user?.authenticated || (role && user.role !== role)) {
      router.replace('/')
    }
  }, [router, role])
}