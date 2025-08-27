/**
 * Authentication Middleware Utilities
 * Handles session validation and cookie management
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create a middleware-specific Supabase client
function createMiddlewareClient(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Get cookies from request
    const cookieHeader = req.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
            const [key, value] = c.split('=')
            return [key, decodeURIComponent(value || '')]
        })
    )

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        global: {
            headers: {
                cookie: cookieHeader,
            },
        },
    })
}

/**
 * Validate session in middleware
 */
export async function validateSession(req: NextRequest) {
    try {
        const supabase = createMiddlewareClient(req)

        // Try to get session from cookies
        const accessToken = req.cookies.get('sb-access-token')?.value
        const refreshToken = req.cookies.get('sb-refresh-token')?.value

        if (!accessToken) {
            return { valid: false, session: null }
        }

        // Verify the session
        const { data: { user }, error } = await supabase.auth.getUser(accessToken)

        if (error || !user) {
            // Try to refresh if we have a refresh token
            if (refreshToken) {
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                    refresh_token: refreshToken
                })

                if (!refreshError && refreshData.session) {
                    return {
                        valid: true,
                        session: refreshData.session,
                        refreshed: true
                    }
                }
            }
            return { valid: false, session: null }
        }

        return {
            valid: true,
            session: { access_token: accessToken, user },
            refreshed: false
        }
    } catch (error) {
        console.error('[Auth Middleware] Session validation error:', error)
        return { valid: false, session: null }
    }
}

/**
 * Set auth cookies in response
 */
export function setAuthCookies(res: NextResponse, session: any) {
    if (!session) return res

    // Set secure, httpOnly cookies
    res.cookies.set({
        name: 'sb-access-token',
        value: session.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: session.expires_in || 3600,
        path: '/'
    })

    if (session.refresh_token) {
        res.cookies.set({
            name: 'sb-refresh-token',
            value: session.refresh_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
        })
    }

    return res
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(res: NextResponse) {
    res.cookies.delete('sb-access-token')
    res.cookies.delete('sb-refresh-token')
    return res
}

/**
 * Protected route handler
 */
export async function withAuth(
    req: NextRequest,
    handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
    const validation = await validateSession(req)

    if (!validation.valid) {
        // Redirect to login
        const url = req.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirect', req.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    const response = await handler(req, validation.session)

    // If session was refreshed, update cookies
    if (validation.refreshed && validation.session) {
        return setAuthCookies(response, validation.session)
    }

    return response
}
