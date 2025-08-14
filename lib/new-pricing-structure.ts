// New 2025 multi-tier pricing configuration
// Keep this file UI-friendly: minimal logic, pure data + helpers.

export type NewPricingTierId =
  | 'self_serve_assessment'
  | 'team_monthly'
  | 'team_yearly'
  | 'board_ready'
  | 'enterprise_program';

export interface NewPricingTier {
  id: NewPricingTierId;
  name: string;
  tagline?: string;
  badge?: string;
  type: 'one_off' | 'subscription';
  period?: 'month' | 'year';
  price: number; // Display price (USD)
  cta: string;
  highlights: string[];
  deliverables: string[];
  stripeEnvKey: string; // Name of env var containing Stripe Price ID
}

export const NEW_PRICING_TIERS: NewPricingTier[] = [
  {
    id: 'self_serve_assessment',
    name: 'Self-Serve Assessment',
    tagline: 'Rapid baseline + AI Narrative PDF',
    type: 'one_off',
    price: 1950,
    cta: 'Purchase Assessment',
    badge: 'Fast Start',
    highlights: [
      'Autonomous survey access',
      'Full AI narrative PDF',
      'Baseline maturity scoring',
      'Priority recommendations'
    ],
    deliverables: [
      'Survey access (single org)',
      'Automated AI readiness scoring',
      'Narrative PDF (exec-friendly)',
      'Top priority gaps & actions'
    ],
    stripeEnvKey: 'STRIPE_PRICE_SELF_SERVE_ASSESSMENT'
  },
  {
    id: 'team_monthly',
    name: 'Team Platform',
    tagline: 'Ongoing access + updates',
    type: 'subscription',
    period: 'month',
    price: 795,
    cta: 'Start Monthly',
    highlights: [
      'Unlimited survey runs',
      'Continuous scoring updates',
      'AI maturity trend tracking',
      'Team workspace'
    ],
    deliverables: [
      'All Self-Serve features',
      'Unlimited reruns + iteration',
      'Team collaboration workspace',
      'Change over time analytics'
    ],
    stripeEnvKey: 'STRIPE_PRICE_TEAM_MONTHLY'
  },
  {
    id: 'team_yearly',
    name: 'Team Platform (Annual)',
    tagline: 'Yearly subscription – best value',
    type: 'subscription',
    period: 'year',
    price: 7995, // Example: ~ 2 months free equivalent
    cta: 'Start Annual',
    badge: 'Save vs Monthly',
    highlights: [
      'Everything in Team Monthly',
      'Annual benchmarking snapshot',
      'Priority roadmap suggestions',
      'Preferred support'
    ],
    deliverables: [
      'All Team Monthly features',
      'Annual benchmark comparison',
      'Roadmap recommendation bundle',
      'Priority async support'
    ],
    stripeEnvKey: 'STRIPE_PRICE_TEAM_YEARLY'
  },
  {
    id: 'board_ready',
    name: 'Board-Ready Package',
    tagline: 'Executive-grade narrative + facilitation',
    type: 'one_off',
    price: 14500,
    cta: 'Book Board-Ready',
    badge: 'Executive',
    highlights: [
      'Executive narrative refinement',
      'Facilitated findings workshop',
      'Strategic Q&A session',
      'Risk & investment framing'
    ],
    deliverables: [
      'Everything in Team Platform',
      'Human refinement & synthesis',
      'Executive workshop (virtual)',
      'Board-ready briefing deck',
      'Stakeholder Q&A facilitation'
    ],
    stripeEnvKey: 'STRIPE_PRICE_BOARD_READY'
  },
  {
    id: 'enterprise_program',
    name: 'Enterprise Program',
    tagline: 'Transformation enablement + roadmap co-creation',
    type: 'one_off',
    price: 48000,
    cta: 'Request Enterprise',
    badge: 'Full Program',
    highlights: [
      'Multi-team orchestration',
      'Strategic roadmap co-build',
      'Change management guidance',
      'Embedded advisory cadence'
    ],
    deliverables: [
      'All Board-Ready deliverables',
      'Portfolio opportunity mapping',
      'Executive alignment sessions',
      'Adoption & operating model guidance',
      'Quarterly strategic advisory'
    ],
    stripeEnvKey: 'STRIPE_PRICE_ENTERPRISE_PROGRAM'
  }
];

// Helper: get tier definition
export function getTier(id: NewPricingTierId) {
  return NEW_PRICING_TIERS.find(t => t.id === id);
}

// Helper: resolve Stripe Price ID from env for given tier
export function getStripePriceId(id: NewPricingTierId): string | undefined {
  const tier = getTier(id);
  if (!tier) return undefined;
  if (typeof process === 'undefined') return undefined;
  return process.env[tier.stripeEnvKey];
}

// List all env var names required so deployment scripts can validate
export const REQUIRED_NEW_PRICE_ENV_VARS = NEW_PRICING_TIERS.map(t => t.stripeEnvKey);
