'use client'

import { createBrowserClient } from '@supabase/ssr'

// CACHE BUST: Force new chunk generation - October 4, 2025 12:57 PM
// This is a critical fix to break Vercel's persistent cache issue
// Build ID: ${Date.now()} - ${Math.random()}
const CACHE_BUST_VERSION = 'v4-force-new-chunks-1759600700'
const BUILD_MARKER = `BUILD_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

let browserClient: ReturnType<typeof createBrowserClient> | null = null
let cacheBustLogged = false

export function createBrowserSupabaseClient() {
    if (browserClient) {
        return browserClient
    }

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && !cacheBustLogged) {
        console.log(`[CACHE BUST] Supabase Client Init: ${CACHE_BUST_VERSION} - ${BUILD_MARKER}`)
        cacheBustLogged = true
    }

    browserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                flowType: 'pkce',
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storageKey: 'sb-aiblueprint-auth-token',
            },
        }
    )

        ; (browserClient as any).__BUILD_MARKER__ = BUILD_MARKER

    return browserClient
}

export function createClient() {
    return createBrowserSupabaseClient()
}
