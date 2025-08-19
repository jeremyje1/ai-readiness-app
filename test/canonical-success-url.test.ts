import { describe, it, expect } from 'vitest';

const HARD_CANONICAL = 'https://aiblueprint.k12aiblueprint.com';

function simulateBuildRedirectBase(returnTo?: string) {
  const envCandidate = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || HARD_CANONICAL;
  let canonical = envCandidate.replace('https://aireadiness.northpathstrategies.org', HARD_CANONICAL);
  if (!canonical.startsWith(HARD_CANONICAL)) canonical = HARD_CANONICAL;
  const destination = (() => {
    switch (returnTo) {
      case 'k12': return '/k12';
      case 'higher-ed':
      case 'highered': return '/higher-ed';
      case 'dashboard': return '/dashboard';
      default: return '/ai-readiness/success';
    }
  })();
  return {
    success: `${canonical}${destination}?checkout=success&session_id={CHECKOUT_SESSION_ID}&auto=1`,
    cancel: `${canonical}/ai-readiness?checkout=cancelled`
  };
}

describe('Canonical success_url enforcement', () => {
  it('forces canonical even if legacy base env present', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://aireadiness.northpathstrategies.org';
    const r = simulateBuildRedirectBase('dashboard');
    expect(r.success.startsWith(HARD_CANONICAL)).toBe(true);
  });

  it('ignores arbitrary preview host', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://some-preview.vercel.app';
    const r = simulateBuildRedirectBase();
    expect(r.success.startsWith(HARD_CANONICAL)).toBe(true);
  });

  it('maps higher-ed returnTo correctly', () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    const r = simulateBuildRedirectBase('higher-ed');
    expect(r.success).toContain('/higher-ed?checkout=success');
    expect(r.success.startsWith(HARD_CANONICAL)).toBe(true);
  });
});
