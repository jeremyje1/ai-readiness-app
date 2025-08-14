import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use a stable, supported Stripe API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15' as any,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
  const product = (searchParams.get('product') || 'team').toLowerCase();
  const billingPeriod = searchParams.get('billing') || 'monthly'; // For team subscriptions
  const trialDays = searchParams.get('trial_days') || '7'; // For team subscriptions
    const couponCode = searchParams.get('coupon');
    const returnTo = searchParams.get('return_to') || '';
    const contactEmail = searchParams.get('contact_email') || '';
    const contactName = searchParams.get('contact_name') || '';
    // Generate a provisional institution id to deep-link after checkout (in-memory placeholder)
    const provisionalInstitutionId = returnTo === 'highered' ? `inst_${Date.now()}` : returnTo === 'k12' ? `school_${Date.now()}` : '';
    const baseUrl = request.nextUrl.origin;

  return await createCheckoutSession({ product, billingPeriod, trialDays, couponCode, returnTo, baseUrl, provisionalInstitutionId, contactEmail, contactName });
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
  const { product = 'team', billingPeriod = 'monthly', couponCode, returnTo = '', contactEmail = '', contactName = '' } = body;
  const trialDays = '7'; // Only used for team subscriptions
    const provisionalInstitutionId = returnTo === 'highered' ? `inst_${Date.now()}` : returnTo === 'k12' ? `school_${Date.now()}` : '';
    const baseUrl = request.nextUrl.origin;

  return await createCheckoutSession({ product, billingPeriod, trialDays, couponCode, returnTo, baseUrl, provisionalInstitutionId, contactEmail, contactName });
  } catch (error) {
    console.error('Stripe checkout error (POST):', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

type CreateSessionArgs = {
  product: string
  billingPeriod: string
  trialDays: string
  couponCode: string | null
  returnTo: string
  baseUrl: string
  provisionalInstitutionId?: string
  contactEmail?: string
  contactName?: string
}

async function createCheckoutSession(args: CreateSessionArgs) {
  try {
    const { product, billingPeriod, trialDays, couponCode, returnTo, baseUrl, provisionalInstitutionId, contactEmail, contactName } = args;

    // Resolve price IDs with new canonical envs (fallback to legacy names)
    const TEAM_MONTHLY = process.env.STRIPE_PRICE_AI_BLUEPRINT_TEAM_MONTHLY
      || process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_MONTHLY;
    const TEAM_YEARLY = process.env.STRIPE_PRICE_AI_BLUEPRINT_TEAM_YEARLY
      || process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_YEARLY;
    const SELF_SERVE = process.env.STRIPE_PRICE_AI_BLUEPRINT_SELF_SERVE_ONETIME;
    const BOARD_READY = process.env.STRIPE_PRICE_AI_BLUEPRINT_BOARD_READY_PRO_ONETIME;
    const ENTERPRISE = process.env.STRIPE_PRICE_AI_BLUEPRINT_ENTERPRISE_PROGRAM_ONETIME;

    // Create checkout session parameters with broadly compatible fields
    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (product === 'team') {
      const priceId = billingPeriod === 'yearly' ? TEAM_YEARLY : TEAM_MONTHLY;
      if (!priceId) throw new Error(`Team price not found for billing=${billingPeriod}`);
      sessionParams = {
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
        cancel_url: `${baseUrl}/pricing?cancelled=true`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          service: 'ai-blueprint-team',
          product,
          billing_period: billingPeriod,
          trial_days: trialDays,
          segment: returnTo === 'k12' ? 'K12' : 'HIGHER_ED',
          ...(provisionalInstitutionId ? { institution_id: provisionalInstitutionId } : {}),
          ...(returnTo ? { return_to: returnTo } : {}),
          ...(provisionalInstitutionId ? { provisional_institution_id: provisionalInstitutionId } : {}),
          ...(contactEmail ? { contact_email: contactEmail } : {}),
          ...(contactName ? { contact_name: contactName } : {})
        },
        subscription_data: {
          trial_period_days: parseInt(trialDays, 10),
          metadata: {
            service: 'ai-blueprint-team',
            product,
            billing_period: billingPeriod,
            trial_start: new Date().toISOString(),
            segment: returnTo === 'k12' ? 'K12' : 'HIGHER_ED',
            ...(provisionalInstitutionId ? { institution_id: provisionalInstitutionId } : {}),
            ...(returnTo ? { return_to: returnTo } : {}),
            ...(provisionalInstitutionId ? { provisional_institution_id: provisionalInstitutionId } : {}),
            ...(contactEmail ? { contact_email: contactEmail } : {}),
            ...(contactName ? { contact_name: contactName } : {})
          }
        }
      };
    } else if (product === 'self-serve' || product === 'selfserve' || product === 'self') {
      const priceId = SELF_SERVE;
      if (!priceId) throw new Error('Self-Serve price not configured');
      sessionParams = {
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
        cancel_url: `${baseUrl}/pricing?cancelled=true`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          service: 'ai-blueprint-self-serve',
          product: 'self-serve',
          segment: returnTo === 'k12' ? 'K12' : 'HIGHER_ED',
          ...(provisionalInstitutionId ? { institution_id: provisionalInstitutionId } : {}),
          ...(returnTo ? { return_to: returnTo } : {}),
          ...(provisionalInstitutionId ? { provisional_institution_id: provisionalInstitutionId } : {}),
          ...(contactEmail ? { contact_email: contactEmail } : {}),
          ...(contactName ? { contact_name: contactName } : {})
        }
      };
    } else if (product === 'board' || product === 'board-ready' || product === 'pro') {
      const priceId = BOARD_READY;
      if (!priceId) throw new Error('Board-Ready Pro price not configured');
      sessionParams = {
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
        cancel_url: `${baseUrl}/pricing?cancelled=true`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          service: 'ai-blueprint-board-ready-pro',
          product: 'board-ready-pro',
          segment: returnTo === 'k12' ? 'K12' : 'HIGHER_ED',
          ...(provisionalInstitutionId ? { institution_id: provisionalInstitutionId } : {}),
          ...(returnTo ? { return_to: returnTo } : {}),
          ...(provisionalInstitutionId ? { provisional_institution_id: provisionalInstitutionId } : {}),
          ...(contactEmail ? { contact_email: contactEmail } : {}),
          ...(contactName ? { contact_name: contactName } : {})
        }
      };
    } else if (product === 'enterprise') {
      const priceId = ENTERPRISE;
      if (!priceId) throw new Error('Enterprise Readiness Program price not configured');
      sessionParams = {
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
        cancel_url: `${baseUrl}/pricing?cancelled=true`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          service: 'ai-blueprint-enterprise-readiness',
          product: 'enterprise',
          segment: returnTo === 'k12' ? 'K12' : 'HIGHER_ED',
          ...(provisionalInstitutionId ? { institution_id: provisionalInstitutionId } : {}),
          ...(returnTo ? { return_to: returnTo } : {}),
          ...(provisionalInstitutionId ? { provisional_institution_id: provisionalInstitutionId } : {}),
          ...(contactEmail ? { contact_email: contactEmail } : {}),
          ...(contactName ? { contact_name: contactName } : {})
        }
      };
    } else {
      throw new Error(`Unknown product: ${product}`);
    }

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
