/**
 * Watchlist Dashboard
 * Pending approvals and vendor renewals overview
 * @version 1.0.0
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardFilters, WatchlistMetrics } from '@/lib/types/dashboard'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarSignIcon,
  FileTextIcon,
  FilterIcon,
  RefreshCwIcon,
  ShieldIcon
} from 'lucide-react'
import { Suspense, useCallback, useEffect, useState } from 'react'

interface WatchlistDashboardProps {
  currentUserId: string
  className?: string
}

function WatchlistDashboardContent({ currentUserId, className = '' }: WatchlistDashboardProps) {
  const [metrics, setMetrics] = useState<WatchlistMetrics | null>(null)
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

      const response = await fetch(`/api/dashboard/watchlist?${params}`, {
        headers: { 'x-user-id': currentUserId }
      })

      if (!response.ok) throw new Error('Failed to fetch watchlist metrics')

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

  const getPriorityBadge = (priority: string, isOverdue?: boolean) => {
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
    }

    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return <Badge className={variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>{priority}</Badge>
  }

  const getRiskBadge = (level: string) => {
    const variants = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return <Badge className={variants[level as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>{level}</Badge>
  }

  if (loading) {
    return <WatchlistDashboardSkeleton className={className} />
  }

  if (error) {
    return <WatchlistDashboardError error={error} onRetry={fetchMetrics} className={className} />
  }

  if (!metrics) {
    return <WatchlistDashboardEmpty className={className} />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Watchlist Dashboard</h1>
          <p className="text-gray-600 mt-1">Pending approvals and upcoming renewals</p>
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
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-orange-600">{metrics.pendingApprovals.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Across all categories
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendor Renewals</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.vendorRenewals.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.vendorRenewals.overdue.length} overdue
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Action Items</p>
                <p className="text-3xl font-bold text-red-600">{metrics.actionItems.length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.actionItems.filter(a => a.priority === 'high').length} high priority
                </p>
              </div>
              <AlertCircleIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contract Value</p>
                <p className="text-3xl font-bold text-green-600">
                  ${metrics.vendorRenewals.upcoming.reduce((sum, r) => sum + r.contractValue, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Renewal value
                </p>
              </div>
              <DollarSignIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.actionItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Action Items</h3>
              <p>Great! No urgent items require immediate attention.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.actionItems.slice(0, 10).map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        {getPriorityBadge(item.priority, item.daysOverdue !== undefined)}
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Department: {item.department}</span>
                        <span>Assigned: {item.assignedTo}</span>
                        <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                        {item.daysOverdue && (
                          <span className="text-red-600 font-medium">
                            {item.daysOverdue} days overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Policies ({metrics.pendingApprovals.policies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.pendingApprovals.policies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileTextIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No pending policies</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.pendingApprovals.policies.slice(0, 5).map((policy) => (
                  <div key={policy.id} className="border rounded p-3">
                    <h4 className="font-medium text-sm">{policy.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{policy.department}</span>
                      <span>•</span>
                      <span>{policy.daysOpen} days open</span>
                    </div>
                    <div className="mt-2">
                      {getPriorityBadge(policy.priority)}
                    </div>
                  </div>
                ))}
                {metrics.pendingApprovals.policies.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{metrics.pendingApprovals.policies.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Vendors */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Vendors ({metrics.pendingApprovals.vendors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.pendingApprovals.vendors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShieldIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No pending vendors</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.pendingApprovals.vendors.slice(0, 5).map((vendor) => (
                  <div key={vendor.id} className="border rounded p-3">
                    <h4 className="font-medium text-sm">{vendor.vendorName}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{vendor.category}</span>
                      <span>•</span>
                      <span>{vendor.daysOpen} days open</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {getPriorityBadge(vendor.priority)}
                      {getRiskBadge(vendor.riskLevel)}
                    </div>
                  </div>
                ))}
                {metrics.pendingApprovals.vendors.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{metrics.pendingApprovals.vendors.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Assessments ({metrics.pendingApprovals.assessments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.pendingApprovals.assessments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No pending assessments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.pendingApprovals.assessments.slice(0, 5).map((assessment) => (
                  <div key={assessment.id} className="border rounded p-3">
                    <h4 className="font-medium text-sm">{assessment.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{assessment.department}</span>
                      <span>•</span>
                      <span>{assessment.type}</span>
                      <span>•</span>
                      <span>{assessment.daysOpen} days open</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      By: {assessment.submittedBy}
                    </p>
                  </div>
                ))}
                {metrics.pendingApprovals.assessments.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{metrics.pendingApprovals.assessments.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Renewals */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals ({metrics.vendorRenewals.upcoming.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.vendorRenewals.upcoming.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Upcoming Renewals</h3>
                <p>No vendor contracts need renewal in the next 90 days.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.vendorRenewals.upcoming.slice(0, 5).map((renewal) => (
                  <div key={renewal.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{renewal.vendorName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>Category: {renewal.category}</span>
                          <span>Department: {renewal.department}</span>
                          <span>${renewal.contractValue.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Renewal due: {new Date(renewal.renewalDate).toLocaleDateString()}
                          <span className={`ml-2 ${renewal.daysUntilRenewal <= 30 ? 'text-orange-600' : 'text-blue-600'}`}>
                            ({renewal.daysUntilRenewal} days)
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getRiskBadge(renewal.riskLevel)}
                        {renewal.daysUntilRenewal <= 30 && (
                          <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Renewals */}
        <Card>
          <CardHeader>
            <CardTitle>Overdue Renewals ({metrics.vendorRenewals.overdue.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.vendorRenewals.overdue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Overdue Renewals</h3>
                <p>All vendor contracts are up to date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.vendorRenewals.overdue.slice(0, 5).map((renewal) => (
                  <div key={renewal.id} className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900">{renewal.vendorName}</h3>
                        <div className="flex items-center gap-4 text-sm text-red-700 mt-1">
                          <span>Category: {renewal.category}</span>
                          <span>Department: {renewal.department}</span>
                          <span>${renewal.contractValue.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          <AlertTriangleIcon className="h-3 w-3 inline mr-1" />
                          Overdue by {Math.abs(renewal.daysUntilRenewal)} days
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getRiskBadge(renewal.riskLevel)}
                        <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function WatchlistDashboardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
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

      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    </div>
  )
}

function WatchlistDashboardError({
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
          <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={onRetry}>Try Again</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function WatchlistDashboardEmpty({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">All Clear</h3>
          <p className="text-gray-600">No pending approvals or renewals requiring attention.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function WatchlistDashboard(props: WatchlistDashboardProps) {
  return (
    <Suspense fallback={<WatchlistDashboardSkeleton className={props.className} />}>
      <WatchlistDashboardContent {...props} />
    </Suspense>
  )
}
