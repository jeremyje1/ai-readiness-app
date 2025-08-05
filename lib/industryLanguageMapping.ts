/**
 * Industry Language Mapping
 * Provides industry-specific translations and terminology
 */

export type InstitutionType = 'K12' | 'HigherEd' | 'CorporateTraining' | 'HealthcareEducation' | 'Government' | 'default'

export function translateText(text: string, institutionType?: InstitutionType): string {
  const translations: Record<InstitutionType, Record<string, string>> = {
    K12: {
      'student': 'student',
      'curriculum': 'curriculum',
      'enrollment': 'enrollment',
      'assessment': 'assessment'
    },
    HigherEd: {
      'student': 'student',
      'curriculum': 'program',
      'enrollment': 'registration',
      'assessment': 'evaluation'
    },
    CorporateTraining: {
      'student': 'employee',
      'curriculum': 'training program',
      'enrollment': 'participation',
      'assessment': 'performance review'
    },
    HealthcareEducation: {
      'student': 'trainee',
      'curriculum': 'clinical program',
      'enrollment': 'certification',
      'assessment': 'competency evaluation'
    },
    Government: {
      'student': 'participant',
      'curriculum': 'training module',
      'enrollment': 'registration',
      'assessment': 'evaluation'
    },
    default: {
      'student': 'learner',
      'curriculum': 'program',
      'enrollment': 'participation',
      'assessment': 'evaluation'
    }
  }

  const typeTranslations = translations[institutionType || 'default'] || translations.default
  return typeTranslations[text.toLowerCase()] || text
}

export function translateUIElement(element: string, institutionType?: InstitutionType): string {
  return translateText(element, institutionType)
}

export function getReportLabels(institutionType?: InstitutionType): Record<string, string> {
  const baseLabels = {
    'Executive Summary': 'Executive Summary',
    'Recommendations': 'Recommendations',
    'Implementation Plan': 'Implementation Plan',
    'Success Metrics': 'Success Metrics',
    'Cost Analysis': 'Cost Analysis',
    'Risk Assessment': 'Risk Assessment'
  }

  // Customize labels based on institution type
  if (institutionType === 'K12') {
    return {
      ...baseLabels,
      'Success Metrics': 'Student Outcomes',
      'Implementation Plan': 'District Implementation Plan'
    }
  } else if (institutionType === 'HigherEd') {
    return {
      ...baseLabels,
      'Success Metrics': 'Academic Success Indicators',
      'Implementation Plan': 'Campus Implementation Strategy'
    }
  } else if (institutionType === 'CorporateTraining') {
    return {
      ...baseLabels,
      'Success Metrics': 'Training ROI Metrics',
      'Implementation Plan': 'Corporate Rollout Plan'
    }
  }

  return baseLabels
}
