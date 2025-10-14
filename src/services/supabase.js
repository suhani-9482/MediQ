import { createClient } from '@supabase/supabase-js'

// Supabase configuration - set these in your Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey)

if (import.meta.env.PROD && !isSupabaseConfigured()) {
  console.error('⚠️ Supabase is not properly configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export default supabase


