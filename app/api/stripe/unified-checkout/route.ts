import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use a stable, supported Stripe API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15' as any,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const billingPeriod = searchParams.get('billing') || 'monthly';
    const trialDays = searchParams.get('trial_days') || '7';
    const couponCode = searchParams.get('coupon');
    const userEmail = searchParams.get('email') || '';
    const returnTo = searchParams.get('return_to') || '';
    // Derive base URL from the request origin to avoid missing envs
    const baseUrl = request.nextUrl.origin;

    return await createCheckoutSession(billingPeriod, trialDays, couponCode, userEmail, returnTo, baseUrl);
  } catch (error) {
    console.error('Stripe checkout error (GET):', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billingPeriod = 'monthly', userEmail = '', couponCode, returnTo = '' } = body;
    const trialDays = '7';
    // Derive base URL from the request origin
    const baseUrl = request.nextUrl.origin;

    return await createCheckoutSession(billingPeriod, trialDays, couponCode, userEmail, returnTo, baseUrl);
  } catch (error) {
    console.error('Stripe checkout error (POST):', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

async function createCheckoutSession(
  billingPeriod: string,
  trialDays: string,
  couponCode: string | null,
  userEmail: string,
  returnTo: string,
  baseUrl: string
) {
  try {
    // Determine which price ID to use
    const priceId = billingPeriod === 'yearly' 
      ? process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_YEARLY
      : process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_MONTHLY;

    if (!priceId) {
      throw new Error(`Price ID not found for billing period: ${billingPeriod}`);
    }

    // Create checkout session parameters with broadly compatible fields
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
      cancel_url: `${baseUrl}/pricing?cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: userEmail || undefined,
      metadata: {
        service: 'ai-readiness-complete',
        billing_period: billingPeriod,
        trial_days: trialDays,
        ...(userEmail ? { customer_email: userEmail } : {}),
        ...(returnTo ? { return_to: returnTo } : {})
      },
      subscription_data: {
        trial_period_days: parseInt(trialDays, 10),
        metadata: {
          service: 'ai-readiness-complete',
          billing_period: billingPeriod,
          trial_start: new Date().toISOString(),
          ...(returnTo ? { return_to: returnTo } : {})
        }
      }
    };

    // Add coupon if provided
    if (couponCode) {
      sessionParams.discounts = [{ coupon: couponCode }];
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    // Redirect to Stripe checkout (use 303 to ensure GET)
    return NextResponse.redirect(session.url, 303);

  } catch (error) {
    console.error('Stripe checkout error (createCheckoutSession):', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
