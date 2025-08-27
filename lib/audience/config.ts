/**
 * Audience Configuration
 * Centralized config for copy, roles, labels, and URLs per audience
 */

import { Audience } from './deriveAudience';

export interface AudienceConfig {
  // Identity & Branding
  name: string;
  shortName: string;
  
  // Organizational Structure
  roles: string[];
  nouns: {
    org: string;           // District vs Institution/University
    unit: string;          // School vs College/Department  
    leader: string;        // Superintendent vs Provost/Dean
    board: string;         // School Board vs Faculty Senate
    compliance: string;    // State Standards vs Accreditation
    organization: string;  // Organization type
  };
  
  // External Integrations
  calendlyUrl: string;
  slackInviteUrl?: string;
  
  // Copy & Messaging
  copy: {
    welcome: string;
    dashboardTitle: string;
    dashboard: string;
    assessmentIntro: string;
    communityCopy: string;
    expertSessionTitle: string;
    expertSessionDescription: string;
    resourcesTitle: string;
    templatePackName: string;
  };
  
  // Assessment & Content
  assessment: {
    bankId: string;
    focusAreas: string[];
    complianceFrameworks: string[];
  };
  
  // Colors & Theming (optional)
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
}

export const audienceConfig: Record<Audience, AudienceConfig> = {
  highered: {
    name: 'Higher Education',
    shortName: 'HigherEd',
    
    roles: [
      'Provost',
      'Vice Provost', 
      'Dean',
      'Associate Dean',
      'Faculty Senate Chair',
      'Accreditation Liaison',
      'IR/IE Director',
      'Academic Affairs',
      'Faculty Development',
      'Educational Technology'
    ],
    
    nouns: {
      org: 'Institution',
      unit: 'College', 
      leader: 'Provost',
      board: 'Faculty Senate',
      compliance: 'Accreditation',
      organization: 'Institution'
    },
    
    calendlyUrl: 'https://calendly.com/jeremyestrella/30min',
    slackInviteUrl: 'https://join.slack.com/t/ai-blueprint/shared_invite/highered',
    
    copy: {
      welcome: 'Welcome to AI Blueprint for Higher Education',
      dashboardTitle: 'Your Institution\'s AI Readiness Dashboard',
      dashboard: 'Institution Dashboard',
      assessmentIntro: 'Evaluate your institution\'s readiness for AI integration across academic and administrative functions.',
      communityCopy: 'Join provosts, deans, faculty leaders, and IR/IE professionals navigating AI transformation in higher education.',
      expertSessionTitle: 'Book a Strategy Session with Higher Ed AI Experts',
      expertSessionDescription: 'Connect with specialists in academic AI integration, faculty development, and accreditation compliance.',
      resourcesTitle: 'Higher Education AI Resources',
      templatePackName: 'Higher Ed AI Policy & Planning Pack'
    },
    
    assessment: {
      bankId: 'highered_v2024',
      focusAreas: [
        'Academic AI Integration',
        'Faculty Development & Training', 
        'Student Learning Analytics',
        'Research & Innovation',
        'Administrative Automation',
        'Academic Integrity',
        'Accreditation Compliance',
        'Data Governance & Privacy'
      ],
      complianceFrameworks: [
        'SACSCOC Standards',
        'Middle States Commission', 
        'WASC Senior College',
        'Higher Learning Commission',
        'FERPA Compliance',
        'Title IX Considerations'
      ]
    },
    
    theme: {
      primaryColor: '#1e3a8a', // Blue-900
      accentColor: '#3b82f6'   // Blue-500
    }
  },
  
  k12: {
    name: 'K-12 Education',
    shortName: 'K-12',
    
    roles: [
      'Superintendent',
      'Assistant Superintendent',
      'Principal', 
      'Assistant Principal',
      'Curriculum Director',
      'Technology Director',
      'Special Education Director',
      'Data & Assessment Director',
      'Professional Development Coordinator',
      'Board Member'
    ],
    
    nouns: {
      org: 'District',
      unit: 'School',
      leader: 'Superintendent', 
      board: 'School Board',
      compliance: 'State Standards',
      organization: 'District'
    },
    
    calendlyUrl: 'https://calendly.com/jeremyestrella/30min',
    slackInviteUrl: 'https://join.slack.com/t/ai-blueprint/shared_invite/k12',
    
    copy: {
      welcome: 'Welcome to AI Blueprint for K-12 Education',
      dashboardTitle: 'Your District\'s AI Readiness Dashboard',
      dashboard: 'District Dashboard',
      assessmentIntro: 'Assess your district\'s preparedness for AI implementation across instruction, operations, and student services.',
      communityCopy: 'Join superintendents, principals, curriculum directors, and education technology leaders pioneering responsible AI adoption.',
      expertSessionTitle: 'Book a Strategy Session with K-12 AI Experts',
      expertSessionDescription: 'Connect with specialists in instructional technology, curriculum integration, and education policy.',
      resourcesTitle: 'K-12 AI Implementation Resources',
      templatePackName: 'K-12 AI Policy & Implementation Pack'
    },
    
    assessment: {
      bankId: 'k12_v2024',
      focusAreas: [
        'Instructional Technology',
        'Curriculum & Assessment',
        'Student Information Systems', 
        'Professional Development',
        'Administrative Operations',
        'Student Safety & Digital Citizenship',
        'State Compliance & Reporting',
        'Parent & Community Engagement'
      ],
      complianceFrameworks: [
        'COPPA Compliance',
        'FERPA Requirements',
        'State Data Privacy Laws',
        'Section 504 & ADA',
        'IDEA Compliance',
        'Title I Requirements'
      ]
    },
    
    theme: {
      primaryColor: '#059669', // Emerald-600  
      accentColor: '#10b981'   // Emerald-500
    }
  }
} as const;

export type AudienceConfigType = typeof audienceConfig[Audience];

/**
 * Get configuration for specific audience
 */
export function getAudienceConfig(audience: Audience): AudienceConfig {
  return audienceConfig[audience];
}

/**
 * Get copy text for specific audience and key
 */
export function getAudienceCopy(audience: Audience, key: keyof AudienceConfig['copy']): string {
  return audienceConfig[audience].copy[key];
}

/**
 * Get noun for specific audience and type
 */
export function getAudienceNoun(audience: Audience, noun: keyof AudienceConfig['nouns']): string {
  return audienceConfig[audience].nouns[noun];
}

/**
 * Get roles for specific audience
 */
export function getAudienceRoles(audience: Audience): string[] {
  return audienceConfig[audience].roles;
}

/**
 * Check if role is valid for audience
 */
export function isValidRoleForAudience(audience: Audience, role: string): boolean {
  return audienceConfig[audience].roles.includes(role);
}

/**
 * Get assessment configuration for audience
 */
export function getAudienceAssessmentConfig(audience: Audience) {
  return audienceConfig[audience].assessment;
}

/**
 * Get external URLs for audience
 */
export function getAudienceUrls(audience: Audience) {
  const config = audienceConfig[audience];
  return {
    calendly: config.calendlyUrl,
    slack: config.slackInviteUrl,
  };
}

/**
 * Get theme configuration for audience
 */
export function getAudienceTheme(audience: Audience) {
  return audienceConfig[audience].theme;
}