/**
 * Approval Dashboard Component
 * Displays user's approval workload and metrics
 * @version 1.0.0
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  FilterIcon
} from 'lucide-react'
import { ApprovalCard } from './approval-card'
import { Approval } from '@/lib/types/approval'

interface ApprovalDashboardData {
  pending: {
    count: number
    items: Approval[]
  }
  approved: {
    count: number
    items: Approval[]
  }
  rejected: {
    count: number
    items: Approval[]
  }
  overdue: {
    count: number
    items: Approval[]
  }
  metrics: {
    avgApprovalTime: number
    totalProcessed: number
    approvalRate: number
    weeklyTrend: number
  }
}

interface ApprovalDashboardProps {
  currentUserId: string
  className?: string
}

export function ApprovalDashboard({ currentUserId, className = '' }: ApprovalDashboardProps) {
  const [data, setData] = useState<ApprovalDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pending')

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/approvals/dashboard', {
          headers: {
            'x-user-id': currentUserId
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Unknown error')
        }

        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [currentUserId])

  // Handle approval decision
  const handleDecision = async (approvalId: string, decision: 'approved' | 'rejected', comment: string, esignConfirmed: boolean) => {
    try {
      const response = await fetch(`/api/approvals/${approvalId}/decision`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({
          decision,
          comment,
          eSignature: {
            signed: esignConfirmed,
            ipAddress: '127.0.0.1', // This would be populated by the server
            userAgent: navigator.userAgent
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit decision')
      }

      // Refresh dashboard
      window.location.reload()
    } catch (err) {
      console.error('Failed to submit decision:', err)
      throw err
    }
  }

  // Handle comment addition
  const handleComment = async (approvalId: string, comment: string) => {
    try {
      const response = await fetch(`/api/approvals/${approvalId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({ comment })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      // Refresh dashboard
      window.location.reload()
    } catch (err) {
      console.error('Failed to add comment:', err)
      throw err
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return <div>No data available</div>
  }

  const formatApprovalTime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`
    const days = Math.floor(hours / 24)
    return `${days}d ${Math.round(hours % 24)}h`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{data.pending.count}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{data.approved.count}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{data.rejected.count}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-orange-600">{data.overdue.count}</p>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Avg Approval Time</p>
              <CalendarIcon className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xl font-bold">{formatApprovalTime(data.metrics.avgApprovalTime)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <div className={`flex items-center ${data.metrics.weeklyTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.metrics.weeklyTrend >= 0 ? 
                  <TrendingUpIcon className="h-4 w-4" /> : 
                  <TrendingDownIcon className="h-4 w-4" />
                }
              </div>
            </div>
            <p className="text-xl font-bold">{Math.round(data.metrics.approvalRate)}%</p>
            <Progress value={data.metrics.approvalRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Processed</p>
              <Badge variant="secondary">{data.metrics.weeklyTrend >= 0 ? '+' : ''}{data.metrics.weeklyTrend}%</Badge>
            </div>
            <p className="text-xl font-bold">{data.metrics.totalProcessed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Lists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Approval Requests</span>
            <Button variant="outline" size="sm">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Pending ({data.pending.count})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4" />
                Overdue ({data.overdue.count})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Approved ({data.approved.count})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircleIcon className="h-4 w-4" />
                Rejected ({data.rejected.count})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {data.pending.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending approvals
                </div>
              ) : (
                data.pending.items.map((approval) => (
                  <ApprovalCard
                    key={approval.id}
                    approval={approval}
                    currentUserId={currentUserId}
                    onDecision={handleDecision}
                    onComment={handleComment}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4 mt-6">
              {data.overdue.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No overdue approvals
                </div>
              ) : (
                data.overdue.items.map((approval) => (
                  <ApprovalCard
                    key={approval.id}
                    approval={approval}
                    currentUserId={currentUserId}
                    onDecision={handleDecision}
                    onComment={handleComment}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {data.approved.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No approved items
                </div>
              ) : (
                data.approved.items.map((approval) => (
                  <ApprovalCard
                    key={approval.id}
                    approval={approval}
                    currentUserId={currentUserId}
                    onComment={handleComment}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-6">
              {data.rejected.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No rejected items
                </div>
              ) : (
                data.rejected.items.map((approval) => (
                  <ApprovalCard
                    key={approval.id}
                    approval={approval}
                    currentUserId={currentUserId}
                    onComment={handleComment}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
