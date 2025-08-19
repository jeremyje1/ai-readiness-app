import { AI_TIERS } from './ai-readiness-questions';
import { getAIBlueprintStripeMappingForTier } from './ai-blueprint-tier-mapping';

/**
 * AI Readiness Products Configuration
 * Defines the different AI readiness assessment products and their features
 */

export interface AIReadinessProduct {
  id: string;
  name: string;
  shortName: string;
  description: string;
  goal?: string;
  duration?: string;
  price: number;
  yearlyPrice?: number;
  features: string[];
  supportLevel: string;
  reportPages: number;
  assessmentTime: string;
  badge?: string;
  isPopular?: boolean;
  stripePriceId?: string;
  category: 'diagnostic' | 'comprehensive' | 'transformation' | 'enterprise';
}

export const AI_READINESS_PRODUCTS: AIReadinessProduct[] = [
  {
    id: 'higher-ed-ai-pulse-check',
    name: AI_TIERS['higher-ed-ai-pulse-check'].name,
    shortName: 'Pulse Check',
    description: AI_TIERS['higher-ed-ai-pulse-check'].description,
    goal: 'Get started with AI transformation',
    duration: '2-3 weeks',
    price: AI_TIERS['higher-ed-ai-pulse-check'].price,
    features: [
      `Rapid AI readiness assessment (${AI_TIERS['higher-ed-ai-pulse-check'].questionCount} questions)`,
      'Institutional benchmark comparison',
      'Priority action items with timeline',
      'Resource and vendor recommendations',
      'Executive summary for leadership',
      '30-day email support for clarification'
    ],
    supportLevel: 'Email Support (30 days)',
    reportPages: 15,
    assessmentTime: '20-25 minutes',
    badge: 'Quick Start',
  stripePriceId: getAIBlueprintStripeMappingForTier('higher-ed-ai-pulse-check')?.stripePriceId,
    category: 'diagnostic'
  },

  {
    id: 'ai-readiness-comprehensive',
    name: AI_TIERS['ai-readiness-comprehensive'].name,
    shortName: 'Comprehensive',
    description: AI_TIERS['ai-readiness-comprehensive'].description,
    goal: 'Comprehensive analysis and roadmap',
    duration: '4-6 weeks',
    price: AI_TIERS['ai-readiness-comprehensive'].price,
    features: [
      `Comprehensive assessment (${AI_TIERS['ai-readiness-comprehensive'].questionCount} questions)`,
      'Detailed benchmark analysis vs peer institutions',
      'ROI projections and budget planning framework',
      'Faculty development recommendations',
      'Student experience enhancement strategies',
      'Data governance and security protocols',
      '90-day advisory support with monthly check-ins',
      'Dedicated Slack advisory channel'
    ],
    supportLevel: 'Advisory Support (90 days) + Slack',
    reportPages: 35,
    assessmentTime: '40-45 minutes',
    badge: 'Strategic',
    isPopular: true,
  stripePriceId: getAIBlueprintStripeMappingForTier('ai-readiness-comprehensive')?.stripePriceId,
    category: 'comprehensive'
  },

  {
    id: 'ai-transformation-blueprint',
    name: AI_TIERS['ai-transformation-blueprint'].name,
    shortName: 'Blueprint',
    description: AI_TIERS['ai-transformation-blueprint'].description,
    goal: 'Full transformation with implementation support',
    duration: '6-12 months',
    price: AI_TIERS['ai-transformation-blueprint'].price,
    features: [
      `Comprehensive assessment (${AI_TIERS['ai-transformation-blueprint'].questionCount} questions)`,
      'Detailed 18-month implementation roadmap',
      'Change management strategy and stakeholder mapping',
      'Budget optimization and ROI forecasting',
      'Faculty training and development programs',
      'Technology integration recommendations',
      '6-month strategic partnership with monthly sessions',
      'Dedicated Slack advisory channel',
      'Monthly strategy office hours (6 sessions)'
    ],
    supportLevel: 'Strategic Partnership (6 months)',
    reportPages: 60,
    assessmentTime: '60-75 minutes',
    badge: 'Transformation',
  stripePriceId: getAIBlueprintStripeMappingForTier('ai-transformation-blueprint')?.stripePriceId,
    category: 'transformation'
  },

  {
    id: 'ai-enterprise-partnership',
    name: AI_TIERS['ai-enterprise-partnership'].name,
    shortName: 'Enterprise',
    description: AI_TIERS['ai-enterprise-partnership'].description,
    goal: 'Enterprise-scale transformation partnership',
    duration: '12+ months',
    price: AI_TIERS['ai-enterprise-partnership'].price,
    features: [
      `Enterprise-grade assessment (${AI_TIERS['ai-enterprise-partnership'].questionCount} questions)`,
      'Dedicated transformation team assignment',
      'Custom training program development',
      'Quarterly strategic reviews and planning sessions',
      'Technology vendor evaluation and selection support',
      'Ongoing performance monitoring and optimization',
      '12-month enterprise partnership',
      'Priority Slack and phone support',
      'Monthly strategy office hours (12 sessions)',
      'Executive briefings and board presentations'
    ],
    supportLevel: 'Dedicated Team (12 months)',
    reportPages: 85,
    assessmentTime: '90+ minutes',
    badge: 'Enterprise',
  stripePriceId: getAIBlueprintStripeMappingForTier('ai-enterprise-partnership')?.stripePriceId,
    category: 'enterprise'
  }
];

export function getAIReadinessProduct(productId: string): AIReadinessProduct | null {
  return AI_READINESS_PRODUCTS.find(product => product.id === productId) || null;
}

export function getAIReadinessProductsByCategory(category: AIReadinessProduct['category']): AIReadinessProduct[] {
  return AI_READINESS_PRODUCTS.filter(product => product.category === category);
}

export function getAllAIReadinessProducts(): AIReadinessProduct[] {
  return AI_READINESS_PRODUCTS;
}

export function isValidAIReadinessProduct(productId: string): boolean {
  return AI_READINESS_PRODUCTS.some(product => product.id === productId);
}

export function getPopularAIReadinessProducts(): AIReadinessProduct[] {
  return AI_READINESS_PRODUCTS.filter(product => product.isPopular);
}
