// Refined Algorithm Domain Types

export interface AlgorithmInputResponse {
  prompt?: string;
  section?: string;
  value?: number; // Likert 1-5
  tags?: string[];
  [k: string]: any;
}

export interface OrganizationOperationalMetrics {
  digitalMaturity?: number;
  systemIntegration?: number;
  collaborationIndex?: number;
  innovationCapacity?: number;
  strategicAgility?: number;
  leadershipEffectiveness?: number;
  decisionLatency?: number; // lower better
  communicationEfficiency?: number;
  employeeEngagement?: number;
  changeReadiness?: number;
  futureReadiness?: number;
  processComplexity?: number; // lower better
  operationalRisk?: number; // lower better
  technologicalRisk?: number; // lower better
  cybersecurityLevel?: number;
  resourceUtilization?: number;
  taskAutomationLevel?: number;
  [k: string]: any;
}

export interface AlgorithmScoreDetail {
  overallScore: number; // 0-1 normalized
  factors: Record<string, number>;
  notes?: string[];
}

export interface EnterpriseAlgorithmResult {
  dsch: AlgorithmScoreDetail;
  crf: AlgorithmScoreDetail;
  lei: AlgorithmScoreDetail;
  oci: AlgorithmScoreDetail;
  hoci: AlgorithmScoreDetail;
  meta?: {
    version: string;
    computedAt: string;
    responseCount: number;
  // Optional user linkage (used for persistence & RLS ownership)
  userId?: string;
  };
}
