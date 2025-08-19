import { createClient } from '@supabase/supabase-js'

// Sanitize environment variables to avoid hidden whitespace / newline issues
const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKeyRaw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrl = supabaseUrlRaw?.trim().replace(/\/$/, '')
const supabaseAnonKey = supabaseAnonKeyRaw?.trim()

// For server-side operations that need elevated privileges
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
if (!/^https:\/\//.test(supabaseUrl)) {
  console.warn('Supabase URL is missing https:// prefix – this may cause fetch failures:', supabaseUrl)
}
try {
  // Basic hostname validation; will throw if invalid
  new URL(supabaseUrl)
} catch (e) {
  console.error('Invalid NEXT_PUBLIC_SUPABASE_URL format; check for typos or whitespace:', supabaseUrl)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role - only initialize on server
export const supabaseAdmin = (() => {
  // Only initialize on server side
  if (typeof window !== 'undefined') {
    // We're on the client side, return null
    return null
  }
  
  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found - admin functions will not work')
    return null
  }
  return createClient(supabaseUrl, supabaseServiceKey)
})()
