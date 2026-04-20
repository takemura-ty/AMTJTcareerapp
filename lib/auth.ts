import { useEffect } from 'react'
import { NextRouter } from 'next/router'
import { getSupabaseBrowserClient } from './supabase-browser'

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
    let cancelled = false

    async function checkAuth() {
      const user = getStoredUser()

      if (!user?.authenticated || (role && user.role !== role)) {
        router.replace('/')
        return
      }

      if (role === 'staff') {
        try {
          const supabase = getSupabaseBrowserClient()
          const { data } = await supabase.auth.getSession()
          if (!cancelled && !data.session) {
            clearStoredUser()
            router.replace('/')
          }
        } catch {
          if (!cancelled) {
            clearStoredUser()
            router.replace('/')
          }
        }
      }
    }

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [router, role])
}