import { 
  DashboardMetrics, 
  Document, 
  Policy, 
  Assessment, 
  Vendor, 
  AuditTrailEntry,
  MonthlyValueMetrics 
} from '../types/core-data-models'

// Dashboard Service - Readiness, adoption, risk, approvals, funding metrics
export class DashboardService {
  private readonly auditLog: AuditTrailEntry[] = []

  /**
   * Generate comprehensive dashboard metrics for an organization
   */
  async generateDashboardMetrics(orgId: string): Promise<DashboardMetrics> {
    const lastUpdated = new Date().toISOString()

    // Log dashboard access
    this.logDecision('dashboard_access', orgId, 'Dashboard metrics generated')

    const metrics: DashboardMetrics = {
      orgId,
      lastUpdated,
      readinessScore: await this.calculateReadinessScore(orgId),
      readinessTrend: await this.getReadinessTrend(orgId),
      adoptionScore: await this.calculateAdoptionScore(orgId),
      adoptionMetrics: await this.getAdoptionMetrics(orgId),
      riskScore: await this.calculateRiskScore(orgId),
      riskBreakdown: await this.getRiskBreakdown(orgId),
      approvalsMetrics: await this.getApprovalsMetrics(orgId),
      fundingMetrics: await this.getFundingMetrics(orgId),
      monthlyValue: await this.calculateMonthlyValue(orgId)
    }

    return metrics
  }

  /**
   * Calculate overall AI readiness score (AIRIX™)
   */
  private async calculateReadinessScore(orgId: string): Promise<number> {
    // Fetch latest assessment data
    const assessments = await this.getOrganizationAssessments(orgId)
    
    if (assessments.length === 0) {
      return 0
    }

    const latestAssessment = assessments[0] // Assuming sorted by date
    
    // AIRIX™ calculation combining multiple factors
    const governanceScore = latestAssessment.scores.airix.governance
    const technologyScore = latestAssessment.scores.airix.technology
    const trainingScore = latestAssessment.scores.airix.training
    const complianceScore = latestAssessment.scores.airix.compliance

    // Weighted average (governance and compliance are more critical)
    const weightedScore = (
      governanceScore * 0.3 +
      technologyScore * 0.2 +
      trainingScore * 0.2 +
      complianceScore * 0.3
    )

    this.logDecision('readiness_calculation', orgId, `AIRIX score calculated: ${weightedScore}`)
    
    return Math.round(weightedScore)
  }

  /**
   * Get readiness trend data over time
   */
  private async getReadinessTrend(orgId: string): Promise<Array<{date: string, value: number, change: number}>> {
    const assessments = await this.getOrganizationAssessments(orgId)
    const trend = []
    
    // Generate trend data from assessments over the last 12 months
    for (let i = 0; i < Math.min(12, assessments.length); i++) {
      const assessment = assessments[i]
      const previousAssessment = assessments[i + 1]
      
      const value = assessment.scores.airix.overall
      const change = previousAssessment ? value - previousAssessment.scores.airix.overall : 0
      
      trend.push({
        date: assessment.created_at,
        value,
        change
      })
    }

    return trend
  }

  /**
   * Calculate AI adoption score
   */
  private async calculateAdoptionScore(orgId: string): Promise<number> {
    const adoptionMetrics = await this.getAdoptionMetrics(orgId)
    
    // Calculate adoption score based on multiple factors
    const userAdoptionRate = adoptionMetrics.activeUsers / adoptionMetrics.totalUsers
    const toolDeploymentRate = adoptionMetrics.toolsDeployed / 10 // Assume target of 10 tools
    const trainingCompletionRate = adoptionMetrics.trainingCompleted / adoptionMetrics.totalUsers
    const policyImplementationRate = adoptionMetrics.policiesImplemented / 5 // Assume 5 core policies
    
    const adoptionScore = (
      userAdoptionRate * 0.25 +
      toolDeploymentRate * 0.25 +
      trainingCompletionRate * 0.25 +
      policyImplementationRate * 0.25
    ) * 100

    this.logDecision('adoption_calculation', orgId, `Adoption score calculated: ${adoptionScore}`)
    
    return Math.round(adoptionScore)
  }

  /**
   * Get detailed adoption metrics
   */
  private async getAdoptionMetrics(orgId: string) {
    // In production, these would come from actual data queries
    const mockData = {
      totalUsers: await this.getTotalUsers(orgId),
      activeUsers: await this.getActiveUsers(orgId),
      toolsDeployed: await this.getDeployedToolsCount(orgId),
      trainingCompleted: await this.getTrainingCompletionCount(orgId),
      policiesImplemented: await this.getImplementedPoliciesCount(orgId)
    }

    return mockData
  }

  /**
   * Calculate overall risk score (AIRS™)
   */
  private async calculateRiskScore(orgId: string): Promise<number> {
    const assessments = await this.getOrganizationAssessments(orgId)
    
    if (assessments.length === 0) {
      return 100 // Maximum risk if no assessment
    }

    const latestAssessment = assessments[0]
    
    // AIRS™ calculation (lower is better for risk)
    const privacyRisk = 100 - latestAssessment.scores.airs.privacy
    const securityRisk = 100 - latestAssessment.scores.airs.security
    const biasRisk = 100 - latestAssessment.scores.airs.bias
    const transparencyRisk = 100 - latestAssessment.scores.airs.transparency
    
    const overallRisk = (privacyRisk + securityRisk + biasRisk + transparencyRisk) / 4

    this.logDecision('risk_calculation', orgId, `AIRS risk score calculated: ${overallRisk}`)
    
    return Math.round(overallRisk)
  }

  /**
   * Get detailed risk breakdown
   */
  private async getRiskBreakdown(orgId: string) {
    const assessments = await this.getOrganizationAssessments(orgId)
    const vendors = await this.getOrganizationVendors(orgId)
    
    if (assessments.length === 0) {
      return {
        privacy: 100,
        security: 100,
        compliance: 100,
        operational: 100,
        unmitigatedRisks: vendors.length
      }
    }

    const latestAssessment = assessments[0]
    const unmitigatedRisks = vendors.filter(v => 
      v.riskFlags.some(flag => !flag.resolvedAt)
    ).length

    return {
      privacy: 100 - latestAssessment.scores.airs.privacy,
      security: 100 - latestAssessment.scores.airs.security,
      compliance: 100 - latestAssessment.scores.aics.overall,
      operational: Math.round(Math.random() * 30 + 10), // Mock operational risk
      unmitigatedRisks
    }
  }

  /**
   * Get approvals metrics and pipeline status
   */
  private async getApprovalsMetrics(orgId: string) {
    const policies = await this.getOrganizationPolicies(orgId)
    const pendingPolicies = policies.filter(p => p.status === 'review')
    
    // Calculate average approval time
    const approvedPolicies = policies.filter(p => p.status === 'approved')
    const approvalTimes = approvedPolicies.map(p => {
      const submissionTime = new Date(p.created_at).getTime()
      const approvalTime = p.approvalTrail
        .filter(a => a.action === 'approve')
        .map(a => new Date(a.signedAt).getTime())
        .sort()
        .pop() || submissionTime
      
      return (approvalTime - submissionTime) / (1000 * 60 * 60 * 24) // Days
    })
    
    const averageApprovalTime = approvalTimes.length > 0 
      ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length 
      : 0

    // Approval breakdown by role
    const approvalsByRole: Record<string, number> = {}
    policies.forEach(policy => {
      policy.approvalTrail.forEach(approval => {
        if (approval.action === 'approve') {
          approvalsByRole[approval.approverRole] = (approvalsByRole[approval.approverRole] || 0) + 1
        }
      })
    })

    // Identify bottlenecks
    const bottlenecks: string[] = []
    const pendingApprovals = pendingPolicies.flatMap(p => p.approvalTrail)
    const roleDelays: Record<string, number> = {}
    
    pendingApprovals.forEach(approval => {
      const daysPending = (Date.now() - new Date(approval.signedAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
      if (daysPending > 5) {
        roleDelays[approval.approverRole] = (roleDelays[approval.approverRole] || 0) + 1
      }
    })
    
    Object.entries(roleDelays).forEach(([role, count]) => {
      if (count > 2) {
        bottlenecks.push(`${role} role has ${count} delayed approvals`)
      }
    })

    return {
      pendingApprovals: pendingPolicies.length,
      averageApprovalTime: Math.round(averageApprovalTime),
      approvalsByRole,
      bottlenecks
    }
  }

  /**
   * Calculate funding and ROI metrics
   */
  private async getFundingMetrics(orgId: string) {
    const monthlyValue = await this.calculateMonthlyValue(orgId)
    const monthlySubscription = 995 // $995/month platform cost
    
    // Calculate estimated savings from automation
    const consultingHoursSaved = monthlyValue.hoursAutomated
    const hourlyConsultingRate = 250 // $250/hour for AI governance consulting
    const estimatedSavings = consultingHoursSaved * hourlyConsultingRate
    
    // ROI calculation
    const totalValue = estimatedSavings + monthlyValue.consultingCostAvoided
    const roiPercentage = ((totalValue - monthlySubscription) / monthlySubscription) * 100
    
    this.logDecision('roi_calculation', orgId, `ROI calculated: ${roiPercentage}%`)

    return {
      monthlySubscription,
      estimatedSavings,
      roiPercentage: Math.round(roiPercentage),
      costAvoidance: monthlyValue.consultingCostAvoided,
      valueRealized: totalValue
    }
  }

  /**
   * Calculate monthly value delivered by the platform
   */
  private async calculateMonthlyValue(orgId: string): Promise<MonthlyValueMetrics> {
    const documents = await this.getOrganizationDocuments(orgId)
    const policies = await this.getOrganizationPolicies(orgId)
    const assessments = await this.getOrganizationAssessments(orgId)
    const vendors = await this.getOrganizationVendors(orgId)
    
    // Calculate this month's metrics
    const thisMonth = new Date()
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    
    const monthlyDocs = documents.filter(d => new Date(d.created_at) >= monthStart)
    const monthlyPolicies = policies.filter(p => new Date(p.created_at) >= monthStart)
    const monthlyAssessments = assessments.filter(a => new Date(a.created_at) >= monthStart)
    const monthlyVendorReviews = vendors.filter(v => new Date(v.created_at) >= monthStart)
    
    // Calculate automation hours saved
    const docProcessingHours = monthlyDocs.length * 2 // 2 hours per document manually
    const policyGenerationHours = monthlyPolicies.length * 8 // 8 hours per policy manually
    const assessmentHours = monthlyAssessments.length * 16 // 16 hours per assessment manually
    const vendorVettingHours = monthlyVendorReviews.length * 6 // 6 hours per vendor review
    
    const totalHoursAutomated = docProcessingHours + policyGenerationHours + assessmentHours + vendorVettingHours
    
    // Calculate gaps identified
    const gapsIdentified = monthlyAssessments.reduce((total, assessment) => {
      return total + assessment.recommendations.filter(r => r.category === 'immediate').length
    }, 0)
    
    // Calculate consulting cost avoided
    const consultingCostAvoided = totalHoursAutomated * 250 // $250/hour consultant rate

    const monthlyValue: MonthlyValueMetrics = {
      documentsProcessed: monthlyDocs.length,
      policiesGenerated: monthlyPolicies.length,
      gapsIdentified,
      risksAssessed: monthlyVendorReviews.length,
      hoursAutomated: totalHoursAutomated,
      consultingCostAvoided
    }

    this.logDecision('monthly_value_calculation', orgId, `Monthly value calculated: $${consultingCostAvoided} cost avoided`)
    
    return monthlyValue
  }

  /**
   * Log all decisions for compliance and audit trail
   */
  private logDecision(action: string, entityId: string, description: string): void {
    const entry: AuditTrailEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: 'system',
      userEmail: 'system@aiblueprint.com',
      userRole: 'system',
      sessionId: 'dashboard-session',
      ipAddress: '127.0.0.1',
      userAgent: 'AI Blueprint Dashboard Service',
      entityType: 'dashboard',
      entityId,
      action: 'read',
      description,
      orgId: entityId,
      relatedEntities: [],
      retentionDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 7 years
      legalHold: false,
      complianceFlags: ['audit_trail', 'dashboard_access']
    }

    this.auditLog.push(entry)
    
    // In production, this would be persisted to audit database
    console.log(`[AUDIT] ${action}: ${description}`)
  }

  /**
   * Get audit trail entries for compliance reporting
   */
  async getAuditTrail(orgId: string, startDate?: string, endDate?: string): Promise<AuditTrailEntry[]> {
    let filteredEntries = this.auditLog.filter(entry => entry.orgId === orgId)
    
    if (startDate) {
      filteredEntries = filteredEntries.filter(entry => entry.timestamp >= startDate)
    }
    
    if (endDate) {
      filteredEntries = filteredEntries.filter(entry => entry.timestamp <= endDate)
    }
    
    this.logDecision('audit_trail_access', orgId, `Audit trail accessed: ${filteredEntries.length} entries`)
    
    return filteredEntries.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  }

  /**
   * Generate compliance report showing "Not Legal Advice" banner
   */
  async generateComplianceReport(orgId: string): Promise<ComplianceReport> {
    const metrics = await this.generateDashboardMetrics(orgId)
    const auditTrail = await this.getAuditTrail(orgId)
    
    const report: ComplianceReport = {
      organizationId: orgId,
      generatedAt: new Date().toISOString(),
      reportPeriod: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        end: new Date().toISOString()
      },
      legalDisclaimer: this.getLegalDisclaimer(),
      executiveSummary: {
        overallReadiness: metrics.readinessScore,
        riskLevel: this.getRiskLevel(metrics.riskScore),
        complianceStatus: this.getComplianceStatus(metrics),
        keyRecommendations: this.getKeyRecommendations(metrics)
      },
      detailedFindings: {
        frameworkCompliance: await this.getFrameworkCompliance(orgId),
        riskAssessment: {
          privacy: metrics.riskBreakdown.privacy,
          security: metrics.riskBreakdown.security,
          compliance: metrics.riskBreakdown.compliance,
          operational: metrics.riskBreakdown.operational
        },
        policyStatus: await this.getPolicyStatus(orgId),
        vendorRisks: await this.getVendorRisks(orgId)
      },
      auditTrail: auditTrail.slice(0, 100), // Last 100 entries
      recommendations: await this.getComplianceRecommendations(orgId),
      nextSteps: this.getNextSteps(metrics)
    }

    this.logDecision('compliance_report_generated', orgId, 'Compliance report generated with legal disclaimer')
    
    return report
  }

  // Helper methods for data retrieval (mocked for implementation)
  private async getOrganizationDocuments(orgId: string): Promise<Document[]> {
    // Mock implementation - would query database
    return []
  }

  private async getOrganizationPolicies(orgId: string): Promise<Policy[]> {
    // Mock implementation - would query database
    return []
  }

  private async getOrganizationAssessments(orgId: string): Promise<Assessment[]> {
    // Mock implementation - would query database
    return [{
      id: 'mock-assessment',
      orgId,
      assessmentType: 'ai_readiness',
      institutionType: 'K12',
      scores: {
        airix: { overall: 75, governance: 80, technology: 70, training: 75, compliance: 80 },
        airs: { overall: 80, privacy: 85, security: 75, bias: 80, transparency: 80 },
        aics: { overall: 85, ferpa: 90, coppa: 80, nist: 85, state: 85 },
        aims: { overall: 70, strategy: 75, implementation: 65, monitoring: 70, optimization: 70 },
        aips: { overall: 80, coverage: 85, quality: 80, implementation: 75, enforcement: 80 }
      },
      recommendations: [
        {
          id: 'rec-1',
          category: 'immediate',
          priority: 'high',
          title: 'Implement COPPA compliance',
          description: 'Address gaps in children\'s privacy protection',
          expectedImpact: 'Regulatory compliance',
          implementationEffort: 'medium',
          estimatedCost: '$5,000',
          timeframe: '30 days',
          dependencies: [],
          successMetrics: ['COPPA audit pass']
        }
      ],
      prioritizedActions: [],
      evidence: [],
      documentReferences: [],
      collaborators: [],
      completionStatus: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system',
      updated_by: 'system'
    }]
  }

  private async getOrganizationVendors(orgId: string): Promise<Vendor[]> {
    // Mock implementation - would query database
    return []
  }

  private async getTotalUsers(orgId: string): Promise<number> {
    // Mock implementation
    return 100
  }

  private async getActiveUsers(orgId: string): Promise<number> {
    // Mock implementation
    return 75
  }

  private async getDeployedToolsCount(orgId: string): Promise<number> {
    // Mock implementation
    return 8
  }

  private async getTrainingCompletionCount(orgId: string): Promise<number> {
    // Mock implementation
    return 60
  }

  private async getImplementedPoliciesCount(orgId: string): Promise<number> {
    // Mock implementation
    return 4
  }

  private generateId(): string {
    return `dashboard_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private getLegalDisclaimer(): string {
    return `
**IMPORTANT LEGAL NOTICE - NOT LEGAL ADVICE**

This compliance report is generated by automated AI systems and is provided for informational purposes only. 
It does NOT constitute legal advice and should not be relied upon as a substitute for consultation with 
qualified legal counsel. The information contained herein is based on automated analysis and may not reflect 
all applicable legal requirements or organizational circumstances.

Organizations are responsible for:
• Engaging qualified legal counsel for compliance guidance
• Conducting their own legal and regulatory analysis
• Ensuring all AI implementations comply with applicable laws
• Regularly updating policies and procedures

The AI Blueprint platform and this report should be used as a starting point for compliance efforts, 
not as definitive legal guidance.
    `
  }

  private getRiskLevel(riskScore: number): string {
    if (riskScore >= 80) return 'Critical'
    if (riskScore >= 60) return 'High'
    if (riskScore >= 40) return 'Medium'
    return 'Low'
  }

  private getComplianceStatus(metrics: DashboardMetrics): string {
    const readiness = metrics.readinessScore
    if (readiness >= 90) return 'Excellent'
    if (readiness >= 80) return 'Good'
    if (readiness >= 70) return 'Satisfactory'
    if (readiness >= 60) return 'Needs Improvement'
    return 'Critical Gaps'
  }

  private getKeyRecommendations(metrics: DashboardMetrics): string[] {
    const recommendations = []
    
    if (metrics.riskScore > 60) {
      recommendations.push('Address high-priority risk items immediately')
    }
    if (metrics.readinessScore < 80) {
      recommendations.push('Improve AI governance framework implementation')
    }
    if (metrics.approvalsMetrics.pendingApprovals > 5) {
      recommendations.push('Streamline policy approval processes')
    }
    
    return recommendations
  }

  private async getFrameworkCompliance(orgId: string): Promise<Record<string, number>> {
    // Mock framework compliance percentages
    return {
      'NIST AI RMF': 85,
      'FERPA': 90,
      'COPPA': 75,
      'State Regulations': 80
    }
  }

  private async getPolicyStatus(orgId: string): Promise<Record<string, number>> {
    // Mock policy status
    return {
      'Approved': 12,
      'Under Review': 3,
      'Draft': 5,
      'Needs Update': 2
    }
  }

  private async getVendorRisks(orgId: string): Promise<Record<string, number>> {
    // Mock vendor risk breakdown
    return {
      'Low Risk': 15,
      'Medium Risk': 8,
      'High Risk': 3,
      'Critical Risk': 1
    }
  }

  private async getComplianceRecommendations(orgId: string): Promise<string[]> {
    return [
      'Review and update AI acceptable use policies',
      'Conduct quarterly vendor risk assessments',
      'Implement automated compliance monitoring',
      'Provide additional staff training on AI governance'
    ]
  }

  private getNextSteps(metrics: DashboardMetrics): string[] {
    const steps = []
    
    if (metrics.riskScore > 50) {
      steps.push('1. Address identified risk items within 30 days')
    }
    steps.push('2. Route pending policies through approval workflow')
    steps.push('3. Schedule quarterly compliance review')
    steps.push('4. Engage legal counsel for policy validation')
    
    return steps
  }
}

// Supporting interfaces
interface ComplianceReport {
  organizationId: string
  generatedAt: string
  reportPeriod: {
    start: string
    end: string
  }
  legalDisclaimer: string
  executiveSummary: {
    overallReadiness: number
    riskLevel: string
    complianceStatus: string
    keyRecommendations: string[]
  }
  detailedFindings: {
    frameworkCompliance: Record<string, number>
    riskAssessment: Record<string, number>
    policyStatus: Record<string, number>
    vendorRisks: Record<string, number>
  }
  auditTrail: AuditTrailEntry[]
  recommendations: string[]
  nextSteps: string[]
}
