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

// Additional proactive validation: Supabase project ref host pattern
try {
  const host = new URL(supabaseUrl).host // e.g. abcdefghijklmnopqrst.supabase.co
  const projectRef = host.split('.supabase.co')[0]
  if (!/^[a-z0-9]{20}$/.test(projectRef)) {
    console.error(
      '\n[Supabase Config Warning] The project ref extracted from NEXT_PUBLIC_SUPABASE_URL looks invalid:',
      `'${projectRef}'`,
      '\nExpected 20 lowercase alphanumeric chars (see Supabase project settings).',
      '\nThis can cause DNS errors (ERR_NAME_NOT_RESOLVED) and downstream 500s in auth/admin routes.',
      '\nUpdate NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to match the correct project.'
    )
  }
} catch (_) {
  // already logged above
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
