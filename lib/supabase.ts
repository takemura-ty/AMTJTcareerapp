import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseServerClient: SupabaseClient | null = null

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL
}

function getSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseKey())
}

export function getSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!supabaseServerClient) {
    supabaseServerClient = createClient(getSupabaseUrl() as string, getSupabaseKey() as string, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }

  return supabaseServerClient
}