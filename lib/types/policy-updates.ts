/**
 * Policy Updates Job Types
 * Handles framework version monitoring and redline generation
 * @version 1.0.0
 */

export interface FrameworkMetadata {
  id: string
  name: string
  version: string
  lastUpdated: string
  sourceUrl?: string
  checksum?: string
  status: 'active' | 'deprecated' | 'draft'
  changelog?: FrameworkChange[]
}

export interface FrameworkChange {
  id: string
  frameworkId: string
  version: string
  changeType: 'major' | 'minor' | 'patch' | 'hotfix'
  title: string
  description: string
  affectedSections: string[]
  impactLevel: 'low' | 'medium' | 'high' | 'critical'
  effectiveDate: string
  createdAt: string
  requiresRedline: boolean
}

export interface PolicyUpdateJob {
  id: string
  frameworkId: string
  frameworkVersion: string
  affectedPolicies: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  errors?: string[]
  redlinePacksGenerated: number
  notificationsSent: number
}

export interface RedlinePack {
  id: string
  policyId: string
  originalVersion: string
  updatedVersion: string
  frameworkChangeId: string
  changes: RedlineChange[]
  approvers: string[]
  status: 'draft' | 'sent_for_approval' | 'approved' | 'rejected'
  createdAt: string
  sentAt?: string
  approvedAt?: string
  generatedBy: 'system' | 'manual'
}

export interface RedlineChange {
  id: string
  type: 'addition' | 'deletion' | 'modification'
  section: string
  originalText?: string
  newText?: string
  reason: string
  position: number
  timestamp: string
  author: string
}

export interface PolicyUpdateNotification {
  id: string
  type: 'redline_generated' | 'approval_required' | 'framework_updated'
  recipientId: string
  recipientEmail: string
  policyId?: string
  redlinePackId?: string
  frameworkChangeId?: string
  title: string
  message: string
  actionUrl?: string
  sent: boolean
  sentAt?: string
  readAt?: string
  createdAt: string
}

export interface FrameworkMonitoringConfig {
  frameworkId: string
  checkInterval: number // minutes
  enabled: boolean
  autoGenerateRedlines: boolean
  notifyApprovers: boolean
  impactThreshold: 'low' | 'medium' | 'high' | 'critical'
  approvers: string[]
  lastChecked?: string
  nextCheck?: string
}

export interface PolicyUpdateJobResult {
  success: boolean
  jobId: string
  frameworksChecked: number
  changesDetected: FrameworkChange[]
  redlinePacksGenerated: RedlinePack[]
  notificationsSent: PolicyUpdateNotification[]
  errors: string[]
  processingTime: number
}

export interface PolicyUpdateJobConfig {
  enabled: boolean
  checkInterval: number // minutes
  frameworks: FrameworkMonitoringConfig[]
  featureFlags: {
    policy_updates_auto_redline: boolean
    policy_updates_notifications: boolean
    policy_updates_dry_run: boolean
  }
  notifications: {
    emailEnabled: boolean
    slackEnabled: boolean
    webhookUrl?: string
  }
}
