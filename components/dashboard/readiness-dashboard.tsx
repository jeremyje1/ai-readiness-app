/**
 * Readiness & Risk Dashboard
 * Assessment scores, trends, and open risks overview
 * @version 1.0.0
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardFilters, ReadinessMetrics } from '@/lib/types/dashboard'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertTriangleIcon,
  BarChart3Icon,
  CalendarIcon,
  FilterIcon,
  MinusIcon,
  RefreshCwIcon,
  ShieldIcon,
  TrendingDownIcon,
  TrendingUpIcon
} from 'lucide-react'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ReadinessDashboardProps {
  currentUserId: string
  className?: string
}

function ReadinessDashboardContent({ currentUserId, className = '' }: ReadinessDashboardProps) {
  const [metrics, setMetrics] = useState<ReadinessMetrics | null>(null)
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
      if (filters.riskLevel) params.append('riskLevel', filters.riskLevel)

      const response = await fetch(`/api/dashboard/readiness?${params}`, {
        headers: { 'x-user-id': currentUserId }
      })

      if (!response.ok) throw new Error('Failed to fetch readiness metrics')

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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDownIcon className="h-4 w-4 text-red-600" />
      default: return <MinusIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getRiskBadge = (level: string, count: number) => {
    const variants = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return (
      <Badge className={variants[level as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {count} {level}
      </Badge>
    )
  }

  if (loading) {
    return <ReadinessDashboardSkeleton className={className} />
  }

  if (error) {
    return <ReadinessDashboardError error={error} onRetry={fetchMetrics} className={className} />
  }

  if (!metrics) {
    return <ReadinessDashboardEmpty className={className} />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Readiness & Risk Dashboard</h1>
          <p className="text-gray-600 mt-1">Assessment trends and risk overview</p>
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
                <p className="text-sm font-medium text-gray-600">Assessment Score</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.assessmentScores.current}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(metrics.assessmentScores.trend)}
                  <span className={`text-sm ${metrics.assessmentScores.trend === 'up' ? 'text-green-600' :
                      metrics.assessmentScores.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                    {Math.abs(metrics.assessmentScores.change)} from last period
                  </span>
                </div>
              </div>
              <BarChart3Icon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">{metrics.completionRates.percentage}%</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.completionRates.completedAssessments} of {metrics.completionRates.totalAssessments} assessments
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Open Risks</p>
                <p className="text-3xl font-bold text-orange-600">
                  {Object.values(metrics.riskDistribution).reduce((sum, count) => sum + count, 0)}
                </p>
                <div className="flex gap-1 mt-2">
                  {metrics.riskDistribution.critical > 0 && getRiskBadge('critical', metrics.riskDistribution.critical)}
                  {metrics.riskDistribution.high > 0 && getRiskBadge('high', metrics.riskDistribution.high)}
                </div>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Distribution</p>
                <div className="space-y-1 mt-2">
                  {getRiskBadge('critical', metrics.riskDistribution.critical)}
                  {getRiskBadge('high', metrics.riskDistribution.high)}
                  {getRiskBadge('medium', metrics.riskDistribution.medium)}
                  {getRiskBadge('low', metrics.riskDistribution.low)}
                </div>
              </div>
              <ShieldIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [value, name === 'score' ? 'Score' : name === 'completions' ? 'Completions' : 'New Risks']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="score"
                />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="completions"
                />
                <Line
                  type="monotone"
                  dataKey="risks"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="risks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Open Risks */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Open Risks</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.openRisks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShieldIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Open Risks</h3>
              <p>Great job! No high-priority risks require attention.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.openRisks.slice(0, 10).map((risk) => (
                <div key={risk.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{risk.title}</h3>
                        {getRiskBadge(risk.level, 0).props.children.includes('critical') &&
                          <Badge className="bg-red-100 text-red-800">{risk.level}</Badge>
                        }
                        {getRiskBadge(risk.level, 0).props.children.includes('high') &&
                          <Badge className="bg-orange-100 text-orange-800">{risk.level}</Badge>
                        }
                        {getRiskBadge(risk.level, 0).props.children.includes('medium') &&
                          <Badge className="bg-yellow-100 text-yellow-800">{risk.level}</Badge>
                        }
                        {getRiskBadge(risk.level, 0).props.children.includes('low') &&
                          <Badge className="bg-green-100 text-green-800">{risk.level}</Badge>
                        }
                      </div>
                      <p className="text-gray-600 mb-2">{risk.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {risk.category}</span>
                        <span>Department: {risk.department}</span>
                        {risk.assignedTo && <span>Assigned: {risk.assignedTo}</span>}
                        {risk.dueDate && (
                          <span>Due: {new Date(risk.dueDate).toLocaleDateString()}</span>
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
    </div>
  )
}

function ReadinessDashboardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-80 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-60 animate-pulse"></div>
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
          <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReadinessDashboardError({
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

function ReadinessDashboardEmpty({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-600">Start by completing some assessments to see readiness metrics.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ReadinessDashboard(props: ReadinessDashboardProps) {
  return (
    <Suspense fallback={<ReadinessDashboardSkeleton className={props.className} />}>
      <ReadinessDashboardContent {...props} />
    </Suspense>
  )
}
