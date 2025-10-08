/**
 * Adoption Dashboard
 * Policy approvals, PD completions, and approved tools by department
 * @version 1.0.0
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdoptionMetrics, DashboardFilters } from '@/lib/types/dashboard'
import { formatDistanceToNow } from 'date-fns'
import {
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  FilterIcon,
  GraduationCapIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  UsersIcon,
  WrenchIcon
} from 'lucide-react'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface AdoptionDashboardProps {
  currentUserId: string
  className?: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function AdoptionDashboardContent({ currentUserId, className = '' }: AdoptionDashboardProps) {
  const [metrics, setMetrics] = useState<AdoptionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [filters, setFilters] = useState<DashboardFilters>({})

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.department) params.append('department', filters.department)
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }
      if (filters.category) params.append('category', filters.category)

      const response = await fetch(`/api/dashboard/adoption?${params}`, {
        headers: { 'x-user-id': currentUserId }
      })

      if (!response.ok) throw new Error('Failed to fetch adoption metrics')

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      setMetrics(result.data)
      setLastUpdated(result.lastUpdated)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }, [currentUserId, filters])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  if (loading) {
    return <AdoptionDashboardSkeleton className={className} />
  }

  if (error) {
    return <AdoptionDashboardError error={error} onRetry={fetchMetrics} className={className} />
  }

  if (!metrics) {
    return <AdoptionDashboardEmpty className={className} />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adoption Dashboard</h1>
          <p className="text-gray-600 mt-1">Policy approvals, training completions, and tool adoption</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated {formatDistanceToNow(new Date(lastUpdated))} ago
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={filters.department || 'all'}
            onValueChange={(value) => setFilters(prev => ({
              ...prev,
              department: value === 'all' ? undefined : value
            }))}
          >
            <SelectTrigger className="w-48">
              <FilterIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Curriculum">Curriculum</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Student Services">Student Services</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Policies Approved</p>
                <p className="text-3xl font-bold text-green-600">{metrics.policiesApproved.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  +{metrics.policiesApproved.thisMonth} this month
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PD Completions</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.professionalDevelopment.totalCompletions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.professionalDevelopment.completionRate}% completion rate
                </p>
              </div>
              <GraduationCapIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Tools</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.approvedTools.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Across {metrics.approvedTools.byDepartment.length} departments
                </p>
              </div>
              <WrenchIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Departments</p>
                <p className="text-3xl font-bold text-orange-600">{metrics.approvedTools.byDepartment.length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Using approved tools
                </p>
              </div>
              <BuildingIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Approvals by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Approvals by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.policiesApproved.byDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tools by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Tools by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.approvedTools.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {metrics.approvedTools.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Policy Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Policy Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.policiesApproved.recentApprovals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Recent Approvals</h3>
                <p>No policy approvals in the recent period.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.policiesApproved.recentApprovals.slice(0, 5).map((approval) => (
                  <div key={approval.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{approval.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>Department: {approval.department}</span>
                          <span>Approved by: {approval.approvedBy}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(approval.approvedAt))} ago
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming PD Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Training Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.professionalDevelopment.upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Upcoming Sessions</h3>
                <p>No professional development sessions scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.professionalDevelopment.upcomingSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{session.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>Department: {session.department}</span>
                          <span className="flex items-center gap-1">
                            <UsersIcon className="h-3 w-3" />
                            {session.attendeeCount} attendees
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          <CalendarIcon className="h-3 w-3 inline mr-1" />
                          {new Date(session.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(session.scheduledAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline">{session.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Tools Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Adoption by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.approvedTools.byDepartment.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <WrenchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tool Adoption</h3>
              <p>No departments have adopted approved tools yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {metrics.approvedTools.byDepartment.map((dept) => (
                <div key={dept.department} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{dept.department}</h3>
                    <Badge variant="outline">{dept.totalTools} tools</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dept.tools.slice(0, 6).map((tool, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3">
                        <h4 className="font-medium text-sm">{tool.toolName}</h4>
                        <p className="text-xs text-gray-500">{tool.category}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>{tool.usageCount} uses</span>
                          <span>•</span>
                          <span>Last used {formatDistanceToNow(new Date(tool.lastUsed))} ago</span>
                        </div>
                      </div>
                    ))}
                    {dept.tools.length > 6 && (
                      <div className="bg-gray-100 rounded p-3 flex items-center justify-center">
                        <span className="text-sm text-gray-600">+{dept.tools.length - 6} more tools</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AdoptionDashboardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-10 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AdoptionDashboardError({
  error,
  onRetry,
  className = ''
}: {
  error: string
  onRetry: () => void
  className?: string
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={onRetry}>Try Again</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AdoptionDashboardEmpty({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardContent className="p-8 text-center">
          <TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Adoption Data</h3>
          <p className="text-gray-600">Start approving policies and tools to see adoption metrics.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdoptionDashboard(props: AdoptionDashboardProps) {
  return (
    <Suspense fallback={<AdoptionDashboardSkeleton className={props.className} />}>
      <AdoptionDashboardContent {...props} />
    </Suspense>
  )
}
