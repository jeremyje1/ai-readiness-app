import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/ai-readiness/dashboard',
  '/ai-readiness/assessment',
  '/ai-readiness/results',
  '/admin',
  '/api/ai-readiness',
  '/api/auth/password/update'  // Only protect password update, not setup
]

// Routes that should redirect to dashboard if user is already authenticated
const authRoutes = [
  '/auth/login',
  '/auth/register'
]

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Define canonical domains
  const k12Domain = 'aiblueprint.k12aiblueprint.com';
  const higherEdDomain = 'aiblueprint.higheredaiblueprint.com';

  // Redirect legacy domain to K-12 canonical
  if (host === 'aireadiness.northpathstrategies.org') {
    const url = new URL(request.url);
    url.host = k12Domain;
    return NextResponse.redirect(url, 301);
  }

  // Clone the request URL to modify
  const response = NextResponse.next();

  // Set institution type and domain context based on hostname
  if (host.includes('higheredaiblueprint.com')) {
    response.headers.set('x-institution-type', 'HigherEd');
    response.headers.set('x-domain-context', 'higher-ed');
  } else if (host.includes('k12aiblueprint.com')) {
    response.headers.set('x-institution-type', 'K12');
    response.headers.set('x-domain-context', 'k12');
  } else {
    // Default to K12 for development/localhost
    response.headers.set('x-institution-type', 'K12');
    response.headers.set('x-domain-context', 'k12');
  }

  // Add domain info to response headers for client-side access
  response.headers.set('x-current-domain', host);

  // Skip auth middleware for static files and certain API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/payments/webhook') ||
    pathname.startsWith('/api/debug')
  ) {
    return response
  }

  // Enhanced authentication handling
  try {
    // Create a Supabase client for middleware
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

  } catch (error) {
    console.error('🔐 Middleware: authentication error:', error)

    // On middleware errors, allow the request to proceed for non-protected routes
    // but redirect to login for protected routes
    if (isProtectedRoute(pathname)) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('message', 'Authentication check failed. Please log in.')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response;
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
};
