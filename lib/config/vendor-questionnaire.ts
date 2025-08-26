/**
 * Vendor Intake Questionnaire Configuration
 * Defines the complete questionnaire with conditional logic
 * @version 1.0.0
 */

import { VendorQuestionnaire, Question, ConditionalRule } from '@/lib/types/vendor'

export const VENDOR_QUESTIONNAIRE: VendorQuestionnaire = {
  sections: {
    basicInfo: {
      title: 'Basic Information',
      description: 'Provide basic details about the vendor and service',
      questions: [
        {
          id: 'vendor_name',
          type: 'text',
          label: 'Vendor Name',
          description: 'Official company name of the vendor',
          required: true,
          placeholder: 'e.g., Example Corp'
        },
        {
          id: 'vendor_url',
          type: 'url',
          label: 'Vendor Website',
          description: 'Primary website URL for the vendor',
          required: true,
          placeholder: 'https://example.com'
        },
        {
          id: 'service_description',
          type: 'textarea',
          label: 'Service Description',
          description: 'Detailed description of the service or tool',
          required: true,
          placeholder: 'Describe the vendor service, its purpose, and key features...'
        },
        {
          id: 'service_category',
          type: 'select',
          label: 'Service Category',
          description: 'Primary category that best describes this service',
          required: true,
          options: [
            'Learning Management System',
            'Assessment Tool',
            'Communication Platform',
            'Content Creation',
            'Data Analytics',
            'AI/ML Service',
            'Administrative Tool',
            'Security Service',
            'Other'
          ]
        },
        {
          id: 'contact_name',
          type: 'text',
          label: 'Primary Contact Name',
          description: 'Name of the primary contact at the vendor',
          required: true
        },
        {
          id: 'contact_email',
          type: 'email',
          label: 'Primary Contact Email',
          description: 'Email address for the primary vendor contact',
          required: true
        },
        {
          id: 'business_justification',
          type: 'textarea',
          label: 'Business Justification',
          description: 'Explain why this vendor service is needed and how it will be used',
          required: true,
          placeholder: 'Describe the educational or business need this service addresses...'
        }
      ]
    },

    dataHandling: {
      title: 'Data Handling',
      description: 'Information about how the vendor handles and processes data',
      questions: [
        {
          id: 'stores_pii',
          type: 'boolean',
          label: 'Does this service store personally identifiable information (PII)?',
          description: 'Any information that can identify a specific individual',
          required: true,
          riskWeight: 15,
          complianceFlags: ['FERPA', 'GDPR', 'COPPA']
        },
        {
          id: 'pii_types',
          type: 'multiselect',
          label: 'What types of PII does the service collect?',
          description: 'Select all that apply',
          required: false,
          options: [
            'Names',
            'Email addresses',
            'Student ID numbers',
            'Social Security numbers',
            'Grades and academic records',
            'Attendance records',
            'Behavioral assessments',
            'Psychological evaluations',
            'Health information',
            'Financial information',
            'Biometric data',
            'Location data',
            'Device identifiers',
            'IP addresses'
          ],
          riskWeight: 10,
          complianceFlags: ['FERPA', 'COPPA', 'PPRA']
        },
        {
          id: 'data_retention',
          type: 'select',
          label: 'How long does the vendor retain data?',
          description: 'Data retention period',
          required: true,
          options: [
            '30 days or less',
            '90 days',
            '1 year',
            '2-5 years',
            'Duration of service',
            'Indefinite',
            'Unknown'
          ],
          riskWeight: 8
        },
        {
          id: 'data_location',
          type: 'multiselect',
          label: 'Where is data stored geographically?',
          description: 'Select all regions where data may be stored',
          required: true,
          options: [
            'United States',
            'European Union',
            'Canada',
            'Asia Pacific',
            'Global/Multiple regions',
            'Unknown'
          ],
          riskWeight: 12,
          complianceFlags: ['GDPR', 'FERPA']
        },
        {
          id: 'encryption_at_rest',
          type: 'boolean',
          label: 'Is data encrypted when stored (at rest)?',
          description: 'Data encryption in databases and storage systems',
          required: true,
          riskWeight: 15
        },
        {
          id: 'encryption_in_transit',
          type: 'boolean',
          label: 'Is data encrypted during transmission (in transit)?',
          description: 'Data encryption during network communication',
          required: true,
          riskWeight: 15
        }
      ],
      conditionalLogic: [
        {
          condition: { questionId: 'stores_pii', operator: 'equals', value: true },
          action: { type: 'require', target: ['pii_types'] }
        },
        {
          condition: { questionId: 'stores_pii', operator: 'equals', value: false },
          action: { type: 'hide', target: ['pii_types'] }
        }
      ]
    },

    aiCapabilities: {
      title: 'AI/ML Capabilities',
      description: 'Information about artificial intelligence and machine learning features',
      questions: [
        {
          id: 'is_ai_service',
          type: 'boolean',
          label: 'Does this service use artificial intelligence or machine learning?',
          description: 'Any AI/ML functionality including recommendations, automation, or data analysis',
          required: true,
          riskWeight: 10
        },
        {
          id: 'model_provider',
          type: 'select',
          label: 'Which AI model provider does the service use?',
          description: 'Primary AI/ML model or platform',
          required: false,
          options: [
            'OpenAI (GPT, ChatGPT)',
            'Anthropic (Claude)',
            'Google (Bard, Gemini)',
            'Microsoft (Copilot)',
            'AWS (Bedrock)',
            'Custom/Proprietary models',
            'Multiple providers',
            'None/Not applicable'
          ],
          riskWeight: 5
        },
        {
          id: 'trains_on_user_data',
          type: 'boolean',
          label: 'Does the AI system train or learn from user data?',
          description: 'Whether user inputs are used to improve the AI model',
          required: false,
          riskWeight: 20,
          complianceFlags: ['COPPA', 'FERPA']
        },
        {
          id: 'bias_auditing',
          type: 'boolean',
          label: 'Does the vendor conduct bias testing and auditing of AI systems?',
          description: 'Regular testing for algorithmic bias and fairness',
          required: false,
          riskWeight: 10,
          complianceFlags: ['PPRA']
        },
        {
          id: 'explainability_features',
          type: 'boolean',
          label: 'Does the AI system provide explainable decisions?',
          description: 'Ability to understand and explain AI-generated recommendations or decisions',
          required: false,
          riskWeight: 5
        }
      ],
      conditionalLogic: [
        {
          condition: { questionId: 'is_ai_service', operator: 'equals', value: true },
          action: { type: 'require', target: ['model_provider', 'trains_on_user_data', 'bias_auditing', 'explainability_features'] }
        },
        {
          condition: { questionId: 'is_ai_service', operator: 'equals', value: false },
          action: { type: 'hide', target: ['model_provider', 'trains_on_user_data', 'bias_auditing', 'explainability_features'] }
        }
      ]
    },

    studentData: {
      title: 'Student Data & Age Requirements',
      description: 'Specific requirements for handling student and children\'s data',
      questions: [
        {
          id: 'handles_student_data',
          type: 'boolean',
          label: 'Will this service handle student educational records?',
          description: 'Any data related to students\' educational activities or performance',
          required: true,
          riskWeight: 20,
          complianceFlags: ['FERPA']
        },
        {
          id: 'minimum_age',
          type: 'number',
          label: 'What is the minimum age for users of this service?',
          description: 'Minimum age requirement as specified by the vendor',
          required: true,
          validation: { min: 0, max: 18 },
          riskWeight: 25,
          complianceFlags: ['COPPA']
        },
        {
          id: 'age_gate',
          type: 'boolean',
          label: 'Does the service have age verification mechanisms?',
          description: 'Active age verification to prevent underage access',
          required: true,
          riskWeight: 20,
          complianceFlags: ['COPPA']
        },
        {
          id: 'parental_consent',
          type: 'boolean',
          label: 'Does the service obtain parental consent for users under 13?',
          description: 'COPPA-compliant parental consent process',
          required: true,
          riskWeight: 25,
          complianceFlags: ['COPPA']
        },
        {
          id: 'educational_purpose',
          type: 'boolean',
          label: 'Is the service used solely for educational purposes?',
          description: 'Service is directly related to educational activities and curriculum',
          required: false,
          riskWeight: 10,
          complianceFlags: ['FERPA']
        },
        {
          id: 'directory_information',
          type: 'boolean',
          label: 'Does the service access student directory information?',
          description: 'Access to names, addresses, phone numbers, email addresses, etc.',
          required: false,
          riskWeight: 15,
          complianceFlags: ['FERPA']
        }
      ],
      conditionalLogic: [
        {
          condition: { questionId: 'minimum_age', operator: 'less_than', value: 13 },
          action: { type: 'require', target: ['age_gate', 'parental_consent'] }
        },
        {
          condition: { questionId: 'handles_student_data', operator: 'equals', value: true },
          action: { type: 'require', target: ['educational_purpose', 'directory_information'] }
        }
      ]
    },

    compliance: {
      title: 'Compliance & Security',
      description: 'Security certifications and compliance documentation',
      questions: [
        {
          id: 'certifications',
          type: 'multiselect',
          label: 'What security certifications does the vendor have?',
          description: 'Select all applicable certifications',
          required: false,
          options: [
            'SOC 2 Type II',
            'ISO 27001',
            'FedRAMP',
            'GDPR Compliance',
            'COPPA Safe Harbor',
            'Student Privacy Pledge',
            'FERPA Compliance',
            'HIPAA Compliance',
            'None',
            'Unknown'
          ],
          riskWeight: -10 // Reduces risk
        },
        {
          id: 'privacy_policy',
          type: 'boolean',
          label: 'Does the vendor have a comprehensive privacy policy?',
          description: 'Publicly available privacy policy document',
          required: true,
          riskWeight: 10
        },
        {
          id: 'terms_of_service',
          type: 'boolean',
          label: 'Does the vendor have clear terms of service?',
          description: 'Comprehensive terms of service agreement',
          required: true,
          riskWeight: 5
        },
        {
          id: 'data_processing_agreement',
          type: 'boolean',
          label: 'Will the vendor sign a data processing agreement?',
          description: 'Willingness to enter into a formal data processing agreement',
          required: true,
          riskWeight: 15,
          complianceFlags: ['GDPR', 'FERPA']
        },
        {
          id: 'audit_reports',
          type: 'boolean',
          label: 'Does the vendor provide third-party audit reports?',
          description: 'Independent security and compliance audit reports',
          required: false,
          riskWeight: 8
        },
        {
          id: 'incident_response',
          type: 'boolean',
          label: 'Does the vendor have a documented incident response plan?',
          description: 'Formal process for handling security incidents and breaches',
          required: true,
          riskWeight: 10
        }
      ]
    },

    technical: {
      title: 'Technical Integration',
      description: 'Technical requirements and integration capabilities',
      questions: [
        {
          id: 'authentication_methods',
          type: 'multiselect',
          label: 'What authentication methods does the service support?',
          description: 'Available authentication and access control options',
          required: true,
          options: [
            'Username/Password',
            'Single Sign-On (SSO)',
            'SAML',
            'OAuth 2.0',
            'Multi-Factor Authentication',
            'Google Workspace',
            'Microsoft 365',
            'Other'
          ],
          riskWeight: 5
        },
        {
          id: 'sso_supported',
          type: 'boolean',
          label: 'Does the service support single sign-on (SSO)?',
          description: 'Integration with institutional SSO systems',
          required: true,
          riskWeight: -5 // Reduces risk
        },
        {
          id: 'api_documentation',
          type: 'boolean',
          label: 'Does the vendor provide comprehensive API documentation?',
          description: 'Technical documentation for system integration',
          required: false,
          riskWeight: 2
        },
        {
          id: 'uptime_guarantee',
          type: 'select',
          label: 'What uptime guarantee does the vendor provide?',
          description: 'Service level agreement for system availability',
          required: false,
          options: [
            '99.9% or higher',
            '99.5% - 99.8%',
            '99.0% - 99.4%',
            'Less than 99%',
            'No guarantee',
            'Unknown'
          ],
          riskWeight: 3
        },
        {
          id: 'support_level',
          type: 'select',
          label: 'What level of technical support is provided?',
          description: 'Available technical support options',
          required: false,
          options: [
            '24/7 Phone and Email',
            'Business Hours Phone and Email',
            'Email Only',
            'Online Documentation Only',
            'Community Forum',
            'Premium Support Available',
            'Unknown'
          ],
          riskWeight: 2
        }
      ]
    }
  }
}

/**
 * Get questionnaire section by ID
 */
export function getQuestionnaireSection(sectionId: keyof typeof VENDOR_QUESTIONNAIRE.sections) {
  return VENDOR_QUESTIONNAIRE.sections[sectionId]
}

/**
 * Get all questions from all sections
 */
export function getAllQuestions(): Question[] {
  return Object.values(VENDOR_QUESTIONNAIRE.sections).flatMap(section => section.questions)
}

/**
 * Get questions by compliance flag
 */
export function getQuestionsByComplianceFlag(flag: string): Question[] {
  return getAllQuestions().filter(q => q.complianceFlags?.includes(flag as any))
}

/**
 * Calculate total possible risk score
 */
export function getMaxRiskScore(): number {
  return getAllQuestions().reduce((total, q) => total + Math.abs(q.riskWeight || 0), 0)
}
