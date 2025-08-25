/**
 * Institution-Specific Compliance Framework System
 * Provides detailed compliance requirements for different educational institution types
 */

import { DetailedInstitutionType } from './institution-types';

export interface ComplianceFramework {
  name: string;
  category: 'federal' | 'state' | 'accreditation' | 'industry' | 'professional';
  description: string;
  requirements: string[];
  updateFrequency: 'monthly' | 'quarterly' | 'annually' | 'as-needed';
  criticality: 'essential' | 'important' | 'recommended';
}

export interface InstitutionCompliance {
  primaryFrameworks: ComplianceFramework[];
  secondaryFrameworks: ComplianceFramework[];
  industrySpecific: ComplianceFramework[];
  monitoringRequirements: string[];
}

export const COMPLIANCE_FRAMEWORKS: Record<string, ComplianceFramework> = {
  // Federal Frameworks
  NIST_AI_RMF: {
    name: 'NIST AI Risk Management Framework',
    category: 'federal',
    description: 'Federal framework for managing AI risks in organizational contexts',
    requirements: [
      'AI Risk Assessment',
      'Governance Structure',
      'Risk Mitigation Strategies',
      'Monitoring and Evaluation'
    ],
    updateFrequency: 'quarterly',
    criticality: 'essential'
  },
  
  FERPA: {
    name: 'Family Educational Rights and Privacy Act',
    category: 'federal',
    description: 'Federal law protecting student education records and privacy',
    requirements: [
      'Student Data Protection',
      'Consent Management',
      'Access Controls',
      'Disclosure Limitations'
    ],
    updateFrequency: 'as-needed',
    criticality: 'essential'
  },
  
  COPPA: {
    name: 'Children\'s Online Privacy Protection Act',
    category: 'federal',
    description: 'Federal law protecting children\'s online privacy under age 13',
    requirements: [
      'Parental Consent',
      'Data Minimization',
      'Secure Data Handling',
      'Child-Safe Design'
    ],
    updateFrequency: 'as-needed',
    criticality: 'essential'
  },
  
  // Accreditation Bodies
  SACSCOC: {
    name: 'Southern Association of Colleges and Schools Commission on Colleges',
    category: 'accreditation',
    description: 'Regional accreditor for higher education institutions in the South',
    requirements: [
      'Institutional Effectiveness',
      'Educational Quality',
      'Governance Standards',
      'Resource Management'
    ],
    updateFrequency: 'annually',
    criticality: 'essential'
  },
  
  ACCJC: {
    name: 'Accrediting Commission for Community and Junior Colleges',
    category: 'accreditation',
    description: 'Regional accreditor for community colleges in Western states',
    requirements: [
      'Student Learning Outcomes',
      'Institutional Improvement',
      'Resource Allocation',
      'Community Engagement'
    ],
    updateFrequency: 'annually',
    criticality: 'essential'
  },
  
  // Industry-Specific
  AUTOMOTIVE_ASE: {
    name: 'Automotive Service Excellence Certification',
    category: 'industry',
    description: 'Industry certification for automotive repair and service professionals',
    requirements: [
      'Technical Competency',
      'Safety Standards',
      'Equipment Proficiency',
      'Continuing Education'
    ],
    updateFrequency: 'annually',
    criticality: 'important'
  },
  
  HEALTHCARE_HIPAA: {
    name: 'Health Insurance Portability and Accountability Act',
    category: 'federal',
    description: 'Federal law protecting patient health information',
    requirements: [
      'Patient Privacy',
      'Data Security',
      'Access Controls',
      'Breach Notification'
    ],
    updateFrequency: 'as-needed',
    criticality: 'essential'
  },
  
  // Trade-Specific
  OSHA_SAFETY: {
    name: 'Occupational Safety and Health Administration Standards',
    category: 'federal',
    description: 'Federal workplace safety and health standards',
    requirements: [
      'Workplace Safety',
      'Hazard Communication',
      'Training Requirements',
      'Incident Reporting'
    ],
    updateFrequency: 'as-needed',
    criticality: 'essential'
  }
};

export const INSTITUTION_COMPLIANCE_MAP: Record<DetailedInstitutionType, InstitutionCompliance> = {
  University: {
    primaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.NIST_AI_RMF,
      COMPLIANCE_FRAMEWORKS.FERPA,
      COMPLIANCE_FRAMEWORKS.SACSCOC
    ],
    secondaryFrameworks: [],
    industrySpecific: [],
    monitoringRequirements: [
      'Research Ethics Board Review',
      'Academic Freedom Assessment',
      'Faculty Development Tracking',
      'Student Outcome Monitoring'
    ]
  },
  
  CommunityCollege: {
    primaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.NIST_AI_RMF,
      COMPLIANCE_FRAMEWORKS.FERPA,
      COMPLIANCE_FRAMEWORKS.ACCJC
    ],
    secondaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.SACSCOC
    ],
    industrySpecific: [],
    monitoringRequirements: [
      'Workforce Development Outcomes',
      'Transfer Student Success',
      'Industry Partnership Effectiveness',
      'Community Impact Assessment'
    ]
  },
  
  TradeSchool: {
    primaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.FERPA,
      COMPLIANCE_FRAMEWORKS.OSHA_SAFETY
    ],
    secondaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.NIST_AI_RMF
    ],
    industrySpecific: [
      COMPLIANCE_FRAMEWORKS.AUTOMOTIVE_ASE
    ],
    monitoringRequirements: [
      'Industry Certification Rates',
      'Job Placement Tracking',
      'Employer Satisfaction',
      'Safety Compliance'
    ]
  },
  
  TechnicalCollege: {
    primaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.NIST_AI_RMF,
      COMPLIANCE_FRAMEWORKS.FERPA,
      COMPLIANCE_FRAMEWORKS.OSHA_SAFETY
    ],
    secondaryFrameworks: [],
    industrySpecific: [],
    monitoringRequirements: [
      'Technical Competency Development',
      'Industry Alignment',
      'Innovation Integration',
      'Safety Standards Compliance'
    ]
  },
  
  CareerCollege: {
    primaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.FERPA
    ],
    secondaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.NIST_AI_RMF
    ],
    industrySpecific: [],
    monitoringRequirements: [
      'Career Placement Rates',
      'Professional Development Effectiveness',
      'Industry Network Growth',
      'Student Satisfaction'
    ]
  },
  
  K12: {
    primaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.FERPA,
      COMPLIANCE_FRAMEWORKS.COPPA
    ],
    secondaryFrameworks: [
      COMPLIANCE_FRAMEWORKS.NIST_AI_RMF
    ],
    industrySpecific: [],
    monitoringRequirements: [
      'Student Privacy Protection',
      'Educational Outcome Tracking',
      'Parent Engagement Metrics',
      'Teacher Development Progress'
    ]
  }
};

export function getComplianceFrameworks(institutionType: DetailedInstitutionType): InstitutionCompliance {
  return INSTITUTION_COMPLIANCE_MAP[institutionType];
}

export function getAllApplicableFrameworks(institutionType: DetailedInstitutionType): ComplianceFramework[] {
  const compliance = getComplianceFrameworks(institutionType);
  return [
    ...compliance.primaryFrameworks,
    ...compliance.secondaryFrameworks,
    ...compliance.industrySpecific
  ];
}

export function getFrameworksByCategory(
  institutionType: DetailedInstitutionType,
  category: ComplianceFramework['category']
): ComplianceFramework[] {
  const allFrameworks = getAllApplicableFrameworks(institutionType);
  return allFrameworks.filter(framework => framework.category === category);
}

export function getEssentialFrameworks(institutionType: DetailedInstitutionType): ComplianceFramework[] {
  const allFrameworks = getAllApplicableFrameworks(institutionType);
  return allFrameworks.filter(framework => framework.criticality === 'essential');
}
