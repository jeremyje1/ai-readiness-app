import Stripe from 'stripe';

let stripe: Stripe | null = null;

function requireStripeSecret(): string {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('Stripe secret key not configured');
  }
  return secret;
}

export function getStripeServerClient(): Stripe {
  if (!stripe) {
    stripe = new Stripe(requireStripeSecret(), { apiVersion: '2025-06-30.basil' });
  }
  return stripe;
}

export function getCanonicalSiteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://aiblueprint.educationaiblueprint.com'
  ).trim();
}

export function buildSiteUrl(path: string): string {
  const base = getCanonicalSiteUrl();
  if (!path.startsWith('/')) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
}
