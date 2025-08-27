/**
 * Audience cookie management utilities
 * Handles secure cookie storage for audience preference
 */

import { NextRequest, NextResponse } from 'next/server';
import { Audience } from './deriveAudience';

const AUDIENCE_COOKIE_NAME = 'ai_blueprint_audience';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface AudienceCookieOptions {
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set audience cookie on response
 */
export function setAudienceCookie(
  response: NextResponse,
  audience: Audience,
  options: AudienceCookieOptions = {}
): void {
  const cookieOptions = {
    maxAge: options.maxAge ?? COOKIE_MAX_AGE,
    secure: options.secure ?? process.env.NODE_ENV === 'production',
    httpOnly: options.httpOnly ?? false, // Allow client-side access for context hydration
    sameSite: options.sameSite ?? 'lax' as const,
    path: '/'
  };

  response.cookies.set(AUDIENCE_COOKIE_NAME, audience, cookieOptions);
}

/**
 * Get audience from request cookies
 */
export function getAudienceCookie(request: NextRequest): Audience | null {
  const cookieValue = request.cookies.get(AUDIENCE_COOKIE_NAME)?.value;
  
  if (cookieValue && isValidAudienceValue(cookieValue)) {
    return cookieValue as Audience;
  }
  
  return null;
}

/**
 * Get audience from browser cookies (client-side)
 */
export function getAudienceCookieClient(): Audience | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const audienceCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${AUDIENCE_COOKIE_NAME}=`)
  );
  
  if (audienceCookie) {
    const value = audienceCookie.split('=')[1]?.trim();
    if (value && isValidAudienceValue(value)) {
      return value as Audience;
    }
  }
  
  return null;
}

/**
 * Set audience cookie (client-side)
 */
export function setAudienceCookieClient(audience: Audience): void {
  if (typeof document === 'undefined') return;
  
  const secure = window.location.protocol === 'https:';
  const cookieString = [
    `${AUDIENCE_COOKIE_NAME}=${audience}`,
    `max-age=${COOKIE_MAX_AGE}`,
    'path=/',
    'samesite=lax',
    secure ? 'secure' : ''
  ].filter(Boolean).join('; ');
  
  document.cookie = cookieString;
}

/**
 * Clear audience cookie
 */
export function clearAudienceCookie(response: NextResponse): void {
  response.cookies.delete(AUDIENCE_COOKIE_NAME);
}

/**
 * Clear audience cookie (client-side)
 */
export function clearAudienceCookieClient(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${AUDIENCE_COOKIE_NAME}=; max-age=0; path=/; samesite=lax`;
}

/**
 * Validate audience cookie value
 */
function isValidAudienceValue(value: string): boolean {
  return value === 'k12' || value === 'highered';
}

/**
 * Get all audience-related cookies for debugging
 */
export function getAudienceCookieDebugInfo(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const audienceCookie = request.cookies.get(AUDIENCE_COOKIE_NAME);
  
  return {
    audienceCookie: audienceCookie?.value || null,
    audienceCookieExists: !!audienceCookie,
    allCookieNames: allCookies.map(c => c.name),
    userAgent: request.headers.get('user-agent')?.substring(0, 100) + '...',
  };
}