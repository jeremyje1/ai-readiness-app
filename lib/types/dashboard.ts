/**
 * Dashboard Types
 * Metrics and data structures for executive dashboards
 * @version 1.0.0
 */

export interface ReadinessMetrics {
  assessmentScores: {
    current: number
    previous: number
    trend: 'up' | 'down' | 'stable'
    change: number
  }
  riskDistribution: {
    critical: number
    high: number
    medium: number
    low: number
  }
  openRisks: Risk[]
  completionRates: {
    totalAssessments: number
    completedAssessments: number
    percentage: number
  }
  trendData: TrendPoint[]
}

export interface AdoptionMetrics {
  policiesApproved: {
    total: number
    thisMonth: number
    byDepartment: DepartmentMetric[]
    recentApprovals: PolicyApproval[]
  }
  professionalDevelopment: {
    totalCompletions: number
    completionRate: number
    byDepartment: DepartmentMetric[]
    upcomingSessions: PDSession[]
  }
  approvedTools: {
    total: number
    byDepartment: DepartmentToolMetric[]
    byCategory: CategoryMetric[]
    recentApprovals: ToolApproval[]
  }
}

export interface WatchlistMetrics {
  pendingApprovals: {
    policies: PendingPolicy[]
    vendors: PendingVendor[]
    assessments: PendingAssessment[]
    total: number
  }
  vendorRenewals: {
    upcoming: VendorRenewal[]
    overdue: VendorRenewal[]
    total: number
  }
  actionItems: ActionItem[]
}

export interface Risk {
  id: string
  title: string
  description: string
  level: 'critical' | 'high' | 'medium' | 'low'
  category: string
  department: string
  assignedTo?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface TrendPoint {
  date: string
  score: number
  completions: number
  risks: number
}

export interface DepartmentMetric {
  department: string
  count: number
  percentage: number
  trend?: 'up' | 'down' | 'stable'
}

export interface DepartmentToolMetric {
  department: string
  tools: ToolUsage[]
  totalTools: number
}

export interface ToolUsage {
  toolName: string
  category: string
  usageCount: number
  lastUsed: string
}

export interface CategoryMetric {
  category: string
  count: number
  percentage: number
}

export interface PolicyApproval {
  id: string
  title: string
  department: string
  approvedAt: string
  approvedBy: string
}

export interface PDSession {
  id: string
  title: string
  department: string
  scheduledAt: string
  attendeeCount: number
  status: 'scheduled' | 'in-progress' | 'completed'
}

export interface ToolApproval {
  id: string
  vendorName: string
  category: string
  department: string
  approvedAt: string
  riskLevel: string
}

export interface PendingPolicy {
  id: string
  title: string
  department: string
  submittedAt: string
  submittedBy: string
  priority: 'high' | 'medium' | 'low'
  daysOpen: number
}

export interface PendingVendor {
  id: string
  vendorName: string
  category: string
  submittedAt: string
  riskLevel: string
  priority: 'high' | 'medium' | 'low'
  daysOpen: number
}

export interface PendingAssessment {
  id: string
  title: string
  department: string
  submittedAt: string
  submittedBy: string
  type: 'readiness' | 'risk' | 'policy'
  daysOpen: number
}

export interface VendorRenewal {
  id: string
  vendorName: string
  category: string
  department: string
  renewalDate: string
  daysUntilRenewal: number
  contractValue: number
  riskLevel: string
  status: 'upcoming' | 'overdue' | 'renewed'
}

export interface ActionItem {
  id: string
  title: string
  description: string
  type: 'approval' | 'renewal' | 'risk' | 'compliance'
  priority: 'high' | 'medium' | 'low'
  assignedTo: string
  dueDate: string
  department: string
  daysOverdue?: number
}

export interface DashboardFilters {
  department?: string
  dateRange?: {
    start: string
    end: string
  }
  riskLevel?: string
  category?: string
}

export interface DashboardResponse<T> {
  success: boolean
  data: T
  lastUpdated: string
  error?: string
}
