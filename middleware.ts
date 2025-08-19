import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';
  
  // Clone the request URL to modify
  const response = NextResponse.next();
  
  // Set institution type based on domain
  if (host.includes('k12aiblueprint.com')) {
    response.headers.set('x-institution-type', 'K12');
    response.headers.set('x-domain-context', 'k12');
  } else if (host.includes('higheredaiblueprint.com')) {
    response.headers.set('x-institution-type', 'HigherEd');
    response.headers.set('x-domain-context', 'higher-ed');
  } else {
    response.headers.set('x-institution-type', 'default');
    response.headers.set('x-domain-context', 'default');
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
