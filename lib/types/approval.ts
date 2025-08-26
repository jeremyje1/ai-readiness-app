/**
 * Approval System Types
 * Core types for policy and artifact approval workflows
 * @version 1.0.0
 */

export type ApprovalSubjectType = 'policy' | 'artifact'
export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected'
export type ApprovalAction = 'created' | 'approved' | 'rejected' | 'requested_changes' | 'reassigned' | 'comment_added' | 'due_date_updated'

export interface ApprovalEvent {
  id: string
  who: string // User ID
  whoName?: string // User display name
  whoEmail?: string // User email
  action: ApprovalAction
  comment?: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface Approver {
  userId: string
  userName?: string
  userEmail?: string
  role: string
  isRequired: boolean
  hasApproved: boolean
  approvedAt?: string
  decision?: 'approved' | 'rejected' | 'changes_requested'
  comment?: string
  eSignature?: {
    signed: boolean
    signedAt?: string
    ipAddress?: string
    userAgent?: string
  }
}

export interface Approval {
  id: string
  subjectType: ApprovalSubjectType
  subjectId: string
  subjectTitle?: string
  subjectVersion?: string
  status: ApprovalStatus
  approvers: Approver[]
  events: ApprovalEvent[]
  createdBy: string
  createdAt: string
  updatedAt: string
  dueDate?: string
  completedAt?: string
  metadata?: {
    organizationId?: string
    departmentId?: string
    priority?: 'low' | 'medium' | 'high' | 'critical'
    tags?: string[]
    requiredApprovals?: number
    allowParallelApproval?: boolean
    autoApproveAfterDays?: number
    reminderIntervalDays?: number
  }
}

export interface CreateApprovalRequest {
  subjectType: ApprovalSubjectType
  subjectId: string
  subjectTitle?: string
  subjectVersion?: string
  approvers: Array<{
    userId: string
    role: string
    isRequired: boolean
  }>
  dueDate?: string
  comment?: string
  metadata?: Approval['metadata']
}

export interface ApprovalDecisionRequest {
  decision: 'approved' | 'rejected' | 'changes_requested'
  comment?: string
  eSignature?: {
    signed: boolean
    ipAddress?: string
    userAgent?: string
  }
}

export interface ApprovalComment {
  id: string
  approvalId: string
  userId: string
  userName?: string
  userEmail?: string
  comment: string
  timestamp: string
  isInternal?: boolean
  attachments?: Array<{
    id: string
    filename: string
    url: string
    size: number
  }>
}

export interface ApprovalSummary {
  id: string
  subjectType: ApprovalSubjectType
  subjectId: string
  subjectTitle?: string
  status: ApprovalStatus
  approverCount: number
  approvedCount: number
  rejectedCount: number
  pendingCount: number
  changesRequestedCount: number
  createdAt: string
  dueDate?: string
  isOverdue: boolean
  daysSinceCreated: number
  daysUntilDue?: number
}

export interface ApprovalDashboard {
  summary: {
    totalApprovals: number
    pendingApprovals: number
    overdueApprovals: number
    completedThisWeek: number
    averageApprovalTime: number
  }
  myApprovals: ApprovalSummary[]
  teamApprovals: ApprovalSummary[]
  recentActivity: ApprovalEvent[]
}

export interface ApprovalNotification {
  id: string
  type: 'approval_request' | 'approval_reminder' | 'approval_completed' | 'approval_overdue' | 'changes_requested'
  approvalId: string
  recipientId: string
  title: string
  message: string
  sent: boolean
  sentAt?: string
  readAt?: string
  actionUrl?: string
}

export interface ApprovalAuditLog {
  id: string
  approvalId: string
  userId: string
  action: ApprovalAction
  details: Record<string, any>
  timestamp: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}
