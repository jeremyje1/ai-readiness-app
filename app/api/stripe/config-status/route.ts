import { NextResponse } from 'next/server';

// This route gives a quick health snapshot of Stripe-related environment configuration
// WITHOUT leaking the actual secret or price IDs. Useful for runtime verification in Vercel.

const REQUIRED_ENV = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_TEAM_MONTHLY',
  'STRIPE_PRICE_TEAM_YEARLY'
];

export async function GET() {
  const status = REQUIRED_ENV.map(key => {
    const value = process.env[key];
    return {
      key,
      present: !!value,
      sample: value ? obfuscate(value) : null
    };
  });

  const allPresent = status.every(s => s.present);

  return NextResponse.json({
    service: 'stripe-config-status',
    allPresent,
    missing: status.filter(s => !s.present).map(s => s.key),
    vars: status
  }, { status: allPresent ? 200 : 500 });
}

function obfuscate(v: string) {
  if (v.length <= 8) return '*'.repeat(v.length);
  return v.slice(0, 4) + '...' + v.slice(-4);
}

export async function POST() { return GET(); }
