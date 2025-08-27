/**
 * Dashboard Service
 * Aggregates metrics and data for executive dashboards
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase'
import {
    ActionItem,
    AdoptionMetrics,
    DashboardFilters,
    DepartmentMetric,
    ReadinessMetrics,
    Risk,
    TrendPoint,
    VendorRenewal,
    WatchlistMetrics
} from '@/lib/types/dashboard'
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns'

// Reuse shared singleton Supabase client (avoid duplicate auth clients)

export class DashboardService {
    /**
     * Get readiness and risk metrics
     */
    static async getReadinessMetrics(filters?: DashboardFilters): Promise<ReadinessMetrics> {
        try {
            const now = new Date()
            const thirtyDaysAgo = subDays(now, 30)
            const sixtyDaysAgo = subDays(now, 60)

            // Get assessment scores and trends
            const { data: assessments } = await supabase
                .from('assessments')
                .select('score, completed_at, department')
                .gte('completed_at', format(sixtyDaysAgo, 'yyyy-MM-dd'))
                .eq('status', 'completed')

            // Calculate current vs previous period scores
            const currentPeriodAssessments = assessments?.filter(a =>
                new Date(a.completed_at) >= thirtyDaysAgo
            ) || []

            const previousPeriodAssessments = assessments?.filter(a =>
                new Date(a.completed_at) >= sixtyDaysAgo && new Date(a.completed_at) < thirtyDaysAgo
            ) || []

            const currentScore = currentPeriodAssessments.length > 0
                ? currentPeriodAssessments.reduce((sum, a) => sum + a.score, 0) / currentPeriodAssessments.length
                : 0

            const previousScore = previousPeriodAssessments.length > 0
                ? previousPeriodAssessments.reduce((sum, a) => sum + a.score, 0) / previousPeriodAssessments.length
                : 0

            const change = currentScore - previousScore
            const trend = Math.abs(change) < 1 ? 'stable' : change > 0 ? 'up' : 'down'

            // Get open risks
            const { data: risks } = await supabase
                .from('risk_assessments')
                .select(`
          id, title, description, risk_level, category, 
          department, assigned_to, due_date, created_at, updated_at
        `)
                .eq('status', 'open')
                .order('risk_level', { ascending: false })
                .limit(50)

            const openRisks: Risk[] = risks?.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                level: r.risk_level,
                category: r.category,
                department: r.department,
                assignedTo: r.assigned_to,
                dueDate: r.due_date,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            })) || []

            // Calculate risk distribution
            const riskDistribution = {
                critical: openRisks.filter(r => r.level === 'critical').length,
                high: openRisks.filter(r => r.level === 'high').length,
                medium: openRisks.filter(r => r.level === 'medium').length,
                low: openRisks.filter(r => r.level === 'low').length
            }

            // Get completion rates
            const { data: totalAssessments } = await supabase
                .from('assessments')
                .select('id, status')
                .gte('created_at', format(thirtyDaysAgo, 'yyyy-MM-dd'))

            const completedCount = totalAssessments?.filter(a => a.status === 'completed').length || 0
            const totalCount = totalAssessments?.length || 0

            // Generate trend data (last 30 days)
            const trendData: TrendPoint[] = []
            for (let i = 29; i >= 0; i--) {
                const date = subDays(now, i)
                const dayAssessments = assessments?.filter(a =>
                    new Date(a.completed_at).toDateString() === date.toDateString()
                ) || []

                const dayScore = dayAssessments.length > 0
                    ? dayAssessments.reduce((sum, a) => sum + a.score, 0) / dayAssessments.length
                    : 0

                const dayRisks = openRisks.filter(r =>
                    new Date(r.createdAt).toDateString() === date.toDateString()
                ).length

                trendData.push({
                    date: format(date, 'yyyy-MM-dd'),
                    score: Math.round(dayScore),
                    completions: dayAssessments.length,
                    risks: dayRisks
                })
            }

            return {
                assessmentScores: {
                    current: Math.round(currentScore),
                    previous: Math.round(previousScore),
                    trend,
                    change: Math.round(change)
                },
                riskDistribution,
                openRisks: openRisks.slice(0, 20), // Limit for UI
                completionRates: {
                    totalAssessments: totalCount,
                    completedAssessments: completedCount,
                    percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
                },
                trendData
            }

        } catch (error) {
            console.error('Error fetching readiness metrics:', error)
            throw error
        }
    }

    /**
     * Get adoption metrics
     */
    static async getAdoptionMetrics(filters?: DashboardFilters): Promise<AdoptionMetrics> {
        try {
            const now = new Date()
            const thisMonthStart = startOfMonth(now)
            const thisMonthEnd = endOfMonth(now)

            // Get policy approvals
            const { data: policies } = await supabase
                .from('policy_approvals')
                .select('id, title, department, approved_at, approved_by')
                .eq('status', 'approved')
                .order('approved_at', { ascending: false })

            const thisMonthPolicies = policies?.filter(p =>
                new Date(p.approved_at) >= thisMonthStart && new Date(p.approved_at) <= thisMonthEnd
            ) || []

            // Get policy approvals by department
            const policyDepartments = this.aggregateByDepartment(policies || [], 'department')

            // Get PD completions
            const { data: pdCompletions } = await supabase
                .from('professional_development')
                .select('id, title, department, completed_at, user_id')
                .eq('status', 'completed')

            const pdDepartments = this.aggregateByDepartment(pdCompletions || [], 'department')

            // Get total users for completion rate
            const { data: totalUsers } = await supabase
                .from('users')
                .select('id')

            const completionRate = (totalUsers?.length || 0) > 0
                ? Math.round((pdCompletions?.length || 0) / (totalUsers?.length || 1) * 100)
                : 0

            // Get upcoming PD sessions
            const { data: upcomingSessions } = await supabase
                .from('professional_development')
                .select('id, title, department, scheduled_at, attendee_count, status')
                .eq('status', 'scheduled')
                .gte('scheduled_at', format(now, 'yyyy-MM-dd'))
                .order('scheduled_at')
                .limit(10)

            // Get approved tools by department
            const { data: approvedTools } = await supabase
                .from('approved_tool_catalog')
                .select(`
          id, vendor_name, category, department, approved_at, 
          vendor_intakes(risk_level)
        `)
                .eq('approved', true)

            const toolsByDepartment = this.aggregateToolsByDepartment(approvedTools || [])
            const toolsByCategory = this.aggregateByCategory(approvedTools || [], 'category')

            return {
                policiesApproved: {
                    total: policies?.length || 0,
                    thisMonth: thisMonthPolicies.length,
                    byDepartment: policyDepartments,
                    recentApprovals: policies?.slice(0, 10).map(p => ({
                        id: p.id,
                        title: p.title,
                        department: p.department,
                        approvedAt: p.approved_at,
                        approvedBy: p.approved_by
                    })) || []
                },
                professionalDevelopment: {
                    totalCompletions: pdCompletions?.length || 0,
                    completionRate,
                    byDepartment: pdDepartments,
                    upcomingSessions: upcomingSessions?.map(s => ({
                        id: s.id,
                        title: s.title,
                        department: s.department,
                        scheduledAt: s.scheduled_at,
                        attendeeCount: s.attendee_count || 0,
                        status: s.status
                    })) || []
                },
                approvedTools: {
                    total: approvedTools?.length || 0,
                    byDepartment: toolsByDepartment,
                    byCategory: toolsByCategory,
                    recentApprovals: approvedTools?.slice(0, 10).map(t => ({
                        id: t.id,
                        vendorName: t.vendor_name,
                        category: t.category,
                        department: t.department,
                        approvedAt: t.approved_at,
                        riskLevel: (t.vendor_intakes as any)?.[0]?.risk_level || 'unknown'
                    })) || []
                }
            }

        } catch (error) {
            console.error('Error fetching adoption metrics:', error)
            throw error
        }
    }

    /**
     * Get watchlist metrics
     */
    static async getWatchlistMetrics(filters?: DashboardFilters): Promise<WatchlistMetrics> {
        try {
            const now = new Date()

            // Get pending policy approvals
            const { data: pendingPolicies } = await supabase
                .from('policy_packs')
                .select('id, name, department, created_at, created_by')
                .eq('status', 'pending')
                .order('created_at')

            // Get pending vendor assessments
            const { data: pendingVendors } = await supabase
                .from('vendor_intakes')
                .select('id, vendor_name, vendor_category, created_at, risk_level')
                .in('status', ['pending', 'under_review'])
                .order('created_at')

            // Get pending assessments
            const { data: pendingAssessments } = await supabase
                .from('assessments')
                .select('id, title, department, created_at, created_by, assessment_type')
                .eq('status', 'pending')
                .order('created_at')

            // Get vendor renewals
            const { data: renewals } = await supabase
                .from('vendor_contracts')
                .select(`
          id, vendor_name, category, department, renewal_date, 
          contract_value, vendor_intakes(risk_level)
        `)
                .gte('renewal_date', format(now, 'yyyy-MM-dd'))
                .lte('renewal_date', format(subDays(now, -90), 'yyyy-MM-dd')) // Next 90 days
                .order('renewal_date')

            // Calculate days until renewal and categorize
            const upcomingRenewals: VendorRenewal[] = []
            const overdueRenewals: VendorRenewal[] = []

            renewals?.forEach(r => {
                const renewalDate = new Date(r.renewal_date)
                const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                const renewal: VendorRenewal = {
                    id: r.id,
                    vendorName: r.vendor_name,
                    category: r.category,
                    department: r.department,
                    renewalDate: r.renewal_date,
                    daysUntilRenewal,
                    contractValue: r.contract_value || 0,
                    riskLevel: (r.vendor_intakes as any)?.[0]?.risk_level || 'unknown',
                    status: daysUntilRenewal < 0 ? 'overdue' : 'upcoming'
                }

                if (daysUntilRenewal < 0) {
                    overdueRenewals.push(renewal)
                } else {
                    upcomingRenewals.push(renewal)
                }
            })

            // Generate action items
            const actionItems: ActionItem[] = []

            // Add high-priority pending items as action items
            pendingPolicies?.slice(0, 5).forEach(p => {
                const daysOpen = Math.ceil((now.getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
                actionItems.push({
                    id: `policy-${p.id}`,
                    title: `Review Policy: ${p.name}`,
                    description: `Policy approval pending for ${daysOpen} days`,
                    type: 'approval',
                    priority: daysOpen > 7 ? 'high' : 'medium',
                    assignedTo: 'Policy Review Team',
                    dueDate: format(new Date(p.created_at).getTime() + (7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                    department: p.department,
                    daysOverdue: daysOpen > 7 ? daysOpen - 7 : undefined
                })
            })

            // Add overdue renewals as action items
            overdueRenewals.slice(0, 5).forEach(r => {
                actionItems.push({
                    id: `renewal-${r.id}`,
                    title: `Renew Contract: ${r.vendorName}`,
                    description: `Contract renewal overdue by ${Math.abs(r.daysUntilRenewal)} days`,
                    type: 'renewal',
                    priority: 'high',
                    assignedTo: 'Procurement Team',
                    dueDate: r.renewalDate,
                    department: r.department,
                    daysOverdue: Math.abs(r.daysUntilRenewal)
                })
            })

            return {
                pendingApprovals: {
                    policies: pendingPolicies?.map(p => ({
                        id: p.id,
                        title: p.name,
                        department: p.department,
                        submittedAt: p.created_at,
                        submittedBy: p.created_by,
                        priority: 'medium' as const,
                        daysOpen: Math.ceil((now.getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    })) || [],
                    vendors: pendingVendors?.map(v => ({
                        id: v.id,
                        vendorName: v.vendor_name,
                        category: v.vendor_category,
                        submittedAt: v.created_at,
                        riskLevel: v.risk_level,
                        priority: v.risk_level === 'high' || v.risk_level === 'critical' ? 'high' : 'medium' as const,
                        daysOpen: Math.ceil((now.getTime() - new Date(v.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    })) || [],
                    assessments: pendingAssessments?.map(a => ({
                        id: a.id,
                        title: a.title,
                        department: a.department,
                        submittedAt: a.created_at,
                        submittedBy: a.created_by,
                        type: a.assessment_type,
                        daysOpen: Math.ceil((now.getTime() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    })) || [],
                    total: (pendingPolicies?.length || 0) + (pendingVendors?.length || 0) + (pendingAssessments?.length || 0)
                },
                vendorRenewals: {
                    upcoming: upcomingRenewals.slice(0, 20),
                    overdue: overdueRenewals.slice(0, 20),
                    total: upcomingRenewals.length + overdueRenewals.length
                },
                actionItems: actionItems.sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 }
                    return priorityOrder[b.priority] - priorityOrder[a.priority]
                }).slice(0, 20)
            }

        } catch (error) {
            console.error('Error fetching watchlist metrics:', error)
            throw error
        }
    }

    /**
     * Helper: Aggregate data by department
     */
    private static aggregateByDepartment(data: any[], departmentField: string): DepartmentMetric[] {
        const counts = data.reduce((acc, item) => {
            const dept = item[departmentField] || 'Unknown'
            acc[dept] = (acc[dept] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const total = data.length
        return Object.entries(counts).map(([department, count]) => ({
            department,
            count: Number(count),
            percentage: total > 0 ? Math.round((Number(count) / total) * 100) : 0
        }))
    }

    /**
     * Helper: Aggregate data by category
     */
    private static aggregateByCategory(data: any[], categoryField: string) {
        const counts = data.reduce((acc, item) => {
            const category = item[categoryField] || 'Unknown'
            acc[category] = (acc[category] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const total = data.length
        return Object.entries(counts).map(([category, count]) => ({
            category,
            count: Number(count),
            percentage: total > 0 ? Math.round((Number(count) / total) * 100) : 0
        }))
    }

    /**
     * Helper: Aggregate tools by department
     */
    private static aggregateToolsByDepartment(tools: any[]) {
        const deptGroups = tools.reduce((acc, tool) => {
            const dept = tool.department || 'Unknown'
            if (!acc[dept]) acc[dept] = []
            acc[dept].push({
                toolName: tool.vendor_name,
                category: tool.category,
                usageCount: Math.floor(Math.random() * 100), // Mock usage data
                lastUsed: tool.approved_at
            })
            return acc
        }, {} as Record<string, any[]>)

        return Object.entries(deptGroups).map(([department, toolList]) => ({
            department,
            tools: toolList as any[],
            totalTools: (toolList as any[]).length
        }))
    }
}
