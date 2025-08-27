import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Supported product definitions. Add additional products and billing cycles here.
// Each entry maps billing interval -> Stripe Price ID (from environment variables)
// We intentionally read env lazily so that missing vars surface as runtime errors with clear messages.
const PRODUCT_PRICE_ENV: Record<string, Record<string, string | undefined>> = {
  team: {
    monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY,
    yearly: process.env.STRIPE_PRICE_TEAM_YEARLY,
    annual: process.env.STRIPE_PRICE_TEAM_YEARLY // allow "annual" synonym
  }
  // Add more products here, e.g.:
  // professional: { monthly: process.env.STRIPE_PRICE_PRO_MONTHLY, yearly: process.env.STRIPE_PRICE_PRO_YEARLY }
};

let stripe: Stripe | null = null;
function getStripeClient(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-06-30.basil' });
  }
  return stripe;
}

interface CheckoutParams {
  product: string;
  billing: string; // monthly | yearly
  tier?: string; // team | enterprise
  userId?: string; // user ID from registration
  priceIdOverride?: string; // explicit price_id param
  trialDays?: number;
  contactEmail?: string;
  contactName?: string;
  returnTo?: string; // e.g. k12 | higher-ed | dashboard
  successUrl?: string;
  cancelUrl?: string;
}

function parseParams(request: NextRequest): CheckoutParams {
  const { searchParams } = new URL(request.url);
  const product = (searchParams.get('product') || searchParams.get('tier') || 'team').toLowerCase();
  const billing = (searchParams.get('billing') || 'monthly').toLowerCase();
  const tier = (searchParams.get('tier') || 'team').toLowerCase();
  const userId = searchParams.get('userId') || undefined;
  const trialDaysRaw = searchParams.get('trial_days');
  const priceIdOverride = searchParams.get('price_id') || undefined;
  const contactEmail = searchParams.get('contact_email') || undefined;
  const contactName = searchParams.get('contact_name') || undefined;
  const returnTo = (searchParams.get('return_to') || '').toLowerCase() || undefined;
  const successUrl = searchParams.get('success_url') || undefined;
  const cancelUrl = searchParams.get('cancel_url') || undefined;

  const trialDays = trialDaysRaw ? parseInt(trialDaysRaw, 10) : 7; // Default to 7-day trial

  return { product, billing, tier, userId, priceIdOverride, trialDays, contactEmail, contactName, returnTo, successUrl, cancelUrl };
}

function resolvePriceId(product: string, billing: string): string | null {
  const productConfig = PRODUCT_PRICE_ENV[product];
  if (!productConfig) return null;
  const normalizedBilling = billing === 'annual' ? 'yearly' : billing;
  return productConfig[normalizedBilling] || null;
}

function buildCheckoutUrls(returnTo?: string, request?: NextRequest) {
  // Simple single-domain approach
  const canonical = 'https://aiblueprint.k12aiblueprint.com';

  // Map return_to shorthand values to paths
  const destination = (() => {
    switch (returnTo) {
      case 'k12':
        return '/k12';
      case 'higher-ed':
      case 'highered':
        return '/higher-ed';
      case 'dashboard':
        return '/dashboard';
      default:
        // For AI readiness products, redirect to success page that handles authentication
        // then guides users to their dashboard
        return '/ai-readiness/success';
    }
  })();

  return {
    // Include session_id placeholder for post-checkout bootstrap
    success: `${canonical}${destination}?checkout=success&session_id={CHECKOUT_SESSION_ID}&auto=1`,
    cancel: `${canonical}/ai-readiness?checkout=cancelled`
  };
}

async function createCheckoutSession(params: CheckoutParams, request?: NextRequest) {
  // Simple single-domain allowlist
  const allowedOrigins = [
    'https://aiblueprint.k12aiblueprint.com'
  ];

  if (params.successUrl && !allowedOrigins.some(origin => params.successUrl!.startsWith(origin))) {
    console.warn('Ignoring non-canonical successUrl param', params.successUrl);
    params.successUrl = undefined;
  }
  if (params.cancelUrl && !allowedOrigins.some(origin => params.cancelUrl!.startsWith(origin))) {
    console.warn('Ignoring non-canonical cancelUrl param', params.cancelUrl);
    params.cancelUrl = undefined;
  }
  const priceId = params.priceIdOverride || resolvePriceId(params.product, params.billing);
  if (!priceId) {
    throw new Error(`${capitalize(params.product || 'Product')} price not found for billing=${params.billing}. Provide correct env vars (STRIPE_PRICE_* ) or pass price_id explicitly.`);
  }

  const isSubscription = true; // unified checkout uses subscriptions (supports trial days)
  const redirect = buildCheckoutUrls(params.returnTo, request);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: isSubscription ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: params.successUrl || redirect.success,
    cancel_url: params.cancelUrl || redirect.cancel,
    metadata: {
      product: params.product,
      tier: params.tier || params.product,
      billing_interval: params.billing,
      contact_name: params.contactName || '',
      user_id: params.userId || '',
      service: 'unified-checkout'
    }
  };

  if (params.contactEmail) {
    sessionParams.customer_email = params.contactEmail;
  }

  if (isSubscription) {
    sessionParams.subscription_data = { metadata: { product: params.product } };
    if (params.trialDays && params.trialDays > 0) {
      // Stripe enforces max trial days via dashboard configuration; still limit to 30 here as a safety net.
      const cappedTrial = Math.min(params.trialDays, 30);
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        trial_period_days: cappedTrial
      };
    }
  }

  return getStripeClient().checkout.sessions.create(sessionParams);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function handler(request: NextRequest) {
  try {
    const params = parseParams(request);

    if (!params.product) {
      return NextResponse.json({ error: 'Missing product parameter' }, { status: 400 });
    }
    if (!params.billing) {
      return NextResponse.json({ error: 'Missing billing parameter' }, { status: 400 });
    }

    const session = await createCheckoutSession(params, request);
    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (error: any) {
    console.error('Unified checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Mirror original error shape referenced in user report
    return NextResponse.json({ error: 'Failed to create checkout session', details: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
