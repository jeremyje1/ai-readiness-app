/**
 * Database client utilities for Supabase
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js'

// Database client for server-side operations
export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Database client for client-side operations
export const clientDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default db
