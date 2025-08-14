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

    // For new subscription tiers, only tier is required
    if (!tier) {
      return NextResponse.json(
        { error: 'Missing required parameter: tier' },
        { status: 400 }
      );
    }

    // For legacy tiers, both tier and price_id are required
    const legacyTiers = ['higher-ed-ai-pulse-check', 'ai-readiness-comprehensive', 'ai-transformation-blueprint', 'ai-enterprise-partnership'];
    if (legacyTiers.includes(tier) && !priceId) {
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
      'ai-blueprint-professional',
      'essentials',
      'professional',
      // New 2025 pricing tiers
      'self-serve-assessment',
      'team-subscription-monthly',
      'team-subscription-yearly',
      'board-ready-pro',
      'enterprise-readiness-program'
    ];

    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid AI Blueprint tier' },
        { status: 400 }
      );
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.NEXT_PUBLIC_APP_URL || 
                    'https://aireadiness.northpathstrategies.org').trim();

    let sessionParams: Stripe.Checkout.SessionCreateParams;
    let tierMapping;

    // Handle new monthly subscription tiers
    if (tier === 'ai-blueprint-essentials' || tier === 'ai-blueprint-professional' || tier === 'essentials' || tier === 'professional' || tier === 'team-subscription-monthly' || tier === 'team-subscription-yearly') {
      // Normalize tier names
      const normalizedTier = tier === 'essentials' ? 'ai-blueprint-essentials' : 
                            tier === 'professional' ? 'ai-blueprint-professional' : tier;
      let tierPriceId: string | undefined;
      if (normalizedTier === 'ai-blueprint-essentials') {
        tierPriceId = process.env.STRIPE_PRICE_AI_BLUEPRINT_ESSENTIALS_MONTHLY || 'price_1Rsp7LGrA5DxvwDNHgskPPpl';
      } else if (normalizedTier === 'ai-blueprint-professional') {
        tierPriceId = process.env.STRIPE_PRICE_AI_BLUEPRINT_PROFESSIONAL_MONTHLY || 'price_1Rsp7MGrA5DxvwDNUNqx3Lsf';
      } else if (normalizedTier === 'team-subscription-monthly') {
        tierPriceId = process.env.STRIPE_PRICE_TEAM_SUBSCRIPTION_MONTHLY || 'price_team_monthly_placeholder';
      } else if (normalizedTier === 'team-subscription-yearly') {
        tierPriceId = process.env.STRIPE_PRICE_TEAM_SUBSCRIPTION_YEARLY || 'price_team_yearly_placeholder';
      }

      // Use provided price_id if available, otherwise use tier-based price_id
      const finalPriceId = priceId || tierPriceId;

      sessionParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: finalPriceId,
            quantity: 1,
          },
        ],
        success_url: successUrl || `${baseUrl}/success?status=success&tier=${normalizedTier}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${baseUrl}/?status=cancelled&tier=${normalizedTier}`,
        metadata: {
          tier: normalizedTier,
          service: 'ai-blueprint',
          tier_name: normalizedTier,
          tier_price: normalizedTier.includes('yearly') ? '10000' : normalizedTier.includes('team-subscription') ? '995' : (normalizedTier === 'ai-blueprint-essentials' ? '199' : '499'),
          subscription_type: normalizedTier.includes('yearly') ? 'annual' : 'monthly'
        },
        subscription_data: {
          metadata: {
            tier: normalizedTier,
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

    } else if (tier === 'self-serve-assessment' || tier === 'board-ready-pro' || tier === 'enterprise-readiness-program') {
      // New one-time pricing tiers (2025)
      const priceEnvMap: Record<string, string> = {
        'self-serve-assessment': process.env.STRIPE_PRICE_SELF_SERVE_ASSESSMENT || 'price_selfserve_placeholder',
        'board-ready-pro': process.env.STRIPE_PRICE_BOARD_READY_PRO || 'price_boardready_placeholder',
        'enterprise-readiness-program': process.env.STRIPE_PRICE_ENTERPRISE_READINESS_PROGRAM || 'price_enterprise_program_placeholder'
      };
      const mappedPriceId = priceEnvMap[tier];
      const finalPriceId = priceId || mappedPriceId;
      if (!finalPriceId) {
        return NextResponse.json({ error: 'Price ID missing for tier' }, { status: 400 });
      }
      sessionParams = {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: finalPriceId,
            quantity: 1,
          },
        ],
        success_url: successUrl || `${baseUrl}/success?status=success&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${baseUrl}/pricing?status=cancelled&tier=${tier}`,
        metadata: {
          tier: tier,
          service: 'ai-blueprint',
          tier_name: tier,
          payment_type: 'one_time'
        },
      };
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
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to create AI Blueprint checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
