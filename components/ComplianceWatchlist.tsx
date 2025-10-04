'use client'

// ComplianceTutorialTrigger removed - using simplified tutorial system
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUserContext } from '@/components/UserProvider'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  XCircle
} from 'lucide-react'
import { useState } from 'react'

interface ComplianceItem {
  id: string
  type: 'policy' | 'vendor' | 'training' | 'certification'
  title: string
  description: string
  status: 'pending' | 'flagged' | 'expired' | 'overdue' | 'review_needed'
  priority: 'critical' | 'high' | 'medium' | 'low'
  dueDate: string
  assignedTo: string
  department: string
  lastAction: string
  nextAction: string
  daysUntilDue: number
  completionPercentage?: number
  dependencies?: string[]
  riskLevel: 'low' | 'medium' | 'high'
  impactArea: string[]
}

interface ComplianceMetrics {
  totalItems: number
  overdue: number
  dueSoon: number
  inProgress: number
  completed: number
  complianceScore: number
}

export default function ComplianceWatchlist() {
  const [filter, setFilter] = useState<string>('all')
  const { user, institution, loading } = useUserContext()

  // Use actual institution data
  const institutionName = institution?.name || 'Your Institution'
  const institutionType = institution?.org_type === 'K12' ? 'District' : 'Institution'
  const [sortBy, setSortBy] = useState<string>('dueDate')

  const complianceItems: ComplianceItem[] = [
    {
      id: 'policy-001',
      type: 'policy',
      title: 'AI Acceptable Use Policy Update',
      description: 'Update district AI policy to include new ChatGPT and Microsoft Copilot guidelines',
      status: 'pending',
      priority: 'critical',
      dueDate: '2025-09-15',
      assignedTo: 'Dr. Sarah Martinez (Legal)',
      department: 'Legal & Compliance',
      lastAction: 'Draft reviewed by IT committee',
      nextAction: 'Board review and approval',
      daysUntilDue: 21,
      completionPercentage: 75,
      dependencies: ['vendor-assessment-chatgpt'],
      riskLevel: 'high',
      impactArea: ['Student Safety', 'Legal Compliance', 'Teacher Guidelines']
    },
    {
      id: 'vendor-002',
      type: 'vendor',
      title: 'ChatGPT Plus Education License Renewal',
      description: 'Annual license renewal with updated data processing agreement',
      status: 'flagged',
      priority: 'critical',
      dueDate: '2025-09-01',
      assignedTo: 'Mike Chen (IT Director)',
      department: 'Information Technology',
      lastAction: 'Vendor contacted about DPA updates',
      nextAction: 'Review and sign new contract',
      daysUntilDue: 7,
      riskLevel: 'high',
      impactArea: ['Service Continuity', 'Data Privacy', 'Cost Management']
    },
    {
      id: 'training-003',
      type: 'training',
      title: 'Elementary Teacher AI Training Module 2',
      description: 'Complete second phase of AI literacy training for K-5 teachers',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-10-01',
      assignedTo: 'Jennifer Lopez (PD Coordinator)',
      department: 'Professional Development',
      lastAction: 'Module 1 completed by 28 teachers',
      nextAction: 'Schedule Module 2 sessions',
      daysUntilDue: 37,
      completionPercentage: 60,
      riskLevel: 'medium',
      impactArea: ['Teacher Readiness', 'Policy Implementation', 'Student Safety']
    },
    {
      id: 'vendor-004',
      type: 'vendor',
      title: 'Grammarly Education Data Processing Agreement',
      description: 'Updated DPA required for COPPA compliance',
      status: 'expired',
      priority: 'critical',
      dueDate: '2025-08-20',
      assignedTo: 'Legal Team',
      department: 'Legal & Compliance',
      lastAction: 'DPA expired, usage suspended',
      nextAction: 'Emergency vendor meeting',
      daysUntilDue: -5,
      riskLevel: 'high',
      impactArea: ['Service Disruption', 'Legal Risk', 'Teacher Workflow']
    },
    {
      id: 'cert-005',
      type: 'certification',
      title: 'FERPA Compliance Audit Preparation',
      description: 'Prepare documentation for annual FERPA compliance review',
      status: 'review_needed',
      priority: 'high',
      dueDate: '2025-09-30',
      assignedTo: 'Compliance Officer',
      department: 'Legal & Compliance',
      lastAction: 'Documentation gathered',
      nextAction: 'Internal review with IT',
      daysUntilDue: 36,
      completionPercentage: 40,
      riskLevel: 'medium',
      impactArea: ['Regulatory Compliance', 'Data Privacy', 'Federal Funding']
    },
    {
      id: 'policy-006',
      type: 'policy',
      title: 'Student AI Usage Guidelines - High School',
      description: 'Develop specific guidelines for AI tool usage in grades 9-12',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-10-15',
      assignedTo: 'High School Principal',
      department: 'Secondary Education',
      lastAction: 'Student committee feedback received',
      nextAction: 'Draft policy for review',
      daysUntilDue: 51,
      completionPercentage: 30,
      riskLevel: 'medium',
      impactArea: ['Academic Integrity', 'Student Guidelines', 'Teacher Support']
    }
  ]

  const metrics: ComplianceMetrics = {
    totalItems: complianceItems.length,
    overdue: complianceItems.filter(item => item.daysUntilDue < 0).length,
    dueSoon: complianceItems.filter(item => item.daysUntilDue >= 0 && item.daysUntilDue <= 14).length,
    inProgress: complianceItems.filter(item => item.completionPercentage && item.completionPercentage > 0).length,
    completed: 0, // Would come from completed items not shown
    complianceScore: 73
  }

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
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  const filteredItems = complianceItems.filter(item => {
    if (filter === 'all') return true
    if (filter === 'urgent') return item.priority === 'critical' || item.daysUntilDue <= 7
    if (filter === 'overdue') return item.daysUntilDue < 0
    return item.type === filter
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return a.daysUntilDue - b.daysUntilDue
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      case 'department':
        return a.department.localeCompare(b.department)
      default:
        return 0
    }
  })

  const generateReport = () => {
    // Generate compliance report for leadership
    const report = `
COMPLIANCE WATCHLIST REPORT
Generated: ${new Date().toLocaleDateString()}
${institutionType}: ${institutionName}

EXECUTIVE SUMMARY
Total Active Items: ${metrics.totalItems}
Overdue Items: ${metrics.overdue}
Due Within 14 Days: ${metrics.dueSoon}
Overall Compliance Score: ${metrics.complianceScore}%

CRITICAL ITEMS REQUIRING IMMEDIATE ATTENTION:
${complianceItems.filter(item => item.priority === 'critical' || item.daysUntilDue < 0)
        .map(item => `- ${item.title} (Due: ${item.dueDate}) - ${item.assignedTo}`).join('\n')}

UPCOMING DEADLINES (Next 30 Days):
${complianceItems.filter(item => item.daysUntilDue >= 0 && item.daysUntilDue <= 30)
        .map(item => `- ${item.title} (${item.daysUntilDue} days) - ${item.assignedTo}`).join('\n')}
    `.trim()

    const element = document.createElement('a')
    const file = new Blob([report], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `compliance-watchlist-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center" data-testid="compliance-watchlist">
        <div>
          <h1 className="text-3xl font-bold">Compliance Watchlist</h1>
          <p className="text-muted-foreground">
            Track AI-related compliance items, vendor renewals, and policy approvals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={generateReport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.overdue}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.dueSoon}</div>
            <div className="text-sm text-muted-foreground">Due Soon</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{metrics.complianceScore}%</div>
            <div className="text-sm text-muted-foreground">Compliance Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Items</option>
                <option value="urgent">Urgent</option>
                <option value="overdue">Overdue</option>
                <option value="policy">Policies</option>
                <option value="vendor">Vendors</option>
                <option value="training">Training</option>
                <option value="certification">Certifications</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="department">Department</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {sortedItems.length} of {complianceItems.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Items */}
      <div className="space-y-4">
        {sortedItems.map((item) => (
          <Card key={item.id} className="border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(item.status)}
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {item.type.toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{item.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Due Date: </span>
                      <span className={item.daysUntilDue < 0 ? 'text-red-600 font-semibold' :
                        item.daysUntilDue <= 7 ? 'text-orange-600 font-semibold' : ''}>
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
                      <span className="font-medium">Days Until Due: </span>
                      <span className={item.daysUntilDue < 0 ? 'text-red-600 font-semibold' :
                        item.daysUntilDue <= 7 ? 'text-orange-600 font-semibold' : ''}>
                        {item.daysUntilDue < 0 ? `${Math.abs(item.daysUntilDue)} days overdue` :
                          item.daysUntilDue === 0 ? 'Due today' : `${item.daysUntilDue} days`}
                      </span>
                    </div>
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

              {item.completionPercentage !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{item.completionPercentage}%</span>
                  </div>
                  <Progress value={item.completionPercentage} className="h-2" />
                </div>
              )}

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

              {item.dependencies && (
                <div className="mb-4">
                  <span className="text-sm font-medium">Dependencies: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.dependencies.map((dep, i) => (
                      <Badge key={i} className="text-xs bg-purple-100 text-purple-800">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Update Status
                </Button>
                <Button size="sm" variant="outline">
                  Assign Owner
                </Button>
                {item.daysUntilDue <= 7 && (
                  <Button size="sm" variant="destructive">
                    Escalate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
