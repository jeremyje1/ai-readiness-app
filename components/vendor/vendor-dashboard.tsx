/**
 * Vendor Dashboard Component
 * Overview of vendor intakes, risk assessments, and approved tools
 * @version 1.0.0
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PlusIcon,
  SearchIcon,
  FilterIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ShieldIcon,
  FileTextIcon,
  TrendingUpIcon
} from 'lucide-react'
import { Vendor, VendorStatus } from '@/lib/types/vendor'
import { formatDistanceToNow } from 'date-fns'

interface VendorDashboardProps {
  currentUserId: string
  onCreateVendor?: () => void
  onViewVendor?: (vendorId: string) => void
  onGenerateBrief?: (vendorId: string) => void
  className?: string
}

export function VendorDashboard({ 
  currentUserId, 
  onCreateVendor, 
  onViewVendor, 
  onGenerateBrief,
  className = '' 
}: VendorDashboardProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'all'>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    highRisk: 0,
    inCatalog: 0
  })

  // Fetch vendors and dashboard data
  useEffect(() => {
    fetchVendors()
  }, [statusFilter, riskFilter])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (riskFilter !== 'all') params.append('riskLevel', riskFilter)
      
      const response = await fetch(`/api/vendors?${params}`, {
        headers: { 'x-user-id': currentUserId }
      })

      if (!response.ok) throw new Error('Failed to fetch vendors')

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      setVendors(result.data)
      
      // Calculate stats
      const vendorList = result.data as Vendor[]
      setStats({
        total: vendorList.length,
        pending: vendorList.filter(v => v.status === 'pending' || v.status === 'under_review').length,
        approved: vendorList.filter(v => v.status === 'approved').length,
        rejected: vendorList.filter(v => v.status === 'rejected').length,
        highRisk: vendorList.filter(v => v.riskLevel === 'high' || v.riskLevel === 'critical').length,
        inCatalog: vendorList.filter(v => v.catalogEntry?.approved).length
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const generateBrief = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/decision-brief`, {
        method: 'POST',
        headers: { 'x-user-id': currentUserId }
      })

      if (!response.ok) throw new Error('Failed to generate brief')

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      alert('Decision brief generated successfully!')
      if (onGenerateBrief) onGenerateBrief(vendorId)

    } catch (err) {
      alert('Failed to generate decision brief: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const getStatusIcon = (status: VendorStatus) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'rejected': return <XCircleIcon className="h-4 w-4 text-red-600" />
      case 'pending': return <ClockIcon className="h-4 w-4 text-yellow-600" />
      case 'under_review': return <ClockIcon className="h-4 w-4 text-blue-600" />
      case 'conditional': return <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
      default: return <ClockIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: VendorStatus) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      conditional: 'bg-orange-100 text-orange-800'
    }
    return <Badge className={variants[status]}>{status.replace('_', ' ')}</Badge>
  }

  const getRiskBadge = (level: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return <Badge className={variants[level as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>{level}</Badge>
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !searchQuery || 
      vendor.assessment.basicInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.assessment.basicInfo.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

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
            <Button onClick={fetchVendors}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">Assess vendor risks and manage tool approvals</p>
        </div>
        {onCreateVendor && (
          <Button onClick={onCreateVendor} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Vendor Assessment
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ShieldIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{stats.highRisk}</p>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Catalog</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inCatalog}</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendor List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No vendors match your search criteria.' : 'No vendor assessments found.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{vendor.assessment.basicInfo.name}</h3>
                        {getStatusBadge(vendor.status)}
                        {getRiskBadge(vendor.riskLevel)}
                        {vendor.catalogEntry?.approved && (
                          <Badge className="bg-blue-100 text-blue-800">In Catalog</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2">{vendor.assessment.basicInfo.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {vendor.assessment.basicInfo.category}</span>
                        <span>Risk Score: {vendor.riskScore}/100</span>
                        <span>Created: {formatDistanceToNow(new Date(vendor.createdAt))} ago</span>
                        {vendor.riskFlags.length > 0 && (
                          <span className="text-orange-600">
                            {vendor.riskFlags.length} risk flag{vendor.riskFlags.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {vendor.mitigations.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">
                            {vendor.mitigations.length} mitigation{vendor.mitigations.length !== 1 ? 's' : ''} required
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateBrief(vendor.id)}
                        className="flex items-center gap-1"
                      >
                        <FileTextIcon className="h-4 w-4" />
                        Generate Brief
                      </Button>
                      
                      {onViewVendor && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onViewVendor(vendor.id)}
                        >
                          View Details
                        </Button>
                      )}
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
