import { useEffect } from 'react'
import { NextRouter } from 'next/router'
import { getSupabaseBrowserClient } from './supabase-browser'
import { getUserRole, UserRole } from './userRole'

export type { UserRole } from './userRole'

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

export function useRequireAuth(router: NextRouter, role?: UserRole | UserRole[]) {
  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase.auth.getSession()
        const currentRole = getUserRole(data.session?.user)
        const allowedRoles = role ? (Array.isArray(role) ? role : [role]) : undefined
        if (!cancelled && (!currentRole || (allowedRoles && !allowedRoles.includes(currentRole)))) {
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

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [router, role])
}