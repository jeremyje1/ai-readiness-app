/**
 * AI Readiness Database
 * Stub implementation for database operations
 */

export interface AssessmentRecord {
  id: string;
  institutionName: string;
  responses: any[];
  score: number;
  createdAt: Date;
  updatedAt: Date;
  // Additional properties expected by the API routes
  ai_readiness_score?: number | null;
  domain_scores?: Record<string, number | { score: number; percentage: number; maturityLevel: string; questions: number }>;
  team_analysis?: any;
  ai_analysis?: {
    recommendations?: string[] | Array<{
      domain: string;
      priority: string;
      title: string;
      description: string;
      actions: string[];
      timeline: string;
      resources: string[];
    }>;
    uploaded_documents?: string[];
    proprietary_metrics?: Record<string, any>;
  };
  policy_recommendations?: string[];
  maturity_profile?: {
    overall: { name: string; level: number; description: string };
    domains: Record<string, any>;
  };
  institution_name?: string;
  institution_type?: string;
  institution_size?: string;
  contact_email?: string;
  contact_name?: string;
  is_team_assessment?: boolean;
  team_members?: any[];
  open_ended_responses?: Record<string, any>;
  tier?: string;
  created_at?: string;
}

export class AIReadinessDatabase {
  static isAvailable(): boolean {
    // Stub implementation - always return true
    return true;
  }

  static async saveAssessment(data: Partial<AssessmentRecord>): Promise<AssessmentRecord> {
    // Stub implementation
    return {
      id: 'stub-id',
      institutionName: data.institutionName || 'Test Institution',
      responses: data.responses || [],
      score: data.score || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static async getAssessment(id: string): Promise<AssessmentRecord | null> {
    // Stub implementation
    return null;
  }

  static async listAssessments(): Promise<AssessmentRecord[]> {
    // Stub implementation
    return [];
  }

  static async createAssessment(data: Partial<AssessmentRecord>): Promise<AssessmentRecord> {
    // Stub implementation - alias for saveAssessment
    return this.saveAssessment(data);
  }

  static async saveResults(assessmentId: string, results: any): Promise<void> {
    // Stub implementation
    console.log(`Saving results for assessment ${assessmentId}:`, results);
  }

  static async getUserAssessments(userId: string): Promise<AssessmentRecord[]> {
    // Stub implementation
    return [];
  }

  static async getAnalytics(startDate?: string, endDate?: string): Promise<any> {
    // Stub implementation
    return {
      totalAssessments: 0,
      averageScore: 0,
      completionRate: 0,
      topRecommendations: []
    };
  }
}

// Export as both named and default for compatibility
export const aiReadinessDatabase = AIReadinessDatabase;
export default AIReadinessDatabase;

// Additional helper functions
export function formatAssessmentForDatabase(responses: any, institutionInfo?: any, tier?: string, uploadedDocuments?: any[]): Partial<AssessmentRecord> {
  return {
    institutionName: institutionInfo?.name || institutionInfo?.institutionName || 'Unknown Institution',
    responses: responses || [],
    score: 0,
    tier: tier,
    ai_analysis: {
      uploaded_documents: uploadedDocuments || []
    }
  };
}

export function formatTeamAssessmentForDatabase(responses: any, institutionInfo?: any, tier?: string, teamMembers?: any[], uploadedDocuments?: any[]): Partial<AssessmentRecord> {
  return {
    institutionName: institutionInfo?.name || institutionInfo?.institutionName || 'Unknown Institution',
    responses: responses || [],
    score: 0,
    tier: tier,
    is_team_assessment: true,
    team_members: teamMembers || [],
    ai_analysis: {
      uploaded_documents: uploadedDocuments || []
    }
  };
}
