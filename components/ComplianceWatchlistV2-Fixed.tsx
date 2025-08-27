'use client'

import { ComplianceTutorialTrigger } from '@/components/TutorialTrigger'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUserContext } from '@/components/UserProvider'
import { useAudience } from '@/lib/audience/AudienceContext'
import { useComplianceItems, useTeamMembers, useComplianceActions, type ComplianceFilters } from '@/lib/hooks/useComplianceData'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  XCircle,
  Plus,
  Calendar,
  User,
  Building,
  Shield,
  BookOpen,
  Gavel,
  Eye,
  Filter as FilterIcon
} from 'lucide-react'
import { useState } from 'react'

export default function ComplianceWatchlistV2() {
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('dueDate')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showTeamDialog, setShowTeamDialog] = useState(false)
  const [showGuidanceDialog, setShowGuidanceDialog] = useState(false)
  
  const { user, institution } = useUserContext()
  const { audience } = useAudience()

  const institutionName = institution?.name || 'Your Institution'
  const institutionType = institution?.org_type === 'K12' ? 'District' : 'Institution'
  const isK12 = audience === 'k12'

  // Build filters for the API
  const filters: ComplianceFilters = {}
  if (filter !== 'all') {
    if (filter === 'urgent') {
      filters.priority = 'critical'
    } else if (filter === 'overdue') {
      filters.status = 'overdue'
    } else if (filter === 'high-risk') {
      filters.riskLevel = 'high'
    } else {
      // Assume it's a type filter
      filters.status = filter
    }
  }

  // Use real data hooks
  const { items: complianceItems, metrics, loading, error } = useComplianceItems(filters)
  const { members: teamMembers } = useTeamMembers()
  const { updateItemStatus, assignToTeamMember, bulkUpdateItems } = useComplianceActions()

  // Filter and sort items locally for now
  const filteredItems = complianceItems.filter(item => {
    if (filter === 'all') return true
    if (filter === 'urgent') return item.priority === 'critical' || item.daysUntilDue <= 14
    if (filter === 'overdue') return item.daysUntilDue < 0
    if (filter === 'high-risk') return item.riskLevel === 'high'
    return item.type === filter
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return a.daysUntilDue - b.daysUntilDue
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      case 'risk':
        const riskOrder = { high: 0, medium: 1, low: 2 }
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
      case 'department':
        return a.department.localeCompare(b.department)
      case 'progress':
        return (b.completionPercentage || 0) - (a.completionPercentage || 0)
      default:
        return 0
    }
  })

  // Action handlers
  const handleUpdateItemStatus = async (itemId: string, newStatus: string, notes?: string) => {
    try {
      await updateItemStatus(itemId, newStatus, notes)
    } catch (error) {
      console.error('Failed to update item status:', error)
    }
  }

  const handleAssignToMember = async (itemId: string, memberId: string) => {
    try {
      await assignToTeamMember(itemId, memberId)
    } catch (error) {
      console.error('Failed to assign item:', error)
    }
  }

  const handleBulkUpdate = async (updates: any) => {
    try {
      await bulkUpdateItems(selectedItems, updates)
      setSelectedItems([])
    } catch (error) {
      console.error('Failed to bulk update items:', error)
    }
  }

  const currentMetrics = metrics || {
    totalItems: 0,
    overdue: 0,
    dueSoon: 0,
    inProgress: 0,
    completed: 0,
    highRiskItems: 0,
    criticalItems: 0,
    complianceScore: 0
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'flagged':
        return 'bg-orange-100 text-orange-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'review_needed':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired':
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'review_needed':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-purple-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'policy':
        return <FileText className="h-4 w-4" />
      case 'vendor':
        return <Building className="h-4 w-4" />
      case 'training':
        return <BookOpen className="h-4 w-4" />
      case 'certification':
        return <Shield className="h-4 w-4" />
      case 'audit':
        return <Eye className="h-4 w-4" />
      case 'legal':
        return <Gavel className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const generateDetailedReport = () => {
    const report = `
COMPLIANCE WATCHLIST DETAILED REPORT
Generated: ${new Date().toLocaleDateString()}
${institutionType}: ${institutionName}
Report Type: ${isK12 ? 'K-12 Education' : 'Higher Education'} Compliance

=== EXECUTIVE SUMMARY ===
Total Active Compliance Items: ${currentMetrics.totalItems}
Critical Priority Items: ${currentMetrics.criticalItems}
High Risk Items: ${currentMetrics.highRiskItems}
Overdue Items: ${currentMetrics.overdue}
Due Within 30 Days: ${currentMetrics.dueSoon}
In Progress: ${currentMetrics.inProgress}
Completed: ${currentMetrics.completed}
Overall Compliance Score: ${currentMetrics.complianceScore}%

Generated by AI Readiness Compliance Watchlist System
    `.trim()

    const element = document.createElement('a')
    const file = new Blob([report], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${isK12 ? 'k12' : 'highered'}-compliance-report-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Compliance Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-600 mb-4">
              This could be due to missing database setup or API configuration. Please ensure:
            </p>
            <ul className="text-sm text-gray-600 text-left max-w-md mx-auto list-disc list-inside space-y-1">
              <li>Database migrations have been run</li>
              <li>Compliance frameworks have been seeded</li>
              <li>User has proper team membership</li>
              <li>Organization ID is properly configured</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Description */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start" data-testid="compliance-watchlist-v2">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{isK12 ? 'K-12' : 'Higher Ed'} Compliance Watchlist</h1>
            </div>
            <p className="text-lg text-gray-700 mb-4">
              Monitor AI-related compliance for {isK12 ? 'school districts' : 'higher education institutions'} with federal regulations
            </p>
            <div className="bg-white rounded-md p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2">📋 How to Use This Dashboard</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Filter & Sort:</strong> Use the controls below to focus on specific compliance areas or priorities</li>
                <li>• <strong>Track Progress:</strong> Monitor completion status and deadlines for all compliance items</li>
                <li>• <strong>Assign Tasks:</strong> Delegate items to team members and track their workload</li>
                <li>• <strong>Take Action:</strong> Update status, add notes, or escalate critical items</li>
                <li>• <strong>Export Reports:</strong> Generate detailed reports for executive review or audits</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <Button 
              onClick={() => setShowGuidanceDialog(true)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Quick Guide
            </Button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <ComplianceTutorialTrigger showNewBadge={true} variant="floating" />
          <Button onClick={generateDetailedReport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Detailed Report
          </Button>
          <Button 
            onClick={() => setShowTeamDialog(true)} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Manage Team
          </Button>
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedItems.length} selected</Badge>
              <Button size="sm" variant="outline" onClick={() => handleBulkUpdate({ status: 'in_progress' })}>
                Bulk Update
              </Button>
              <Button size="sm" variant="outline">
                Bulk Assign
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Compliance Item</DialogTitle>
                <DialogDescription>
                  Add a new compliance tracking item to your watchlist.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="audit">Audit</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Enter compliance item title" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the compliance requirement" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Assigned To</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={() => setShowAddDialog(false)}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{currentMetrics.overdue}</div>
            <div className="text-sm text-red-700 font-medium">Overdue</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{currentMetrics.dueSoon}</div>
            <div className="text-sm text-orange-700 font-medium">Due Soon</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{currentMetrics.inProgress}</div>
            <div className="text-sm text-purple-700 font-medium">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{currentMetrics.completed}</div>
            <div className="text-sm text-green-700 font-medium">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{currentMetrics.criticalItems}</div>
            <div className="text-sm text-red-700 font-medium">Critical</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{currentMetrics.complianceScore}%</div>
            <div className="text-sm text-blue-700 font-medium">Compliance Score</div>
            <Progress value={currentMetrics.complianceScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filters & View Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Items ({complianceItems.length})</option>
                <option value="urgent">🚨 Urgent ({complianceItems.filter(item => item.priority === 'critical' || item.daysUntilDue <= 14).length})</option>
                <option value="overdue">⏰ Overdue ({complianceItems.filter(item => item.daysUntilDue < 0).length})</option>
                <option value="high-risk">⚠️ High Risk ({complianceItems.filter(item => item.riskLevel === 'high').length})</option>
                <option value="policy">📋 Policies ({complianceItems.filter(item => item.type === 'policy').length})</option>
                <option value="legal">⚖️ Legal ({complianceItems.filter(item => item.type === 'legal').length})</option>
                <option value="audit">🔍 Audits ({complianceItems.filter(item => item.type === 'audit').length})</option>
                <option value="certification">🛡️ Certifications ({complianceItems.filter(item => item.type === 'certification').length})</option>
                <option value="training">📚 Training ({complianceItems.filter(item => item.type === 'training').length})</option>
                <option value="vendor">🏢 Vendors ({complianceItems.filter(item => item.type === 'vendor').length})</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dueDate">📅 Due Date</option>
                <option value="priority">🔥 Priority</option>
                <option value="risk">⚠️ Risk Level</option>
                <option value="department">🏢 Department</option>
                <option value="progress">📊 Progress</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="select-all" 
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(sortedItems.map(item => item.id))
                  } else {
                    setSelectedItems([])
                  }
                }}
                className="rounded"
              />
              <label htmlFor="select-all" className="text-sm font-medium">Select All</label>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{sortedItems.length}</strong> of <strong>{complianceItems.length}</strong> items
              {selectedItems.length > 0 && (
                <span className="ml-2">• <strong>{selectedItems.length}</strong> selected</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setSelectedItems([])}>
                Clear Selection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Items */}
      <div className="space-y-4">
        {sortedItems.map((item) => (
          <Card key={item.id} className={`border-l-4 transition-all duration-200 hover:shadow-md ${selectedItems.includes(item.id) ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`} style={{
            borderLeftColor: item.priority === 'critical' ? '#DC2626' : 
                           item.priority === 'high' ? '#EA580C' :
                           item.priority === 'medium' ? '#D97706' : '#16A34A'
          }}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(prev => [...prev, item.id])
                      } else {
                        setSelectedItems(prev => prev.filter(id => id !== item.id))
                      }
                    }}
                    className="mt-2 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(item.status)}
                      {getTypeIcon(item.type)}
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.type.toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.regulatoryFramework.map((framework, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          {framework}
                        </Badge>
                      ))}
                    </div>

                    {/* Team Assignment Display - Only show if teamAssignment exists */}
                    {item.teamAssignment && (
                      <div className="bg-gray-50 rounded-md p-3 mb-3 border">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Team Assignment</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                              {item.teamAssignment.primaryAssignee.name.charAt(0)}
                            </div>
                            <span className="text-sm">
                              <strong>{item.teamAssignment.primaryAssignee.name}</strong> - {item.teamAssignment.primaryAssignee.role}
                            </span>
                            <Badge variant="outline" className="text-xs">Primary</Badge>
                          </div>
                          {item.teamAssignment.collaborators && item.teamAssignment.collaborators.map((collab, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-700">
                                {collab.name.charAt(0)}
                              </div>
                              <span className="text-sm">
                                {collab.name} - {collab.role}
                              </span>
                              <Badge variant="outline" className="text-xs">Collaborator</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right ml-6">
                  <Badge className={`${getStatusColor(item.status)} mb-2`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className={`text-sm font-medium ${getRiskColor(item.riskLevel)}`}>
                    {item.riskLevel.toUpperCase()} RISK
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {item.completionPercentage !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{item.completionPercentage}%</span>
                  </div>
                  <Progress value={item.completionPercentage} className="h-2" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Due Date: </span>
                  <span className={item.daysUntilDue < 0 ? 'text-red-600 font-semibold' :
                    item.daysUntilDue <= 14 ? 'text-orange-600 font-semibold' : ''}>
                    {item.dueDate}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Assigned To: </span>
                  <span>{item.assignedTo}</span>
                </div>
                <div>
                  <span className="font-medium">Department: </span>
                  <span>{item.department}</span>
                </div>
                <div>
                  <span className="font-medium">Time Remaining: </span>
                  <span className={item.daysUntilDue < 0 ? 'text-red-600 font-semibold' :
                    item.daysUntilDue <= 14 ? 'text-orange-600 font-semibold' : ''}>
                    {item.daysUntilDue < 0 ? `${Math.abs(item.daysUntilDue)} days overdue` :
                      item.daysUntilDue === 0 ? 'Due today' : `${item.daysUntilDue} days`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium">Last Action: </span>
                  <span className="text-sm text-muted-foreground">{item.lastAction}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Next Action: </span>
                  <span className="text-sm">{item.nextAction}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm font-medium">Impact Areas: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.impactArea.map((area, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        {item.title}
                      </DialogTitle>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Key Details</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Due Date:</strong> {item.dueDate}</div>
                            <div><strong>Assigned To:</strong> {item.assignedTo}</div>
                            <div><strong>Department:</strong> {item.department}</div>
                            <div><strong>Risk Level:</strong> <span className={getRiskColor(item.riskLevel)}>{item.riskLevel.toUpperCase()}</span></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Regulatory Framework</h4>
                          <div className="space-y-1">
                            {item.regulatoryFramework.map((framework, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 mr-1 mb-1">
                                {framework}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Impact Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {item.impactArea.map((area, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Progress & Actions</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Last Action:</strong> {item.lastAction}</div>
                          <div><strong>Next Action:</strong> {item.nextAction}</div>
                          {item.completionPercentage && (
                            <div>
                              <strong>Completion:</strong> {item.completionPercentage}%
                              <Progress value={item.completionPercentage} className="h-2 mt-1" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div>Created: {item.createdDate}</div>
                        <div>Last Updated: {item.updatedDate}</div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Status: {item.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>New Status</Label>
                        <Select onValueChange={(value) => handleUpdateItemStatus(item.id, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="review_needed">Review Needed</SelectItem>
                            <SelectItem value="flagged">Flagged</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Update Notes</Label>
                        <Textarea placeholder="Add notes about this status update..." rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Update Status</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button size="sm" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Reassign
                </Button>
                {(item.daysUntilDue <= 7 || item.priority === 'critical') && (
                  <Button size="sm" variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Escalate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Items Found</h3>
            <p className="text-muted-foreground">No compliance items match your current filters.</p>
          </CardContent>
        </Card>
      )}

      {/* Team Management Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Team Management
            </DialogTitle>
            <DialogDescription>
              Manage team members and their assignments for compliance tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Team Members</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg font-medium text-blue-700">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{member.name}</h5>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <p className="text-xs text-gray-500">{member.department}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {member.workload} tasks
                        </div>
                        <div className={`text-xs ${member.workload > 10 ? 'text-red-600' : member.workload > 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {member.workload > 10 ? 'Overloaded' : member.workload > 7 ? 'Busy' : 'Available'}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Workload Distribution</h4>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-32">
                      <span className="text-sm font-medium">{member.name}</span>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            member.workload > 10 ? 'bg-red-500' : 
                            member.workload > 7 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} 
                          style={{ width: `${Math.min((member.workload / 15) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600">
                      {member.workload}/15
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTeamDialog(false)}>Close</Button>
            <Button onClick={() => setShowTeamDialog(false)}>Add Team Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Guide Dialog */}
      <Dialog open={showGuidanceDialog} onOpenChange={setShowGuidanceDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Compliance Watchlist Quick Guide
            </DialogTitle>
            <DialogDescription>
              Learn how to effectively use the compliance watchlist to stay on top of regulatory requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">🎯 What is the Compliance Watchlist?</h4>
              <p className="text-gray-700 mb-4">
                The Compliance Watchlist is your central hub for tracking and managing all AI-related compliance requirements for your {isK12 ? 'school district' : 'institution'}. 
                It helps you stay compliant with federal regulations while implementing AI technologies in education.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">📊 Key Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2">📈 Progress Tracking</h5>
                  <p className="text-sm text-gray-600">Monitor completion status, deadlines, and progress for all compliance items with visual indicators.</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2">👥 Team Management</h5>
                  <p className="text-sm text-gray-600">Assign tasks to team members, track workloads, and collaborate on compliance activities.</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2">⚡ Smart Filtering</h5>
                  <p className="text-sm text-gray-600">Quickly find specific items by status, priority, risk level, or regulatory framework.</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2">📋 Detailed Reports</h5>
                  <p className="text-sm text-gray-600">Generate comprehensive reports for executive review or audit documentation.</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">🚀 Getting Started</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Review Your Items</p>
                    <p className="text-sm text-gray-600">Start by reviewing all compliance items, focusing on overdue and high-priority items first.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Assign Responsibilities</p>
                    <p className="text-sm text-gray-600">Use the team management feature to assign items to appropriate team members based on expertise.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Track Progress</p>
                    <p className="text-sm text-gray-600">Regularly update status and monitor deadlines to ensure nothing falls through the cracks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">Generate Reports</p>
                    <p className="text-sm text-gray-600">Use the detailed report feature to communicate status to leadership and maintain audit trails.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">⚖️ {isK12 ? 'K-12' : 'Higher Ed'} Regulatory Focus</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  This watchlist specifically tracks compliance with federal regulations relevant to {isK12 ? 'K-12 education' : 'higher education'}:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>FERPA:</strong> Student privacy and educational records</li>
                  {isK12 ? (
                    <>
                      <li>• <strong>COPPA:</strong> Children's online privacy protection</li>
                      <li>• <strong>IDEA:</strong> Special education compliance</li>
                      <li>• <strong>Section 508:</strong> Accessibility requirements</li>
                    </>
                  ) : (
                    <>
                      <li>• <strong>HIPAA:</strong> Health information privacy</li>
                      <li>• <strong>Clery Act:</strong> Campus safety reporting</li>
                      <li>• <strong>ADA:</strong> Accessibility compliance</li>
                    </>
                  )}
                  <li>• <strong>Title VI & IX:</strong> Civil rights and non-discrimination</li>
                  <li>• <strong>State Laws:</strong> Local privacy and data protection requirements</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowGuidanceDialog(false)}>Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}