/**
 * Approval Service
 * Core business logic for approval workflows
 * @version 1.0.0
 */

import { supabase as sharedSupabase } from '@/lib/supabase'
import { 
  Approval, 
  CreateApprovalRequest, 
  ApprovalDecisionRequest,
  ApprovalEvent,
  ApprovalComment,
  ApprovalSummary,
  ApprovalDashboard,
  ApprovalAuditLog,
  Approver,
  ApprovalStatus
} from '@/lib/types/approval'
import { v4 as uuidv4 } from 'uuid'

export class ApprovalService {
  private supabase = sharedSupabase

  /**
   * Create a new approval request
   */
  async createApproval(
    request: CreateApprovalRequest,
    createdBy: string,
    userInfo?: { name?: string; email?: string }
  ): Promise<Approval> {
    const approvalId = uuidv4()
    const now = new Date().toISOString()

    // Start transaction
    const { data: approval, error: approvalError } = await this.supabase
      .from('approvals')
      .insert({
        id: approvalId,
        subject_type: request.subjectType,
        subject_id: request.subjectId,
        subject_title: request.subjectTitle,
        subject_version: request.subjectVersion,
        status: 'pending',
        created_by: createdBy,
        due_date: request.dueDate,
        metadata: request.metadata || {}
      })
      .select()
      .single()

    if (approvalError) {
      throw new Error(`Failed to create approval: ${approvalError.message}`)
    }

    // Add approvers
    const approversData = request.approvers.map(approver => ({
      approval_id: approvalId,
      user_id: approver.userId,
      role: approver.role,
      is_required: approver.isRequired
    }))

    const { error: approversError } = await this.supabase
      .from('approval_approvers')
      .insert(approversData)

    if (approversError) {
      throw new Error(`Failed to add approvers: ${approversError.message}`)
    }

    // Add creation event
    await this.addEvent(approvalId, createdBy, 'created', request.comment, userInfo)

    // Create audit log
    await this.createAuditLog(approvalId, createdBy, 'created', {
      subjectType: request.subjectType,
      subjectId: request.subjectId,
      approverCount: request.approvers.length,
      dueDate: request.dueDate
    })

    // Send notifications to approvers
    await this.sendApprovalNotifications(approvalId, 'approval_request')

    return this.getApprovalById(approvalId)
  }

  /**
   * Get approval by ID with full details
   */
  async getApprovalById(id: string): Promise<Approval> {
    const { data: approval, error } = await this.supabase
      .from('approvals')
      .select(`
        *,
        approval_approvers(*),
        approval_events(*),
        approval_comments(*)
      `)
      .eq('id', id)
      .single()

    if (error || !approval) {
      throw new Error(`Approval not found: ${id}`)
    }

    return this.mapDbToApproval(approval)
  }

  /**
   * Make an approval decision
   */
  async makeDecision(
    approvalId: string,
    userId: string,
    decision: ApprovalDecisionRequest,
    userInfo?: { name?: string; email?: string }
  ): Promise<Approval> {
    // Update approver decision
    const { error: approverError } = await this.supabase
      .from('approval_approvers')
      .update({
        has_approved: decision.decision === 'approved',
        decision: decision.decision,
        comment: decision.comment,
        approved_at: new Date().toISOString(),
        e_signature_signed: decision.eSignature?.signed || false,
        e_signature_signed_at: decision.eSignature?.signed ? new Date().toISOString() : null,
        e_signature_ip_address: decision.eSignature?.ipAddress,
        e_signature_user_agent: decision.eSignature?.userAgent
      })
      .eq('approval_id', approvalId)
      .eq('user_id', userId)

    if (approverError) {
      throw new Error(`Failed to record decision: ${approverError.message}`)
    }

    // Add event
    const actionMap = {
      'approved': 'approved',
      'rejected': 'rejected',
      'changes_requested': 'requested_changes'
    } as const

    await this.addEvent(
      approvalId, 
      userId, 
      actionMap[decision.decision], 
      decision.comment,
      userInfo
    )

    // Create audit log
    await this.createAuditLog(approvalId, userId, actionMap[decision.decision], {
      decision: decision.decision,
      comment: decision.comment,
      eSignature: decision.eSignature
    })

    // Check if approval is complete and update status
    await this.updateApprovalStatus(approvalId)

    // Send notifications based on decision
    if (decision.decision === 'changes_requested') {
      await this.sendApprovalNotifications(approvalId, 'changes_requested')
    }

    return this.getApprovalById(approvalId)
  }

  /**
   * Add comment to approval
   */
  async addComment(
    approvalId: string,
    userId: string,
    comment: string,
    isInternal: boolean = false,
    userInfo?: { name?: string; email?: string }
  ): Promise<ApprovalComment> {
    const { data, error } = await this.supabase
      .from('approval_comments')
      .insert({
        approval_id: approvalId,
        user_id: userId,
        user_name: userInfo?.name,
        user_email: userInfo?.email,
        comment,
        is_internal: isInternal
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`)
    }

    // Add event
    await this.addEvent(approvalId, userId, 'comment_added', comment, userInfo)

    // Create audit log
    await this.createAuditLog(approvalId, userId, 'comment_added', {
      comment,
      isInternal
    })

    return {
      id: data.id,
      approvalId: data.approval_id,
      userId: data.user_id,
      userName: data.user_name,
      userEmail: data.user_email,
      comment: data.comment,
      timestamp: data.timestamp,
      isInternal: data.is_internal,
      attachments: data.attachments || []
    }
  }

  /**
   * Get approval dashboard for user
   */
  async getDashboard(userId: string): Promise<ApprovalDashboard> {
    // Get summary stats
    const { data: summaryData } = await this.supabase
      .from('approval_summary')
      .select('*')

    // Get user's approvals (where they are an approver)
    const { data: userApprovalIds } = await this.supabase
      .from('approval_approvers')
      .select('approval_id')
      .eq('user_id', userId)

    const approvalIds = userApprovalIds?.map((item: any) => item.approval_id) || []

    const { data: myApprovalsData } = await this.supabase
      .from('approval_summary')
      .select('*')
      .in('id', approvalIds)

    const { data: teamApprovalsData } = await this.supabase
      .from('approval_summary')
      .select('*')
      .eq('created_by', userId)

    const { data: recentActivityData } = await this.supabase
      .from('recent_approval_activity')
      .select('*')
      .limit(20)

    // Calculate summary metrics
    const allApprovals = summaryData || []
    const totalApprovals = allApprovals.length
    const pendingApprovals = allApprovals.filter((a: any) => a.status === 'pending').length
    const overdueApprovals = allApprovals.filter((a: any) => a.is_overdue).length
    const completedThisWeek = allApprovals.filter((a: any) => 
      a.completed_at && 
      new Date(a.completed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    const completedApprovals = allApprovals.filter((a: any) => a.completed_at)
    const averageApprovalTime = completedApprovals.length > 0
      ? completedApprovals.reduce((sum: number, a: any) => {
          const created = new Date(a.created_at).getTime()
          const completed = new Date(a.completed_at!).getTime()
          return sum + (completed - created)
        }, 0) / completedApprovals.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0

    return {
      summary: {
        totalApprovals,
        pendingApprovals,
        overdueApprovals,
        completedThisWeek,
        averageApprovalTime: Math.round(averageApprovalTime * 10) / 10
      },
      myApprovals: (myApprovalsData || []).map(this.mapDbToApprovalSummary),
      teamApprovals: (teamApprovalsData || []).map(this.mapDbToApprovalSummary),
      recentActivity: (recentActivityData || []).map(this.mapDbToApprovalEvent)
    }
  }

  /**
   * Get approvals list with filtering
   */
  async getApprovals(
    filters: {
      userId?: string
      status?: ApprovalStatus
      subjectType?: string
      overdue?: boolean
      limit?: number
      offset?: number
    } = {}
  ): Promise<{ approvals: ApprovalSummary[]; total: number }> {
    let query = this.supabase.from('approval_summary').select('*', { count: 'exact' })

    if (filters.userId) {
      query = query.or(`created_by.eq.${filters.userId},id.in.(${
        this.supabase
          .from('approval_approvers')
          .select('approval_id')
          .eq('user_id', filters.userId)
      })`)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.subjectType) {
      query = query.eq('subject_type', filters.subjectType)
    }

    if (filters.overdue) {
      query = query.eq('is_overdue', true)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch approvals: ${error.message}`)
    }

    return {
      approvals: (data || []).map(this.mapDbToApprovalSummary),
      total: count || 0
    }
  }

  /**
   * Update approval due date
   */
  async updateDueDate(
    approvalId: string,
    dueDate: string | null,
    userId: string,
    userInfo?: { name?: string; email?: string }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('approvals')
      .update({ due_date: dueDate })
      .eq('id', approvalId)

    if (error) {
      throw new Error(`Failed to update due date: ${error.message}`)
    }

    // Add event
    await this.addEvent(
      approvalId, 
      userId, 
      'due_date_updated', 
      dueDate ? `Due date set to ${dueDate}` : 'Due date removed',
      userInfo
    )

    // Create audit log
    await this.createAuditLog(approvalId, userId, 'due_date_updated', {
      newDueDate: dueDate
    })
  }

  /**
   * Get approval version history
   */
  async getVersionHistory(approvalId: string): Promise<ApprovalEvent[]> {
    const { data, error } = await this.supabase
      .from('approval_events')
      .select('*')
      .eq('approval_id', approvalId)
      .order('timestamp', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch version history: ${error.message}`)
    }

    return (data || []).map(this.mapDbToApprovalEvent)
  }

  // Private helper methods

  private async addEvent(
    approvalId: string, 
    userId: string, 
    action: ApprovalEvent['action'], 
    comment?: string,
    userInfo?: { name?: string; email?: string }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('approval_events')
      .insert({
        approval_id: approvalId,
        who: userId,
        who_name: userInfo?.name,
        who_email: userInfo?.email,
        action,
        comment
      })

    if (error) {
      console.error('Failed to add approval event:', error)
    }
  }

  private async createAuditLog(
    approvalId: string,
    userId: string,
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('approval_audit_logs')
      .insert({
        approval_id: approvalId,
        user_id: userId,
        action,
        details
      })

    if (error) {
      console.error('Failed to create audit log:', error)
    }
  }

  private async updateApprovalStatus(approvalId: string): Promise<void> {
    // Get all approvers for this approval
    const { data: approvers } = await this.supabase
      .from('approval_approvers')
      .select('*')
      .eq('approval_id', approvalId)

    if (!approvers || approvers.length === 0) return

    const requiredApprovers = approvers.filter((a: any) => a.is_required)
    const allApprovers = approvers

    // Check if any required approver rejected
    const hasRejection = requiredApprovers.some((a: any) => a.decision === 'rejected')
    if (hasRejection) {
      await this.setApprovalStatus(approvalId, 'rejected')
      await this.sendApprovalNotifications(approvalId, 'approval_completed')
      return
    }

    // Check if any approver requested changes
    const hasChangesRequested = allApprovers.some((a: any) => a.decision === 'changes_requested')
    if (hasChangesRequested) {
      await this.setApprovalStatus(approvalId, 'changes_requested')
      return
    }

    // Check if all required approvers approved
    const allRequiredApproved = requiredApprovers.every((a: any) => a.decision === 'approved')
    if (allRequiredApproved && requiredApprovers.length > 0) {
      await this.setApprovalStatus(approvalId, 'approved')
      await this.sendApprovalNotifications(approvalId, 'approval_completed')
      return
    }
  }

  private async setApprovalStatus(approvalId: string, status: ApprovalStatus): Promise<void> {
    const { error } = await this.supabase
      .from('approvals')
      .update({ 
        status,
        completed_at: status !== 'pending' ? new Date().toISOString() : null
      })
      .eq('id', approvalId)

    if (error) {
      console.error('Failed to update approval status:', error)
    }
  }

  private async sendApprovalNotifications(
    approvalId: string, 
    type: 'approval_request' | 'approval_completed' | 'changes_requested'
  ): Promise<void> {
    // This would integrate with your notification system
    // For now, just log that notifications should be sent
    console.log(`Sending ${type} notifications for approval ${approvalId}`)
  }

  private mapDbToApproval(data: any): Approval {
    return {
      id: data.id,
      subjectType: data.subject_type,
      subjectId: data.subject_id,
      subjectTitle: data.subject_title,
      subjectVersion: data.subject_version,
      status: data.status,
      approvers: (data.approval_approvers || []).map(this.mapDbToApprover),
      events: (data.approval_events || []).map(this.mapDbToApprovalEvent),
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dueDate: data.due_date,
      completedAt: data.completed_at,
      metadata: data.metadata || {}
    }
  }

  private mapDbToApprover(data: any): Approver {
    return {
      userId: data.user_id,
      userName: data.user_name,
      userEmail: data.user_email,
      role: data.role,
      isRequired: data.is_required,
      hasApproved: data.has_approved,
      approvedAt: data.approved_at,
      decision: data.decision,
      comment: data.comment,
      eSignature: {
        signed: data.e_signature_signed || false,
        signedAt: data.e_signature_signed_at,
        ipAddress: data.e_signature_ip_address,
        userAgent: data.e_signature_user_agent
      }
    }
  }

  private mapDbToApprovalEvent(data: any): ApprovalEvent {
    return {
      id: data.id,
      who: data.who,
      whoName: data.who_name,
      whoEmail: data.who_email,
      action: data.action,
      comment: data.comment,
      timestamp: data.timestamp,
      metadata: data.metadata || {}
    }
  }

  private mapDbToApprovalSummary(data: any): ApprovalSummary {
    return {
      id: data.id,
      subjectType: data.subject_type,
      subjectId: data.subject_id,
      subjectTitle: data.subject_title,
      status: data.status,
      approverCount: data.approver_count || 0,
      approvedCount: data.approved_count || 0,
      rejectedCount: data.rejected_count || 0,
      pendingCount: data.pending_count || 0,
      changesRequestedCount: data.changes_requested_count || 0,
      createdAt: data.created_at,
      dueDate: data.due_date,
      isOverdue: data.is_overdue || false,
      daysSinceCreated: data.days_since_created || 0,
      daysUntilDue: data.days_until_due
    }
  }
}

export default ApprovalService
