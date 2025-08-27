/**
 * Next.js Middleware for Audience Derivation and Legacy Domain Handling
 * Enhanced with audience detection and secure cookie management
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { deriveAudience, getAudienceOverride, getDerivationDebugInfo } from './lib/audience/deriveAudience';
import { getAudienceCookie, setAudienceCookie, getAudienceCookieDebugInfo } from './lib/audience/cookie';

const MIDDLEWARE_DEBUG = process.env.AUDIENCE_MIDDLEWARE_DEBUG === '1';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Skip middleware for certain paths
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  try {
    // Define canonical domains
    const k12Domain = 'aiblueprint.k12aiblueprint.com';
    const higherEdDomain = 'aiblueprint.higheredaiblueprint.com';

    // Redirect legacy domain to K-12 canonical
    if (host === 'aireadiness.northpathstrategies.org') {
      const url = new URL(request.url);
      url.host = k12Domain;
      return NextResponse.redirect(url, 301);
    }

    // Check for dev/staging override first
    const override = getAudienceOverride(searchParams);
    if (override) {
      const response = NextResponse.next();
      setAudienceCookie(response, override);
      
      // Set legacy headers for backwards compatibility
      setLegacyHeaders(response, override, host);
      
      if (MIDDLEWARE_DEBUG) {
        console.log('[Audience Middleware] Override applied:', {
          audience: override,
          path: pathname,
          source: 'query_param'
        });
      }
      
      return response;
    }

    // Get existing cookie
    const existingAudience = getAudienceCookie(request);
    
    // Build derivation context
    const context = {
      host: request.headers.get('host') || undefined,
      referer: request.headers.get('referer') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      cookie: existingAudience || undefined,
    };

    // Derive audience
    const derivation = deriveAudience(context);
    const { audience, source, confidence } = derivation;

    // Set up response
    const response = NextResponse.next();

    // Update cookie if audience changed or doesn't exist
    if (!existingAudience || existingAudience !== audience) {
      setAudienceCookie(response, audience);
      
      if (MIDDLEWARE_DEBUG) {
        console.log('[Audience Middleware] Cookie updated:', {
          audience,
          source,
          confidence,
          path: pathname,
          previousAudience: existingAudience
        });
      }
    }

    // Set headers for backwards compatibility and new audience system
    setLegacyHeaders(response, audience, host);
    setAudienceHeaders(response, audience, derivation);

    // Add debug headers in non-production
    if (MIDDLEWARE_DEBUG || searchParams.get('debug_audience') === '1') {
      const debugInfo = getDerivationDebugInfo(context);
      const cookieDebugInfo = getAudienceCookieDebugInfo(request);
      
      response.headers.set('x-audience-derivation', JSON.stringify(debugInfo));
      response.headers.set('x-audience-cookie-info', JSON.stringify(cookieDebugInfo));
      
      // Log detailed debug info
      console.log('[Audience Middleware] Debug Info:', {
        derivation: debugInfo,
        cookieInfo: cookieDebugInfo,
        request: {
          url: request.url,
          method: request.method,
          path: pathname
        }
      });
    }

    return response;

  } catch (error) {
    console.error('[Audience Middleware] Error:', error);
    
    // Fallback: set default audience and continue
    const response = NextResponse.next();
    setAudienceCookie(response, 'k12'); // Safe default
    setLegacyHeaders(response, 'k12', host);
    return response;
  }
}

/**
 * Set legacy headers for backwards compatibility
 */
function setLegacyHeaders(response: NextResponse, audience: string, host: string) {
  const institutionType = audience === 'highered' ? 'HigherEd' : 'K12';
  const domainContext = audience === 'highered' ? 'higher-ed' : 'k12';
  
  response.headers.set('x-institution-type', institutionType);
  response.headers.set('x-domain-context', domainContext);
  response.headers.set('x-current-domain', host);
}

/**
 * Set new audience headers
 */
function setAudienceHeaders(response: NextResponse, audience: string, derivation: any) {
  response.headers.set('x-audience', audience);
  response.headers.set('x-audience-source', derivation.source);
  response.headers.set('x-audience-confidence', derivation.confidence);
}

/**
 * Determine if middleware should be skipped for this path
 */
function shouldSkipMiddleware(pathname: string): boolean {
  const skipPatterns = [
    // Static assets
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    
    // API routes (they handle their own audience logic)
    '/api/',
    
    // Public assets
    '/images/',
    '/icons/',
    '/pdf/',
    
    // Service worker and manifests
    '/sw.js',
    '/manifest.json',
    
    // Health checks
    '/health',
    '/ping',
  ];

  return skipPatterns.some(pattern => pathname.startsWith(pattern));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
