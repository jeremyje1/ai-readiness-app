/**
 * AICS™ - AI Cultural Compatibility Score v1.0
 * Proprietary algorithm for organizational culture AI alignment assessment
 * 
 * This algorithm evaluates how well institutional culture aligns with AI adoption,
 * measuring readiness for cultural transformation required for AI success.
 * 
 * @version 1.0.0
 * @author NorthPath Strategies
 * @proprietary true
 * @patent-pending true
 */

import { AssessmentData, OrganizationMetrics } from '@/types/assessment';

export const AICS_CONFIG = {
  VERSION: '1.0.0',
  CULTURE_DIMENSIONS: {
    INNOVATION_OPENNESS: 0.25,
    COLLABORATION_READINESS: 0.20,
    LEARNING_ORIENTATION: 0.20,
    CHANGE_ADAPTABILITY: 0.15,
    RISK_TOLERANCE: 0.10,
    TECHNOLOGY_ACCEPTANCE: 0.10
  },
  COMPATIBILITY_THRESHOLDS: {
    HIGH_COMPATIBILITY: 0.75,
    MODERATE_COMPATIBILITY: 0.55,
    LOW_COMPATIBILITY: 0.35
  }
} as const;

export interface AICSSculturalMetrics {
  overallCompatibility: number;
  compatibilityLevel: 'high' | 'moderate' | 'low' | 'critical';
  culturalDimensions: {
    innovationOpenness: number;
    collaborationReadiness: number;
    learningOrientation: number;
    changeAdaptability: number;
    riskTolerance: number;
    technologyAcceptance: number;
  };
  culturalBarriers: CulturalBarrier[];
  culturalEnablers: CulturalEnabler[];
  transformationRequirements: TransformationRequirement[];
  facultyReadiness: number;
  studentAcceptance: number;
}

export interface CulturalBarrier {
  dimension: string;
  barrier: string;
  severity: 'low' | 'medium' | 'high';
  impact: number;
  mitigationStrategy: string;
}

export interface CulturalEnabler {
  dimension: string;
  enabler: string;
  strength: number;
  leverageOpportunity: string;
}

export interface TransformationRequirement {
  area: string;
  requirement: string;
  priority: 'critical' | 'important' | 'optional';
  timeline: string;
  resources: string[];
}

export class AICSAlgorithm {
  private config = AICS_CONFIG;

  public calculateAICS(
    assessmentData: AssessmentData,
    organizationMetrics: OrganizationMetrics
  ): AICSSculturalMetrics {
    // Calculate cultural dimensions
    const innovationOpenness = this.calculateInnovationOpenness(assessmentData);
    const collaborationReadiness = this.calculateCollaborationReadiness(assessmentData);
    const learningOrientation = this.calculateLearningOrientation(assessmentData);
    const changeAdaptability = this.calculateChangeAdaptability(assessmentData);
    const riskTolerance = this.calculateRiskTolerance(assessmentData);
    const technologyAcceptance = this.calculateTechnologyAcceptance(assessmentData);

    // Calculate overall compatibility
    const overallCompatibility = (
      innovationOpenness * this.config.CULTURE_DIMENSIONS.INNOVATION_OPENNESS +
      collaborationReadiness * this.config.CULTURE_DIMENSIONS.COLLABORATION_READINESS +
      learningOrientation * this.config.CULTURE_DIMENSIONS.LEARNING_ORIENTATION +
      changeAdaptability * this.config.CULTURE_DIMENSIONS.CHANGE_ADAPTABILITY +
      riskTolerance * this.config.CULTURE_DIMENSIONS.RISK_TOLERANCE +
      technologyAcceptance * this.config.CULTURE_DIMENSIONS.TECHNOLOGY_ACCEPTANCE
    );

    const compatibilityLevel = this.getCompatibilityLevel(overallCompatibility);
    const culturalBarriers = this.identifyCulturalBarriers(assessmentData, overallCompatibility);
    const culturalEnablers = this.identifyCulturalEnablers(assessmentData, overallCompatibility);
    const transformationRequirements = this.generateTransformationRequirements(overallCompatibility);
    const facultyReadiness = this.calculateFacultyReadiness(assessmentData);
    const studentAcceptance = this.calculateStudentAcceptance(assessmentData);

    return {
      overallCompatibility,
      compatibilityLevel,
      culturalDimensions: {
        innovationOpenness,
        collaborationReadiness,
        learningOrientation,
        changeAdaptability,
        riskTolerance,
        technologyAcceptance
      },
      culturalBarriers,
      culturalEnablers,
      transformationRequirements,
      facultyReadiness,
      studentAcceptance
    };
  }

  private calculateInnovationOpenness(data: AssessmentData): number {
    const responsesArray = Object.values(data.responses || {});
    const innovationResponses = this.filterResponsesByKeywords(responsesArray, [
      'innovation', 'creativity', 'experimentation', 'new ideas'
    ]);
    return this.calculateResponseScore(innovationResponses);
  }

  private calculateCollaborationReadiness(data: AssessmentData): number {
    const responsesArray = Object.values(data.responses || {});
    const collaborationResponses = this.filterResponsesByKeywords(responsesArray, [
      'collaboration', 'teamwork', 'interdisciplinary', 'partnership'
    ]);
    return this.calculateResponseScore(collaborationResponses);
  }

  private calculateLearningOrientation(data: AssessmentData): number {
    const responsesArray = Object.values(data.responses || {});
    const learningResponses = this.filterResponsesByKeywords(responsesArray, [
      'learning', 'development', 'training', 'growth', 'continuous improvement'
    ]);
    return this.calculateResponseScore(learningResponses);
  }

  private calculateChangeAdaptability(data: AssessmentData): number {
    const responsesArray = Object.values(data.responses || {});
    const changeResponses = this.filterResponsesByKeywords(responsesArray, [
      'change', 'adaptation', 'flexibility', 'agility'
    ]);
    return this.calculateResponseScore(changeResponses);
  }

  private calculateRiskTolerance(data: AssessmentData): number {
    const responsesArray = Object.values(data.responses || {});
    const riskResponses = this.filterResponsesByKeywords(responsesArray, [
      'risk', 'uncertainty', 'experimentation', 'pilot'
    ]);
    return this.calculateResponseScore(riskResponses);
  }

  private calculateTechnologyAcceptance(data: AssessmentData): number {
    const responsesArray = Object.values(data.responses || {});
    const techResponses = this.filterResponsesByKeywords(responsesArray, [
      'technology', 'digital', 'automation', 'systems'
    ]);
    return this.calculateResponseScore(techResponses);
  }

  private getCompatibilityLevel(score: number): 'high' | 'moderate' | 'low' | 'critical' {
    if (score >= this.config.COMPATIBILITY_THRESHOLDS.HIGH_COMPATIBILITY) return 'high';
    if (score >= this.config.COMPATIBILITY_THRESHOLDS.MODERATE_COMPATIBILITY) return 'moderate';
    if (score >= this.config.COMPATIBILITY_THRESHOLDS.LOW_COMPATIBILITY) return 'low';
    return 'critical';
  }

  private identifyCulturalBarriers(data: AssessmentData, compatibilityScore: number): CulturalBarrier[] {
    const barriers: CulturalBarrier[] = [];

    if (compatibilityScore < 0.6) {
      barriers.push({
        dimension: 'Faculty Autonomy',
        barrier: 'Strong preference for individual academic freedom over collaborative AI adoption',
        severity: 'high',
        impact: 0.8,
        mitigationStrategy: 'Emphasize AI as enhancing rather than replacing faculty expertise'
      });

      barriers.push({
        dimension: 'Risk Aversion',
        barrier: 'Conservative institutional culture resistant to technological experimentation',
        severity: 'medium',
        impact: 0.6,
        mitigationStrategy: 'Start with low-risk pilot programs and demonstrate success'
      });
    }

    return barriers;
  }

  private identifyCulturalEnablers(data: AssessmentData, compatibilityScore: number): CulturalEnabler[] {
    const enablers: CulturalEnabler[] = [];

    if (compatibilityScore >= 0.5) {
      enablers.push({
        dimension: 'Learning Culture',
        enabler: 'Strong institutional commitment to continuous learning and improvement',
        strength: 0.7,
        leverageOpportunity: 'Build on existing professional development programs'
      });

      enablers.push({
        dimension: 'Student-Centered Focus',
        enabler: 'Deep commitment to student success and outcomes',
        strength: 0.8,
        leverageOpportunity: 'Frame AI initiatives around student success benefits'
      });
    }

    return enablers;
  }

  private generateTransformationRequirements(compatibilityScore: number): TransformationRequirement[] {
    const requirements: TransformationRequirement[] = [];

    if (compatibilityScore < 0.7) {
      requirements.push({
        area: 'Faculty Development',
        requirement: 'Comprehensive AI literacy and pedagogical integration training',
        priority: 'critical',
        timeline: '6-12 months',
        resources: ['Training budget', 'Expert facilitators', 'Release time']
      });

      requirements.push({
        area: 'Change Management',
        requirement: 'Structured change management program with stakeholder engagement',
        priority: 'important',
        timeline: '3-9 months',
        resources: ['Change management expertise', 'Communication resources', 'Leadership time']
      });
    }

    return requirements;
  }

  private calculateFacultyReadiness(data: AssessmentData): number {
    const responsesArray = Object.values(data.responses || {});
    const facultyResponses = this.filterResponsesByKeywords(responsesArray, [
      'faculty', 'instructor', 'professor', 'teaching'
    ]);
    return this.calculateResponseScore(facultyResponses);
  }

  private calculateStudentAcceptance(data: AssessmentData): number {
    const responsesArray = Object.values(data.responses || {});
    const studentResponses = this.filterResponsesByKeywords(responsesArray, [
      'student', 'learner', 'academic experience'
    ]);
    return this.calculateResponseScore(studentResponses);
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

export function createAICSAlgorithm(): AICSAlgorithm {
  return new AICSAlgorithm();
}

export async function calculateAICSScore(
  assessmentData: AssessmentData,
  organizationMetrics: OrganizationMetrics
): Promise<AICSSculturalMetrics> {
  const algorithm = createAICSAlgorithm();
  return algorithm.calculateAICS(assessmentData, organizationMetrics);
}
