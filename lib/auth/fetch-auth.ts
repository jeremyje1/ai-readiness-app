'use client'

import { createClient } from '@/lib/supabase/browser-client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

let fetchPatched = false
let cachedAccessToken: string | null = null
let cachedRefreshToken: string | null = null

function isRelativeRequest(input: RequestInfo | URL): boolean {
    if (typeof input === 'string') {
        return input.startsWith('/') || input.startsWith(window.location.origin)
    }

    if (input instanceof URL) {
        return input.origin === window.location.origin
    }

    const url = input.url
    return url.startsWith('/') || url.startsWith(window.location.origin)
}

export function ensureAuthFetchPatched() {
    if (typeof window === 'undefined' || fetchPatched) {
        return
    }

    const supabase = createClient()

    const updateTokens = (session: Session | null) => {
        cachedAccessToken = session?.access_token ?? null
        cachedRefreshToken = session?.refresh_token ?? null
    }

    type SessionResponse = Awaited<ReturnType<typeof supabase.auth.getSession>>

    supabase.auth.getSession().then((response: SessionResponse) => {
        updateTokens(response.data.session ?? null)
    })

    supabase.auth.onAuthStateChange((_: AuthChangeEvent, session: Session | null) => {
        updateTokens(session)
    })

    const originalFetch = window.fetch.bind(window)

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        if (!isRelativeRequest(input)) {
            return originalFetch(input as any, init)
        }

        const requestInit: RequestInit = init ? { ...init } : {}

        if (!cachedAccessToken) {
            try {
                const { data } = await supabase.auth.getSession()
                updateTokens(data.session ?? null)
            } catch (error) {
                console.warn('[AuthFetch] Failed to refresh session before request', error)
            }
        }

        const headers = new Headers(requestInit.headers || (input instanceof Request ? input.headers : undefined) || undefined)

        if (cachedAccessToken && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${cachedAccessToken}`)
        }

        if (cachedRefreshToken && !headers.has('x-supabase-refresh-token')) {
            headers.set('x-supabase-refresh-token', cachedRefreshToken)
        }

        requestInit.headers = headers

        if (!requestInit.credentials) {
            requestInit.credentials = 'include'
        }

        return originalFetch(input as any, requestInit)
    }

    fetchPatched = true
}
