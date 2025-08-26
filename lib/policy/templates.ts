/**
 * Policy Template Store
 * Pre-built templates and clauses for K12 and Higher Ed
 * @version 1.0.0
 */

import { PolicyTemplate, PolicyClause, Audience, RiskLevel, ToolUseMode } from './types'

export const POLICY_CLAUSES: PolicyClause[] = [
  // Purpose and Scope Clauses
  {
    id: 'purpose-001',
    title: 'Purpose and Scope',
    body: 'This policy establishes guidelines for the responsible use of artificial intelligence (AI) tools and systems within [ORGANIZATION_NAME]. It applies to all faculty, staff, students, and contractors who access, use, or implement AI technologies in educational, research, or administrative contexts.',
    tags: ['purpose', 'scope', 'definitions'],
    riskLevel: 'low',
    audience: ['k12', 'highered'],
    jurisdictions: ['US', 'CA', 'EU'],
    toolUseModes: ['prohibited', 'restricted', 'permitted', 'encouraged'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },
  {
    id: 'purpose-002-k12',
    title: 'K-12 Educational Purpose',
    body: 'This policy governs the use of AI technologies in K-12 educational settings to ensure student safety, privacy protection under COPPA, and educational appropriateness. All AI implementations must support pedagogical goals while maintaining compliance with federal and state education regulations.',
    tags: ['purpose', 'k12', 'coppa', 'education'],
    riskLevel: 'medium',
    audience: ['k12'],
    jurisdictions: ['US'],
    toolUseModes: ['restricted', 'permitted'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },
  {
    id: 'purpose-003-highered',
    title: 'Higher Education Research and Academic Purpose',
    body: 'This policy facilitates responsible AI adoption in higher education research, instruction, and administration while ensuring compliance with FERPA, research ethics standards, and institutional academic integrity policies. AI use must advance educational and research missions while protecting student and research data.',
    tags: ['purpose', 'highered', 'ferpa', 'research'],
    riskLevel: 'medium',
    audience: ['highered'],
    jurisdictions: ['US'],
    toolUseModes: ['permitted', 'encouraged'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Definitions
  {
    id: 'definitions-001',
    title: 'Artificial Intelligence Definition',
    body: 'Artificial Intelligence (AI) refers to computer systems that can perform tasks typically requiring human intelligence, including but not limited to machine learning, natural language processing, computer vision, automated decision-making, and predictive analytics.',
    tags: ['definitions', 'ai', 'technology'],
    riskLevel: 'low',
    audience: ['k12', 'highered'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },
  {
    id: 'definitions-002',
    title: 'High-Risk AI System Definition',
    body: 'High-Risk AI Systems are those that pose significant potential for adverse impact on student welfare, educational outcomes, privacy rights, or institutional operations. This includes AI systems used for student assessment, disciplinary decisions, college admissions, or processing of sensitive personal data.',
    tags: ['definitions', 'high-risk', 'assessment'],
    riskLevel: 'high',
    audience: ['k12', 'highered'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Governance and Oversight
  {
    id: 'governance-001',
    title: 'AI Governance Committee',
    body: 'An AI Governance Committee shall be established comprising representatives from IT, Academic Affairs, Legal, Privacy, and Student Services. The committee shall review AI implementations, approve high-risk AI systems, and ensure ongoing compliance with this policy.',
    tags: ['governance', 'committee', 'oversight'],
    riskLevel: 'medium',
    audience: ['k12', 'highered'],
    dependencies: ['definitions-002'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },
  {
    id: 'governance-002-k12',
    title: 'K-12 Parental Notification',
    body: 'Parents and guardians must be notified when AI systems will be used in educational activities involving their children. For AI systems that collect, use, or store student data, written parental consent must be obtained in compliance with COPPA requirements.',
    tags: ['governance', 'k12', 'coppa', 'parental-consent'],
    riskLevel: 'high',
    audience: ['k12'],
    jurisdictions: ['US'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Data Privacy and Protection
  {
    id: 'privacy-001',
    title: 'Student Data Protection',
    body: 'AI systems that process student educational records must comply with FERPA requirements. Student data shall not be used for AI training without explicit consent, and all data processing must be limited to legitimate educational purposes.',
    tags: ['privacy', 'ferpa', 'student-data'],
    riskLevel: 'high',
    audience: ['k12', 'highered'],
    jurisdictions: ['US'],
    toolUseModes: ['restricted', 'permitted'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },
  {
    id: 'privacy-002-coppa',
    title: 'COPPA Compliance for Under-13 Students',
    body: 'AI systems used with students under 13 years of age must comply with the Children\'s Online Privacy Protection Act (COPPA). This includes obtaining verifiable parental consent before collecting personal information and limiting data collection to what is necessary for the educational purpose.',
    tags: ['privacy', 'coppa', 'k12', 'children'],
    riskLevel: 'critical',
    audience: ['k12'],
    jurisdictions: ['US'],
    toolUseModes: ['restricted'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Risk Assessment
  {
    id: 'risk-001',
    title: 'AI Risk Assessment Requirement',
    body: 'All AI implementations must undergo a risk assessment prior to deployment. The assessment shall evaluate potential impacts on privacy, bias, accuracy, transparency, and educational outcomes. High-risk AI systems require additional review and approval.',
    tags: ['risk-assessment', 'compliance', 'approval'],
    riskLevel: 'medium',
    audience: ['k12', 'highered'],
    dependencies: ['definitions-002', 'governance-001'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Bias and Fairness
  {
    id: 'bias-001',
    title: 'AI Bias Prevention',
    body: 'AI systems must be designed and implemented to minimize bias and ensure fair treatment of all students regardless of race, gender, ethnicity, disability status, or socioeconomic background. Regular bias testing and mitigation measures are required.',
    tags: ['bias', 'fairness', 'equity', 'testing'],
    riskLevel: 'high',
    audience: ['k12', 'highered'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Academic Integrity
  {
    id: 'integrity-001',
    title: 'Academic Integrity and AI Use',
    body: 'Students and faculty must disclose the use of AI tools in academic work when required by course policies or institutional guidelines. AI-generated content must be clearly identified, and students remain responsible for the accuracy and originality of their submitted work.',
    tags: ['academic-integrity', 'disclosure', 'transparency'],
    riskLevel: 'medium',
    audience: ['k12', 'highered'],
    toolUseModes: ['restricted', 'permitted'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Vendor Management
  {
    id: 'vendor-001',
    title: 'AI Vendor Due Diligence',
    body: 'Third-party AI vendors must demonstrate compliance with applicable privacy laws, security standards, and educational regulations. Vendor agreements must include data processing addendums, liability provisions, and audit rights.',
    tags: ['vendor', 'procurement', 'compliance'],
    riskLevel: 'high',
    audience: ['k12', 'highered'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Prohibited Uses
  {
    id: 'prohibited-001',
    title: 'Prohibited AI Uses',
    body: 'AI systems shall not be used for: (1) Automated disciplinary decisions without human review, (2) Surveillance of students beyond legitimate safety purposes, (3) Predictive analytics that could result in discriminatory treatment, (4) Processing of biometric data without explicit consent and legal basis.',
    tags: ['prohibited', 'restrictions', 'surveillance'],
    riskLevel: 'critical',
    audience: ['k12', 'highered'],
    toolUseModes: ['prohibited'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Training and Support
  {
    id: 'training-001',
    title: 'AI Training Requirements',
    body: 'All users of AI systems must complete appropriate training on AI ethics, privacy implications, and institutional policies before gaining access. Training shall be updated annually and include emerging best practices.',
    tags: ['training', 'education', 'competency'],
    riskLevel: 'medium',
    audience: ['k12', 'highered'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  },

  // Monitoring and Compliance
  {
    id: 'monitoring-001',
    title: 'AI System Monitoring',
    body: 'AI systems shall be continuously monitored for performance, bias, and compliance with institutional policies. Regular audits, impact assessments, and user feedback collection are required to ensure ongoing effectiveness and safety.',
    tags: ['monitoring', 'auditing', 'compliance'],
    riskLevel: 'medium',
    audience: ['k12', 'highered'],
    dependencies: ['governance-001'],
    metadata: {
      version: 1,
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      legalReview: true
    }
  }
]

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    id: 'k12-standard',
    name: 'K-12 Standard AI Policy',
    description: 'Comprehensive AI governance policy for K-12 educational institutions with COPPA compliance',
    jurisdiction: 'US',
    audience: 'k12',
    clauses: [
      'purpose-002-k12',
      'definitions-001',
      'definitions-002',
      'governance-001',
      'governance-002-k12',
      'privacy-001',
      'privacy-002-coppa',
      'risk-001',
      'bias-001',
      'integrity-001',
      'vendor-001',
      'prohibited-001',
      'training-001',
      'monitoring-001'
    ],
    version: 1,
    metadata: {
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      status: 'approved'
    }
  },
  {
    id: 'k12-restrictive',
    name: 'K-12 Restrictive AI Policy',
    description: 'Conservative AI policy for K-12 institutions prioritizing safety and minimal AI use',
    jurisdiction: 'US',
    audience: 'k12',
    clauses: [
      'purpose-002-k12',
      'definitions-001',
      'definitions-002',
      'governance-001',
      'governance-002-k12',
      'privacy-001',
      'privacy-002-coppa',
      'risk-001',
      'prohibited-001',
      'training-001'
    ],
    version: 1,
    metadata: {
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      status: 'approved'
    }
  },
  {
    id: 'highered-standard',
    name: 'Higher Education Standard AI Policy',
    description: 'Comprehensive AI governance policy for higher education institutions with research considerations',
    jurisdiction: 'US',
    audience: 'highered',
    clauses: [
      'purpose-003-highered',
      'definitions-001',
      'definitions-002',
      'governance-001',
      'privacy-001',
      'risk-001',
      'bias-001',
      'integrity-001',
      'vendor-001',
      'prohibited-001',
      'training-001',
      'monitoring-001'
    ],
    version: 1,
    metadata: {
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      status: 'approved'
    }
  },
  {
    id: 'highered-research',
    name: 'Higher Education Research-Focused AI Policy',
    description: 'AI policy optimized for research institutions with enhanced research protections',
    jurisdiction: 'US',
    audience: 'highered',
    clauses: [
      'purpose-003-highered',
      'definitions-001',
      'governance-001',
      'privacy-001',
      'risk-001',
      'bias-001',
      'integrity-001',
      'vendor-001',
      'training-001',
      'monitoring-001'
    ],
    version: 1,
    metadata: {
      createdAt: '2025-08-26T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      author: 'Policy Engine',
      status: 'approved'
    }
  }
]

// Clause recommendation weights based on context
export const CLAUSE_WEIGHTS = {
  riskProfile: {
    low: { 'prohibited': 0.3, 'training': 0.7, 'monitoring': 0.5 },
    medium: { 'prohibited': 0.6, 'privacy': 0.8, 'risk-assessment': 0.9 },
    high: { 'prohibited': 0.9, 'privacy': 1.0, 'bias': 1.0, 'governance': 1.0 },
    critical: { 'prohibited': 1.0, 'privacy': 1.0, 'governance': 1.0, 'risk-assessment': 1.0 }
  },
  toolUseMode: {
    prohibited: { 'prohibited': 1.0, 'restrictions': 1.0 },
    restricted: { 'privacy': 1.0, 'risk-assessment': 1.0, 'governance': 0.8 },
    permitted: { 'training': 0.8, 'monitoring': 0.7, 'compliance': 0.6 },
    encouraged: { 'training': 1.0, 'guidance': 0.8, 'best-practices': 0.7 }
  },
  audience: {
    k12: { 'coppa': 1.0, 'parental-consent': 1.0, 'children': 1.0 },
    highered: { 'ferpa': 1.0, 'research': 0.8, 'academic-integrity': 0.9 }
  }
}
