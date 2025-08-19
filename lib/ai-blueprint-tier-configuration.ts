/**
 * AI Blueprint Tier Configuration
 * Defines the different tiers and their features for AI Blueprint assessments
 */

export type AIBlueprintTier = 
  | 'higher-ed-ai-pulse-check'
  | 'ai-readiness-comprehensive' 
  | 'ai-transformation-blueprint'
  | 'ai-enterprise-partnership';

export interface AIBlueprintTierConfig {
  id: AIBlueprintTier;
  name: string;
  price: number;
  description: string;
  targetCustomer: string;
  assessmentScope: {
    questionCount: number;
    sections: string[];
    algorithms: string[];
    reportPages: number;
    followUpSupport: string;
  };
  coreDeliverables: string[];
  features: {
    uploadSupport: boolean;
    policyGeneration: boolean;
    scenarioBuilder: boolean;
    facultyEnablement: boolean;
    implementationCoaching: boolean;
    slackSupport: boolean;
    officeHours: boolean;
    customReporting: boolean;
    implementationSupport: boolean;
    quarterlyReassessment: boolean;
  };
  isPopular?: boolean;
}

export const AI_BLUEPRINT_PRICING_TIERS: Record<AIBlueprintTier, AIBlueprintTierConfig> = {
  'higher-ed-ai-pulse-check': {
    id: 'higher-ed-ai-pulse-check',
    name: 'AI Pulse Check',
    price: 299,
    description: 'Quick diagnostic assessment to identify immediate AI opportunities and gaps',
    targetCustomer: 'Small to medium institutions ready for AI exploration',
    assessmentScope: {
      questionCount: 45,
      sections: [
        'Governance & Policy',
        'Infrastructure Readiness',
        'Faculty & Staff Capabilities',
        'Student Experience',
        'Data Management'
      ],
      algorithms: [
        'Readiness Scoring',
        'Gap Analysis',
        'Priority Ranking'
      ],
      reportPages: 15,
      followUpSupport: '30-day email support for clarification and next steps'
    },
    coreDeliverables: [
      'Comprehensive readiness assessment',
      '15-page detailed report',
      'Priority action items',
      'Resource recommendations',
      '30-day email support'
    ],
    features: {
      uploadSupport: false,
      policyGeneration: false,
      scenarioBuilder: false,
      facultyEnablement: false,
      implementationCoaching: false,
      slackSupport: false,
      officeHours: false,
      customReporting: false,
      implementationSupport: false,
      quarterlyReassessment: false
    }
  },
  
  'ai-readiness-comprehensive': {
    id: 'ai-readiness-comprehensive',
    name: 'AI Readiness Comprehensive',
    price: 999,
    description: 'Deep-dive assessment with strategic roadmap and implementation guidance',
    targetCustomer: 'Medium to large institutions seeking strategic AI planning',
    assessmentScope: {
      questionCount: 105,
      sections: [
        'Governance & Policy',
        'Infrastructure Readiness',
        'Faculty & Staff Capabilities',
        'Student Experience',
        'Data Management',
        'Academic Integration',
        'Research & Innovation',
        'Compliance & Ethics'
      ],
      algorithms: [
        'Advanced Readiness Scoring',
        'Comparative Benchmarking',
        'ROI Projection',
        'Risk Assessment',
        'Implementation Sequencing'
      ],
      reportPages: 35,
      followUpSupport: '90-day advisory support with monthly check-ins'
    },
    coreDeliverables: [
      'Comprehensive assessment across 8 domains',
      '35-page strategic report',
      'Benchmarking against peer institutions',
      'ROI projections and budget planning',
      '90-day advisory support',
      'Implementation roadmap'
    ],
    features: {
      uploadSupport: true,
      policyGeneration: false,
      scenarioBuilder: false,
      facultyEnablement: true,
      implementationCoaching: false,
      slackSupport: true,
      officeHours: false,
      customReporting: true,
      implementationSupport: false,
      quarterlyReassessment: false
    }
  },

  'ai-transformation-blueprint': {
    id: 'ai-transformation-blueprint',
    name: 'AI Transformation Blueprint',
    price: 2499,
    description: 'Complete transformation strategy with hands-on implementation support',
    targetCustomer: 'Large institutions ready for comprehensive AI transformation',
    assessmentScope: {
      questionCount: 125,
      sections: [
        'Governance & Policy',
        'Infrastructure Readiness', 
        'Faculty & Staff Capabilities',
        'Student Experience',
        'Data Management',
        'Academic Integration',
        'Research & Innovation',
        'Compliance & Ethics',
        'Change Management',
        'Performance Metrics'
      ],
      algorithms: [
        'Advanced Readiness Scoring',
        'Predictive Modeling',
        'Comparative Benchmarking',
        'ROI Optimization',
        'Risk Assessment',
        'Implementation Sequencing',
        'Change Impact Analysis'
      ],
      reportPages: 60,
      followUpSupport: '6-month strategic partnership with monthly strategy sessions'
    },
    coreDeliverables: [
      'Comprehensive assessment across 10 domains',
      '60-page transformation blueprint',
      'Detailed implementation timeline',
      'Budget planning and ROI projections',
      'Change management strategy',
      '6-month strategic partnership',
      'Monthly strategy sessions'
    ],
    features: {
      uploadSupport: true,
      policyGeneration: true,
      scenarioBuilder: true,
      facultyEnablement: true,
      implementationCoaching: true,
      slackSupport: true,
      officeHours: true,
      customReporting: true,
      implementationSupport: true,
      quarterlyReassessment: false
    },
    isPopular: true
  },

  'ai-enterprise-partnership': {
    id: 'ai-enterprise-partnership',
    name: 'Enterprise AI Partnership',
    price: 9999,
    description: 'Full-service partnership with dedicated team and ongoing transformation support',
    targetCustomer: 'Enterprise institutions needing dedicated transformation partnerships',
    assessmentScope: {
      questionCount: 150,
      sections: [
        'Governance & Policy',
        'Infrastructure Readiness',
        'Faculty & Staff Capabilities', 
        'Student Experience',
        'Data Management',
        'Academic Integration',
        'Research & Innovation',
        'Compliance & Ethics',
        'Change Management',
        'Performance Metrics',
        'Stakeholder Engagement',
        'Technology Integration'
      ],
      algorithms: [
        'Advanced Readiness Scoring',
        'Predictive Modeling',
        'Comparative Benchmarking',
        'ROI Optimization',
        'Risk Assessment',
        'Implementation Sequencing',
        'Change Impact Analysis',
        'Continuous Monitoring',
        'Performance Optimization'
      ],
      reportPages: 85,
      followUpSupport: '12-month enterprise partnership with dedicated team and quarterly reviews'
    },
    coreDeliverables: [
      'Comprehensive assessment across 12 domains',
      '85-page enterprise transformation guide',
      'Dedicated transformation team',
      'Quarterly strategic reviews',
      'Custom training programs',
      'Ongoing performance monitoring',
      '12-month enterprise partnership'
    ],
    features: {
      uploadSupport: true,
      policyGeneration: true,
      scenarioBuilder: true,
      facultyEnablement: true,
      implementationCoaching: true,
      slackSupport: true,
      officeHours: true,
      customReporting: true,
      implementationSupport: true,
      quarterlyReassessment: true
    }
  }
};

export function getAIBlueprintTierFeatures(tier: AIBlueprintTier): AIBlueprintTierConfig | null {
  return AI_BLUEPRINT_PRICING_TIERS[tier] || null;
}

export function getAllAIBlueprintTiers(): AIBlueprintTierConfig[] {
  return Object.values(AI_BLUEPRINT_PRICING_TIERS);
}

export function isValidAIBlueprintTier(tier: string): tier is AIBlueprintTier {
  return Object.keys(AI_BLUEPRINT_PRICING_TIERS).includes(tier);
}
