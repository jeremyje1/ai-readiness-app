/**
 * Streamlined AI Readiness Assessment
 * 15-20 strategic open-ended questions for better data collection
 */

export interface StreamlinedQuestion {
  id: string;
  category: 'leadership' | 'infrastructure' | 'skills' | 'policy' | 'implementation';
  question: string;
  type: 'textarea' | 'select' | 'multiselect' | 'number';
  placeholder?: string;
  options?: string[];
  helpText?: string;
  required: boolean;
}

export const streamlinedQuestions: StreamlinedQuestion[] = [
  // Leadership & Vision (3 questions)
  {
    id: 'leadership-vision',
    category: 'leadership',
    question: 'What are your primary goals for AI implementation at your institution?',
    type: 'textarea',
    placeholder: 'Describe your vision, expected outcomes, and timeline...',
    helpText: 'Be specific about what you hope to achieve with AI tools (e.g., improve student outcomes, increase efficiency, etc.)',
    required: true
  },
  {
    id: 'leadership-support',
    category: 'leadership',
    question: 'How would you rate your leadership\'s understanding and support for AI initiatives?',
    type: 'select',
    options: [
      'Fully supportive with dedicated resources',
      'Supportive but limited resources',
      'Neutral - needs more information',
      'Skeptical but open to discussion',
      'Not yet engaged'
    ],
    required: true
  },
  {
    id: 'budget-allocation',
    category: 'leadership',
    question: 'What is your estimated annual budget for AI/technology initiatives? (USD)',
    type: 'number',
    placeholder: '50000',
    helpText: 'Include software, hardware, training, and personnel costs',
    required: true
  },

  // Current Infrastructure (4 questions)
  {
    id: 'current-ai-tools',
    category: 'infrastructure',
    question: 'What AI tools or platforms are you currently using? (If any)',
    type: 'textarea',
    placeholder: 'List specific tools, platforms, or systems (e.g., ChatGPT, Google AI, custom solutions)...',
    helpText: 'Include both institutional and individual faculty/staff usage',
    required: true
  },
  {
    id: 'data-infrastructure',
    category: 'infrastructure',
    question: 'Describe your current data infrastructure and systems',
    type: 'textarea',
    placeholder: 'Include student information systems, learning management systems, data warehouses, etc...',
    helpText: 'This helps us understand integration capabilities',
    required: true
  },
  {
    id: 'technology-readiness',
    category: 'infrastructure',
    question: 'How would you describe your institution\'s technology infrastructure?',
    type: 'select',
    options: [
      'Modern and cloud-based with regular updates',
      'Mostly current with some legacy systems',
      'Mix of modern and outdated systems',
      'Primarily legacy systems needing updates',
      'Significant infrastructure challenges'
    ],
    required: true
  },
  {
    id: 'internet-bandwidth',
    category: 'infrastructure',
    question: 'What challenges, if any, do you face with internet connectivity or bandwidth?',
    type: 'textarea',
    placeholder: 'Describe bandwidth limitations, connectivity issues, or infrastructure gaps...',
    required: false
  },

  // Skills & Training (4 questions)
  {
    id: 'faculty-ai-usage',
    category: 'skills',
    question: 'What percentage of your faculty/staff are currently using AI tools? (0-100%)',
    type: 'number',
    placeholder: '25',
    helpText: 'Best estimate is fine',
    required: true
  },
  {
    id: 'training-needs',
    category: 'skills',
    question: 'What are your biggest training and professional development needs around AI?',
    type: 'textarea',
    placeholder: 'Describe skill gaps, training priorities, and development areas...',
    helpText: 'Be specific about roles (teachers, admins, IT staff, etc.)',
    required: true
  },
  {
    id: 'ai-literacy',
    category: 'skills',
    question: 'How would you rate the overall AI literacy of your faculty and staff?',
    type: 'select',
    options: [
      'Advanced - actively creating and using AI tools',
      'Intermediate - comfortable with common AI tools',
      'Basic - aware but limited hands-on experience',
      'Beginner - minimal exposure or understanding',
      'No experience - need foundational training'
    ],
    required: true
  },
  {
    id: 'change-readiness',
    category: 'skills',
    question: 'How ready is your organization for change and new technology adoption?',
    type: 'select',
    options: [
      'Very ready - culture of innovation and experimentation',
      'Moderately ready - open with proper support',
      'Somewhat ready - some resistance expected',
      'Limited readiness - significant change management needed',
      'Not ready - major cultural barriers exist'
    ],
    required: true
  },

  // Policy & Compliance (4 questions)
  {
    id: 'existing-policies',
    category: 'policy',
    question: 'What AI or technology policies do you currently have in place?',
    type: 'textarea',
    placeholder: 'List policies, guidelines, or frameworks (e.g., acceptable use, data privacy, AI ethics)...',
    helpText: 'Include both formal policies and informal guidelines',
    required: true
  },
  {
    id: 'compliance-requirements',
    category: 'policy',
    question: 'What compliance frameworks or regulations must you adhere to?',
    type: 'multiselect',
    options: [
      'FERPA (Family Educational Rights and Privacy Act)',
      'COPPA (Children\'s Online Privacy Protection Act)',
      'HIPAA (Health Insurance Portability and Accountability Act)',
      'GDPR (General Data Protection Regulation)',
      'State-specific education regulations',
      'Title IX requirements',
      'Accessibility standards (ADA, Section 508)',
      'Other/Not sure'
    ],
    required: true
  },
  {
    id: 'data-governance',
    category: 'policy',
    question: 'Describe your current data governance and privacy practices',
    type: 'textarea',
    placeholder: 'Include data handling procedures, privacy protocols, security measures...',
    helpText: 'This helps us ensure compliant AI implementation',
    required: true
  },
  {
    id: 'equity-concerns',
    category: 'policy',
    question: 'What equity, accessibility, or bias concerns do you have regarding AI implementation?',
    type: 'textarea',
    placeholder: 'Describe concerns about digital divide, algorithmic bias, accessibility, etc...',
    required: false
  },

  // Implementation & Challenges (4 questions)
  {
    id: 'primary-challenges',
    category: 'implementation',
    question: 'What are your biggest challenges or barriers to AI adoption?',
    type: 'textarea',
    placeholder: 'Describe obstacles, concerns, or roadblocks (budget, skills, resistance, etc.)...',
    helpText: 'Be honest - this helps us provide relevant solutions',
    required: true
  },
  {
    id: 'use-cases',
    category: 'implementation',
    question: 'What specific use cases or applications are most important to you?',
    type: 'multiselect',
    options: [
      'Personalized learning and adaptive instruction',
      'Administrative automation and efficiency',
      'Student support and intervention',
      'Assessment and grading assistance',
      'Content creation and curriculum development',
      'Data analysis and reporting',
      'Communication and engagement tools',
      'Research and innovation support',
      'Professional development and training',
      'Other/Not sure yet'
    ],
    required: true
  },
  {
    id: 'timeline-expectations',
    category: 'implementation',
    question: 'What is your expected timeline for AI implementation?',
    type: 'select',
    options: [
      'Immediate - already deploying',
      '3-6 months - planning now',
      '6-12 months - exploring options',
      '1-2 years - long-term planning',
      'Not sure yet'
    ],
    required: true
  },
  {
    id: 'success-metrics',
    category: 'implementation',
    question: 'How will you measure success of AI initiatives?',
    type: 'textarea',
    placeholder: 'Describe key performance indicators, metrics, or outcomes you\'ll track...',
    helpText: 'Examples: student achievement, time saved, cost reduction, engagement rates',
    required: true
  }
];

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    leadership: 'Leadership & Vision',
    infrastructure: 'Technology Infrastructure',
    skills: 'Skills & Training',
    policy: 'Policy & Compliance',
    implementation: 'Implementation Planning'
  };
  return labels[category] || category;
};

export const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    leadership: 'Understanding your strategic vision and organizational support',
    infrastructure: 'Assessing your current technology foundation',
    skills: 'Evaluating readiness and training needs',
    policy: 'Ensuring compliance and governance',
    implementation: 'Planning your AI journey'
  };
  return descriptions[category] || '';
};
