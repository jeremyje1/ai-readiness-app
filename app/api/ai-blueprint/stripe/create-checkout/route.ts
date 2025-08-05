import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAIBlueprintStripeMappingForTier } from '@/lib/ai-blueprint-tier-mapping';
import type { AIBlueprintTier } from '@/lib/ai-blueprint-tier-configuration';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const priceId = searchParams.get('price_id');
    const customerEmail = searchParams.get('customer_email');
    const successUrl = searchParams.get('success_url');
    const cancelUrl = searchParams.get('cancel_url');
    const trialDays = searchParams.get('trial_days');

    if (!tier || !priceId) {
      return NextResponse.json(
        { error: 'Missing required parameters: tier and price_id' },
        { status: 400 }
      );
    }

    // Support both legacy one-time payment tiers and new monthly subscription tiers
    const validTiers = [
      'higher-ed-ai-pulse-check',
      'ai-readiness-comprehensive', 
      'ai-transformation-blueprint',
      'ai-enterprise-partnership',
      'ai-blueprint-essentials',
      'ai-blueprint-professional'
    ];

    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid AI Blueprint tier' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.NEXT_PUBLIC_APP_URL || 
                    'https://ai-readiness-app.vercel.app';

    let sessionParams: Stripe.Checkout.SessionCreateParams;
    let tierMapping;

    // Handle new monthly subscription tiers
    if (tier === 'ai-blueprint-essentials' || tier === 'ai-blueprint-professional') {
      // Verify price ID matches environment
      const expectedPriceId = tier === 'ai-blueprint-essentials' 
        ? process.env.STRIPE_PRICE_AI_BLUEPRINT_ESSENTIALS_MONTHLY
        : process.env.STRIPE_PRICE_AI_BLUEPRINT_PROFESSIONAL_MONTHLY;

      if (priceId !== expectedPriceId) {
        return NextResponse.json(
          { error: 'Price ID does not match tier' },
          { status: 400 }
        );
      }

      sessionParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl || `${baseUrl}/success?status=success&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${baseUrl}/?status=cancelled&tier=${tier}`,
        metadata: {
          tier: tier,
          service: 'ai-blueprint',
          tier_name: tier === 'ai-blueprint-essentials' ? 'AI Blueprint Essentials' : 'AI Blueprint Professional',
          tier_price: tier === 'ai-blueprint-essentials' ? '199' : '499',
          subscription_type: 'monthly'
        },
        subscription_data: {
          metadata: {
            tier: tier,
            service: 'ai-blueprint'
          }
        }
      };

      // Add trial period if specified
      if (trialDays && parseInt(trialDays) > 0) {
        sessionParams.subscription_data!.trial_period_days = parseInt(trialDays);
      }

      // Add coupon support
      const couponCode = searchParams.get('coupon');
      if (couponCode) {
        sessionParams.discounts = [{ coupon: couponCode }];
      }

    } else {
      // Handle legacy one-time payment tiers
      tierMapping = getAIBlueprintStripeMappingForTier(tier as AIBlueprintTier);
      
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

      sessionParams = {
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
    }

    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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
