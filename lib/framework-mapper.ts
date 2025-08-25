import { FrameworkMapping, FrameworkControl, ExtractionRule, Document } from '../types/core-data-models'

// Framework Mapper - Rules that map extracted text to NIST/ED/state controls
export class FrameworkMapper {
  private readonly frameworkControls: Map<string, FrameworkControl[]> = new Map()
  private readonly mappingRules: Map<string, FrameworkMapping[]> = new Map()
  private readonly stateRegulations: Map<string, StateRegulation[]> = new Map()

  constructor() {
    this.initializeNISTControls()
    this.initializeEDGuidance()
    this.initializeStateRegulations()
    this.initializeMappingRules()
  }

  /**
   * Map document content to framework controls
   */
  async mapDocumentToFrameworks(document: Document): Promise<FrameworkMappingResult> {
    const result: FrameworkMappingResult = {
      documentId: document.id,
      mappings: [],
      coverage: {},
      gaps: [],
      recommendations: [],
      confidenceScore: 0
    }

    // Map to NIST AI RMF
    const nistMappings = await this.mapToNIST(document)
    result.mappings.push(...nistMappings)

    // Map to U.S. Department of Education Guidance
    const edMappings = await this.mapToEDGuidance(document)
    result.mappings.push(...edMappings)

    // Map to state regulations
    const stateMappings = await this.mapToStateRegulations(document)
    result.mappings.push(...stateMappings)

    // Calculate coverage and identify gaps
    result.coverage = this.calculateCoverage(result.mappings)
    result.gaps = this.identifyGaps(result.mappings, result.coverage)
    result.recommendations = this.generateRecommendations(result.gaps)
    result.confidenceScore = this.calculateConfidenceScore(result.mappings)

    return result
  }

  /**
   * Map content to NIST AI Risk Management Framework
   */
  private async mapToNIST(document: Document): Promise<ControlMapping[]> {
    const mappings: ControlMapping[] = []
    const nistControls = this.frameworkControls.get('NIST_AI_RMF') || []
    const content = document.extractedText.toLowerCase()

    for (const control of nistControls) {
      const mapping = await this.evaluateControlMapping(document, control, 'NIST_AI_RMF')
      if (mapping.confidence > 0.3) { // Threshold for inclusion
        mappings.push(mapping)
      }
    }

    return mappings
  }

  /**
   * Map content to U.S. Department of Education AI Guidance
   */
  private async mapToEDGuidance(document: Document): Promise<ControlMapping[]> {
    const mappings: ControlMapping[] = []
    const edControls = this.frameworkControls.get('ED_GUIDANCE') || []
    const content = document.extractedText.toLowerCase()

    for (const control of edControls) {
      const mapping = await this.evaluateControlMapping(document, control, 'ED_GUIDANCE')
      if (mapping.confidence > 0.3) {
        mappings.push(mapping)
      }
    }

    return mappings
  }

  /**
   * Map content to state-specific regulations
   */
  private async mapToStateRegulations(document: Document): Promise<ControlMapping[]> {
    const mappings: ControlMapping[] = []
    
    // Determine applicable states from document metadata or content
    const applicableStates = this.identifyApplicableStates(document)
    
    for (const state of applicableStates) {
      const stateRegs = this.stateRegulations.get(state) || []
      
      for (const regulation of stateRegs) {
        for (const control of regulation.controls) {
          const mapping = await this.evaluateControlMapping(document, control, `STATE_${state}`)
          if (mapping.confidence > 0.3) {
            mappings.push(mapping)
          }
        }
      }
    }

    return mappings
  }

  /**
   * Evaluate how well a document maps to a specific control
   */
  private async evaluateControlMapping(
    document: Document, 
    control: FrameworkControl, 
    framework: string
  ): Promise<ControlMapping> {
    const content = document.extractedText.toLowerCase()
    let totalScore = 0
    let matchedRules = 0
    const evidenceFound: string[] = []

    // Get mapping rules for this framework
    const frameworkMappings = this.mappingRules.get(framework) || []
    const relevantMapping = frameworkMappings.find(m => m.targetControl.id === control.id)

    if (relevantMapping) {
      for (const rule of relevantMapping.extractionRules) {
        const ruleScore = this.evaluateExtractionRule(content, rule)
        if (ruleScore > 0) {
          totalScore += ruleScore * rule.weight
          matchedRules++
          evidenceFound.push(`Found: ${rule.pattern}`)
        }
      }
    } else {
      // Fallback to basic keyword matching
      const basicScore = this.evaluateBasicMapping(content, control)
      totalScore = basicScore
      if (basicScore > 0) {
        matchedRules = 1
        evidenceFound.push('Basic keyword match')
      }
    }

    const confidence = matchedRules > 0 ? Math.min(totalScore / matchedRules, 1.0) : 0

    return {
      documentId: document.id,
      framework,
      controlId: control.id,
      controlTitle: control.title,
      confidence,
      status: this.determineImplementationStatus(confidence, evidenceFound),
      evidence: evidenceFound,
      gaps: this.identifyControlGaps(control, evidenceFound),
      recommendations: this.generateControlRecommendations(control, confidence)
    }
  }

  /**
   * Evaluate an extraction rule against content
   */
  private evaluateExtractionRule(content: string, rule: ExtractionRule): number {
    let score = 0

    switch (rule.ruleType) {
      case 'keyword':
        const keywords = rule.pattern.split('|')
        const matchedKeywords = keywords.filter(keyword => 
          content.includes(keyword.toLowerCase())
        )
        score = matchedKeywords.length / keywords.length
        break

      case 'pattern':
        try {
          const regex = new RegExp(rule.pattern, 'gi')
          const matches = content.match(regex)
          score = matches ? Math.min(matches.length / 5, 1.0) : 0
        } catch (e) {
          score = 0
        }
        break

      case 'semantic':
        // Semantic similarity would use embeddings/NLP
        score = this.evaluateSemanticSimilarity(content, rule.pattern)
        break

      case 'section_header':
        const headerRegex = new RegExp(`^#{1,3}\\s+.*${rule.pattern}.*$`, 'mi')
        score = headerRegex.test(content) ? 1.0 : 0
        break
    }

    // Apply context and exclusion filters
    if (score > 0) {
      // Check context requirements
      if (rule.context.length > 0) {
        const hasContext = rule.context.some(ctx => content.includes(ctx.toLowerCase()))
        if (!hasContext) score *= 0.5
      }

      // Check exclusions
      if (rule.exclusions.length > 0) {
        const hasExclusion = rule.exclusions.some(exc => content.includes(exc.toLowerCase()))
        if (hasExclusion) score *= 0.3
      }
    }

    return score
  }

  /**
   * Basic keyword-based mapping as fallback
   */
  private evaluateBasicMapping(content: string, control: FrameworkControl): number {
    const controlKeywords = [
      ...control.title.toLowerCase().split(' '),
      ...control.description.toLowerCase().split(' '),
      ...control.requirements.join(' ').toLowerCase().split(' ')
    ].filter(word => word.length > 3)

    const uniqueKeywords = [...new Set(controlKeywords)]
    const matchedKeywords = uniqueKeywords.filter(keyword => 
      content.includes(keyword)
    )

    return matchedKeywords.length / uniqueKeywords.length
  }

  /**
   * Mock semantic similarity evaluation
   */
  private evaluateSemanticSimilarity(content: string, pattern: string): number {
    // In production, this would use embeddings or NLP models
    // For now, use simple term overlap
    const contentTerms = content.split(' ').map(t => t.toLowerCase())
    const patternTerms = pattern.split(' ').map(t => t.toLowerCase())
    
    const overlap = patternTerms.filter(term => contentTerms.includes(term))
    return overlap.length / patternTerms.length
  }

  /**
   * Calculate framework coverage percentages
   */
  private calculateCoverage(mappings: ControlMapping[]): Record<string, FrameworkCoverage> {
    const coverage: Record<string, FrameworkCoverage> = {}

    // Group mappings by framework
    const frameworkGroups = mappings.reduce((groups, mapping) => {
      if (!groups[mapping.framework]) {
        groups[mapping.framework] = []
      }
      groups[mapping.framework].push(mapping)
      return groups
    }, {} as Record<string, ControlMapping[]>)

    // Calculate coverage for each framework
    Object.entries(frameworkGroups).forEach(([framework, frameworkMappings]) => {
      const totalControls = (this.frameworkControls.get(framework) || []).length
      const mappedControls = frameworkMappings.length
      const implementedControls = frameworkMappings.filter(m => 
        m.status === 'implemented' || m.status === 'partially_implemented'
      ).length

      coverage[framework] = {
        totalControls,
        mappedControls,
        implementedControls,
        coveragePercentage: totalControls > 0 ? (mappedControls / totalControls) * 100 : 0,
        implementationPercentage: totalControls > 0 ? (implementedControls / totalControls) * 100 : 0,
        averageConfidence: frameworkMappings.reduce((sum, m) => sum + m.confidence, 0) / frameworkMappings.length
      }
    })

    return coverage
  }

  /**
   * Identify gaps in framework coverage
   */
  private identifyGaps(mappings: ControlMapping[], coverage: Record<string, FrameworkCoverage>): FrameworkGap[] {
    const gaps: FrameworkGap[] = []

    Object.entries(coverage).forEach(([framework, frameworkCoverage]) => {
      const allControls = this.frameworkControls.get(framework) || []
      const mappedControlIds = mappings
        .filter(m => m.framework === framework)
        .map(m => m.controlId)

      const missingControls = allControls.filter(control => 
        !mappedControlIds.includes(control.id)
      )

      missingControls.forEach(control => {
        gaps.push({
          framework,
          controlId: control.id,
          controlTitle: control.title,
          priority: this.assessGapPriority(control),
          riskLevel: this.assessGapRisk(control),
          description: `Missing implementation evidence for ${control.title}`,
          recommendations: this.generateGapRecommendations(control)
        })
      })
    })

    return gaps.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Generate recommendations based on gaps and mappings
   */
  private generateRecommendations(gaps: FrameworkGap[]): FrameworkRecommendation[] {
    const recommendations: FrameworkRecommendation[] = []

    // Group gaps by framework for consolidated recommendations
    const gapsByFramework = gaps.reduce((groups, gap) => {
      if (!groups[gap.framework]) {
        groups[gap.framework] = []
      }
      groups[gap.framework].push(gap)
      return groups
    }, {} as Record<string, FrameworkGap[]>)

    Object.entries(gapsByFramework).forEach(([framework, frameworkGaps]) => {
      const criticalGaps = frameworkGaps.filter(g => g.priority === 'critical')
      const highPriorityGaps = frameworkGaps.filter(g => g.priority === 'high')

      if (criticalGaps.length > 0) {
        recommendations.push({
          type: 'immediate_action',
          priority: 'critical',
          framework,
          title: `Address Critical ${framework} Compliance Gaps`,
          description: `${criticalGaps.length} critical controls require immediate attention`,
          actionItems: criticalGaps.map(gap => `Implement ${gap.controlTitle}`),
          estimatedEffort: 'High',
          timeline: '30 days',
          impact: 'Regulatory compliance and risk reduction'
        })
      }

      if (highPriorityGaps.length > 0) {
        recommendations.push({
          type: 'policy_update',
          priority: 'high',
          framework,
          title: `Update Policies for ${framework} Compliance`,
          description: `${highPriorityGaps.length} high-priority controls need policy documentation`,
          actionItems: highPriorityGaps.map(gap => `Document ${gap.controlTitle}`),
          estimatedEffort: 'Medium',
          timeline: '60 days',
          impact: 'Improved compliance posture'
        })
      }
    })

    return recommendations
  }

  // Helper methods
  private determineImplementationStatus(confidence: number, evidence: string[]): ControlMapping['status'] {
    if (confidence >= 0.8) return 'implemented'
    if (confidence >= 0.5) return 'partially_implemented'
    if (confidence >= 0.3) return 'planned'
    return 'not_implemented'
  }

  private identifyControlGaps(control: FrameworkControl, evidence: string[]): string[] {
    const gaps: string[] = []
    
    control.requirements.forEach(requirement => {
      const hasEvidence = evidence.some(e => 
        e.toLowerCase().includes(requirement.toLowerCase().substring(0, 20))
      )
      if (!hasEvidence) {
        gaps.push(`Missing evidence for: ${requirement}`)
      }
    })

    return gaps
  }

  private generateControlRecommendations(control: FrameworkControl, confidence: number): string[] {
    const recommendations: string[] = []

    if (confidence < 0.5) {
      recommendations.push(`Develop policy documentation for ${control.title}`)
    }
    if (confidence < 0.7) {
      recommendations.push(`Implement missing requirements for ${control.id}`)
    }
    if (control.requirements.length > 0) {
      recommendations.push(`Ensure evidence collection for ${control.title}`)
    }

    return recommendations
  }

  private assessGapPriority(control: FrameworkControl): 'critical' | 'high' | 'medium' | 'low' {
    // Assess based on control characteristics
    if (control.title.toLowerCase().includes('privacy') || 
        control.title.toLowerCase().includes('security')) {
      return 'critical'
    }
    if (control.title.toLowerCase().includes('risk') || 
        control.title.toLowerCase().includes('governance')) {
      return 'high'
    }
    return 'medium'
  }

  private assessGapRisk(control: FrameworkControl): 'critical' | 'high' | 'medium' | 'low' {
    return this.assessGapPriority(control) // Same logic for now
  }

  private generateGapRecommendations(control: FrameworkControl): string[] {
    return [
      `Review and implement ${control.title}`,
      `Document implementation evidence`,
      `Assign responsible party for ${control.id}`
    ]
  }

  private identifyApplicableStates(document: Document): string[] {
    const content = document.extractedText.toLowerCase()
    const states: string[] = []

    // Look for state indicators in content
    const statePatterns = {
      'CA': ['california', 'ca dept', 'cdph', 'ab 2273'],
      'NY': ['new york', 'ny state', 'shield act'],
      'TX': ['texas', 'tx education', 'hb 4'],
      'FL': ['florida', 'fl dept', 'fdle'],
      'IL': ['illinois', 'il state']
    }

    Object.entries(statePatterns).forEach(([stateCode, patterns]) => {
      if (patterns.some(pattern => content.includes(pattern))) {
        states.push(stateCode)
      }
    })

    return states.length > 0 ? states : ['Federal'] // Default to federal if no state identified
  }

  private calculateConfidenceScore(mappings: ControlMapping[]): number {
    if (mappings.length === 0) return 0
    return mappings.reduce((sum, mapping) => sum + mapping.confidence, 0) / mappings.length
  }

  // Initialization methods
  private initializeNISTControls(): void {
    const nistControls: FrameworkControl[] = [
      {
        id: 'GOVERN-1.1',
        framework: 'NIST_AI_RMF',
        controlNumber: 'GOVERN-1.1',
        title: 'Legal and regulatory requirements are understood and managed',
        description: 'AI actors understand applicable laws, regulations, and organizational policies',
        requirements: [
          'Identify applicable legal and regulatory requirements',
          'Establish compliance monitoring processes',
          'Document legal obligations for AI systems'
        ],
        evidence: [
          'Legal compliance matrix',
          'Regulatory scanning process',
          'Policy documentation'
        ],
        testProcedures: [
          'Review legal requirements documentation',
          'Verify compliance monitoring implementation',
          'Assess policy completeness'
        ],
        implementationNotes: 'Requires ongoing legal review and stakeholder engagement',
        riskIfNotImplemented: 'Regulatory violations, legal exposure, reputational damage',
        typicalEvidence: ['Compliance policies', 'Legal reviews', 'Regulatory filings'],
        crossReferences: [
          { targetFramework: 'ISO_27001', targetControl: 'A.18.1.1', mappingType: 'related', notes: 'Legal compliance alignment' }
        ]
      },
      {
        id: 'MAP-1.1',
        framework: 'NIST_AI_RMF',
        controlNumber: 'MAP-1.1',
        title: 'AI system context and business process are understood',
        description: 'Map AI systems to organizational context and business processes',
        requirements: [
          'Document AI system purposes and use cases',
          'Identify stakeholders and users',
          'Map to business processes and workflows'
        ],
        evidence: [
          'System documentation',
          'Use case definitions',
          'Stakeholder analysis'
        ],
        testProcedures: [
          'Review system documentation completeness',
          'Verify stakeholder identification',
          'Assess business process mapping'
        ],
        implementationNotes: 'Requires cross-functional collaboration',
        riskIfNotImplemented: 'Misaligned AI deployment, ineffective governance',
        typicalEvidence: ['System inventories', 'Process maps', 'Stakeholder registers'],
        crossReferences: []
      },
      {
        id: 'MEASURE-2.1',
        framework: 'NIST_AI_RMF',
        controlNumber: 'MEASURE-2.1',
        title: 'AI system performance is measured and documented',
        description: 'Establish metrics and measurement processes for AI system performance',
        requirements: [
          'Define performance metrics',
          'Implement measurement processes',
          'Document performance results'
        ],
        evidence: [
          'Performance metrics documentation',
          'Measurement procedures',
          'Performance reports'
        ],
        testProcedures: [
          'Review metric definitions',
          'Verify measurement implementation',
          'Assess reporting completeness'
        ],
        implementationNotes: 'Requires technical measurement capabilities',
        riskIfNotImplemented: 'Unknown system performance, inability to detect issues',
        typicalEvidence: ['Metrics dashboards', 'Performance logs', 'Monitoring reports'],
        crossReferences: []
      }
    ]

    this.frameworkControls.set('NIST_AI_RMF', nistControls)
  }

  private initializeEDGuidance(): void {
    const edControls: FrameworkControl[] = [
      {
        id: 'ED-AI-1',
        framework: 'ED_GUIDANCE',
        controlNumber: 'AI-1',
        title: 'Educational AI systems protect student privacy',
        description: 'AI systems in education must comply with FERPA and protect student privacy',
        requirements: [
          'Implement FERPA-compliant data handling',
          'Establish student consent processes',
          'Document privacy protection measures'
        ],
        evidence: [
          'FERPA compliance documentation',
          'Privacy impact assessments',
          'Consent management systems'
        ],
        testProcedures: [
          'Review FERPA compliance measures',
          'Test consent processes',
          'Verify privacy controls'
        ],
        implementationNotes: 'Must align with FERPA requirements for educational records',
        riskIfNotImplemented: 'FERPA violations, student privacy breaches',
        typicalEvidence: ['Privacy policies', 'Data handling procedures', 'Consent records'],
        crossReferences: [
          { targetFramework: 'FERPA', targetControl: '99.30', mappingType: 'equivalent', notes: 'Direct FERPA compliance' }
        ]
      },
      {
        id: 'ED-AI-2',
        framework: 'ED_GUIDANCE',
        controlNumber: 'AI-2',
        title: 'AI systems support equitable educational outcomes',
        description: 'Educational AI must be designed to promote equity and avoid bias',
        requirements: [
          'Conduct bias assessments',
          'Implement equity monitoring',
          'Provide inclusive AI experiences'
        ],
        evidence: [
          'Bias assessment reports',
          'Equity monitoring data',
          'Inclusive design documentation'
        ],
        testProcedures: [
          'Review bias assessment results',
          'Verify equity monitoring implementation',
          'Assess inclusive design features'
        ],
        implementationNotes: 'Requires ongoing monitoring and assessment',
        riskIfNotImplemented: 'Educational inequity, discriminatory outcomes',
        typicalEvidence: ['Bias reports', 'Equity metrics', 'Accessibility audits'],
        crossReferences: []
      }
    ]

    this.frameworkControls.set('ED_GUIDANCE', edControls)
  }

  private initializeStateRegulations(): void {
    // California regulations
    this.stateRegulations.set('CA', [
      {
        state: 'CA',
        regulation: 'AB 2273',
        title: 'California Age-Appropriate Design Code',
        description: 'Privacy and design requirements for online services used by children',
        controls: [
          {
            id: 'CA-AB2273-1',
            framework: 'STATE_CA',
            controlNumber: 'AB2273-1',
            title: 'Age-appropriate design and privacy by default',
            description: 'Implement age-appropriate design features and privacy by default',
            requirements: [
              'Configure privacy settings for highest protection by default',
              'Implement age-appropriate design features',
              'Conduct Data Protection Impact Assessments'
            ],
            evidence: ['Privacy settings documentation', 'Age verification systems', 'DPIA reports'],
            testProcedures: ['Verify default privacy settings', 'Test age verification', 'Review DPIA'],
            implementationNotes: 'Applies to services likely to be accessed by children',
            riskIfNotImplemented: 'Regulatory penalties, privacy violations',
            typicalEvidence: ['Privacy configurations', 'Age gates', 'Impact assessments'],
            crossReferences: []
          }
        ]
      }
    ])

    // Texas regulations
    this.stateRegulations.set('TX', [
      {
        state: 'TX',
        regulation: 'HB 4',
        title: 'Texas Student Data Privacy',
        description: 'Requirements for educational technology and student data protection',
        controls: [
          {
            id: 'TX-HB4-1',
            framework: 'STATE_TX',
            controlNumber: 'HB4-1',
            title: 'Student data protection in educational technology',
            description: 'Protect student data in educational technology applications',
            requirements: [
              'Implement data minimization practices',
              'Establish vendor data agreements',
              'Provide parent notification and consent'
            ],
            evidence: ['Data agreements', 'Parent consent forms', 'Data minimization policies'],
            testProcedures: ['Review vendor agreements', 'Verify consent processes', 'Assess data practices'],
            implementationNotes: 'Applies to educational technology vendors and schools',
            riskIfNotImplemented: 'Student privacy violations, regulatory non-compliance',
            typicalEvidence: ['Vendor contracts', 'Consent records', 'Privacy notices'],
            crossReferences: []
          }
        ]
      }
    ])
  }

  private initializeMappingRules(): void {
    // NIST AI RMF mapping rules
    const nistMappings: FrameworkMapping[] = [
      {
        id: 'nist-govern-mapping',
        sourceFramework: 'NIST_AI_RMF',
        targetControl: {
          id: 'GOVERN-1.1',
          framework: 'NIST_AI_RMF',
          controlNumber: 'GOVERN-1.1',
          title: 'Legal and regulatory requirements',
          description: '',
          requirements: [],
          evidence: [],
          testProcedures: [],
          implementationNotes: '',
          riskIfNotImplemented: '',
          typicalEvidence: [],
          crossReferences: []
        },
        extractionRules: [
          {
            id: 'rule-1',
            ruleType: 'keyword',
            pattern: 'legal|regulatory|compliance|law|regulation',
            weight: 0.8,
            context: ['requirement', 'obligation', 'must'],
            exclusions: ['example', 'illustration']
          },
          {
            id: 'rule-2',
            ruleType: 'section_header',
            pattern: 'legal|compliance|regulatory',
            weight: 1.0,
            context: [],
            exclusions: []
          }
        ],
        mappingConfidence: 0.85,
        lastUpdated: new Date().toISOString(),
        monitoringEnabled: true,
        updateFrequency: 'monthly',
        alertThreshold: 0.7
      }
    ]

    this.mappingRules.set('NIST_AI_RMF', nistMappings)

    // ED Guidance mapping rules
    const edMappings: FrameworkMapping[] = [
      {
        id: 'ed-privacy-mapping',
        sourceFramework: 'ED_GUIDANCE',
        targetControl: {
          id: 'ED-AI-1',
          framework: 'ED_GUIDANCE',
          controlNumber: 'AI-1',
          title: 'Student privacy protection',
          description: '',
          requirements: [],
          evidence: [],
          testProcedures: [],
          implementationNotes: '',
          riskIfNotImplemented: '',
          typicalEvidence: [],
          crossReferences: []
        },
        extractionRules: [
          {
            id: 'rule-3',
            ruleType: 'keyword',
            pattern: 'ferpa|student privacy|educational records|coppa',
            weight: 0.9,
            context: ['protection', 'compliance', 'policy'],
            exclusions: []
          }
        ],
        mappingConfidence: 0.90,
        lastUpdated: new Date().toISOString(),
        monitoringEnabled: true,
        updateFrequency: 'monthly',
        alertThreshold: 0.8
      }
    ]

    this.mappingRules.set('ED_GUIDANCE', edMappings)
  }
}

// Supporting interfaces
interface FrameworkMappingResult {
  documentId: string
  mappings: ControlMapping[]
  coverage: Record<string, FrameworkCoverage>
  gaps: FrameworkGap[]
  recommendations: FrameworkRecommendation[]
  confidenceScore: number
}

interface ControlMapping {
  documentId: string
  framework: string
  controlId: string
  controlTitle: string
  confidence: number
  status: 'implemented' | 'partially_implemented' | 'planned' | 'not_implemented'
  evidence: string[]
  gaps: string[]
  recommendations: string[]
}

interface FrameworkCoverage {
  totalControls: number
  mappedControls: number
  implementedControls: number
  coveragePercentage: number
  implementationPercentage: number
  averageConfidence: number
}

interface FrameworkGap {
  framework: string
  controlId: string
  controlTitle: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  description: string
  recommendations: string[]
}

interface FrameworkRecommendation {
  type: 'immediate_action' | 'policy_update' | 'process_improvement' | 'training'
  priority: 'critical' | 'high' | 'medium' | 'low'
  framework: string
  title: string
  description: string
  actionItems: string[]
  estimatedEffort: 'Low' | 'Medium' | 'High'
  timeline: string
  impact: string
}

interface StateRegulation {
  state: string
  regulation: string
  title: string
  description: string
  controls: FrameworkControl[]
}
