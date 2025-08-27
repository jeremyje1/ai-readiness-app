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
  Eye
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface ComplianceItem {
  id: string
  type: 'policy' | 'vendor' | 'training' | 'certification' | 'audit' | 'legal'
  title: string
  description: string
  status: 'pending' | 'flagged' | 'expired' | 'overdue' | 'review_needed' | 'completed' | 'in_progress'
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
  regulatoryFramework: string[]
  documentLinks?: string[]
  notes?: string
  createdDate: string
  updatedDate: string
}

interface ComplianceMetrics {
  totalItems: number
  overdue: number
  dueSoon: number
  inProgress: number
  completed: number
  complianceScore: number
  highRiskItems: number
  criticalItems: number
}

export default function ComplianceWatchlistV2() {
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('dueDate')
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user, institution } = useUserContext()
  const { audience } = useAudience()

  const institutionName = institution?.name || 'Your Institution'
  const institutionType = institution?.org_type === 'K12' ? 'District' : 'Institution'
  const isK12 = audience === 'k12'

  // Generate realistic compliance items based on audience
  useEffect(() => {
    const generateRealComplianceItems = (): ComplianceItem[] => {
      const currentDate = new Date()
      
      const k12Items: ComplianceItem[] = [
        {
          id: 'ferpa-2025-review',
          type: 'legal',
          title: 'Annual FERPA Compliance Review',
          description: 'Required annual review of all student data handling practices, including AI tools that process educational records.',
          status: 'pending',
          priority: 'critical',
          dueDate: '2025-10-01',
          assignedTo: 'Privacy Officer',
          department: 'Legal & Compliance',
          lastAction: 'Initial documentation review started',
          nextAction: 'Complete AI vendor data processing inventory',
          daysUntilDue: Math.ceil((new Date('2025-10-01').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 15,
          riskLevel: 'high',
          impactArea: ['Student Privacy', 'Federal Compliance', 'Legal Risk'],
          regulatoryFramework: ['FERPA', '20 USC 1232g'],
          createdDate: '2025-08-01',
          updatedDate: '2025-08-25'
        },
        {
          id: 'coppa-ai-assessment',
          type: 'audit',
          title: 'COPPA Compliance for AI Tools (Under 13)',
          description: 'Audit all AI educational tools used with students under 13 to ensure COPPA compliance, including parental consent mechanisms.',
          status: 'in_progress',
          priority: 'critical',
          dueDate: '2025-09-15',
          assignedTo: 'IT Director & Legal Counsel',
          department: 'Information Technology',
          lastAction: 'Completed ChatGPT EDU and Khan Academy review',
          nextAction: 'Review Prodigy Math and IXL Learning compliance',
          daysUntilDue: Math.ceil((new Date('2025-09-15').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 60,
          riskLevel: 'high',
          impactArea: ['Student Privacy', 'Parental Rights', 'Legal Compliance'],
          regulatoryFramework: ['COPPA', '15 USC 6501-6506'],
          documentLinks: ['/docs/coppa-compliance-checklist.pdf'],
          createdDate: '2025-07-15',
          updatedDate: '2025-08-26'
        },
        {
          id: 'section-508-accessibility',
          type: 'certification',
          title: 'Section 508 Accessibility Compliance - AI Tools',
          description: 'Ensure all AI educational technology meets federal accessibility requirements for students with disabilities.',
          status: 'flagged',
          priority: 'high',
          dueDate: '2025-11-30',
          assignedTo: 'Special Education Coordinator',
          department: 'Student Services',
          lastAction: 'Accessibility audit failed for 3 AI tools',
          nextAction: 'Work with vendors on accessibility improvements',
          daysUntilDue: Math.ceil((new Date('2025-11-30').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 25,
          riskLevel: 'medium',
          impactArea: ['Student Accessibility', 'Federal Compliance', 'Civil Rights'],
          regulatoryFramework: ['Section 508', 'ADA', '29 USC 794d'],
          createdDate: '2025-06-01',
          updatedDate: '2025-08-20'
        },
        {
          id: 'title-ix-ai-bias',
          type: 'policy',
          title: 'Title IX Bias Assessment in AI Systems',
          description: 'Review AI tools for potential gender bias in educational recommendations and ensure Title IX compliance.',
          status: 'pending',
          priority: 'high',
          dueDate: '2025-12-01',
          assignedTo: 'Title IX Coordinator',
          department: 'Civil Rights & Compliance',
          lastAction: 'Policy framework drafted',
          nextAction: 'Begin bias testing with pilot group',
          daysUntilDue: Math.ceil((new Date('2025-12-01').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          riskLevel: 'medium',
          impactArea: ['Gender Equity', 'Educational Fairness', 'Civil Rights'],
          regulatoryFramework: ['Title IX', '20 USC 1681'],
          createdDate: '2025-08-10',
          updatedDate: '2025-08-25'
        },
        {
          id: 'idea-ai-accommodations',
          type: 'policy',
          title: 'IDEA Compliance - AI in Special Education',
          description: 'Establish protocols for using AI tools in IEP implementation while maintaining IDEA compliance.',
          status: 'review_needed',
          priority: 'high',
          dueDate: '2025-10-15',
          assignedTo: 'Director of Special Education',
          department: 'Special Education',
          lastAction: 'Draft policies under legal review',
          nextAction: 'Finalize IEP data privacy protocols',
          daysUntilDue: Math.ceil((new Date('2025-10-15').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 70,
          riskLevel: 'high',
          impactArea: ['Special Education', 'Student Rights', 'Legal Compliance'],
          regulatoryFramework: ['IDEA', '20 USC 1400'],
          createdDate: '2025-07-01',
          updatedDate: '2025-08-22'
        },
        {
          id: 'state-privacy-law',
          type: 'legal',
          title: 'State Student Data Privacy Law Compliance',
          description: 'Ensure AI tool usage complies with state-specific student data privacy laws and regulations.',
          status: 'pending',
          priority: 'medium',
          dueDate: '2025-11-01',
          assignedTo: 'Legal Counsel',
          department: 'Legal Affairs',
          lastAction: 'State law research completed',
          nextAction: 'Map AI tools to state requirements',
          daysUntilDue: Math.ceil((new Date('2025-11-01').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 30,
          riskLevel: 'medium',
          impactArea: ['State Compliance', 'Data Privacy', 'Regulatory Risk'],
          regulatoryFramework: ['State Privacy Laws', 'Student Data Protection Acts'],
          createdDate: '2025-08-05',
          updatedDate: '2025-08-25'
        }
      ]

      const higherEdItems: ComplianceItem[] = [
        {
          id: 'ferpa-research-2025',
          type: 'legal',
          title: 'FERPA Compliance - AI Research Data',
          description: 'Review FERPA compliance for AI systems processing student education records in research contexts.',
          status: 'pending',
          priority: 'critical',
          dueDate: '2025-09-30',
          assignedTo: 'Research Compliance Officer',
          department: 'Research & Compliance',
          lastAction: 'IRB consultation completed',
          nextAction: 'Draft AI research data handling protocols',
          daysUntilDue: Math.ceil((new Date('2025-09-30').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 40,
          riskLevel: 'high',
          impactArea: ['Student Privacy', 'Research Ethics', 'Federal Compliance'],
          regulatoryFramework: ['FERPA', '34 CFR 99'],
          createdDate: '2025-07-10',
          updatedDate: '2025-08-26'
        },
        {
          id: 'title-vi-ai-bias',
          type: 'audit',
          title: 'Title VI - AI Algorithmic Bias Assessment',
          description: 'Conduct bias assessment of AI systems for potential discrimination based on race, color, or national origin.',
          status: 'in_progress',
          priority: 'critical',
          dueDate: '2025-10-31',
          assignedTo: 'Diversity & Inclusion Office',
          department: 'Student Affairs',
          lastAction: 'Baseline bias metrics established',
          nextAction: 'Test admission and academic AI systems',
          daysUntilDue: Math.ceil((new Date('2025-10-31').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 35,
          riskLevel: 'high',
          impactArea: ['Civil Rights', 'Admissions', 'Academic Equity'],
          regulatoryFramework: ['Title VI', '42 USC 2000d'],
          createdDate: '2025-06-15',
          updatedDate: '2025-08-24'
        },
        {
          id: 'hipaa-health-ai',
          type: 'certification',
          title: 'HIPAA Compliance - Health Services AI',
          description: 'Ensure AI tools used in campus health services meet HIPAA privacy and security requirements.',
          status: 'flagged',
          priority: 'critical',
          dueDate: '2025-09-01',
          assignedTo: 'Campus Health Director',
          department: 'Health Services',
          lastAction: 'Privacy impact assessment revealed gaps',
          nextAction: 'Implement additional safeguards',
          daysUntilDue: Math.ceil((new Date('2025-09-01').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 65,
          riskLevel: 'high',
          impactArea: ['Health Privacy', 'HIPAA Compliance', 'Student Welfare'],
          regulatoryFramework: ['HIPAA', '45 CFR 160-164'],
          createdDate: '2025-05-01',
          updatedDate: '2025-08-20'
        },
        {
          id: 'title-ix-reporting-ai',
          type: 'policy',
          title: 'Title IX - AI in Incident Reporting',
          description: 'Develop protocols for AI-assisted Title IX incident reporting and investigation while ensuring compliance.',
          status: 'review_needed',
          priority: 'high',
          dueDate: '2025-11-15',
          assignedTo: 'Title IX Coordinator',
          department: 'Civil Rights Office',
          lastAction: 'Legal review of draft protocols',
          nextAction: 'Stakeholder feedback incorporation',
          daysUntilDue: Math.ceil((new Date('2025-11-15').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 75,
          riskLevel: 'high',
          impactArea: ['Title IX Compliance', 'Sexual Misconduct', 'Due Process'],
          regulatoryFramework: ['Title IX', '34 CFR 106'],
          createdDate: '2025-07-01',
          updatedDate: '2025-08-25'
        },
        {
          id: 'clery-act-ai-security',
          type: 'audit',
          title: 'Clery Act - AI Campus Security Systems',
          description: 'Ensure AI-enhanced campus security systems comply with Clery Act reporting and privacy requirements.',
          status: 'pending',
          priority: 'medium',
          dueDate: '2025-12-31',
          assignedTo: 'Campus Security Chief',
          department: 'Campus Safety',
          lastAction: 'Security system inventory completed',
          nextAction: 'Privacy impact assessment',
          daysUntilDue: Math.ceil((new Date('2025-12-31').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 20,
          riskLevel: 'medium',
          impactArea: ['Campus Safety', 'Crime Reporting', 'Privacy'],
          regulatoryFramework: ['Clery Act', '20 USC 1092'],
          createdDate: '2025-08-01',
          updatedDate: '2025-08-26'
        },
        {
          id: 'ada-accessibility-lms',
          type: 'certification',
          title: 'ADA Compliance - AI-Enhanced LMS',
          description: 'Verify learning management system AI features meet ADA accessibility requirements.',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2025-10-01',
          assignedTo: 'Disability Services Director',
          department: 'Student Accessibility',
          lastAction: 'Third-party accessibility audit initiated',
          nextAction: 'Review audit findings and remediation plan',
          daysUntilDue: Math.ceil((new Date('2025-10-01').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          completionPercentage: 50,
          riskLevel: 'medium',
          impactArea: ['Accessibility', 'Learning Equity', 'Civil Rights'],
          regulatoryFramework: ['ADA', '42 USC 12101', 'Section 504'],
          createdDate: '2025-06-01',
          updatedDate: '2025-08-25'
        }
      ]

      return isK12 ? k12Items : higherEdItems
    }

    setComplianceItems(generateRealComplianceItems())
    setLoading(false)
  }, [isK12])

  const metrics: ComplianceMetrics = {
    totalItems: complianceItems.length,
    overdue: complianceItems.filter(item => item.daysUntilDue < 0).length,
    dueSoon: complianceItems.filter(item => item.daysUntilDue >= 0 && item.daysUntilDue <= 30).length,
    inProgress: complianceItems.filter(item => item.status === 'in_progress').length,
    completed: complianceItems.filter(item => item.status === 'completed').length,
    highRiskItems: complianceItems.filter(item => item.riskLevel === 'high').length,
    criticalItems: complianceItems.filter(item => item.priority === 'critical').length,
    complianceScore: Math.round(
      ((complianceItems.filter(item => item.status === 'completed').length + 
        complianceItems.filter(item => item.status === 'in_progress' && item.completionPercentage && item.completionPercentage > 70).length) 
        / complianceItems.length) * 100
    )
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
      default:
        return 0
    }
  })

  const updateItemStatus = (itemId: string, newStatus: string, notes?: string) => {
    setComplianceItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            status: newStatus as any, 
            updatedDate: new Date().toISOString().split('T')[0],
            notes: notes || item.notes,
            completionPercentage: newStatus === 'completed' ? 100 : item.completionPercentage
          }
        : item
    ))
  }

  const generateDetailedReport = () => {
    const report = `
COMPLIANCE WATCHLIST DETAILED REPORT
Generated: ${new Date().toLocaleDateString()}
${institutionType}: ${institutionName}
Report Type: ${isK12 ? 'K-12 Education' : 'Higher Education'} Compliance

=== EXECUTIVE SUMMARY ===
Total Active Compliance Items: ${metrics.totalItems}
Critical Priority Items: ${metrics.criticalItems}
High Risk Items: ${metrics.highRiskItems}
Overdue Items: ${metrics.overdue}
Due Within 30 Days: ${metrics.dueSoon}
In Progress: ${metrics.inProgress}
Completed: ${metrics.completed}
Overall Compliance Score: ${metrics.complianceScore}%

=== CRITICAL ITEMS REQUIRING IMMEDIATE ATTENTION ===
${complianceItems.filter(item => item.priority === 'critical' || item.daysUntilDue < 0)
  .map(item => `
• ${item.title}
  Due: ${item.dueDate} (${item.daysUntilDue < 0 ? Math.abs(item.daysUntilDue) + ' days overdue' : item.daysUntilDue + ' days remaining'})
  Assigned: ${item.assignedTo}
  Status: ${item.status.toUpperCase()}
  Risk Level: ${item.riskLevel.toUpperCase()}
  Regulatory Framework: ${item.regulatoryFramework.join(', ')}
  Impact Areas: ${item.impactArea.join(', ')}
  Next Action: ${item.nextAction}
`).join('')}

=== REGULATORY FRAMEWORK BREAKDOWN ===
${isK12 ? 'K-12 SPECIFIC COMPLIANCE AREAS:' : 'HIGHER EDUCATION COMPLIANCE AREAS:'}
• FERPA (Family Educational Rights and Privacy Act)
• ${isK12 ? 'COPPA (Children\'s Online Privacy Protection Act)' : 'HIPAA (Health Insurance Portability and Accountability Act)'}
• Title VI (Civil Rights - Race, Color, National Origin)
• Title IX (Sex Discrimination in Education)
• Section 508/ADA (Accessibility Requirements)
• ${isK12 ? 'IDEA (Individuals with Disabilities Education Act)' : 'Clery Act (Campus Crime Reporting)'}
• State-Specific Privacy Laws

=== RECOMMENDED ACTIONS ===
${complianceItems.filter(item => item.daysUntilDue >= 0 && item.daysUntilDue <= 30 && item.status !== 'completed')
  .map(item => `
• ${item.title}
  Deadline: ${item.dueDate}
  Recommended Action: ${item.nextAction}
  Owner: ${item.assignedTo}
  Department: ${item.department}
`).join('')}

=== RISK MITIGATION PRIORITIES ===
High Risk Items: ${complianceItems.filter(item => item.riskLevel === 'high').length}
Medium Risk Items: ${complianceItems.filter(item => item.riskLevel === 'medium').length}
Low Risk Items: ${complianceItems.filter(item => item.riskLevel === 'low').length}

This report should be reviewed by senior leadership and shared with relevant department heads.
For questions, contact the Compliance Office or Legal Affairs.

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center" data-testid="compliance-watchlist-v2">
        <div>
          <h1 className="text-3xl font-bold">{isK12 ? 'K-12' : 'Higher Ed'} Compliance Watchlist</h1>
          <p className="text-muted-foreground">
            Monitor AI-related compliance for {isK12 ? 'school districts' : 'higher education institutions'} with federal regulations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ComplianceTutorialTrigger showNewBadge={true} variant="floating" />
          <Button onClick={generateDetailedReport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Detailed Report
          </Button>
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
                    <Input placeholder="Responsible person" />
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
            <div className="text-2xl font-bold text-red-600">{metrics.overdue}</div>
            <div className="text-sm text-red-700 font-medium">Overdue</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{metrics.dueSoon}</div>
            <div className="text-sm text-orange-700 font-medium">Due Soon</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{metrics.inProgress}</div>
            <div className="text-sm text-purple-700 font-medium">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{metrics.completed}</div>
            <div className="text-sm text-green-700 font-medium">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{metrics.criticalItems}</div>
            <div className="text-sm text-red-700 font-medium">Critical</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.complianceScore}%</div>
            <div className="text-sm text-blue-700 font-medium">Compliance Score</div>
            <Progress value={metrics.complianceScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
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
                <option value="urgent">Urgent (Critical + Due Soon)</option>
                <option value="overdue">Overdue</option>
                <option value="high-risk">High Risk</option>
                <option value="policy">Policies</option>
                <option value="legal">Legal</option>
                <option value="audit">Audits</option>
                <option value="certification">Certifications</option>
                <option value="training">Training</option>
                <option value="vendor">Vendors</option>
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
                <option value="risk">Risk Level</option>
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
          <Card key={item.id} className="border-l-4" style={{
            borderLeftColor: item.priority === 'critical' ? '#DC2626' : 
                           item.priority === 'high' ? '#EA580C' :
                           item.priority === 'medium' ? '#D97706' : '#16A34A'
          }}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
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
                    <Button size="sm" variant="outline" onClick={() => setSelectedItem(item)}>
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
                        <Select onValueChange={(value) => updateItemStatus(item.id, value)}>
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
    </div>
  )
}