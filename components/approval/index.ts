/**
 * Approval System Components
 * Centralized exports for approval-related UI components
 * @version 1.0.0
 */

export { ApprovalCard } from './approval-card'
export { ApprovalDashboard } from './approval-dashboard'

// Re-export types for convenience
export type { 
  Approval, 
  ApprovalStatus, 
  ApprovalEvent, 
  Approver,
  CreateApprovalRequest,
  ApprovalDecisionRequest,
  ApprovalComment
} from '@/lib/types/approval'
