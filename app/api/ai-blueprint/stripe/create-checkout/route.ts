import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAIBlueprintStripeMappingForTier } from '@/lib/ai-blueprint-tier-mapping';
import type { AIBlueprintTier } from '@/lib/ai-blueprint-tier-configuration';

let stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });
  }
  return stripe;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier') as AIBlueprintTier;
    const priceId = searchParams.get('price_id');
    const customerEmail = searchParams.get('customer_email');
    const successUrl = searchParams.get('success_url');
    const cancelUrl = searchParams.get('cancel_url');

    if (!tier || !priceId) {
      return NextResponse.json(
        { error: 'Missing required parameters: tier and price_id' },
        { status: 400 }
      );
    }

    // Validate tier is an AI Blueprint tier
    const validTiers: AIBlueprintTier[] = [
      'higher-ed-ai-pulse-check',
      'ai-readiness-comprehensive', 
      'ai-transformation-blueprint',
      'ai-enterprise-partnership'
    ];

    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid AI Blueprint tier' },
        { status: 400 }
      );
    }

    const tierMapping = getAIBlueprintStripeMappingForTier(tier);
    
    if (!tierMapping) {
      return NextResponse.json(
        { error: 'Invalid tier mapping' },
        { status: 400 }
      );
    }
    
    // Verify the price ID matches the tier
    if (priceId !== tierMapping.stripePriceId) {
      return NextResponse.json(
        { error: 'Price ID does not match tier' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.NEXT_PUBLIC_APP_URL || 
                    'https://app.northpathstrategies.org';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${baseUrl}${tierMapping.successRedirect}`,
      cancel_url: cancelUrl || `${baseUrl}${tierMapping.cancelRedirect}`,
      metadata: {
        tier: tier,
        service: 'ai-blueprint',
        tier_name: tierMapping.tierName,
        tier_price: tierMapping.tierPrice.toString()
      },
    };

    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const session = await getStripeClient().checkout.sessions.create(sessionParams);

    return NextResponse.redirect(session.url!);
    
  } catch (error) {
    console.error('AI Blueprint Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create AI Blueprint checkout session' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
