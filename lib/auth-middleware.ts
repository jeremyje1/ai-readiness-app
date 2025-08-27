import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/ai-readiness/dashboard',
  '/ai-readiness/assessment',
  '/ai-readiness/results',
  '/admin',
  '/api/ai-readiness',
  '/api/auth/password'
]

// Routes that should redirect to dashboard if user is already authenticated
const authRoutes = [
  '/auth/login',
  '/auth/register'
]

// Routes that are always public
const publicRoutes = [
  '/',
  '/start',
  '/pricing',
  '/contact',
  '/privacy',
  '/terms',
  '/auth/password/reset',
  '/debug-auth',
  '/api/debug'
]

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname.startsWith(route))
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and API routes we don't need to protect
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/payments/webhook')
  ) {
    return NextResponse.next()
  }

  try {
    // Create a Supabase client for middleware
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })

    // Get session with timeout to prevent hanging
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Session check timeout')), 5000)
    })

    let session = null
    try {
      const result = await Promise.race([sessionPromise, timeoutPromise])
      session = result.data.session
    } catch (error) {
      console.warn('🔐 Middleware: session check failed or timed out:', error)
      // Continue without session - handle as unauthenticated
    }

    console.log('🔐 Middleware:', {
      pathname,
      hasSession: !!session,
      userId: session?.user?.id,
      isProtected: isProtectedRoute(pathname),
      isAuth: isAuthRoute(pathname),
      isPublic: isPublicRoute(pathname)
    })

    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!session) {
        console.log('🔐 Middleware: redirecting to login (no session)')
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Validate session is not expired
      if (session.expires_at) {
        const now = Math.floor(Date.now() / 1000)
        if (session.expires_at < now) {
          console.log('🔐 Middleware: redirecting to login (expired session)')
          const redirectUrl = new URL('/auth/login', request.url)
          redirectUrl.searchParams.set('redirect', pathname)
          redirectUrl.searchParams.set('message', 'Session expired. Please log in again.')
          return NextResponse.redirect(redirectUrl)
        }
      }
    }

    // Handle auth routes when user is already authenticated
    if (isAuthRoute(pathname) && session) {
      console.log('🔐 Middleware: redirecting to dashboard (already authenticated)')
      const redirectUrl = new URL('/ai-readiness/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Special handling for password update route
    if (pathname === '/auth/password/update') {
      if (!session) {
        console.log('🔐 Middleware: password update requires session')
        const redirectUrl = new URL('/auth/password/reset', request.url)
        redirectUrl.searchParams.set('message', 'Please use the password reset link from your email.')
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response

  } catch (error) {
    console.error('🔐 Middleware: unexpected error:', error)
    
    // On middleware errors, allow the request to proceed for public routes
    // but redirect to login for protected routes
    if (isProtectedRoute(pathname)) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('message', 'Authentication check failed. Please log in.')
      return NextResponse.redirect(redirectUrl)
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
