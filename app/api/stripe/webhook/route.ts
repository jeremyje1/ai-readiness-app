import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripe Webhook Handler (Scaffolding)
// -----------------------------------
// Listens for key subscription + billing lifecycle events and provides
// structured handler hooks you can implement to persist data (e.g. Supabase).
//
// IMPORTANT: Add the endpoint in Stripe Dashboard (e.g. https://your-domain/api/stripe/webhook)
// and set STRIPE_WEBHOOK_SECRET env var to the signing secret provided.
//
// Security: We MUST use the raw request body for signature verification.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2025-06-30.basil' });

// Event handler placeholders. Replace console.log with real persistence logic.
const handlers: Record<string, (event: Stripe.Event) => Promise<void>> = {
  'checkout.session.completed': async (event) => {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('[webhook] checkout.session.completed', session.id, session.metadata);
    // TODO: Link session to user/org using metadata or customer_email
  },
  'customer.subscription.created': async (event) => {
    const sub = event.data.object as Stripe.Subscription;
    console.log('[webhook] subscription.created', sub.id, sub.items.data[0]?.price?.id);
    // TODO: Persist subscription record
  },
  'customer.subscription.updated': async (event) => {
    const sub = event.data.object as Stripe.Subscription;
    console.log('[webhook] subscription.updated', sub.id, sub.status);
    // TODO: Update subscription status/plan
  },
  'customer.subscription.deleted': async (event) => {
    const sub = event.data.object as Stripe.Subscription;
    console.log('[webhook] subscription.deleted', sub.id);
    // TODO: Mark subscription as canceled
  },
  'invoice.payment_succeeded': async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    console.log('[webhook] invoice.payment_succeeded', invoice.id);
    // TODO: Record successful payment
  },
  'invoice.payment_failed': async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    console.warn('[webhook] invoice.payment_failed', invoice.id);
    // TODO: Notify user / update dunning status
  },
  'customer.subscription.trial_will_end': async (event) => {
    const sub = event.data.object as Stripe.Subscription;
    console.log('[webhook] subscription.trial_will_end', sub.id);
    // TODO: Send trial ending notification
  }
};

async function handleEvent(event: Stripe.Event) {
  const handler = handlers[event.type];
  if (handler) {
    await handler(event);
  } else {
    if (!event.type.startsWith('charge.')) {
      console.log('[webhook] unhandled event', event.type);
    }
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
  }
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (e) {
    return NextResponse.json({ error: 'Unable to read body' }, { status: 400 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    await handleEvent(event);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook signature verification failed', err.message);
    return NextResponse.json({ error: 'Invalid signature', details: err.message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ service: 'stripe-webhook', ok: true });
}
