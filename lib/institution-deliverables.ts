/**
 * Institution-Specific Deliverable Templates
 * Provides contextualized deliverables for different educational institution types
 */

import { DetailedInstitutionType } from './institution-types';

export interface DeliverableTemplate {
  title: string;
  description: string;
  sections: string[];
  frameworks: string[];
  stakeholders: string[];
}

export interface MonthlyDeliverables {
  month1: DeliverableTemplate[];
  month2: DeliverableTemplate[];
  month3: DeliverableTemplate[];
  ongoing: DeliverableTemplate[];
}

export const INSTITUTION_DELIVERABLES: Record<DetailedInstitutionType, MonthlyDeliverables> = {
  University: {
    month1: [
      {
        title: 'Academic AI Governance Framework',
        description: 'Comprehensive 18-page analysis of institutional AI readiness across academic and research domains',
        sections: ['Research Ethics Assessment', 'Academic Integrity Policies', 'Faculty Development Needs', 'Institutional Governance Gaps'],
        frameworks: ['NIST AI RMF', 'Research Ethics Guidelines', 'Regional Accreditation Standards'],
        stakeholders: ['Provosts', 'Deans', 'Faculty Senate', 'Research Compliance Office']
      },
      {
        title: 'Faculty Development Roadmap',
        description: 'Strategic plan for AI integration in teaching and research across all academic departments',
        sections: ['Department-Specific Training', 'Research Integration Pathways', 'Teaching Enhancement Tools', 'Academic Freedom Considerations'],
        frameworks: ['Academic Freedom Guidelines', 'Faculty Development Standards', 'Research Best Practices'],
        stakeholders: ['Faculty', 'Department Chairs', 'Teaching Centers', 'Research Offices']
      }
    ],
    month2: [
      {
        title: 'Research AI Integration Plan',
        description: '90-day implementation timeline for AI tools in research and academic programs',
        sections: ['IRB Protocol Updates', 'Research Data Management', 'Academic Program Integration', 'Compliance Monitoring'],
        frameworks: ['Research Ethics Framework', 'Data Governance Policies', 'Academic Standards'],
        stakeholders: ['Researchers', 'IRB Committees', 'Academic Departments', 'IT Services']
      }
    ],
    month3: [
      {
        title: 'Academic Excellence Dashboard',
        description: 'Monitoring system for AI impact on teaching, research, and institutional outcomes',
        sections: ['Research Output Metrics', 'Teaching Effectiveness', 'Student Learning Outcomes', 'Faculty Satisfaction'],
        frameworks: ['Academic Assessment Standards', 'Research Impact Metrics', 'Institutional Effectiveness'],
        stakeholders: ['Academic Leadership', 'Faculty', 'Students', 'Research Administration']
      }
    ],
    ongoing: [
      {
        title: 'Research Ethics Updates',
        description: 'Quarterly updates to research protocols based on evolving AI ethics standards',
        sections: ['Ethics Review Updates', 'Protocol Amendments', 'Training Refreshers', 'Compliance Audits'],
        frameworks: ['Evolving Research Ethics', 'Federal Research Guidelines', 'Institutional Policies'],
        stakeholders: ['IRB', 'Research Community', 'Compliance Office', 'Academic Leadership']
      }
    ]
  },
  
  CommunityCollege: {
    month1: [
      {
        title: 'Workforce AI Readiness Assessment',
        description: 'Comprehensive 15-page analysis of AI integration opportunities across workforce and transfer programs',
        sections: ['Program-Level AI Gaps', 'Industry Alignment Assessment', 'Transfer Pathway Analysis', 'Student Success Metrics'],
        frameworks: ['Workforce Development Standards', 'Transfer Agreements', 'Industry Certification Requirements'],
        stakeholders: ['Program Directors', 'Industry Partners', 'Transfer Coordinators', 'Student Services']
      },
      {
        title: 'Industry Partnership Framework',
        description: 'Strategic plan for engaging employers and industry partners in AI curriculum development',
        sections: ['Employer Needs Assessment', 'Curriculum Alignment', 'Internship Integration', 'Job Placement Tracking'],
        frameworks: ['Industry Standards', 'Accreditation Requirements', 'Workforce Board Guidelines'],
        stakeholders: ['Employers', 'Faculty', 'Career Services', 'Advisory Boards']
      }
    ],
    month2: [
      {
        title: 'Dual Mission Implementation Plan',
        description: '90-day rollout plan balancing workforce development and university transfer preparation',
        sections: ['Workforce Program Integration', 'Transfer Curriculum Enhancement', 'Student Pathway Guidance', 'Community Engagement'],
        frameworks: ['Transfer Standards', 'Workforce Certification', 'Student Success Metrics'],
        stakeholders: ['Faculty', 'Students', 'Transfer Institutions', 'Community Partners']
      }
    ],
    month3: [
      {
        title: 'Community Impact Dashboard',
        description: 'Tracking system for workforce outcomes, transfer success, and community benefit',
        sections: ['Employment Outcomes', 'Transfer Success Rates', 'Community Economic Impact', 'Student Satisfaction'],
        frameworks: ['Workforce Metrics', 'Transfer Tracking', 'Community Impact Assessment'],
        stakeholders: ['Students', 'Employers', 'Transfer Universities', 'Community Leaders']
      }
    ],
    ongoing: [
      {
        title: 'Industry Standards Updates',
        description: 'Quarterly curriculum updates based on evolving industry AI standards and employer needs',
        sections: ['Curriculum Refreshers', 'Industry Feedback Integration', 'Certification Updates', 'Partnership Reviews'],
        frameworks: ['Industry Evolution', 'Certification Bodies', 'Employer Feedback'],
        stakeholders: ['Industry Partners', 'Faculty', 'Program Directors', 'Students']
      }
    ]
  },

  TradeSchool: {
    month1: [
      {
        title: 'Trade AI Integration Assessment',
        description: 'Comprehensive 12-page analysis of AI opportunities across trade and technical programs',
        sections: ['Trade-Specific AI Applications', 'Certification Alignment', 'Employer Requirements', 'Safety Considerations'],
        frameworks: ['Industry Certification Standards', 'Safety Regulations', 'Employer Specifications'],
        stakeholders: ['Trade Instructors', 'Industry Partners', 'Safety Officers', 'Program Directors']
      },
      {
        title: 'Employer Partnership Strategy',
        description: 'Framework for engaging trade employers in AI-enhanced training program development',
        sections: ['Employer Skill Requirements', 'On-the-Job Integration', 'Certification Pathways', 'Job Placement Metrics'],
        frameworks: ['Trade Standards', 'Safety Protocols', 'Industry Certifications'],
        stakeholders: ['Employers', 'Trade Unions', 'Instructors', 'Students']
      }
    ],
    month2: [
      {
        title: 'Hands-On AI Training Plan',
        description: '90-day implementation for integrating AI tools into practical trade training',
        sections: ['Equipment Integration', 'Safety Protocol Updates', 'Instructor Training', 'Student Assessment Methods'],
        frameworks: ['Safety Standards', 'Training Protocols', 'Certification Requirements'],
        stakeholders: ['Instructors', 'Students', 'Safety Personnel', 'Equipment Vendors']
      }
    ],
    month3: [
      {
        title: 'Trade Outcomes Dashboard',
        description: 'Monitoring system for certification rates, job placement, and employer satisfaction',
        sections: ['Certification Success Rates', 'Job Placement Metrics', 'Employer Feedback', 'Student Progression'],
        frameworks: ['Trade Certification Tracking', 'Employment Metrics', 'Industry Satisfaction'],
        stakeholders: ['Students', 'Employers', 'Certification Bodies', 'Program Administration']
      }
    ],
    ongoing: [
      {
        title: 'Trade Technology Updates',
        description: 'Quarterly updates to training programs based on evolving trade technology and AI tools',
        sections: ['Technology Integration', 'Equipment Updates', 'Certification Changes', 'Industry Trends'],
        frameworks: ['Industry Evolution', 'Technology Standards', 'Certification Bodies'],
        stakeholders: ['Industry Partners', 'Instructors', 'Technology Vendors', 'Students']
      }
    ]
  },

  TechnicalCollege: {
    month1: [
      {
        title: 'Technical AI Integration Assessment',
        description: 'Comprehensive analysis of AI opportunities across technical and applied programs',
        sections: ['Program-Specific AI Applications', 'Technology Infrastructure', 'Industry Alignment', 'Student Outcomes'],
        frameworks: ['Technical Standards', 'Industry Certifications', 'Applied Learning Principles'],
        stakeholders: ['Technical Faculty', 'Industry Partners', 'IT Services', 'Program Directors']
      }
    ],
    month2: [
      {
        title: 'Applied Learning Enhancement Plan',
        description: '90-day implementation for AI-enhanced hands-on technical training',
        sections: ['Lab Integration', 'Project-Based Learning', 'Industry Collaboration', 'Assessment Innovation'],
        frameworks: ['Applied Learning Standards', 'Technical Competencies', 'Industry Requirements'],
        stakeholders: ['Faculty', 'Students', 'Lab Coordinators', 'Industry Partners']
      }
    ],
    month3: [
      {
        title: 'Technical Excellence Dashboard',
        description: 'Monitoring system for technical competency development and industry readiness',
        sections: ['Technical Skill Assessment', 'Industry Readiness', 'Innovation Metrics', 'Student Success'],
        frameworks: ['Technical Competency Standards', 'Industry Readiness Metrics', 'Innovation Assessment'],
        stakeholders: ['Students', 'Faculty', 'Industry Partners', 'Technical Coordinators']
      }
    ],
    ongoing: [
      {
        title: 'Technology Evolution Updates',
        description: 'Quarterly updates to technical programs based on advancing technology and AI integration',
        sections: ['Technology Updates', 'Curriculum Evolution', 'Industry Standards', 'Innovation Integration'],
        frameworks: ['Technology Standards', 'Industry Evolution', 'Innovation Principles'],
        stakeholders: ['Industry Partners', 'Faculty', 'Technology Vendors', 'Students']
      }
    ]
  },

  CareerCollege: {
    month1: [
      {
        title: 'Career AI Readiness Assessment',
        description: 'Comprehensive analysis of AI integration opportunities across career-focused programs',
        sections: ['Career Program Analysis', 'Professional Skill Requirements', 'Industry Demand', 'Employment Outcomes'],
        frameworks: ['Career Development Standards', 'Professional Competencies', 'Employment Metrics'],
        stakeholders: ['Career Counselors', 'Industry Partners', 'Program Directors', 'Employment Services']
      }
    ],
    month2: [
      {
        title: 'Professional Development Integration Plan',
        description: '90-day implementation for AI-enhanced career preparation and professional skills',
        sections: ['Professional Skill Development', 'Career Coaching Enhancement', 'Industry Networking', 'Employment Preparation'],
        frameworks: ['Professional Development Standards', 'Career Coaching Principles', 'Industry Connections'],
        stakeholders: ['Career Coaches', 'Students', 'Industry Mentors', 'Professional Networks']
      }
    ],
    month3: [
      {
        title: 'Career Success Dashboard',
        description: 'Monitoring system for career preparation effectiveness and employment outcomes',
        sections: ['Career Readiness Metrics', 'Employment Success', 'Professional Network Growth', 'Student Satisfaction'],
        frameworks: ['Career Success Metrics', 'Employment Tracking', 'Professional Development Assessment'],
        stakeholders: ['Students', 'Career Services', 'Employers', 'Professional Mentors']
      }
    ],
    ongoing: [
      {
        title: 'Career Market Updates',
        description: 'Quarterly updates to career programs based on evolving job market and professional AI integration',
        sections: ['Job Market Analysis', 'Professional Skill Evolution', 'Industry Networking', 'Career Trend Integration'],
        frameworks: ['Job Market Intelligence', 'Professional Standards', 'Career Trends'],
        stakeholders: ['Career Services', 'Industry Partners', 'Professional Networks', 'Students']
      }
    ]
  },

  K12: {
    month1: [
      {
        title: 'Student-Centered AI Assessment',
        description: 'Comprehensive 12-page analysis of AI readiness across all grade levels and subjects',
        sections: ['Student Privacy Analysis', 'Curriculum Integration Gaps', 'Teacher Readiness Assessment', 'Parent Communication Needs'],
        frameworks: ['COPPA Compliance', 'FERPA Requirements', 'State Education Standards', 'Child Protection Guidelines'],
        stakeholders: ['Teachers', 'Students', 'Parents', 'Administrators']
      }
    ],
    month2: [
      {
        title: 'Classroom Implementation Plan',
        description: '90-day rollout plan for age-appropriate AI integration across grade levels',
        sections: ['Grade-Level Progression', 'Subject Integration', 'Teacher Support Systems', 'Parent Engagement'],
        frameworks: ['Educational Standards', 'Child Development Principles', 'Learning Objectives'],
        stakeholders: ['Teachers', 'Students', 'Parents', 'Curriculum Coordinators']
      }
    ],
    month3: [
      {
        title: 'Student Learning Dashboard',
        description: 'Monitoring system for AI impact on student learning outcomes and engagement',
        sections: ['Learning Outcome Metrics', 'Student Engagement', 'Teacher Effectiveness', 'Parent Satisfaction'],
        frameworks: ['Educational Assessment Standards', 'Student Success Metrics', 'Parent Engagement Guidelines'],
        stakeholders: ['Students', 'Teachers', 'Parents', 'Educational Leadership']
      }
    ],
    ongoing: [
      {
        title: 'Educational Standards Updates',
        description: 'Quarterly updates to AI integration based on evolving educational standards and best practices',
        sections: ['Standards Alignment', 'Best Practice Integration', 'Student Outcome Analysis', 'Community Feedback'],
        frameworks: ['State Educational Standards', 'Federal Guidelines', 'Best Practice Research'],
        stakeholders: ['Educators', 'Students', 'Parents', 'Educational Administration']
      }
    ]
  }
};

export function getDeliverablesForInstitution(
  institutionType: DetailedInstitutionType,
  month: 'month1' | 'month2' | 'month3' | 'ongoing'
): DeliverableTemplate[] {
  return INSTITUTION_DELIVERABLES[institutionType][month] || [];
}

export function getAllDeliverablesForInstitution(institutionType: DetailedInstitutionType): MonthlyDeliverables {
  return INSTITUTION_DELIVERABLES[institutionType];
}
