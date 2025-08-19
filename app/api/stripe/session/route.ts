import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-06-30.basil' });
  }
  return stripe;
}

export const dynamic = 'force-dynamic';

// Minimal endpoint to retrieve limited safe session info client can use to auto bootstrap auth
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const s = await getStripe().checkout.sessions.retrieve(sessionId, { expand: ['customer'] });

    // Only expose email + flags; never expose pricing secrets etc.
    const email = (
      s.customer_details?.email ||
      (s.customer && typeof s.customer === 'object' && 'email' in s.customer
        ? (s.customer as any).email
        : null)
    );

    return NextResponse.json({
      id: s.id,
      email,
      status: s.status,
      subscription: s.subscription ? { id: typeof s.subscription === 'string' ? s.subscription : s.subscription.id } : null
    });
  } catch (e: any) {
    console.error('Stripe session fetch error', e);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
