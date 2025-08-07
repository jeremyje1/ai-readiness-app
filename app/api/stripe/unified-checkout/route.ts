import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const billingPeriod = searchParams.get('billing') || 'monthly';
    const trialDays = searchParams.get('trial_days') || '7';
    const couponCode = searchParams.get('coupon');
    const userEmail = searchParams.get('email') || '';

    return await createCheckoutSession(billingPeriod, trialDays, couponCode, userEmail);
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billingPeriod = 'monthly', userEmail = '', couponCode } = body;
    const trialDays = '7';

    return await createCheckoutSession(billingPeriod, trialDays, couponCode, userEmail);
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

async function createCheckoutSession(billingPeriod: string, trialDays: string, couponCode: string | null, userEmail: string) {
  try {
    // Determine which price ID to use
    const priceId = billingPeriod === 'yearly' 
      ? process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_YEARLY
      : process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_MONTHLY;

    if (!priceId) {
      throw new Error(`Price ID not found for billing period: ${billingPeriod}`);
    }

    // Create checkout session parameters with best practices
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      // Best practice: Collect payment method during trial
      payment_method_collection: 'always',
      customer_email: userEmail,
      metadata: {
        service: 'ai-readiness-complete',
        billing_period: billingPeriod,
        trial_days: trialDays,
        customer_email: userEmail || ''
      },
      subscription_data: {
        trial_period_days: parseInt(trialDays),
        metadata: {
          service: 'ai-readiness-complete',
          billing_period: billingPeriod,
          trial_start: new Date().toISOString()
        }
      },
      // Custom messaging for trial experience
      custom_text: {
        submit: {
          message: 'Start your 7-day free trial. You won\'t be charged until the trial ends.'
        }
      }
    };

    // Add coupon if provided
    if (couponCode) {
      sessionParams.discounts = [{ coupon: couponCode }];
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Redirect to Stripe checkout
    return NextResponse.redirect(session.url!);

  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
