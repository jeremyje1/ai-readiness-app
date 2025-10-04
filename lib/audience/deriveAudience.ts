/**
 * Audience derivation utilities
 * Determines audience (K-12 or HigherEd) from host, referrer, and fallbacks
 */

export type Audience = 'k12' | 'highered';

export interface AudienceDerivationContext {
  host?: string;
  referer?: string;
  userAgent?: string;
  cookie?: string;
  cookies?: any;
  referrer?: any;
  searchParams?: URLSearchParams | Record<string, string> | any;
  userProfile?: {
    organization?: string;
    audience?: Audience;
  };
}

/**
 * Derive audience from various sources with priority:
 * 1. Valid cookie (most reliable)
 * 2. Host domain patterns  
 * 3. Referer domain patterns
 * 4. User profile data
 * 5. Default fallback to k12
 */
export function deriveAudience(context: AudienceDerivationContext): {
  audience: Audience;
  source: 'cookie' | 'host' | 'referer' | 'profile' | 'default';
  confidence: 'high' | 'medium' | 'low';
} {
  // 1. Check cookie first (highest confidence)
  if (context.cookie && isValidAudience(context.cookie)) {
    return {
      audience: context.cookie as Audience,
      source: 'cookie',
      confidence: 'high'
    };
  }

  // 2. Check host patterns
  if (context.host) {
    const hostAudience = deriveFromHost(context.host);
    if (hostAudience) {
      return {
        audience: hostAudience,
        source: 'host',
        confidence: 'high'
      };
    }
  }

  // 3. Check referer patterns  
  if (context.referer) {
    const refererAudience = deriveFromReferer(context.referer);
    if (refererAudience) {
      return {
        audience: refererAudience,
        source: 'referer',
        confidence: 'medium'
      };
    }
  }

  // 4. Check user profile
  if (context.userProfile?.audience && isValidAudience(context.userProfile.audience)) {
    return {
      audience: context.userProfile.audience,
      source: 'profile',
      confidence: 'medium'
    };
  }

  // 5. Default fallback
  return {
    audience: 'k12',
    source: 'default',
    confidence: 'low'
  };
}

/**
 * Extract audience from host domain patterns
 */
function deriveFromHost(host: string): Audience | null {
  const cleanHost = host.toLowerCase();

  // Direct domain matches
  if (cleanHost.includes('educationaiblueprint.com')) {
    return 'highered';
  }
  if (cleanHost.includes('k12aiblueprint.com')) {
    return 'k12';
  }

  // Subdomain patterns
  if (cleanHost.startsWith('highered.') || cleanHost.includes('.highered.')) {
    return 'highered';
  }
  if (cleanHost.startsWith('k12.') || cleanHost.includes('.k12.')) {
    return 'k12';
  }

  return null;
}

/**
 * Extract audience from referer URL patterns
 */
function deriveFromReferer(referer: string): Audience | null {
  try {
    const url = new URL(referer);
    return deriveFromHost(url.host);
  } catch {
    // Fallback to string matching if URL parsing fails
    const cleanReferer = referer.toLowerCase();
    if (cleanReferer.includes('educationaiblueprint.com')) {
      return 'highered';
    }
    if (cleanReferer.includes('k12aiblueprint.com')) {
      return 'k12';
    }
    return null;
  }
}

/**
 * Validate audience string
 */
export function isValidAudience(audience: string): audience is Audience {
  return audience === 'k12' || audience === 'highered';
}

/**
 * Get audience override from query parameters (dev/staging only)
 */
export function getAudienceOverride(
  searchParams: URLSearchParams | Record<string, string>,
  allowOverride: boolean = process.env.NODE_ENV !== 'production'
): Audience | null {
  if (!allowOverride) return null;

  const audParam = typeof searchParams.get === 'function'
    ? searchParams.get('aud')
    : (searchParams as Record<string, string>)['aud'];

  if (audParam && isValidAudience(audParam)) {
    return audParam as Audience;
  }

  return null;
}

/**
 * Debug information for audience derivation
 */
export function getDerivationDebugInfo(context: AudienceDerivationContext) {
  return {
    timestamp: new Date().toISOString(),
    context: {
      host: context.host,
      referer: context.referer,
      hasCookie: !!context.cookie,
      hasUserProfile: !!context.userProfile,
    },
    derivation: deriveAudience(context),
    hostCheck: context.host ? deriveFromHost(context.host) : null,
    refererCheck: context.referer ? deriveFromReferer(context.referer) : null,
  };
}