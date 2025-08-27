/**
 * Vendor Intake Service
 * Manages vendor assessments, risk evaluation, and decision tracking
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase'
import { 
  Vendor, 
  VendorAssessment, 
  CreateVendorRequest, 
  VendorDecisionRequest,
  VendorStatus,
  DecisionBrief
} from '@/lib/types/vendor'
import { VendorRiskEngine } from './vendor-risk-engine'

// Reuse shared singleton Supabase client to prevent multiple GoTrueClient instances in browser

export class VendorService {
  /**
   * Create a new vendor intake request
   */
  static async createVendor(request: CreateVendorRequest, userId: string): Promise<Vendor> {
    try {
      // Evaluate vendor risks
      const riskResult = await VendorRiskEngine.evaluateVendor(request.assessment)

      // Prepare vendor data
      const vendorData = {
        vendor_name: request.assessment.basicInfo.name,
        vendor_url: request.assessment.basicInfo.url,
        vendor_description: request.assessment.basicInfo.description,
        vendor_category: request.assessment.basicInfo.category,
        contact_email: request.assessment.basicInfo.contactEmail,
        contact_name: request.assessment.basicInfo.contactName,
        business_justification: request.assessment.basicInfo.businessJustification,
        
        assessment_data: request.assessment,
        risk_score: riskResult.totalScore,
        risk_level: riskResult.riskLevel,
        risk_flags: riskResult.flags,
        
        created_by: userId,
        requested_urgency: request.urgency,
        expected_launch_date: request.expectedLaunchDate,
        request_notes: request.notes,
        
        status: riskResult.autoApproval ? 'approved' : 'pending'
      }

      // Insert vendor intake
      const { data: vendor, error } = await supabase
        .from('vendor_intakes')
        .insert([vendorData])
        .select()
        .single()

      if (error) throw error

      // Insert data flows
      for (const flow of request.assessment.dataHandling.dataFlows) {
        await supabase
          .from('vendor_data_flows')
          .insert({
            vendor_id: vendor.id,
            flow_type: flow.type,
            data_types: flow.dataTypes,
            frequency: flow.frequency,
            volume: flow.volume,
            encryption_enabled: flow.encryption,
            retention_period: flow.retention
          })
      }

      // Insert required mitigations
      for (const mitigation of riskResult.requiredMitigations) {
        await supabase
          .from('vendor_mitigations')
          .insert({
            vendor_id: vendor.id,
            risk_flag: mitigation.riskFlag,
            title: mitigation.title,
            description: mitigation.description,
            mitigation_type: mitigation.type,
            status: mitigation.status,
            due_date: mitigation.dueDate
          })
      }

      // Log audit event
      await this.logAuditEvent(vendor.id, 'vendor_created', 'Vendor intake request created', userId, {
        riskScore: riskResult.totalScore,
        riskLevel: riskResult.riskLevel,
        flagCount: riskResult.flags.length,
        autoApproval: riskResult.autoApproval
      })

      return this.formatVendorResponse(vendor)
    } catch (error) {
      console.error('Error creating vendor:', error)
      throw error
    }
  }

  /**
   * Get vendor by ID with full details
   */
  static async getVendor(vendorId: string, userId: string): Promise<Vendor | null> {
    try {
      const { data: vendor, error } = await supabase
        .from('vendor_intakes')
        .select(`
          *,
          vendor_mitigations(*),
          vendor_data_flows(*),
          approved_tool_catalog(*)
        `)
        .eq('id', vendorId)
        .single()

      if (error || !vendor) return null

      return this.formatVendorResponse(vendor)
    } catch (error) {
      console.error('Error fetching vendor:', error)
      return null
    }
  }

  /**
   * List vendors with filtering
   */
  static async listVendors(params: {
    status?: VendorStatus
    riskLevel?: string
    createdBy?: string
    limit?: number
    offset?: number
  } = {}): Promise<{ vendors: Vendor[], total: number }> {
    try {
      let query = supabase
        .from('vendor_intakes')
        .select(`
          *,
          vendor_mitigations(count),
          approved_tool_catalog(id)
        `, { count: 'exact' })

      if (params.status) {
        query = query.eq('status', params.status)
      }

      if (params.riskLevel) {
        query = query.eq('risk_level', params.riskLevel)
      }

      if (params.createdBy) {
        query = query.eq('created_by', params.createdBy)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1)

      const { data: vendors, error, count } = await query

      if (error) throw error

      return {
        vendors: vendors?.map(v => this.formatVendorResponse(v)) || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Error listing vendors:', error)
      return { vendors: [], total: 0 }
    }
  }

  /**
   * Make a decision on a vendor intake
   */
  static async makeDecision(vendorId: string, decision: VendorDecisionRequest, userId: string): Promise<Vendor> {
    try {
      // Update vendor with decision
      const { data: vendor, error } = await supabase
        .from('vendor_intakes')
        .update({
          status: decision.outcome,
          decision_outcome: decision.outcome,
          decision_reason: decision.reason,
          decision_conditions: decision.conditions || [],
          decision_approver: userId,
          decision_approved_at: new Date().toISOString(),
          reviewed_by: userId,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', vendorId)
        .select()
        .single()

      if (error) throw error

      // Add mitigations if provided
      if (decision.mitigations) {
        for (const mitigation of decision.mitigations) {
          await supabase
            .from('vendor_mitigations')
            .insert({
              vendor_id: vendorId,
              risk_flag: mitigation.riskFlag,
              title: mitigation.title,
              description: mitigation.description,
              mitigation_type: mitigation.type,
              status: mitigation.status || 'pending',
              assignee: mitigation.assignee,
              due_date: mitigation.dueDate
            })
        }
      }

      // Add to tool catalog if approved
      if (decision.addToCatalog && decision.outcome === 'approved' && decision.catalogMetadata) {
        await supabase
          .from('approved_tool_catalog')
          .insert({
            vendor_id: vendorId,
            tool_name: decision.catalogMetadata.description || vendor.vendor_name,
            category: decision.catalogMetadata.category,
            description: decision.catalogMetadata.description,
            usage_guidelines: decision.catalogMetadata.usage,
            restrictions: decision.catalogMetadata.restrictions || [],
            tags: decision.catalogMetadata.tags || [],
            approved_by: userId
          })
      }

      // Log audit event
      await this.logAuditEvent(vendorId, 'decision_made', `Vendor ${decision.outcome}`, userId, {
        outcome: decision.outcome,
        reason: decision.reason,
        conditions: decision.conditions,
        addedToCatalog: decision.addToCatalog
      })

      return this.formatVendorResponse(vendor)
    } catch (error) {
      console.error('Error making vendor decision:', error)
      throw error
    }
  }

  /**
   * Generate a decision brief for a vendor
   */
  static async generateDecisionBrief(vendorId: string, userId: string): Promise<DecisionBrief> {
    try {
      const vendor = await this.getVendor(vendorId, userId)
      if (!vendor) throw new Error('Vendor not found')

      // Re-evaluate risks for current assessment
      const riskResult = await VendorRiskEngine.evaluateVendor(vendor.assessment)

      const brief: DecisionBrief = {
        vendorId: vendor.id,
        vendorName: vendor.assessment.basicInfo.name,
        generatedAt: new Date().toISOString(),
        generatedBy: userId,
        
        summary: {
          recommendation: this.determineRecommendation(riskResult),
          riskLevel: riskResult.riskLevel,
          riskScore: riskResult.totalScore,
          keyRisks: riskResult.flags.filter(f => f.triggered).map(f => f.description),
          primaryMitigations: riskResult.requiredMitigations.map(m => m.title)
        },
        
        assessment: {
          dataHandling: {
            storesPII: vendor.assessment.dataHandling.storesPII,
            piiTypes: vendor.assessment.dataHandling.piiTypes,
            trainsOnUserData: vendor.assessment.aiCapabilities.trainsOnUserData,
            dataLocation: vendor.assessment.dataHandling.dataLocation.join(', '),
            retention: vendor.assessment.dataHandling.dataRetention
          },
          compliance: {
            flaggedRegulations: riskResult.flags.map(f => f.type),
            missingCertifications: this.identifyMissingCertifications(vendor.assessment),
            requiredActions: riskResult.recommendations
          },
          aiRisks: {
            biasRisk: vendor.assessment.aiCapabilities.biasAuditing ? 'low' : 'medium',
            privacyRisk: vendor.assessment.aiCapabilities.trainsOnUserData ? 'high' : 'low',
            transparencyRisk: vendor.assessment.aiCapabilities.explainabilityFeatures ? 'low' : 'medium',
            recommendations: riskResult.recommendations.filter(r => r.toLowerCase().includes('ai'))
          }
        },
        
        mitigations: vendor.mitigations,
        conditions: vendor.decision?.conditions || [],
        
        monitoring: {
          reviewFrequency: this.determineReviewFrequency(riskResult.riskLevel),
          keyMetrics: this.getKeyMetrics(vendor.assessment),
          escalationTriggers: this.getEscalationTriggers(riskResult.flags)
        },
        
        approvals: {
          requiredApprovers: this.getRequiredApprovers(riskResult),
          currentStatus: vendor.status,
          nextSteps: this.getNextSteps(vendor.status, riskResult)
        }
      }

      // Store the brief
      await supabase
        .from('vendor_decision_briefs')
        .insert({
          vendor_id: vendorId,
          brief_data: brief,
          generated_by: userId,
          recommendation: brief.summary.recommendation,
          risk_summary: brief.summary,
          mitigation_summary: brief.mitigations,
          approval_requirements: brief.approvals
        })

      // Log audit event
      await this.logAuditEvent(vendorId, 'brief_generated', 'Decision brief generated', userId, {
        recommendation: brief.summary.recommendation,
        riskLevel: brief.summary.riskLevel
      })

      return brief
    } catch (error) {
      console.error('Error generating decision brief:', error)
      throw error
    }
  }

  /**
   * Get vendor dashboard data
   */
  static async getDashboard(userId: string): Promise<any> {
    try {
      const { data: stats, error } = await supabase
        .from('vendor_dashboard')
        .select('*')

      if (error) throw error

      return {
        totalVendors: stats?.length || 0,
        byStatus: this.groupByField(stats || [], 'status'),
        byRiskLevel: this.groupByField(stats || [], 'risk_level'),
        recentVendors: stats?.slice(0, 10) || [],
        pendingReviews: stats?.filter(v => v.status === 'pending').length || 0,
        highRiskVendors: stats?.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      return {}
    }
  }

  // Helper methods
  private static formatVendorResponse(dbVendor: any): Vendor {
    return {
      id: dbVendor.id,
      status: dbVendor.status,
      assessment: dbVendor.assessment_data,
      riskFlags: dbVendor.risk_flags || [],
      riskScore: dbVendor.risk_score || 0,
      riskLevel: dbVendor.risk_level || 'low',
      decision: dbVendor.decision_outcome ? {
        outcome: dbVendor.decision_outcome,
        reason: dbVendor.decision_reason,
        conditions: dbVendor.decision_conditions || [],
        approver: dbVendor.decision_approver,
        approvedAt: dbVendor.decision_approved_at,
        validUntil: dbVendor.decision_valid_until
      } : undefined,
      mitigations: dbVendor.vendor_mitigations?.map((m: any) => ({
        id: m.id,
        riskFlag: m.risk_flag,
        title: m.title,
        description: m.description,
        type: m.mitigation_type,
        status: m.status,
        assignee: m.assignee,
        dueDate: m.due_date,
        evidence: m.evidence,
        notes: m.notes
      })) || [],
      createdBy: dbVendor.created_by,
      createdAt: dbVendor.created_at,
      updatedAt: dbVendor.updated_at,
      reviewedBy: dbVendor.reviewed_by,
      reviewedAt: dbVendor.reviewed_at,
      catalogEntry: dbVendor.approved_tool_catalog ? {
        approved: true,
        category: dbVendor.approved_tool_catalog.category,
        description: dbVendor.approved_tool_catalog.description,
        tags: dbVendor.approved_tool_catalog.tags || [],
        usage: dbVendor.approved_tool_catalog.usage_guidelines,
        restrictions: dbVendor.approved_tool_catalog.restrictions || []
      } : undefined
    }
  }

  private static async logAuditEvent(vendorId: string, eventType: string, description: string, userId: string, metadata: any = {}) {
    await supabase
      .from('vendor_audit_logs')
      .insert({
        vendor_id: vendorId,
        event_type: eventType,
        event_description: description,
        user_id: userId,
        metadata
      })
  }

  private static determineRecommendation(riskResult: any): VendorStatus {
    if (riskResult.riskLevel === 'critical') return 'rejected'
    if (riskResult.riskLevel === 'high') return 'conditional'
    if (riskResult.riskLevel === 'medium') return 'conditional'
    return 'approved'
  }

  private static identifyMissingCertifications(assessment: VendorAssessment): string[] {
    const missing: string[] = []
    if (!assessment.compliance.privacyPolicy) missing.push('Privacy Policy')
    if (!assessment.compliance.termsOfService) missing.push('Terms of Service')
    if (!assessment.compliance.dataProcessingAgreement) missing.push('Data Processing Agreement')
    if (!assessment.compliance.auditReports) missing.push('Security Audit Reports')
    return missing
  }

  private static determineReviewFrequency(riskLevel: string): string {
    switch (riskLevel) {
      case 'critical': return 'quarterly'
      case 'high': return 'semi-annually'
      case 'medium': return 'annually'
      default: return 'bi-annually'
    }
  }

  private static getKeyMetrics(assessment: VendorAssessment): string[] {
    const metrics = ['Security incident reports', 'Compliance audit results']
    if (assessment.aiCapabilities.isAIService) {
      metrics.push('AI bias testing results', 'Model performance metrics')
    }
    if (assessment.studentData.handlesStudentData) {
      metrics.push('Student data access logs', 'FERPA compliance reports')
    }
    return metrics
  }

  private static getEscalationTriggers(flags: any[]): string[] {
    const triggers = ['Security breach notification', 'Compliance violation report']
    if (flags.some(f => f.type === 'COPPA')) {
      triggers.push('Children privacy incident')
    }
    if (flags.some(f => f.type === 'FERPA')) {
      triggers.push('Student data misuse')
    }
    return triggers
  }

  private static getRequiredApprovers(riskResult: any): string[] {
    const approvers = ['Security Lead']
    if (riskResult.flags.some((f: any) => f.type === 'FERPA' || f.type === 'COPPA')) {
      approvers.push('Legal Counsel', 'Privacy Officer')
    }
    if (riskResult.riskLevel === 'critical') {
      approvers.push('CISO', 'General Counsel')
    }
    return approvers
  }

  private static getNextSteps(status: VendorStatus, riskResult: any): string[] {
    switch (status) {
      case 'pending':
        return ['Complete risk assessment', 'Review required mitigations', 'Obtain stakeholder approvals']
      case 'under_review':
        return ['Finalize mitigation plans', 'Prepare decision brief', 'Schedule approval meeting']
      case 'approved':
        return ['Add to tool catalog', 'Implement monitoring', 'Schedule periodic review']
      case 'conditional':
        return ['Implement required mitigations', 'Verify compliance measures', 'Re-evaluate risk score']
      default:
        return ['Review rejection reasons', 'Address identified risks', 'Resubmit if appropriate']
    }
  }

  private static groupByField(items: any[], field: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = item[field] || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }
}
