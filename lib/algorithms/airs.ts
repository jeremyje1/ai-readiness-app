/**
 * AIRS™ - AI Implementation Risk Score v1.0
 * Proprietary algorithm for AI deployment risk assessment
 * 
 * This algorithm evaluates potential risks in AI implementation across
 * multiple dimensions, providing risk-adjusted implementation planning.
 * 
 * @version 1.0.0
 * @author NorthPath Strategies
 * @proprietary true
 * @patent-pending true
 */

import { AssessmentData, OrganizationMetrics } from '@/types/assessment';
import { calculateWeightedScore, normalizeScore } from './utils';

// AIRS Configuration Constants
export const AIRS_CONFIG = {
  VERSION: '1.0.0',
  RISK_WEIGHTS: {
    CULTURAL_RESISTANCE: 0.25,
    COMPLIANCE_GAPS: 0.20,
    RESOURCE_CONSTRAINTS: 0.20,
    TECHNICAL_LIMITATIONS: 0.15,
    GOVERNANCE_WEAKNESSES: 0.10,
    EXTERNAL_PRESSURES: 0.10
  },
  RISK_THRESHOLDS: {
    LOW_RISK: 0.30,
    MODERATE_RISK: 0.50,
    HIGH_RISK: 0.70,
    CRITICAL_RISK: 0.85
  }
} as const;

export interface AIRSMetrics {
  overallRisk: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: {
    culturalResistance: number;
    complianceGaps: number;
    resourceConstraints: number;
    technicalLimitations: number;
    governanceWeaknesses: number;
    externalPressures: number;
  };
  mitigationStrategies: MitigationStrategy[];
  implementationReadiness: number;
  riskTimeline: RiskTimelineItem[];
}

export interface MitigationStrategy {
  riskCategory: string;
  strategy: string;
  priority: 'immediate' | 'short-term' | 'long-term';
  effort: 'low' | 'medium' | 'high';
  impact: number;
}

export interface RiskTimelineItem {
  phase: string;
  risks: string[];
  mitigations: string[];
  timeline: string;
}

export class AIRSAlgorithm {
  private config = AIRS_CONFIG;

  public calculateAIRS(
    assessmentData: AssessmentData,
    organizationMetrics: OrganizationMetrics
  ): AIRSMetrics {
    // Calculate risk factors
    const culturalResistance = this.calculateCulturalRisk(assessmentData);
    const complianceGaps = this.calculateComplianceRisk(assessmentData);
    const resourceConstraints = this.calculateResourceRisk(assessmentData);
    const technicalLimitations = this.calculateTechnicalRisk(assessmentData);
    const governanceWeaknesses = this.calculateGovernanceRisk(assessmentData);
    const externalPressures = this.calculateExternalRisk(assessmentData, organizationMetrics);

    // Calculate overall risk
    const riskFactors = {
      culturalResistance,
      complianceGaps,
      resourceConstraints,
      technicalLimitations,
      governanceWeaknesses,
      externalPressures
    };
    
    const overallRisk = (
      riskFactors.culturalResistance * this.config.RISK_WEIGHTS.CULTURAL_RESISTANCE +
      riskFactors.complianceGaps * this.config.RISK_WEIGHTS.COMPLIANCE_GAPS +
      riskFactors.resourceConstraints * this.config.RISK_WEIGHTS.RESOURCE_CONSTRAINTS +
      riskFactors.technicalLimitations * this.config.RISK_WEIGHTS.TECHNICAL_LIMITATIONS +
      riskFactors.governanceWeaknesses * this.config.RISK_WEIGHTS.GOVERNANCE_WEAKNESSES +
      riskFactors.externalPressures * this.config.RISK_WEIGHTS.EXTERNAL_PRESSURES
    );

    const riskLevel = this.getRiskLevel(overallRisk);
    const mitigationStrategies = this.generateMitigationStrategies(assessmentData, overallRisk);
    const implementationReadiness = 1 - overallRisk; // Inverse of risk
    const riskTimeline = this.generateRiskTimeline(overallRisk);

    return {
      overallRisk,
      riskLevel,
      riskFactors: {
        culturalResistance,
        complianceGaps,
        resourceConstraints,
        technicalLimitations,
        governanceWeaknesses,
        externalPressures
      },
      mitigationStrategies,
      implementationReadiness,
      riskTimeline
    };
  }

  private calculateCulturalRisk(data: AssessmentData): number {
    // Faculty resistance, change aversion, pedagogical concerns
    const culturalResponses = this.filterResponsesByKeywords(Object.values(data.responses || {}), [
      'faculty', 'culture', 'resistance', 'change', 'pedagogy'
    ]);
    
    const baseRisk = 1 - this.calculateResponseScore(culturalResponses);
    
    // Higher ed specific cultural risks
    const facultyAutonomyConcerns = this.assessFacultyAutonomyRisk(culturalResponses);
    const academicFreedomConcerns = this.assessAcademicFreedomRisk(culturalResponses);
    
    return Math.min(1, baseRisk + (facultyAutonomyConcerns + academicFreedomConcerns) * 0.1);
  }

  private calculateComplianceRisk(data: AssessmentData): number {
    // FERPA, accessibility, accreditation compliance gaps
    const complianceResponses = this.filterResponsesByKeywords(Object.values(data.responses || {}), [
      'compliance', 'ferpa', 'privacy', 'accessibility', 'accreditation'
    ]);
    
    return 1 - this.calculateResponseScore(complianceResponses);
  }

  private calculateResourceRisk(data: AssessmentData): number {
    // Budget, staffing, infrastructure constraints
    const resourceResponses = this.filterResponsesByKeywords(Object.values(data.responses || {}), [
      'budget', 'resources', 'staffing', 'infrastructure', 'funding'
    ]);
    
    return 1 - this.calculateResponseScore(resourceResponses);
  }

  private calculateTechnicalRisk(data: AssessmentData): number {
    // Technical capacity, integration challenges
    const techResponses = this.filterResponsesByKeywords(Object.values(data.responses || {}), [
      'technology', 'infrastructure', 'integration', 'systems'
    ]);
    
    return 1 - this.calculateResponseScore(techResponses);
  }

  private calculateGovernanceRisk(data: AssessmentData): number {
    // Governance structure, decision-making processes
    const governanceResponses = this.filterResponsesByKeywords(Object.values(data.responses || {}), [
      'governance', 'leadership', 'decision', 'oversight'
    ]);
    
    return 1 - this.calculateResponseScore(governanceResponses);
  }

  private calculateExternalRisk(data: AssessmentData, orgMetrics: OrganizationMetrics): number {
    // External pressures, competitive forces, regulatory changes
    let externalRisk = 0.3; // Base external risk
    
    // Institution type specific risks (safely access type property)
    const institutionType = (orgMetrics as any).type || 'university';
    if (institutionType === 'community_college') {
      externalRisk += 0.1; // Higher funding pressure
    } else if (institutionType === 'research_university') {
      externalRisk += 0.05; // Research compliance complexity
    }
    
    return Math.min(1, externalRisk);
  }

  private getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'critical' {
    if (score >= this.config.RISK_THRESHOLDS.CRITICAL_RISK) return 'critical';
    if (score >= this.config.RISK_THRESHOLDS.HIGH_RISK) return 'high';
    if (score >= this.config.RISK_THRESHOLDS.MODERATE_RISK) return 'moderate';
    return 'low';
  }

  private generateMitigationStrategies(data: AssessmentData, riskScore: number): MitigationStrategy[] {
    const strategies: MitigationStrategy[] = [];
    
    if (riskScore >= 0.7) {
      strategies.push({
        riskCategory: 'Cultural Resistance',
        strategy: 'Comprehensive change management program with faculty champions',
        priority: 'immediate',
        effort: 'high',
        impact: 0.8
      });
    }
    
    strategies.push({
      riskCategory: 'Compliance',
      strategy: 'FERPA and accessibility compliance audit',
      priority: 'short-term',
      effort: 'medium',
      impact: 0.7
    });

    strategies.push({
      riskCategory: 'Resource Planning',
      strategy: 'Phased implementation with quick wins',
      priority: 'short-term',
      effort: 'medium',
      impact: 0.6
    });
    
    return strategies;
  }

  private generateRiskTimeline(riskScore: number): RiskTimelineItem[] {
    return [
      {
        phase: 'Planning (Months 1-3)',
        risks: ['Incomplete stakeholder buy-in', 'Unclear governance structure'],
        mitigations: ['Stakeholder engagement plan', 'Governance framework development'],
        timeline: '90 days'
      },
      {
        phase: 'Pilot Implementation (Months 4-9)',
        risks: ['Faculty resistance', 'Technical integration issues'],
        mitigations: ['Change management support', 'Technical pilot testing'],
        timeline: '6 months'
      },
      {
        phase: 'Scale & Adoption (Months 10-18)',
        risks: ['Scaling challenges', 'Compliance gaps'],
        mitigations: ['Systematic rollout plan', 'Compliance monitoring'],
        timeline: '9 months'
      }
    ];
  }

  // Helper methods
  private assessFacultyAutonomyRisk(responses: any[]): number {
    // Assess risk related to faculty autonomy concerns
    return 0.2; // Simplified implementation
  }

  private assessAcademicFreedomRisk(responses: any[]): number {
    // Assess risk related to academic freedom concerns
    return 0.15; // Simplified implementation
  }

  private filterResponsesByKeywords(responses: any[], keywords: string[]): any[] {
    return responses.filter(r => 
      keywords.some(keyword => 
        r.question?.toLowerCase().includes(keyword) ||
        r.section?.toLowerCase().includes(keyword)
      )
    );
  }

  private calculateResponseScore(responses: any[]): number {
    if (responses.length === 0) return 0.5;
    
    const totalScore = responses.reduce((sum, response) => {
      let score = 0.5;
      
      if (typeof response.value === 'number') {
        score = response.value / 4; // Assuming 0-4 scale
      }
      
      return sum + score;
    }, 0);
    
    return totalScore / responses.length;
  }
}

export function createAIRSAlgorithm(): AIRSAlgorithm {
  return new AIRSAlgorithm();
}

export async function calculateAIRSScore(
  assessmentData: AssessmentData,
  organizationMetrics: OrganizationMetrics
): Promise<AIRSMetrics> {
  const algorithm = createAIRSAlgorithm();
  return algorithm.calculateAIRS(assessmentData, organizationMetrics);
}
