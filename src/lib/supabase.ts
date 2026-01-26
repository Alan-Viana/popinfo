import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndmnatfmwdqjyrvzvahc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kbW5hdGZtd2Rxanlydnp2YWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTg0NTMsImV4cCI6MjA4NDE3NDQ1M30.v2k6AUHC7Glm-C8GK0ej6I358mXC1e_P-bb4eXh-70Y'

const isValidSupabaseUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co')
  } catch {
    return false
  }
}

const isValidSupabaseKey = (key: string) => {
  return key && key.startsWith('ey')
}

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  isValidSupabaseUrl(supabaseUrl) &&
  isValidSupabaseKey(supabaseAnonKey)

if (supabaseUrl && !isValidSupabaseUrl(supabaseUrl)) {
  console.warn('⚠️ VITE_SUPABASE_URL inválida. Deve ser no formato: https://<project-ref>.supabase.co')
}

if (supabaseAnonKey && !isValidSupabaseKey(supabaseAnonKey)) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY inválida. A chave deve ser um JWT (começa com "ey...")')
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseEnabled = () => !!supabase
