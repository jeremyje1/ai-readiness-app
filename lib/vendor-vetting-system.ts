import { createClient } from '@supabase/supabase-js'

// Vendor Vetting & Tool Approval System
export interface VendorIntakeForm {
  id: string
  submittedBy: string
  submissionDate: string
  
  // Tool Information
  toolName: string
  vendorName: string
  toolDescription: string
  requestedUseCase: string
  requestingDepartment: string
  targetUsers: ('Teachers' | 'Students' | 'Administrators' | 'Parents')[]
  
  // Age and Grade Specifications
  minAge: number
  maxAge: number
  gradeLevel: string[]
  subjectAreas: string[]
  
  // Technical Details
  websiteUrl: string
  hostingLocation: string
  dataCenter: string
  modelProvider: string
  apiIntegrations: string[]
  
  // Data Flow Information
  dataCollected: string[]
  dataSharing: boolean
  dataRetention: string
  trainingOnUserData: boolean
  optOutAvailable: boolean
  ageGateImplemented: boolean
  parentalConsentRequired: boolean
  
  // Cost Information
  pricingModel: string
  estimatedCost: number
  contractLength: string
  trialAvailable: boolean
  
  // Status
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Conditional Approval'
  assignedReviewer: string
  reviewStartDate?: string
  reviewCompletedDate?: string
  
  created_at: string
  updated_at: string
}

export interface RiskAssessment {
  id: string
  intakeFormId: string
  
  // Automated Risk Scores (0-100)
  overallRiskScore: number
  privacyRiskScore: number
  securityRiskScore: number
  complianceRiskScore: number
  pedagogicalRiskScore: number
  
  // Compliance Flags
  coppaFlags: ComplianceFlag[]
  ferpaFlags: ComplianceFlag[]
  ppraFlags: ComplianceFlag[]
  statePrivacyFlags: ComplianceFlag[]
  
  // Technical Risk Factors
  hostingRisk: 'Low' | 'Medium' | 'High'
  dataFlowRisk: 'Low' | 'Medium' | 'High'
  vendorRisk: 'Low' | 'Medium' | 'High'
  modelProviderRisk: 'Low' | 'Medium' | 'High'
  
  // Generated Recommendations
  recommendations: string[]
  requiredMitigations: string[]
  conditionalApprovalRequirements: string[]
  
  generatedAt: string
  created_at: string
}

export interface ComplianceFlag {
  regulation: 'COPPA' | 'FERPA' | 'PPRA' | 'State Privacy'
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  issue: string
  description: string
  mitigation: string
  sourceReference: string
}

export interface DecisionBrief {
  id: string
  intakeFormId: string
  riskAssessmentId: string
  
  // Executive Summary
  toolName: string
  vendorName: string
  recommendedDecision: 'Approve' | 'Reject' | 'Conditional Approval'
  executiveSummary: string
  
  // Key Risk Factors
  primaryRisks: string[]
  complianceIssues: string[]
  mitigationStrategies: string[]
  
  // Financial Impact
  totalCostOfOwnership: number
  budgetImpact: string
  alternatives: string[]
  
  // Implementation Requirements
  trainingRequired: boolean
  policyUpdatesNeeded: boolean
  technicalRequirements: string[]
  timelineToImplementation: string
  
  // Board Presentation Ready
  boardSlideContent: string
  votingRecommendation: string
  nextSteps: string[]
  
  generatedAt: string
  approvedBy?: string
  approvedAt?: string
  created_at: string
}

export interface ApprovedTool {
  id: string
  intakeFormId: string
  decisionBriefId: string
  
  // Tool Details
  toolName: string
  vendorName: string
  description: string
  category: string
  
  // Approved Usage
  approvedRoles: ('Teachers' | 'Students' | 'Administrators' | 'Parents')[]
  approvedSubjects: string[]
  approvedGradeLevels: string[]
  approvedUseCases: string[]
  
  // Restrictions and Requirements
  usageRestrictions: string[]
  requiredTraining: string[]
  dataHandlingRequirements: string[]
  monitoringRequirements: string[]
  
  // Contract Information
  contractStartDate: string
  contractEndDate: string
  renewalDate: string
  primaryContact: string
  
  // Compliance Status
  lastComplianceReview: string
  nextComplianceReview: string
  complianceStatus: 'Compliant' | 'Minor Issues' | 'Major Issues' | 'Non-Compliant'
  
  // Usage Analytics
  activeUsers: number
  monthlyUsage: number
  incidentCount: number
  satisfactionScore: number
  
  // Status
  status: 'Active' | 'Suspended' | 'Deprecated' | 'Under Review'
  
  approvedAt: string
  created_at: string
  updated_at: string
}

export interface VendorProfile {
  id: string
  vendorName: string
  website: string
  headquarters: string
  yearFounded: number
  
  // Company Information
  employeeCount: string
  annualRevenue: string
  publiclyTraded: boolean
  parentCompany?: string
  
  // Security & Compliance
  certifications: string[]
  privacyFrameworkCompliance: string[]
  securityAudits: string[]
  breachHistory: SecurityBreach[]
  
  // Education Focus
  k12Experience: boolean
  higherEdExperience: boolean
  educationClientCount: number
  referenceCustomers: string[]
  
  // Support & Training
  supportChannels: string[]
  trainingOffered: boolean
  implementationSupport: boolean
  dataPortability: boolean
  
  // Risk Profile
  overallVendorRisk: 'Low' | 'Medium' | 'High'
  riskFactors: string[]
  
  created_at: string
  updated_at: string
}

export interface SecurityBreach {
  date: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  affectedRecords: number
  description: string
  resolution: string
  regulatoryAction: boolean
}

export class VendorVettingSystem {
  private supabase: any

  constructor() {
  // Use shared anon client to avoid multiple instances; elevate to admin client only in server contexts
  this.supabase = require('./supabase').supabase
  }

  // Submit new vendor intake form
  async submitIntakeForm(formData: Omit<VendorIntakeForm, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<VendorIntakeForm> {
    const intakeForm: VendorIntakeForm = {
      id: `intake-${Date.now()}`,
      ...formData,
      status: 'Submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Store in database
    await this.supabase
      .from('vendor_intake_forms')
      .insert(intakeForm)

    // Automatically trigger risk assessment
    await this.generateRiskAssessment(intakeForm.id, intakeForm)

    return intakeForm
  }

  // Generate automated risk assessment
  async generateRiskAssessment(intakeFormId: string, intakeForm: VendorIntakeForm): Promise<RiskAssessment> {
    const riskAssessment: RiskAssessment = {
      id: `risk-${Date.now()}`,
      intakeFormId,
      overallRiskScore: 0,
      privacyRiskScore: 0,
      securityRiskScore: 0,
      complianceRiskScore: 0,
      pedagogicalRiskScore: 0,
      coppaFlags: [],
      ferpaFlags: [],
      ppraFlags: [],
      statePrivacyFlags: [],
      hostingRisk: 'Low',
      dataFlowRisk: 'Low',
      vendorRisk: 'Low',
      modelProviderRisk: 'Low',
      recommendations: [],
      requiredMitigations: [],
      conditionalApprovalRequirements: [],
      generatedAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    // COPPA Compliance Checks (Under 13)
    if (intakeForm.minAge < 13) {
      if (!intakeForm.parentalConsentRequired) {
        riskAssessment.coppaFlags.push({
          regulation: 'COPPA',
          severity: 'Critical',
          issue: 'Missing Parental Consent',
          description: 'Tool collects data from children under 13 without parental consent mechanism',
          mitigation: 'Require parental consent workflow or age gate implementation',
          sourceReference: '15 USC § 6501-6506 (COPPA)'
        })
      }

      if (intakeForm.trainingOnUserData) {
        riskAssessment.coppaFlags.push({
          regulation: 'COPPA',
          severity: 'High',
          issue: 'AI Training on Child Data',
          description: 'Tool uses children\'s data for AI model training',
          mitigation: 'Exclude children\'s data from training or obtain specific consent',
          sourceReference: 'FTC COPPA Rule § 312.5(c)(3)'
        })
      }

      if (!intakeForm.optOutAvailable) {
        riskAssessment.coppaFlags.push({
          regulation: 'COPPA',
          severity: 'Medium',
          issue: 'No Opt-Out Mechanism',
          description: 'Parents cannot opt children out of data collection',
          mitigation: 'Implement parent opt-out functionality',
          sourceReference: 'FTC COPPA Rule § 312.6'
        })
      }
    }

    // FERPA Compliance Checks
    if (intakeForm.targetUsers.includes('Students') && intakeForm.dataCollected.some(data => 
      ['grades', 'academic records', 'student id', 'attendance', 'behavior'].some(term => 
        data.toLowerCase().includes(term)))) {
      
      riskAssessment.ferpaFlags.push({
        regulation: 'FERPA',
        severity: 'High',
        issue: 'Educational Records Processing',
        description: 'Tool processes educational records as defined by FERPA',
        mitigation: 'Ensure school official status or obtain written consent',
        sourceReference: '20 USC § 1232g (FERPA)'
      })

      if (intakeForm.dataSharing) {
        riskAssessment.ferpaFlags.push({
          regulation: 'FERPA',
          severity: 'Critical',
          issue: 'Educational Records Sharing',
          description: 'Tool shares educational records with third parties',
          mitigation: 'Limit sharing to authorized purposes or obtain consent',
          sourceReference: 'FERPA § 99.31'
        })
      }
    }

    // PPRA Compliance Checks (K-12 Surveys)
    if (intakeForm.requestedUseCase.toLowerCase().includes('survey') || 
        intakeForm.requestedUseCase.toLowerCase().includes('assessment')) {
      
      const protectedAreas = ['political', 'mental health', 'family', 'religion', 'sex']
      if (protectedAreas.some(area => intakeForm.toolDescription.toLowerCase().includes(area))) {
        riskAssessment.ppraFlags.push({
          regulation: 'PPRA',
          severity: 'High',
          issue: 'Protected Information Survey',
          description: 'Tool may collect information protected under PPRA',
          mitigation: 'Obtain parental consent before administering surveys',
          sourceReference: '20 USC § 1232h (PPRA)'
        })
      }
    }

    // Calculate Risk Scores
    riskAssessment.privacyRiskScore = this.calculatePrivacyRisk(intakeForm, riskAssessment)
    riskAssessment.securityRiskScore = this.calculateSecurityRisk(intakeForm)
    riskAssessment.complianceRiskScore = this.calculateComplianceRisk(riskAssessment)
    riskAssessment.pedagogicalRiskScore = this.calculatePedagogicalRisk(intakeForm)
    
    riskAssessment.overallRiskScore = Math.round(
      (riskAssessment.privacyRiskScore + 
       riskAssessment.securityRiskScore + 
       riskAssessment.complianceRiskScore + 
       riskAssessment.pedagogicalRiskScore) / 4
    )

    // Generate recommendations
    riskAssessment.recommendations = this.generateRecommendations(intakeForm, riskAssessment)
    riskAssessment.requiredMitigations = this.generateMitigations(riskAssessment)

    // Store assessment
    await this.supabase
      .from('risk_assessments')
      .insert(riskAssessment)

    // Generate decision brief
    await this.generateDecisionBrief(intakeFormId, riskAssessment.id, intakeForm, riskAssessment)

    return riskAssessment
  }

  private calculatePrivacyRisk(intakeForm: VendorIntakeForm, assessment: RiskAssessment): number {
    let score = 0
    
    // Base risk from data collection
    if (intakeForm.dataCollected.length > 5) score += 20
    if (intakeForm.dataSharing) score += 25
    if (intakeForm.trainingOnUserData) score += 30
    if (!intakeForm.optOutAvailable) score += 15
    
    // Compliance flags increase score
    score += assessment.coppaFlags.length * 10
    score += assessment.ferpaFlags.length * 10
    score += assessment.ppraFlags.length * 10
    
    return Math.min(score, 100)
  }

  private calculateSecurityRisk(intakeForm: VendorIntakeForm): number {
    let score = 0
    
    // Hosting location risk
    const highRiskCountries = ['China', 'Russia', 'Iran', 'North Korea']
    if (highRiskCountries.includes(intakeForm.hostingLocation)) score += 40
    
    // Model provider risk
    const unknownProviders = ['Unknown', 'Custom', 'Proprietary']
    if (unknownProviders.includes(intakeForm.modelProvider)) score += 20
    
    // Data retention risk
    if (intakeForm.dataRetention === 'Indefinite') score += 30
    if (intakeForm.dataRetention === 'Unknown') score += 25
    
    return Math.min(score, 100)
  }

  private calculateComplianceRisk(assessment: RiskAssessment): number {
    let score = 0
    
    // Critical flags
    const criticalFlags = [
      ...assessment.coppaFlags.filter(f => f.severity === 'Critical'),
      ...assessment.ferpaFlags.filter(f => f.severity === 'Critical'),
      ...assessment.ppraFlags.filter(f => f.severity === 'Critical')
    ]
    score += criticalFlags.length * 40
    
    // High severity flags
    const highFlags = [
      ...assessment.coppaFlags.filter(f => f.severity === 'High'),
      ...assessment.ferpaFlags.filter(f => f.severity === 'High'),
      ...assessment.ppraFlags.filter(f => f.severity === 'High')
    ]
    score += highFlags.length * 25
    
    return Math.min(score, 100)
  }

  private calculatePedagogicalRisk(intakeForm: VendorIntakeForm): number {
    let score = 0
    
    // Age appropriateness
    if (intakeForm.minAge < 8 && intakeForm.targetUsers.includes('Students')) score += 20
    
    // Subject area appropriateness
    const sensitiveSubjects = ['Health', 'Sex Education', 'Religion', 'Politics']
    if (intakeForm.subjectAreas.some(subject => sensitiveSubjects.includes(subject))) score += 15
    
    // Use case appropriateness
    if (intakeForm.requestedUseCase.toLowerCase().includes('assessment')) score += 10
    if (intakeForm.requestedUseCase.toLowerCase().includes('grading')) score += 15
    
    return Math.min(score, 100)
  }

  private generateRecommendations(intakeForm: VendorIntakeForm, assessment: RiskAssessment): string[] {
    const recommendations: string[] = []
    
    if (assessment.overallRiskScore < 30) {
      recommendations.push('Low risk tool suitable for approval with standard monitoring')
    } else if (assessment.overallRiskScore < 60) {
      recommendations.push('Moderate risk tool requiring enhanced oversight and training')
    } else {
      recommendations.push('High risk tool requiring significant mitigations or rejection')
    }
    
    if (assessment.coppaFlags.length > 0) {
      recommendations.push('Implement COPPA compliance training for all users')
      recommendations.push('Establish parental consent workflows')
    }
    
    if (assessment.ferpaFlags.length > 0) {
      recommendations.push('Ensure vendor qualifies as school official under FERPA')
      recommendations.push('Update data processing agreements with FERPA clauses')
    }
    
    if (intakeForm.trainingOnUserData) {
      recommendations.push('Negotiate data exclusion from AI training')
      recommendations.push('Require opt-out mechanisms for data processing')
    }
    
    return recommendations
  }

  private generateMitigations(assessment: RiskAssessment): string[] {
    const mitigations: string[] = []
    
    // Extract mitigations from compliance flags
    assessment.coppaFlags.forEach(flag => mitigations.push(flag.mitigation))
    assessment.ferpaFlags.forEach(flag => mitigations.push(flag.mitigation))
    assessment.ppraFlags.forEach(flag => mitigations.push(flag.mitigation))
    
    // Remove duplicates
    return [...new Set(mitigations)]
  }

  // Generate board-ready decision brief
  async generateDecisionBrief(
    intakeFormId: string, 
    riskAssessmentId: string, 
    intakeForm: VendorIntakeForm, 
    riskAssessment: RiskAssessment
  ): Promise<DecisionBrief> {
    
    const recommendedDecision = this.determineRecommendation(riskAssessment)
    
    const decisionBrief: DecisionBrief = {
      id: `brief-${Date.now()}`,
      intakeFormId,
      riskAssessmentId,
      toolName: intakeForm.toolName,
      vendorName: intakeForm.vendorName,
      recommendedDecision,
      executiveSummary: this.generateExecutiveSummary(intakeForm, riskAssessment, recommendedDecision),
      primaryRisks: this.extractPrimaryRisks(riskAssessment),
      complianceIssues: this.extractComplianceIssues(riskAssessment),
      mitigationStrategies: riskAssessment.requiredMitigations,
      totalCostOfOwnership: this.calculateTotalCost(intakeForm),
      budgetImpact: this.assessBudgetImpact(intakeForm),
      alternatives: this.suggestAlternatives(intakeForm),
      trainingRequired: this.determineTrainingRequirements(riskAssessment),
      policyUpdatesNeeded: this.determinePolicyUpdates(riskAssessment),
      technicalRequirements: this.identifyTechnicalRequirements(intakeForm),
      timelineToImplementation: this.estimateImplementationTimeline(intakeForm, riskAssessment),
      boardSlideContent: this.generateBoardSlideContent(intakeForm, riskAssessment, recommendedDecision),
      votingRecommendation: this.generateVotingRecommendation(recommendedDecision),
      nextSteps: this.generateNextSteps(recommendedDecision, riskAssessment),
      generatedAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    // Store decision brief
    await this.supabase
      .from('decision_briefs')
      .insert(decisionBrief)

    return decisionBrief
  }

  private determineRecommendation(assessment: RiskAssessment): 'Approve' | 'Reject' | 'Conditional Approval' {
    const criticalFlags = [
      ...assessment.coppaFlags.filter(f => f.severity === 'Critical'),
      ...assessment.ferpaFlags.filter(f => f.severity === 'Critical'),
      ...assessment.ppraFlags.filter(f => f.severity === 'Critical')
    ]

    if (criticalFlags.length > 0) return 'Reject'
    if (assessment.overallRiskScore > 70) return 'Reject'
    if (assessment.overallRiskScore > 40) return 'Conditional Approval'
    return 'Approve'
  }

  private generateExecutiveSummary(
    intakeForm: VendorIntakeForm, 
    assessment: RiskAssessment, 
    decision: string
  ): string {
    return `
${intakeForm.vendorName}'s ${intakeForm.toolName} has been evaluated for use in ${intakeForm.requestingDepartment}. 

Risk Assessment Summary:
- Overall Risk Score: ${assessment.overallRiskScore}/100
- Privacy Risk: ${assessment.privacyRiskScore}/100
- Compliance Risk: ${assessment.complianceRiskScore}/100
- Security Risk: ${assessment.securityRiskScore}/100

Compliance Findings:
- COPPA Issues: ${assessment.coppaFlags.length}
- FERPA Issues: ${assessment.ferpaFlags.length} 
- PPRA Issues: ${assessment.ppraFlags.length}

Recommendation: ${decision}

${decision === 'Approve' ? 'This tool meets our security and compliance standards with standard monitoring procedures.' :
  decision === 'Conditional Approval' ? 'This tool can be approved with the implementation of specific mitigations and enhanced oversight.' :
  'This tool presents significant risks that cannot be adequately mitigated and should be rejected.'}
`
  }

  private extractPrimaryRisks(assessment: RiskAssessment): string[] {
    const risks: string[] = []
    
    if (assessment.privacyRiskScore > 60) risks.push('High privacy risk due to extensive data collection')
    if (assessment.securityRiskScore > 60) risks.push('Security concerns with hosting or data handling')
    if (assessment.complianceRiskScore > 60) risks.push('Significant compliance violations identified')
    if (assessment.coppaFlags.length > 0) risks.push('COPPA compliance issues for under-13 users')
    if (assessment.ferpaFlags.length > 0) risks.push('FERPA educational records concerns')
    
    return risks
  }

  private extractComplianceIssues(assessment: RiskAssessment): string[] {
    const issues: string[] = []
    
    assessment.coppaFlags.forEach(flag => issues.push(`COPPA: ${flag.issue}`))
    assessment.ferpaFlags.forEach(flag => issues.push(`FERPA: ${flag.issue}`))
    assessment.ppraFlags.forEach(flag => issues.push(`PPRA: ${flag.issue}`))
    
    return issues
  }

  private calculateTotalCost(intakeForm: VendorIntakeForm): number {
    // Simple calculation - in production this would be more sophisticated
    const baseCost = intakeForm.estimatedCost
    const trainingCost = baseCost * 0.15 // 15% for training
    const implementationCost = baseCost * 0.10 // 10% for implementation
    
    return baseCost + trainingCost + implementationCost
  }

  private assessBudgetImpact(intakeForm: VendorIntakeForm): string {
    const totalCost = this.calculateTotalCost(intakeForm)
    
    if (totalCost < 5000) return 'Low budget impact - within departmental authority'
    if (totalCost < 25000) return 'Moderate budget impact - requires administrative approval'
    return 'High budget impact - requires board approval'
  }

  private suggestAlternatives(intakeForm: VendorIntakeForm): string[] {
    // In production, this would query a database of alternative tools
    return [
      'Evaluate existing district-approved tools with similar functionality',
      'Consider free or open-source alternatives',
      'Pilot program with limited scope before full deployment'
    ]
  }

  private determineTrainingRequirements(assessment: RiskAssessment): boolean {
    return assessment.overallRiskScore > 30 || 
           assessment.coppaFlags.length > 0 || 
           assessment.ferpaFlags.length > 0
  }

  private determinePolicyUpdates(assessment: RiskAssessment): boolean {
    return assessment.complianceRiskScore > 40 || 
           assessment.coppaFlags.length > 0 || 
           assessment.ferpaFlags.length > 0
  }

  private identifyTechnicalRequirements(intakeForm: VendorIntakeForm): string[] {
    const requirements: string[] = []
    
    if (intakeForm.apiIntegrations.length > 0) {
      requirements.push('API integration and testing')
    }
    
    if (intakeForm.parentalConsentRequired) {
      requirements.push('Parental consent workflow implementation')
    }
    
    if (intakeForm.ageGateImplemented) {
      requirements.push('Age verification system configuration')
    }
    
    requirements.push('Single sign-on integration')
    requirements.push('Data backup and recovery procedures')
    
    return requirements
  }

  private estimateImplementationTimeline(intakeForm: VendorIntakeForm, assessment: RiskAssessment): string {
    if (assessment.overallRiskScore < 30) return '2-4 weeks'
    if (assessment.overallRiskScore < 60) return '4-8 weeks'
    return '8-12 weeks'
  }

  private generateBoardSlideContent(
    intakeForm: VendorIntakeForm, 
    assessment: RiskAssessment, 
    decision: string
  ): string {
    return `
# ${intakeForm.toolName} Approval Request

## Tool Overview
- **Vendor:** ${intakeForm.vendorName}
- **Requesting Department:** ${intakeForm.requestingDepartment}
- **Use Case:** ${intakeForm.requestedUseCase}
- **Target Users:** ${intakeForm.targetUsers.join(', ')}

## Risk Assessment
- **Overall Risk Score:** ${assessment.overallRiskScore}/100
- **Primary Concerns:** ${this.extractPrimaryRisks(assessment).join(', ')}
- **Compliance Issues:** ${assessment.coppaFlags.length + assessment.ferpaFlags.length + assessment.ppraFlags.length} identified

## Financial Impact
- **Annual Cost:** $${intakeForm.estimatedCost.toLocaleString()}
- **Total Cost of Ownership:** $${this.calculateTotalCost(intakeForm).toLocaleString()}

## Recommendation
**${decision}**

${decision === 'Approve' ? '✅ Proceed with standard implementation' :
  decision === 'Conditional Approval' ? '⚠️ Approve with required mitigations' :
  '❌ Reject due to unacceptable risks'}
`
  }

  private generateVotingRecommendation(decision: string): string {
    switch (decision) {
      case 'Approve':
        return 'Motion to approve the implementation of this AI tool with standard monitoring procedures.'
      case 'Conditional Approval':
        return 'Motion to approve the implementation of this AI tool contingent upon completion of all required mitigations.'
      case 'Reject':
        return 'Motion to reject the implementation of this AI tool due to unacceptable risk factors.'
      default:
        return 'Motion to table this decision pending additional information.'
    }
  }

  private generateNextSteps(decision: string, assessment: RiskAssessment): string[] {
    const steps: string[] = []
    
    switch (decision) {
      case 'Approve':
        steps.push('Begin procurement process')
        steps.push('Schedule implementation planning meeting')
        steps.push('Notify requesting department of approval')
        break
      case 'Conditional Approval':
        steps.push('Implement required mitigations')
        steps.push('Conduct compliance verification')
        steps.push('Schedule follow-up review')
        break
      case 'Reject':
        steps.push('Notify requesting department of rejection')
        steps.push('Provide alternative tool recommendations')
        steps.push('Document decision rationale')
        break
    }
    
    if (assessment.overallRiskScore > 30) {
      steps.push('Develop training program for users')
    }
    
    return steps
  }

  // Search approved tools catalog
  async searchApprovedTools(filters: {
    role?: string
    subject?: string
    gradeLevel?: string
    category?: string
  }): Promise<ApprovedTool[]> {
    let query = this.supabase
      .from('approved_tools')
      .select('*')
      .eq('status', 'Active')

    if (filters.role) {
      query = query.contains('approved_roles', [filters.role])
    }

    if (filters.subject) {
      query = query.contains('approved_subjects', [filters.subject])
    }

    if (filters.gradeLevel) {
      query = query.contains('approved_grade_levels', [filters.gradeLevel])
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Get vendor profile with risk assessment
  async getVendorProfile(vendorName: string): Promise<VendorProfile | null> {
    const { data, error } = await this.supabase
      .from('vendor_profiles')
      .select('*')
      .eq('vendor_name', vendorName)
      .single()

    if (error) return null
    return data
  }

  // Generate monthly vendor compliance report
  async generateMonthlyComplianceReport(month: string): Promise<{
    toolsReviewed: number
    newApprovals: number
    rejections: number
    complianceIssues: number
    riskTrends: any[]
  }> {
    // In production, this would query actual data
    return {
      toolsReviewed: 15,
      newApprovals: 8,
      rejections: 3,
      complianceIssues: 4,
      riskTrends: [
        { month: 'July', avgRisk: 35 },
        { month: 'August', avgRisk: 32 },
        { month: 'September', avgRisk: 28 }
      ]
    }
  }
}
