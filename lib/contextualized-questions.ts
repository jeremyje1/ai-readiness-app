/**
 * Institution-Specific Question Bank
 * Provides contextualized questions for different educational institution types
 */

import { DetailedInstitutionType } from './institution-types';

export interface ContextualizedQuestion {
  id: string;
  baseQuestion: string;
  institutionVariants: Partial<Record<DetailedInstitutionType, string>>;
  category: string;
  weight: number;
  options: string[];
  contextualOptions?: Partial<Record<DetailedInstitutionType, string[]>>;
}

export const CONTEXTUALIZED_QUESTIONS: ContextualizedQuestion[] = [
  {
    id: 'AI_LEADERSHIP_01',
    baseQuestion: 'How well does your leadership team understand AI opportunities and risks?',
    institutionVariants: {
      University: 'How well does your academic leadership (provosts, deans) understand AI opportunities and risks in research and instruction?',
      CommunityCollege: 'How well does your executive team understand AI opportunities and risks for workforce development and transfer programs?',
      TradeSchool: 'How well does your leadership team understand AI opportunities and risks for industry training and certification programs?',
      K12: 'How well does your administrative team understand AI opportunities and risks for student learning and teacher support?'
    },
    category: 'Leadership & Governance',
    weight: 25,
    options: ['Not at all', 'Somewhat', 'Moderately', 'Well', 'Very well'],
    contextualOptions: {
      University: ['No research AI strategy', 'Basic awareness', 'Some academic policies', 'Comprehensive research framework', 'Leading AI innovation'],
      CommunityCollege: ['No workforce AI plan', 'Basic industry awareness', 'Some program integration', 'Strong industry partnerships', 'AI workforce leadership'],
      TradeSchool: ['No industry AI strategy', 'Basic trade awareness', 'Some certification updates', 'Strong employer partnerships', 'Industry AI innovation'],
      K12: ['No district AI plan', 'Basic teacher awareness', 'Some classroom policies', 'Comprehensive student framework', 'Educational AI leadership']
    }
  },
  {
    id: 'AI_PROGRAMS_01',
    baseQuestion: 'How are your academic programs integrating AI tools and concepts?',
    institutionVariants: {
      University: 'How are your academic departments and research programs integrating AI tools and concepts?',
      CommunityCollege: 'How are your workforce and transfer programs integrating AI tools and industry standards?',
      TradeSchool: 'How are your training programs integrating AI tools and industry certifications?',
      K12: 'How are your classrooms and curriculum integrating AI tools and concepts?'
    },
    category: 'Program Integration',
    weight: 30,
    options: ['No integration', 'Pilot programs', 'Some departments', 'Most programs', 'Fully integrated'],
    contextualOptions: {
      University: ['No academic AI use', 'Research pilots only', 'Some departments active', 'Cross-disciplinary integration', 'Institution-wide AI curriculum'],
      CommunityCollege: ['No program AI use', 'Workforce pilots only', 'Some programs active', 'Industry-aligned integration', 'Comprehensive AI workforce prep'],
      TradeSchool: ['No training AI use', 'Industry pilots only', 'Some trades active', 'Certification-aligned integration', 'Leading trade AI training'],
      K12: ['No classroom AI use', 'Teacher pilots only', 'Some classes active', 'Grade-level integration', 'District-wide AI curriculum']
    }
  },
  {
    id: 'AI_COMPLIANCE_01',
    baseQuestion: 'How well do your policies address AI compliance requirements?',
    institutionVariants: {
      University: 'How well do your policies address NIST AI RMF, research ethics, and academic integrity requirements?',
      CommunityCollege: 'How well do your policies address accreditation, workforce standards, and transfer requirements?',
      TradeSchool: 'How well do your policies address industry certifications, licensing, and employer standards?',
      K12: 'How well do your policies address COPPA, FERPA, and state education requirements?'
    },
    category: 'Compliance & Risk',
    weight: 25,
    options: ['No policies', 'Basic guidelines', 'Some coverage', 'Comprehensive policies', 'Leading practices'],
    contextualOptions: {
      University: ['No AI policies', 'Basic research guidelines', 'Academic integrity focus', 'NIST-aligned framework', 'Research AI excellence'],
      CommunityCollege: ['No AI policies', 'Basic workforce guidelines', 'Transfer compatibility', 'Industry-aligned policies', 'Workforce AI leadership'],
      TradeSchool: ['No AI policies', 'Basic trade guidelines', 'Certification focus', 'Industry-standard policies', 'Trade AI innovation'],
      K12: ['No AI policies', 'Basic student guidelines', 'Teacher support focus', 'Comprehensive student protection', 'Educational AI excellence']
    }
  },
  {
    id: 'AI_STAKEHOLDER_01',
    baseQuestion: 'How engaged are your key stakeholders in AI planning?',
    institutionVariants: {
      University: 'How engaged are faculty, students, and researchers in AI strategy development?',
      CommunityCollege: 'How engaged are faculty, students, and industry partners in AI planning?',
      TradeSchool: 'How engaged are instructors, students, and employers in AI integration planning?',
      K12: 'How engaged are teachers, students, and parents in AI policy development?'
    },
    category: 'Stakeholder Engagement',
    weight: 20,
    options: ['Not engaged', 'Limited input', 'Some participation', 'Active involvement', 'Co-creating strategy'],
    contextualOptions: {
      University: ['Faculty unaware', 'Limited research input', 'Academic committee involvement', 'Cross-campus collaboration', 'University-wide AI community'],
      CommunityCollege: ['Staff unaware', 'Limited industry input', 'Program coordinator involvement', 'Community partnerships', 'Regional AI leadership'],
      TradeSchool: ['Instructors unaware', 'Limited employer input', 'Program manager involvement', 'Industry partnerships', 'Trade sector AI leadership'],
      K12: ['Teachers unaware', 'Limited parent input', 'Committee involvement', 'Community engagement', 'District AI community']
    }
  }
];

export function getContextualizedQuestion(
  question: ContextualizedQuestion,
  institutionType: DetailedInstitutionType
): {
  question: string;
  options: string[];
} {
  const contextualQuestion = question.institutionVariants[institutionType] || question.baseQuestion;
  const contextualOptions = question.contextualOptions?.[institutionType] || question.options;
  
  return {
    question: contextualQuestion,
    options: contextualOptions
  };
}

export function getQuestionsForInstitution(institutionType: DetailedInstitutionType): Array<{
  id: string;
  question: string;
  category: string;
  weight: number;
  options: string[];
}> {
  return CONTEXTUALIZED_QUESTIONS.map(q => {
    const contextual = getContextualizedQuestion(q, institutionType);
    return {
      id: q.id,
      question: contextual.question,
      category: q.category,
      weight: q.weight,
      options: contextual.options
    };
  });
}

// Institution-specific assessment focus areas
export const INSTITUTION_ASSESSMENT_DOMAINS = {
  University: [
    'Research Ethics & AI',
    'Academic Integrity Policies',
    'Faculty Development',
    'Graduate Program Integration',
    'Institutional Governance',
    'Research Compliance'
  ],
  CommunityCollege: [
    'Workforce Development',
    'Transfer Program Alignment',
    'Industry Partnerships',
    'Student Success Services',
    'Community Engagement',
    'Accreditation Compliance'
  ],
  TradeSchool: [
    'Industry Certification',
    'Employer Partnerships',
    'Hands-on Training',
    'Job Placement Services',
    'Technical Skills Development',
    'Licensing Compliance'
  ],
  TechnicalCollege: [
    'Technology Integration',
    'Applied Learning',
    'Industry Alignment',
    'Professional Certification',
    'Technical Innovation',
    'Skills Assessment'
  ],
  CareerCollege: [
    'Career Preparation',
    'Professional Development',
    'Employment Services',
    'Industry Mentorship',
    'Skill Validation',
    'Career Outcomes'
  ],
  K12: [
    'Student Privacy Protection',
    'Teacher Professional Development',
    'Curriculum Integration',
    'Parent Communication',
    'Administrative Oversight',
    'Educational Outcomes'
  ]
};

export function getAssessmentDomains(institutionType: DetailedInstitutionType): string[] {
  return INSTITUTION_ASSESSMENT_DOMAINS[institutionType] || INSTITUTION_ASSESSMENT_DOMAINS.University;
}
