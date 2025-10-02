// Simple question types for AI readiness assessment
export type QuestionType = 'likert' | 'numeric' | 'text' | 'upload';
export type OrganizationType = 'higher-education' | 'healthcare' | 'nonprofit' | 'corporate' | 'government';

export interface ValidationRules {
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: string;
    required?: boolean;
}

export interface Question {
    id: string;
    section: string;
    prompt: string;
    type: QuestionType;
    organizationTypes?: OrganizationType[];
    required?: boolean;
    helpText?: string;
    validationRules?: ValidationRules;
    tierMinimum?: string;
    tags?: string[];
    enableContext?: boolean;
    contextPrompt?: string;
}