import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
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

  return response;
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
