/**
 * Enhanced Institution Type System
 * Provides detailed contextualization for different educational institution types
 */

export type DetailedInstitutionType = 
  | 'K12'
  | 'University'
  | 'CommunityCollege'
  | 'TradeSchool'
  | 'TechnicalCollege'
  | 'CareerCollege';

export type BaseInstitutionType = 'K12' | 'HigherEd';

export interface InstitutionConfig {
  baseType: BaseInstitutionType;
  detailedType: DetailedInstitutionType;
  displayName: string;
  features: string[];
  complianceFrameworks: string[];
  stakeholders: string[];
  leadership: string[];
  assessmentFocus: string[];
}

export const INSTITUTION_CONFIGS: Record<DetailedInstitutionType, InstitutionConfig> = {
  K12: {
    baseType: 'K12',
    detailedType: 'K12',
    displayName: 'K-12 School District',
    features: [
      'Student-centered AI policies',
      'Teacher professional development',
      'Parent communication frameworks',
      'Board governance structures'
    ],
    complianceFrameworks: ['COPPA', 'FERPA', 'State Education AI Guidance'],
    stakeholders: ['teachers', 'students', 'parents', 'administrators'],
    leadership: ['superintendents', 'principals', 'curriculum directors'],
    assessmentFocus: [
      'Classroom integration readiness',
      'Student privacy protection',
      'Teacher training needs',
      'Administrative oversight'
    ]
  },
  University: {
    baseType: 'HigherEd',
    detailedType: 'University',
    displayName: 'University',
    features: [
      'Research ethics frameworks',
      'Faculty academic freedom policies',
      'Graduate program guidelines',
      'Institutional governance'
    ],
    complianceFrameworks: ['NIST AI RMF', 'FERPA', 'Research Ethics', 'Regional Accreditation'],
    stakeholders: ['faculty', 'students', 'researchers', 'staff'],
    leadership: ['provosts', 'deans', 'department chairs', 'presidents'],
    assessmentFocus: [
      'Research integration strategies',
      'Academic integrity policies',
      'Faculty development programs',
      'Institutional AI governance'
    ]
  },
  CommunityCollege: {
    baseType: 'HigherEd',
    detailedType: 'CommunityCollege',
    displayName: 'Community College',
    features: [
      'Workforce development programs',
      'Transfer pathway policies',
      'Industry partnership frameworks',
      'Student success initiatives'
    ],
    complianceFrameworks: ['NIST AI RMF', 'FERPA', 'SACSCOC/ACCJC', 'State Workforce Boards'],
    stakeholders: ['faculty', 'students', 'industry partners', 'staff'],
    leadership: ['presidents', 'vice presidents', 'deans', 'division chairs'],
    assessmentFocus: [
      'Workforce preparation',
      'Transfer student success',
      'Industry collaboration',
      'Student support services'
    ]
  },
  TradeSchool: {
    baseType: 'HigherEd',
    detailedType: 'TradeSchool',
    displayName: 'Trade School',
    features: [
      'Industry certification tracking',
      'Employer partnership agreements',
      'Hands-on training protocols',
      'Job placement frameworks'
    ],
    complianceFrameworks: ['Industry Certifications', 'Licensing Bodies', 'Accrediting Agencies', 'FERPA'],
    stakeholders: ['instructors', 'students', 'employers', 'industry partners'],
    leadership: ['directors', 'program coordinators', 'department heads'],
    assessmentFocus: [
      'Industry certification readiness',
      'Employer satisfaction',
      'Job placement rates',
      'Hands-on training effectiveness'
    ]
  },
  TechnicalCollege: {
    baseType: 'HigherEd',
    detailedType: 'TechnicalCollege',
    displayName: 'Technical College',
    features: [
      'Technology integration programs',
      'Industry-specific training',
      'Professional certification paths',
      'Applied learning frameworks'
    ],
    complianceFrameworks: ['Technical Accreditors', 'Industry Standards', 'FERPA', 'Professional Licensing'],
    stakeholders: ['faculty', 'students', 'industry partners', 'technical staff'],
    leadership: ['presidents', 'deans', 'program directors', 'technical coordinators'],
    assessmentFocus: [
      'Technology integration',
      'Industry alignment',
      'Professional readiness',
      'Applied learning outcomes'
    ]
  },
  CareerCollege: {
    baseType: 'HigherEd',
    detailedType: 'CareerCollege',
    displayName: 'Career College',
    features: [
      'Career-focused programs',
      'Professional skill development',
      'Industry mentorship programs',
      'Employment readiness training'
    ],
    complianceFrameworks: ['Career College Accreditors', 'Professional Standards', 'FERPA', 'Employment Regulations'],
    stakeholders: ['instructors', 'students', 'career counselors', 'industry mentors'],
    leadership: ['directors', 'program managers', 'career services heads'],
    assessmentFocus: [
      'Career readiness',
      'Professional skill development',
      'Industry connections',
      'Employment outcomes'
    ]
  }
};

export function getInstitutionConfig(detailedType: DetailedInstitutionType): InstitutionConfig {
  return INSTITUTION_CONFIGS[detailedType];
}

export function getBaseType(detailedType: DetailedInstitutionType): BaseInstitutionType {
  return INSTITUTION_CONFIGS[detailedType].baseType;
}

export function getHigherEdTypes(): DetailedInstitutionType[] {
  return Object.keys(INSTITUTION_CONFIGS)
    .filter(key => INSTITUTION_CONFIGS[key as DetailedInstitutionType].baseType === 'HigherEd') as DetailedInstitutionType[];
}

export function detectInstitutionType(domain?: string, userSelection?: string): DetailedInstitutionType {
  if (userSelection) {
    return userSelection as DetailedInstitutionType;
  }
  
  if (domain) {
    // Community colleges often have .edu domains with specific patterns
    if (domain.includes('community') || domain.includes('cc.')) {
      return 'CommunityCollege';
    }
    // Trade schools might have specific patterns
    if (domain.includes('trade') || domain.includes('technical') || domain.includes('career')) {
      return 'TradeSchool';
    }
    // Universities typically have .edu domains
    if (domain.includes('.edu') && (domain.includes('university') || domain.includes('college'))) {
      return 'University';
    }
    // K-12 domains often have .k12 or school district patterns
    if (domain.includes('.k12.') || domain.includes('school') || domain.includes('district')) {
      return 'K12';
    }
  }
  
  // Default fallback
  return 'University';
}

export function getContextualizedContent(detailedType: DetailedInstitutionType) {
  const config = getInstitutionConfig(detailedType);
  
  return {
    assessmentTitle: `${config.displayName} AI Readiness Assessment`,
    assessmentDescription: `Comprehensive AI readiness assessment designed specifically for ${config.displayName.toLowerCase()}s`,
    welcomeMessage: `Welcome to your ${config.displayName} AI Blueprint Dashboard. Track your institution's AI readiness progress and access implementation resources tailored for your specific educational environment.`,
    stakeholdersList: config.stakeholders.join(', '),
    leadershipTerms: config.leadership.join(', '),
    complianceFrameworks: config.complianceFrameworks.join(', '),
    features: config.features
  };
}
