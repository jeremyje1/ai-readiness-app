/**
 * AI Blueprint Tier to Stripe Mapping Configuration
 * Maps AI Blueprint tiers to Stripe price IDs and checkout configurations
 */

import type { AIBlueprintTier } from './ai-blueprint-tier-configuration';

export interface AIBlueprintStripeMapping {
  tierName: string;
  tierPrice: number;
  stripePriceId: string;
  successRedirect: string;
  cancelRedirect: string;
  description: string;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name} for AI blueprint pricing`);
  return v;
}

// Uses environment variables so price IDs can be rotated without code changes.
// Define the following in Vercel (or .env):
//  STRIPE_PRICE_PULSE_CHECK
//  STRIPE_PRICE_COMPREHENSIVE
//  STRIPE_PRICE_TRANSFORMATION
//  STRIPE_PRICE_ENTERPRISE
const AI_BLUEPRINT_STRIPE_MAPPING: Record<AIBlueprintTier, AIBlueprintStripeMapping> = {
  'higher-ed-ai-pulse-check': {
    tierName: 'AI Pulse Check',
    tierPrice: 299,
    stripePriceId: process.env.STRIPE_PRICE_PULSE_CHECK || 'missing_pulse_check_price',
    successRedirect: '/ai-blueprint/assessment?tier=higher-ed-ai-pulse-check&status=success',
    cancelRedirect: '/ai-blueprint/pricing?tier=higher-ed-ai-pulse-check&status=cancelled',
    description: 'Quick diagnostic assessment to identify immediate AI opportunities and gaps'
  },
  'ai-readiness-comprehensive': {
    tierName: 'AI Readiness Comprehensive',
    tierPrice: 999,
    stripePriceId: process.env.STRIPE_PRICE_COMPREHENSIVE || 'missing_comprehensive_price',
    successRedirect: '/ai-blueprint/assessment?tier=ai-readiness-comprehensive&status=success',
    cancelRedirect: '/ai-blueprint/pricing?tier=ai-readiness-comprehensive&status=cancelled',
    description: 'Deep-dive assessment with strategic roadmap and implementation guidance'
  },
  'ai-transformation-blueprint': {
    tierName: 'AI Transformation Blueprint',
    tierPrice: 2499,
    stripePriceId: process.env.STRIPE_PRICE_TRANSFORMATION || 'missing_transformation_price',
    successRedirect: '/ai-blueprint/assessment?tier=ai-transformation-blueprint&status=success',
    cancelRedirect: '/ai-blueprint/pricing?tier=ai-transformation-blueprint&status=cancelled',
    description: 'Complete transformation strategy with hands-on implementation support'
  },
  'ai-enterprise-partnership': {
    tierName: 'Enterprise AI Partnership',
    tierPrice: 9999,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'missing_enterprise_price',
    successRedirect: '/ai-blueprint/assessment?tier=ai-enterprise-partnership&status=success',
    cancelRedirect: '/ai-blueprint/pricing?tier=ai-enterprise-partnership&status=cancelled',
    description: 'Full-service partnership with dedicated team and ongoing transformation support'
  }
};

export function getAIBlueprintStripeMappingForTier(tier: AIBlueprintTier): AIBlueprintStripeMapping | null {
  return AI_BLUEPRINT_STRIPE_MAPPING[tier] || null;
}

export function generateAIBlueprintStripeCheckoutUrl(
  tier: AIBlueprintTier,
  customerEmail?: string,
  successUrl?: string,
  cancelUrl?: string
): string {
  const mapping = getAIBlueprintStripeMappingForTier(tier);
  if (!mapping) {
    throw new Error(`Invalid AI Blueprint tier: ${tier}`);
  }

  const baseUrl = '/api/ai-blueprint/stripe/create-checkout';
  const params = new URLSearchParams({
    tier,
    price_id: mapping.stripePriceId
  });

  if (customerEmail) {
    params.append('customer_email', customerEmail);
  }

  if (successUrl) {
    params.append('success_url', successUrl);
  }

  if (cancelUrl) {
    params.append('cancel_url', cancelUrl);
  }

  return `${baseUrl}?${params.toString()}`;
}

export function isValidAIBlueprintStripePrice(tier: AIBlueprintTier, priceId: string): boolean {
  const mapping = getAIBlueprintStripeMappingForTier(tier);
  return mapping?.stripePriceId === priceId;
}

export function getAllAIBlueprintStripeMappings(): AIBlueprintStripeMapping[] {
  return Object.values(AI_BLUEPRINT_STRIPE_MAPPING);
}
