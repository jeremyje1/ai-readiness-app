/**
 * Server-only Supabase Admin Client
 * This file should only be imported in server-side code or API routes
 * @server-only
 */

import { createClient } from '@supabase/supabase-js'
import 'server-only'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder') || SUPABASE_URL.includes('example')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required and must be a real Supabase project URL')
}

if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY.includes('placeholder')) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY appears to be missing or invalid.')
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
}

// Validate that it looks like a valid service role key
// Legacy format: JWT (eyJ...)
// Current format: sb_secret_... or sbp_...
const isValidFormat = SUPABASE_SERVICE_KEY.startsWith('eyJ') ||
    SUPABASE_SERVICE_KEY.startsWith('sb_secret_') ||
    SUPABASE_SERVICE_KEY.startsWith('sbp_')

if (!isValidFormat) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY appears to have an unexpected format.')
    console.warn('Expected: JWT (eyJ...), sb_secret_..., or sbp_...')
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be a valid service role key')
}

// Singleton admin client with service role key
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Helper function for creating admin clients with specific configs
export const createAdminClient = (options?: {
    autoRefreshToken?: boolean
    persistSession?: boolean
}) => {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
            autoRefreshToken: options?.autoRefreshToken ?? false,
            persistSession: options?.persistSession ?? false
        }
    })
}