/**
 * Gap Analyzer Service
 * Analyzes document content against framework requirements to identify gaps
 * 
 * @version 1.0.0
 * @author Staff Software Engineer
 */

export interface GapAnalysis {
  id: string;
  section: string;
  requirement: string;
  currentState: string;
  gap: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
  framework: string;
  confidence: number;
  evidence: string[];
  recommendations: string[];
}

export interface AnalysisContext {
  institutionType: string;
  documentType: string;
  extractedEntities: Record<string, any>;
}

export class GapAnalyzer {
  private requirementDatabase: Map<string, FrameworkRequirements>;

  constructor() {
    this.requirementDatabase = new Map([
      ['NIST AI RMF', this.getNistRequirements()],
      ['FERPA', this.getFerpaRequirements()],
      ['COPPA', this.getCoppaRequirements()],
      ['ED AI Guidance', this.getEdRequirements()],
    ]);
  }

  async analyze(
    documentText: string,
    applicableFrameworks: string[],
    entities: Record<string, any>
  ): Promise<GapAnalysis[]> {
    const gaps: GapAnalysis[] = [];

    for (const framework of applicableFrameworks) {
      const requirements = this.requirementDatabase.get(framework);
      if (!requirements) continue;

      for (const requirement of requirements.requirements) {
        const gap = await this.analyzeRequirement(
          documentText,
          requirement,
          framework,
          entities
        );

        if (gap) {
          gaps.push(gap);
        }
      }
    }

    // Sort by risk level and confidence
    return gaps.sort((a, b) => {
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const riskDiff = riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      if (riskDiff !== 0) return riskDiff;
      return b.confidence - a.confidence;
    });
  }

  private async analyzeRequirement(
    text: string,
    requirement: RequirementDefinition,
    framework: string,
    entities: Record<string, any>
  ): Promise<GapAnalysis | null> {
    try {
      // 1. Check if requirement is addressed in the document
      const coverage = this.assessRequirementCoverage(text, requirement);
      
      // 2. If not fully covered, identify the gap
      if (coverage.score < 0.7) {
        const gap = this.identifyGap(text, requirement, coverage);
        const riskLevel = this.assessRiskLevel(requirement, coverage.score);
        const remediation = this.generateRemediation(requirement, gap);

        return {
          id: `gap-${requirement.id}-${Date.now()}`,
          section: requirement.section,
          requirement: requirement.text,
          currentState: coverage.currentState,
          gap: gap.description,
          riskLevel,
          remediation,
          framework,
          confidence: coverage.confidence,
          evidence: coverage.evidence,
          recommendations: gap.recommendations,
        };
      }

      return null;

    } catch (error) {
      console.error('Gap analysis error:', error);
      return null;
    }
  }

  private assessRequirementCoverage(
    text: string,
    requirement: RequirementDefinition
  ): CoverageAssessment {
    const evidence: string[] = [];
    let score = 0;
    let confidence = 0;

    // Check for direct keyword matches
    const keywordMatches = this.findKeywordMatches(text, requirement.keywords);
    score += keywordMatches.length * 0.2;
    evidence.push(...keywordMatches);

    // Check for pattern matches
    const patternMatches = this.findPatternMatches(text, requirement.patterns);
    score += patternMatches.length * 0.3;
    evidence.push(...patternMatches);

    // Check for semantic similarity (simplified)
    const semanticScore = this.calculateSemanticSimilarity(text, requirement.text);
    score += semanticScore * 0.5;

    // Assess confidence based on evidence quality
    confidence = Math.min(evidence.length * 0.3, 1.0);

    // Generate current state description
    const currentState = this.describeCurrentState(text, requirement, evidence);

    return {
      score: Math.min(score, 1.0),
      confidence,
      evidence: evidence.slice(0, 5), // Limit evidence
      currentState,
    };
  }

  private findKeywordMatches(text: string, keywords: string[]): string[] {
    const matches: string[] = [];
    const textLower = text.toLowerCase();

    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        // Find the actual text snippet
        const regex = new RegExp(`\\b[^.]*${keyword}[^.]*\\.`, 'gi');
        const match = text.match(regex);
        if (match) {
          matches.push(match[0].trim());
        }
      }
    }

    return matches;
  }

  private findPatternMatches(text: string, patterns: RegExp[]): string[] {
    const matches: string[] = [];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        matches.push(...match.slice(0, 2)); // Limit matches per pattern
      }
    }

    return matches;
  }

  private calculateSemanticSimilarity(text: string, requirement: string): number {
    // Simplified semantic similarity using word overlap
    const textWords = new Set(text.toLowerCase().split(/\W+/));
    const reqWords = new Set(requirement.toLowerCase().split(/\W+/));
    
    const intersection = new Set([...textWords].filter(word => reqWords.has(word)));
    const union = new Set([...textWords, ...reqWords]);
    
    return intersection.size / union.size;
  }

  private describeCurrentState(
    text: string,
    requirement: RequirementDefinition,
    evidence: string[]
  ): string {
    if (evidence.length === 0) {
      return `No evidence found of ${requirement.section.toLowerCase()} implementation.`;
    }

    if (evidence.length === 1) {
      return `Limited coverage found: ${evidence[0].substring(0, 100)}...`;
    }

    return `Partial coverage found with ${evidence.length} relevant sections addressing ${requirement.section.toLowerCase()}.`;
  }

  private identifyGap(
    text: string,
    requirement: RequirementDefinition,
    coverage: CoverageAssessment
  ): GapIdentification {
    const missingElements = requirement.mandatoryElements.filter(element => 
      !text.toLowerCase().includes(element.toLowerCase())
    );

    const description = missingElements.length > 0
      ? `Missing required elements: ${missingElements.join(', ')}`
      : `Insufficient detail in addressing ${requirement.section} requirements`;

    const recommendations = this.generateGapRecommendations(requirement, missingElements);

    return {
      description,
      missingElements,
      recommendations,
    };
  }

  private generateGapRecommendations(
    requirement: RequirementDefinition,
    missingElements: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (missingElements.includes('governance structure')) {
      recommendations.push('Establish an AI governance committee with defined roles and responsibilities');
    }

    if (missingElements.includes('risk assessment')) {
      recommendations.push('Implement a systematic AI risk assessment process');
    }

    if (missingElements.includes('incident response')) {
      recommendations.push('Develop AI-specific incident response procedures');
    }

    if (missingElements.includes('training')) {
      recommendations.push('Create AI ethics and safety training programs for staff');
    }

    // Generic recommendation if no specific ones apply
    if (recommendations.length === 0) {
      recommendations.push(`Enhance ${requirement.section.toLowerCase()} section to fully address compliance requirements`);
    }

    return recommendations;
  }

  private assessRiskLevel(
    requirement: RequirementDefinition,
    coverageScore: number
  ): 'critical' | 'high' | 'medium' | 'low' {
    // Risk based on requirement criticality and coverage gap
    if (requirement.mandatory && coverageScore < 0.3) {
      return 'critical';
    }

    if (requirement.mandatory && coverageScore < 0.6) {
      return 'high';
    }

    if (coverageScore < 0.4) {
      return 'medium';
    }

    return 'low';
  }

  private generateRemediation(
    requirement: RequirementDefinition,
    gap: GapIdentification
  ): string {
    const actions: string[] = [];

    // Specific remediation based on requirement type
    switch (requirement.category) {
      case 'governance':
        actions.push('Establish governance framework');
        actions.push('Define roles and responsibilities');
        actions.push('Create oversight mechanisms');
        break;

      case 'risk-management':
        actions.push('Implement risk assessment procedures');
        actions.push('Define risk tolerance levels');
        actions.push('Create mitigation strategies');
        break;

      case 'privacy':
        actions.push('Strengthen data protection measures');
        actions.push('Implement consent mechanisms');
        actions.push('Create data handling procedures');
        break;

      case 'transparency':
        actions.push('Improve system transparency');
        actions.push('Create user notification processes');
        actions.push('Document decision-making criteria');
        break;

      default:
        actions.push(`Address ${requirement.section} requirements comprehensively`);
    }

    return actions.join('; ') + '.';
  }

  // Framework-specific requirement definitions
  private getNistRequirements(): FrameworkRequirements {
    return {
      framework: 'NIST AI RMF',
      requirements: [
        {
          id: 'GOVERN-1.1',
          section: 'AI Governance',
          text: 'Establish AI governance and oversight structure',
          category: 'governance',
          mandatory: true,
          keywords: ['governance', 'oversight', 'leadership', 'responsibility', 'accountability'],
          patterns: [/AI\s+governance/gi, /oversight\s+structure/gi],
          mandatoryElements: ['governance structure', 'roles and responsibilities', 'oversight mechanisms'],
        },
        {
          id: 'MAP-1.1',
          section: 'AI System Inventory',
          text: 'Maintain comprehensive inventory of AI systems',
          category: 'risk-management',
          mandatory: true,
          keywords: ['inventory', 'catalog', 'AI systems', 'documentation'],
          patterns: [/AI\s+(?:inventory|catalog|systems)/gi],
          mandatoryElements: ['system inventory', 'documentation'],
        },
        {
          id: 'MEASURE-2.1',
          section: 'Bias Testing',
          text: 'Implement bias testing and monitoring',
          category: 'risk-management',
          mandatory: true,
          keywords: ['bias', 'testing', 'monitoring', 'fairness', 'discrimination'],
          patterns: [/bias\s+(?:testing|monitoring)/gi, /fairness\s+assessment/gi],
          mandatoryElements: ['bias testing', 'monitoring procedures'],
        },
        {
          id: 'MANAGE-3.1',
          section: 'Incident Response',
          text: 'Establish AI incident response procedures',
          category: 'risk-management',
          mandatory: true,
          keywords: ['incident', 'response', 'procedures', 'escalation'],
          patterns: [/incident\s+response/gi],
          mandatoryElements: ['incident response', 'escalation procedures'],
        },
      ],
    };
  }

  private getFerpaRequirements(): FrameworkRequirements {
    return {
      framework: 'FERPA',
      requirements: [
        {
          id: 'FERPA-1',
          section: 'Student Record Access',
          text: 'Provide students and parents access to educational records',
          category: 'privacy',
          mandatory: true,
          keywords: ['student records', 'access rights', 'educational records', 'parent access'],
          patterns: [/student\s+(?:record|data)\s+access/gi],
          mandatoryElements: ['access procedures', 'notification requirements'],
        },
        {
          id: 'FERPA-2',
          section: 'Consent for Disclosure',
          text: 'Obtain consent before disclosing personally identifiable information',
          category: 'privacy',
          mandatory: true,
          keywords: ['consent', 'disclosure', 'PII', 'authorization'],
          patterns: [/consent\s+(?:for\s+)?disclosure/gi],
          mandatoryElements: ['consent procedures', 'disclosure authorization'],
        },
      ],
    };
  }

  private getCoppaRequirements(): FrameworkRequirements {
    return {
      framework: 'COPPA',
      requirements: [
        {
          id: 'COPPA-1',
          section: 'Parental Consent',
          text: 'Obtain verifiable parental consent for children under 13',
          category: 'privacy',
          mandatory: true,
          keywords: ['parental consent', 'children under 13', 'verifiable consent'],
          patterns: [/parental\s+consent/gi, /(?:children\s+)?under\s+13/gi],
          mandatoryElements: ['parental consent', 'age verification'],
        },
      ],
    };
  }

  private getEdRequirements(): FrameworkRequirements {
    return {
      framework: 'ED AI Guidance',
      requirements: [
        {
          id: 'ED-1',
          section: 'Educational Equity',
          text: 'Ensure AI systems promote educational equity and accessibility',
          category: 'transparency',
          mandatory: true,
          keywords: ['equity', 'accessibility', 'inclusive', 'fair access'],
          patterns: [/educational\s+equity/gi, /accessibility/gi],
          mandatoryElements: ['equity measures', 'accessibility features'],
        },
      ],
    };
  }
}

// Supporting interfaces
interface FrameworkRequirements {
  framework: string;
  requirements: RequirementDefinition[];
}

interface RequirementDefinition {
  id: string;
  section: string;
  text: string;
  category: 'governance' | 'risk-management' | 'privacy' | 'transparency';
  mandatory: boolean;
  keywords: string[];
  patterns: RegExp[];
  mandatoryElements: string[];
}

interface CoverageAssessment {
  score: number;
  confidence: number;
  evidence: string[];
  currentState: string;
}

interface GapIdentification {
  description: string;
  missingElements: string[];
  recommendations: string[];
}
