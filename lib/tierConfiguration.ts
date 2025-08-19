/**
 * AI Readiness Tier Configuration
 * Defines assessment tiers specific to AI readiness evaluation
 */

export interface AIReadinessTierConfig {
  name: string;
  price: number;
  questions: number;
  algorithms: string[];
  features: string[];
  reportPages: number;
  analysisDepth: 'basic' | 'standard' | 'comprehensive' | 'enterprise';
  includeAdvanced: boolean;
}

export const AI_READINESS_TIERS: Record<string, AIReadinessTierConfig> = {
  'basic-assessment': {
    name: 'Basic AI Readiness',
    price: 1995,
    questions: 50,
    algorithms: ['AIRIX', 'AIRS'],
    features: [
      'Basic AI readiness scoring',
      'Foundational recommendations',
      'Simple PDF report'
    ],
    reportPages: 12,
    analysisDepth: 'basic',
    includeAdvanced: false
  },
  
  'advanced-assessment': {
    name: 'Advanced AI Assessment',
    price: 4995,
    questions: 105,
    algorithms: ['AIRIX', 'AIRS', 'AICS', 'AIMS'],
    features: [
      'Comprehensive AI readiness analysis',
      'Implementation capacity scoring',
      'Maturity level assessment',
      'Strategic recommendations',
      'AI-powered PDF report'
    ],
    reportPages: 20,
    analysisDepth: 'standard',
    includeAdvanced: true
  },
  
  'comprehensive-assessment': {
    name: 'Comprehensive AI Assessment',
    price: 12000,
    questions: 150,
    algorithms: ['AIRIX', 'AIRS', 'AICS', 'AIMS', 'AIPS', 'AIBS'],
    features: [
      'Full AI readiness algorithm suite',
      'Priority scoring and benchmarking',
      'Policy development guidance',
      'Implementation roadmap',
      'Advanced AI-powered analytics',
      'Historical trend analysis'
    ],
    reportPages: 30,
    analysisDepth: 'comprehensive',
    includeAdvanced: true
  }
};

export const getAIReadinessTierConfig = (tier: string): AIReadinessTierConfig => {
  return AI_READINESS_TIERS[tier] || AI_READINESS_TIERS['basic-assessment'];
};

export const getAlgorithmsForTier = (tier: string): string[] => {
  return getAIReadinessTierConfig(tier).algorithms;
};
