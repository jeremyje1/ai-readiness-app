// Assessment Types for AI Readiness App

export interface AssessmentData {
  user_email: string;
  organization_type?: string;
  submitted_at?: string;
  responses?: Record<string, any>;
  assessment_score?: number;
  recommendations?: string;
  domains?: Record<string, any>;
}

export interface OrganizationMetrics {
  totalEmployees?: number;
  techStack?: string[];
  industry?: string;
  currentAIUsage?: string;
  budgetRange?: string;
  timeframe?: string;
}

export interface DomainScore {
  score: number;
  maxScore: number;
  percentage: number;
  recommendations: string[];
}

export interface AssessmentResults {
  totalScore: number;
  maxScore: number;
  percentage: number;
  domains: Record<string, DomainScore>;
  overallRecommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  readinessLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface AIReadinessResults {
  assessment_score: number;
  recommendations: string;
  domains: Record<string, any>;
  user_email: string;
  organization_type?: string;
  submitted_at?: string;
  responses?: Record<string, any>;
  assessmentData?: AssessmentData;
}
