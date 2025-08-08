/**
 * Unified AI Service Configuration
 * Single service package with monthly and yearly options
 */

export type AIServiceTier = 'ai-readiness-complete';

export interface AIServiceConfig {
  id: AIServiceTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  includesEverything: boolean;
  trialDays: number;
}

export const AI_SERVICE_COMPLETE = {
  id: 'ai-readiness-complete',
  name: 'Complete AI Implementation Service',
  description: 'Fully autonomous AI implementation with comprehensive analysis, policies, and reporting',
  tagline: 'Everything you need for successful AI integration',
  
  // Backwards compatibility
  trialDays: 7,
  
  pricing: {
    monthly: {
      price: 99,
      priceId: process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_MONTHLY || 'price_1Rta8CGrA5DxvwDN5CwgmHj1',
      period: 'month'
    },
    yearly: {
      price: 999,
      priceId: process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_YEARLY || 'price_1Rta8CGrA5DxvwDN4tAF3N8w',
      period: 'year',
      discount: '15.9% off'
    }
  },

  trial: {
    enabled: true,
    days: 7,
    description: '7-day free trial - no commitment'
  },

  // Flattened features for backwards compatibility with pricing page
  features: [
    'AI-powered institutional analysis',
    'Automated policy generation', 
    'Risk assessment & compliance reports',
    'Implementation roadmap creation',
    'Real-time progress monitoring',
    'Automated stakeholder communications',
    'Comprehensive AI readiness assessment',
    'Custom AI governance policies',
    'Risk mitigation strategies',
    'Implementation timeline & milestones',
    'Training & adoption frameworks',
    'Ongoing monitoring dashboards',
    'Fully autonomous implementation',
    'AI-driven progress updates',
    'Self-service knowledge base',
    'Community forum access'
  ],

  // Detailed feature categories
  featureCategories: {
    autonomous: [
      'AI-powered institutional analysis',
      'Automated policy generation',
      'Risk assessment & compliance reports',
      'Implementation roadmap creation',
      'Real-time progress monitoring',
      'Automated stakeholder communications'
    ],
    deliverables: [
      'Comprehensive AI readiness assessment',
      'Custom AI governance policies',
      'Risk mitigation strategies',
      'Implementation timeline & milestones',
      'Training & adoption frameworks',
      'Ongoing monitoring dashboards'
    ],
    support: [
      'Fully autonomous implementation',
      'AI-driven progress updates',
      'Self-service knowledge base',
      'Community forum access'
    ]
  },

  // Separate paid consultation services
  consultationServices: {
    available: true,
    description: 'Optional human consultation and implementation support',
    note: 'Available for additional fee - not included in subscription',
    services: [
      {
        name: 'Expert Consultation Call',
        duration: '60 minutes',
        price: 299,
        priceId: 'price_1RtaXMGrA5DxvwDNRgvRbFe1',
        productId: 'prod_SpF1UWAJkUmRBD',
        type: 'one_time',
        description: 'One-on-one strategy session with AI implementation expert'
      },
      {
        name: 'Implementation Support Package',
        duration: 'Monthly',
        price: 999,
        priceId: 'price_1RtaXfGrA5DxvwDNYqj5czaz',
        productId: 'prod_SpF1qNWUk8JO5k',
        type: 'subscription',
        description: 'Dedicated consultant support for hands-on implementation guidance'
      },
      {
        name: 'Custom Policy Review',
        duration: 'One-time',
        price: 499,
        priceId: 'price_1RtaXtGrA5DxvwDNrj05RDRp',
        productId: 'prod_SpF15ihrUGXZoO',
        type: 'one_time',
        description: 'Expert review and refinement of your AI policies'
      }
    ]
  },

  autonomousNote: 'This service is designed to be fully autonomous. All analysis, reporting, and implementation guidance is AI-powered and requires no human intervention.'
}

export const PRICING_DISPLAY = {
  monthly: {
    price: 99,
    period: 'month',
    savings: null,
    description: 'Perfect for getting started with AI transformation'
  },
  yearly: {
    price: 999,
    period: 'year',
    savings: 189, // $1188 - $999
    description: 'Best value - save $189 annually'
  }
};

// Helper functions for pricing calculations
export function getYearlySavings(): number {
  return (AI_SERVICE_COMPLETE.pricing.monthly.price * 12) - AI_SERVICE_COMPLETE.pricing.yearly.price;
}

export function getAnnualSavings(): number {
  return getYearlySavings();
}

export function getMonthlyEquivalent(): number {
  return AI_SERVICE_COMPLETE.pricing.yearly.price / 12;
}
