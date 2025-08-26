/**
 * Framework Mapping Service for Assessment 2.0
 * Maps document sections to AI governance frameworks
 * @version 2.0.0
 */

export interface FrameworkControl {
  id: string
  name: string
  description: string
  category: string
  keywords: string[]
  weight: number
}

export interface FrameworkMapping {
  framework: 'AIRIX' | 'AIRS' | 'AICS' | 'AIMS' | 'AIPS' | 'AIBS'
  controlId: string
  sectionIds: string[]
  score: number
  evidence: string[]
  gaps: string[]
  rationale: string
}

export interface FrameworkAnalysis {
  overallScores: Record<string, number>
  mappings: FrameworkMapping[]
  recommendations: string[]
  complianceLevel: 'non-compliant' | 'partial' | 'substantial' | 'full'
}

export class FrameworkMapper {
  private frameworks: Record<string, FrameworkControl[]> = {
    AIRIX: [
      {
        id: 'AIRIX-1.1',
        name: 'AI Governance Structure',
        description: 'Establish clear AI governance roles and responsibilities',
        category: 'Governance',
        keywords: ['governance', 'oversight', 'responsibility', 'authority', 'leadership'],
        weight: 1.0
      },
      {
        id: 'AIRIX-1.2', 
        name: 'AI Risk Management',
        description: 'Implement comprehensive AI risk assessment processes',
        category: 'Risk Management',
        keywords: ['risk', 'assessment', 'management', 'mitigation', 'evaluation'],
        weight: 1.0
      },
      {
        id: 'AIRIX-2.1',
        name: 'Data Quality and Integrity',
        description: 'Ensure AI training data quality and bias mitigation',
        category: 'Data Management',
        keywords: ['data', 'quality', 'bias', 'integrity', 'training'],
        weight: 0.9
      },
      {
        id: 'AIRIX-2.2',
        name: 'Privacy Protection',
        description: 'Implement privacy-preserving AI practices',
        category: 'Privacy',
        keywords: ['privacy', 'protection', 'personal', 'confidential', 'sensitive'],
        weight: 1.0
      },
      {
        id: 'AIRIX-3.1',
        name: 'Algorithmic Transparency',
        description: 'Ensure explainability and interpretability of AI decisions',
        category: 'Transparency',
        keywords: ['transparency', 'explainable', 'interpretable', 'decision', 'algorithm'],
        weight: 0.8
      }
    ],

    AIRS: [
      {
        id: 'AIRS-1.1',
        name: 'AI Security Framework',
        description: 'Implement comprehensive AI security measures',
        category: 'Security',
        keywords: ['security', 'protection', 'threat', 'vulnerability', 'defense'],
        weight: 1.0
      },
      {
        id: 'AIRS-1.2',
        name: 'Model Security',
        description: 'Secure AI models from adversarial attacks',
        category: 'Model Protection',
        keywords: ['model', 'adversarial', 'attack', 'robustness', 'protection'],
        weight: 0.9
      },
      {
        id: 'AIRS-2.1',
        name: 'Data Security',
        description: 'Protect training and operational data',
        category: 'Data Security',
        keywords: ['data', 'encryption', 'access', 'control', 'storage'],
        weight: 1.0
      },
      {
        id: 'AIRS-2.2',
        name: 'Infrastructure Security',
        description: 'Secure AI infrastructure and deployment environments',
        category: 'Infrastructure',
        keywords: ['infrastructure', 'deployment', 'environment', 'network', 'system'],
        weight: 0.8
      }
    ],

    AICS: [
      {
        id: 'AICS-1.1',
        name: 'FERPA Compliance',
        description: 'Ensure AI systems comply with FERPA requirements',
        category: 'Education Privacy',
        keywords: ['ferpa', 'education', 'student', 'records', 'privacy'],
        weight: 1.0
      },
      {
        id: 'AICS-1.2',
        name: 'COPPA Compliance',
        description: 'Implement COPPA-compliant AI for children under 13',
        category: 'Child Privacy',
        keywords: ['coppa', 'children', 'under 13', 'parental', 'consent'],
        weight: 1.0
      },
      {
        id: 'AICS-2.1',
        name: 'Accessibility Compliance',
        description: 'Ensure AI systems meet accessibility standards',
        category: 'Accessibility',
        keywords: ['accessibility', 'disability', 'accommodation', 'ada', 'wcag'],
        weight: 0.9
      },
      {
        id: 'AICS-2.2',
        name: 'Bias and Fairness',
        description: 'Implement bias detection and fairness measures',
        category: 'Fairness',
        keywords: ['bias', 'fairness', 'discrimination', 'equity', 'inclusive'],
        weight: 0.9
      }
    ],

    AIMS: [
      {
        id: 'AIMS-1.1',
        name: 'Performance Monitoring',
        description: 'Continuously monitor AI system performance',
        category: 'Monitoring',
        keywords: ['monitoring', 'performance', 'metrics', 'tracking', 'measurement'],
        weight: 0.8
      },
      {
        id: 'AIMS-1.2',
        name: 'Model Validation',
        description: 'Validate AI models before deployment',
        category: 'Validation',
        keywords: ['validation', 'testing', 'verification', 'quality', 'assurance'],
        weight: 0.9
      },
      {
        id: 'AIMS-2.1',
        name: 'Drift Detection',
        description: 'Detect and respond to model drift',
        category: 'Drift Management',
        keywords: ['drift', 'degradation', 'performance', 'monitoring', 'detection'],
        weight: 0.8
      },
      {
        id: 'AIMS-2.2',
        name: 'Incident Response',
        description: 'Respond to AI system incidents and failures',
        category: 'Incident Management',
        keywords: ['incident', 'response', 'failure', 'recovery', 'escalation'],
        weight: 0.9
      }
    ],

    AIPS: [
      {
        id: 'AIPS-1.1',
        name: 'Procurement Standards',
        description: 'Implement AI procurement evaluation criteria',
        category: 'Procurement',
        keywords: ['procurement', 'vendor', 'evaluation', 'criteria', 'selection'],
        weight: 0.9
      },
      {
        id: 'AIPS-1.2',
        name: 'Vendor Management',
        description: 'Manage AI vendor relationships and contracts',
        category: 'Vendor Management',
        keywords: ['vendor', 'contract', 'relationship', 'management', 'oversight'],
        weight: 0.8
      },
      {
        id: 'AIPS-2.1',
        name: 'Due Diligence',
        description: 'Conduct thorough AI vendor due diligence',
        category: 'Due Diligence',
        keywords: ['due diligence', 'assessment', 'evaluation', 'risk', 'review'],
        weight: 0.9
      },
      {
        id: 'AIPS-2.2',
        name: 'Contract Compliance',
        description: 'Ensure AI vendors meet contractual obligations',
        category: 'Compliance',
        keywords: ['compliance', 'contract', 'obligation', 'requirement', 'terms'],
        weight: 0.8
      }
    ],

    AIBS: [
      {
        id: 'AIBS-1.1',
        name: 'Benchmarking Framework',
        description: 'Establish AI governance benchmarking metrics',
        category: 'Benchmarking',
        keywords: ['benchmark', 'metrics', 'comparison', 'standard', 'measurement'],
        weight: 0.7
      },
      {
        id: 'AIBS-1.2',
        name: 'Peer Comparison',
        description: 'Compare AI maturity with peer organizations',
        category: 'Peer Analysis',
        keywords: ['peer', 'comparison', 'maturity', 'benchmark', 'analysis'],
        weight: 0.7
      },
      {
        id: 'AIBS-2.1',
        name: 'Improvement Planning',
        description: 'Develop improvement plans based on benchmarks',
        category: 'Improvement',
        keywords: ['improvement', 'planning', 'development', 'enhancement', 'growth'],
        weight: 0.8
      },
      {
        id: 'AIBS-2.2',
        name: 'Progress Tracking',
        description: 'Track progress against benchmarking goals',
        category: 'Progress Tracking',
        keywords: ['progress', 'tracking', 'goals', 'objectives', 'measurement'],
        weight: 0.7
      }
    ]
  }

  async analyzeDocument(sections: any[], organizationType: 'K12' | 'HigherEd' = 'K12'): Promise<FrameworkAnalysis> {
    const mappings: FrameworkMapping[] = []
    const overallScores: Record<string, number> = {}

    // Analyze each framework
    for (const [frameworkName, controls] of Object.entries(this.frameworks)) {
      let frameworkScore = 0
      let totalWeight = 0

      for (const control of controls) {
        const mapping = await this.mapControlToSections(
          frameworkName as any, 
          control, 
          sections,
          organizationType
        )
        
        mappings.push(mapping)
        frameworkScore += mapping.score * control.weight
        totalWeight += control.weight
      }

      overallScores[frameworkName] = totalWeight > 0 ? frameworkScore / totalWeight : 0
    }

    const recommendations = this.generateRecommendations(mappings, overallScores)
    const complianceLevel = this.calculateComplianceLevel(overallScores)

    return {
      overallScores,
      mappings,
      recommendations,
      complianceLevel
    }
  }

  private async mapControlToSections(
    framework: 'AIRIX' | 'AIRS' | 'AICS' | 'AIMS' | 'AIPS' | 'AIBS',
    control: FrameworkControl,
    sections: any[],
    organizationType: 'K12' | 'HigherEd'
  ): Promise<FrameworkMapping> {
    const relevantSections = sections.filter(section => 
      this.isSectionRelevant(section, control)
    )

    const score = this.calculateControlScore(control, relevantSections, organizationType)
    const evidence = this.extractEvidence(control, relevantSections)
    const gaps = this.identifyGaps(control, relevantSections, score)
    const rationale = this.generateRationale(control, relevantSections, score)

    return {
      framework,
      controlId: control.id,
      sectionIds: relevantSections.map(s => s.id || ''),
      score,
      evidence,
      gaps,
      rationale
    }
  }

  private isSectionRelevant(section: any, control: FrameworkControl): boolean {
    const sectionText = (section.heading + ' ' + section.content).toLowerCase()
    
    return control.keywords.some(keyword => 
      sectionText.includes(keyword.toLowerCase())
    )
  }

  private calculateControlScore(
    control: FrameworkControl, 
    sections: any[], 
    organizationType: 'K12' | 'HigherEd'
  ): number {
    if (sections.length === 0) return 0

    let baseScore = 0
    let coverageScore = 0
    let qualityScore = 0

    // Coverage score (0-0.4)
    const keywordCoverage = control.keywords.filter(keyword =>
      sections.some(section => 
        (section.heading + ' ' + section.content).toLowerCase().includes(keyword.toLowerCase())
      )
    ).length / control.keywords.length
    
    coverageScore = keywordCoverage * 0.4

    // Quality score (0-0.4)
    const avgConfidence = sections.reduce((sum, s) => sum + (s.confidence || 0), 0) / sections.length
    const contentQuality = sections.reduce((sum, s) => {
      const hasPolicy = /\b(shall|must|will|policy|procedure)\b/i.test(s.content)
      const hasMetrics = /\b(measure|metric|assess|evaluate|monitor)\b/i.test(s.content)
      return sum + (hasPolicy ? 0.1 : 0) + (hasMetrics ? 0.1 : 0)
    }, 0) / sections.length

    qualityScore = (avgConfidence * 0.2) + (contentQuality * 0.2)

    // Organization-specific adjustments (0-0.2)
    let orgAdjustment = 0
    if (organizationType === 'K12' && control.category === 'Education Privacy') {
      orgAdjustment = 0.1 // K12 gets bonus for education privacy
    }

    baseScore = Math.min(coverageScore + qualityScore + orgAdjustment, 1.0)

    return Math.round(baseScore * 100) / 100 // Round to 2 decimal places
  }

  private extractEvidence(control: FrameworkControl, sections: any[]): string[] {
    const evidence: string[] = []

    for (const section of sections) {
      const content = section.content || ''
      
      // Extract relevant sentences that contain control keywords
      const sentences = content.split(/[.!?]+/)
      
      for (const sentence of sentences) {
        if (control.keywords.some(keyword => 
          sentence.toLowerCase().includes(keyword.toLowerCase())
        )) {
          const trimmed = sentence.trim()
          if (trimmed.length > 20 && trimmed.length < 200) {
            evidence.push(trimmed)
          }
        }
      }
    }

    return evidence.slice(0, 5) // Limit to top 5 pieces of evidence
  }

  private identifyGaps(control: FrameworkControl, sections: any[], score: number): string[] {
    const gaps: string[] = []

    if (score < 0.3) {
      gaps.push(`No evidence found for ${control.name}`)
    }

    const coveredKeywords = control.keywords.filter(keyword =>
      sections.some(section => 
        (section.heading + ' ' + section.content).toLowerCase().includes(keyword.toLowerCase())
      )
    )

    const missingKeywords = control.keywords.filter(keyword => !coveredKeywords.includes(keyword))
    
    if (missingKeywords.length > 0) {
      gaps.push(`Missing coverage for: ${missingKeywords.join(', ')}`)
    }

    // Specific gap analysis based on control type
    if (control.category === 'Governance' && !sections.some(s => 
      /\b(board|committee|oversight)\b/i.test(s.content)
    )) {
      gaps.push('No clear governance structure defined')
    }

    if (control.category === 'Privacy' && !sections.some(s => 
      /\b(consent|notice|rights)\b/i.test(s.content)
    )) {
      gaps.push('Missing privacy rights and consent procedures')
    }

    return gaps.slice(0, 3) // Limit to top 3 gaps
  }

  private generateRationale(control: FrameworkControl, sections: any[], score: number): string {
    if (score === 0) {
      return `No relevant content found for ${control.name}. Consider adding specific policies or procedures addressing ${control.description.toLowerCase()}.`
    }

    if (score < 0.5) {
      return `Limited coverage of ${control.name}. Found ${sections.length} relevant section(s) but gaps exist in implementation details and specific procedures.`
    }

    if (score < 0.8) {
      return `Partial coverage of ${control.name}. Good foundation exists but could be strengthened with more detailed procedures and monitoring mechanisms.`
    }

    return `Strong coverage of ${control.name}. Well-documented policies and procedures align with framework requirements.`
  }

  private generateRecommendations(mappings: FrameworkMapping[], scores: Record<string, number>): string[] {
    const recommendations: string[] = []

    // Low-scoring frameworks
    for (const [framework, score] of Object.entries(scores)) {
      if (score < 0.5) {
        recommendations.push(`Prioritize ${framework} implementation - current score: ${(score * 100).toFixed(0)}%`)
      }
    }

    // Specific control recommendations
    const lowScoringControls = mappings
      .filter(m => m.score < 0.5)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)

    for (const control of lowScoringControls) {
      recommendations.push(`Address ${control.controlId}: ${control.gaps[0] || 'Improve implementation'}`)
    }

    // High-priority recommendations
    const criticalGaps = mappings.filter(m => 
      m.framework === 'AICS' && m.score < 0.3 // COPPA/FERPA compliance is critical
    )

    if (criticalGaps.length > 0) {
      recommendations.unshift('URGENT: Address COPPA/FERPA compliance gaps immediately')
    }

    return recommendations.slice(0, 8) // Limit to top 8 recommendations
  }

  private calculateComplianceLevel(scores: Record<string, number>): 'non-compliant' | 'partial' | 'substantial' | 'full' {
    const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length
    
    if (avgScore < 0.3) return 'non-compliant'
    if (avgScore < 0.6) return 'partial'
    if (avgScore < 0.9) return 'substantial'
    return 'full'
  }

  // Get framework details for UI
  getFrameworkDetails(): Record<string, FrameworkControl[]> {
    return this.frameworks
  }

  // Get control by ID
  getControl(framework: string, controlId: string): FrameworkControl | undefined {
    return this.frameworks[framework]?.find(c => c.id === controlId)
  }
}

export default FrameworkMapper
