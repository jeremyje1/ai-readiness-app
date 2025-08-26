import { UserInstitution } from '@/lib/hooks/useUserContext'

/**
 * Utility functions for personalizing content based on user institution data
 */

export interface PersonalizationData {
    institutionName: string
    institutionType: string
    studentCount: number
    staffCount: number
    displayType: string // for UI display (e.g., "School District", "University")
    contextualDescriptor: string // for narratives (e.g., "district", "institution")
}

export function getPersonalizationData(institution: UserInstitution | null): PersonalizationData {
    if (!institution) {
        return {
            institutionName: 'Your Institution',
            institutionType: 'institution',
            studentCount: 2500,
            staffCount: 200,
            displayType: 'Educational Institution',
            contextualDescriptor: 'institution'
        }
    }

    const isK12 = institution.org_type === 'K12'
    const isHigherEd = institution.org_type === 'higher_ed'

    return {
        institutionName: institution.name,
        institutionType: institution.org_type || 'institution',
        studentCount: institution.headcount || (isK12 ? 2500 : 8000),
        staffCount: Math.floor((institution.headcount || (isK12 ? 2500 : 8000)) * (isK12 ? 0.08 : 0.12)),
        displayType: isK12 ? 'School District' : isHigherEd ? 'University' : 'Educational Institution',
        contextualDescriptor: isK12 ? 'district' : 'institution'
    }
}

export function personalizeText(template: string, data: PersonalizationData): string {
    return template
        .replace(/\{institutionName\}/g, data.institutionName)
        .replace(/\{institutionType\}/g, data.institutionType)
        .replace(/\{displayType\}/g, data.displayType)
        .replace(/\{contextualDescriptor\}/g, data.contextualDescriptor)
        .replace(/\{studentCount\}/g, data.studentCount.toLocaleString())
        .replace(/\{staffCount\}/g, data.staffCount.toLocaleString())
}

export function getInstitutionSpecificExamples(institution: UserInstitution | null) {
    const isK12 = institution?.org_type === 'K12'

    return {
        sampleDistricts: isK12
            ? ['Riverside School District', 'Mountain View Unified', 'Central Valley Schools']
            : ['State University System', 'Regional Community College', 'Metropolitan University'],

        policyExamples: isK12
            ? ['Student AI Usage Guidelines', 'Teacher AI Tools Policy', 'Student Data Protection']
            : ['Faculty AI Research Policy', 'Student Academic Integrity', 'Institutional AI Governance'],

        stakeholders: isK12
            ? ['teachers', 'students', 'parents', 'administrators']
            : ['faculty', 'students', 'researchers', 'administrators'],

        departments: isK12
            ? ['curriculum', 'technology', 'student services', 'special education']
            : ['academic affairs', 'research', 'student life', 'information technology']
    }
}

export default {
    getPersonalizationData,
    personalizeText,
    getInstitutionSpecificExamples
}
