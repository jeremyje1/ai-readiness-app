/**
 * Domain-aware utility functions for redirects and URL generation
 */

export type InstitutionType = 'K12' | 'HigherEd';

/**
 * Detect institution type from current hostname (client-side only)
 */
export function detectInstitutionType(): InstitutionType {
  if (typeof window === 'undefined') return 'K12'; // Default for SSR
  const hostname = window.location.hostname;
  return hostname.includes('educationaiblueprint.com') ? 'HigherEd' : 'K12';
}

/**
 * Get the canonical domain for an institution type
 */
export function getCanonicalDomain(institutionType: InstitutionType): string {
  return institutionType === 'HigherEd'
    ? 'https://aiblueprint.educationaiblueprint.com'
    : 'https://aiblueprint.k12aiblueprint.com';
}

/**
 * Generate a domain-aware URL for the given path
 */
export function getDomainAwareUrl(path: string, institutionType?: InstitutionType): string {
  const detectedType = institutionType || detectInstitutionType();
  const domain = getCanonicalDomain(detectedType);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${domain}${cleanPath}`;
}

/**
 * Navigate to a path using the appropriate domain context
 * Use this instead of router.push() for cross-domain navigation
 */
export function navigateToDomainAwarePath(path: string, institutionType?: InstitutionType): void {
  const url = getDomainAwareUrl(path, institutionType);
  window.location.href = url;
}
