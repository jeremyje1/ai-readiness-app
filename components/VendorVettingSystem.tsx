'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Shield, 
  FileText, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download,
  Users,
  BookOpen,
  Eye,
  Filter
} from 'lucide-react'

interface VendorVettingProps {
  assessmentId: string
  institutionType: 'K12' | 'HigherEd'
  institutionName: string
}

interface ApprovedTool {
  id: string
  toolName: string
  vendorName: string
  description: string
  category: string
  approvedRoles: string[]
  approvedSubjects: string[]
  approvedGradeLevels: string[]
  usageRestrictions: string[]
  lastComplianceReview: string
  complianceStatus: string
  activeUsers: number
}

interface IntakeFormData {
  submittedBy: string
  toolName: string
  vendorName: string
  toolDescription: string
  requestedUseCase: string
  requestingDepartment: string
  targetUsers: string[]
  minAge: number
  maxAge: number
  gradeLevel: string[]
  subjectAreas: string[]
  websiteUrl: string
  hostingLocation: string
  dataCenter: string
  modelProvider: string
  apiIntegrations: string[]
  dataCollected: string[]
  dataSharing: boolean
  dataRetention: string
  trainingOnUserData: boolean
  optOutAvailable: boolean
  ageGateImplemented: boolean
  parentalConsentRequired: boolean
  pricingModel: string
  estimatedCost: number
  contractLength: string
  trialAvailable: boolean
  assignedReviewer: string
}

const riskColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
  Critical: 'bg-red-200 text-red-900'
}

const statusColors = {
  Compliant: 'bg-green-100 text-green-800',
  'Minor Issues': 'bg-yellow-100 text-yellow-800',
  'Major Issues': 'bg-orange-100 text-orange-800',
  'Non-Compliant': 'bg-red-100 text-red-800'
}

export default function VendorVettingSystem({ assessmentId, institutionType, institutionName }: VendorVettingProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'submit' | 'status'>('catalog')
  const [approvedTools, setApprovedTools] = useState<ApprovedTool[]>([])
  const [filteredTools, setFilteredTools] = useState<ApprovedTool[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form data for intake submission
  const [formData, setFormData] = useState<Partial<IntakeFormData>>({
    submittedBy: '',
    toolName: '',
    vendorName: '',
    toolDescription: '',
    requestedUseCase: '',
    requestingDepartment: '',
    targetUsers: [],
    minAge: 13,
    maxAge: 18,
    gradeLevel: [],
    subjectAreas: [],
    websiteUrl: '',
    hostingLocation: 'United States',
    dataCenter: 'United States',
    modelProvider: 'Unknown',
    apiIntegrations: [],
    dataCollected: [],
    dataSharing: false,
    dataRetention: '1 year',
    trainingOnUserData: false,
    optOutAvailable: false,
    ageGateImplemented: false,
    parentalConsentRequired: false,
    pricingModel: 'Subscription',
    estimatedCost: 0,
    contractLength: '1 year',
    trialAvailable: false,
    assignedReviewer: 'Privacy Officer'
  })

  useEffect(() => {
    loadApprovedTools()
  }, [])

  useEffect(() => {
    filterTools()
  }, [approvedTools, searchTerm, selectedRole, selectedSubject, selectedGrade])

  const loadApprovedTools = async () => {
    try {
      const response = await fetch('/api/vendor-vetting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'searchApprovedTools' })
      })
      const data = await response.json()
      
      if (data.success) {
        // Mock data for demonstration
        const mockTools: ApprovedTool[] = [
          {
            id: 'tool-1',
            toolName: 'ChatGPT for Education',
            vendorName: 'OpenAI',
            description: 'AI-powered writing and research assistant with educational safeguards',
            category: 'Content Creation',
            approvedRoles: ['Teachers', 'Students'],
            approvedSubjects: ['English', 'History', 'Science'],
            approvedGradeLevels: ['9-12'],
            usageRestrictions: ['No assessment completion', 'Disclosure required'],
            lastComplianceReview: '2024-08-01',
            complianceStatus: 'Compliant',
            activeUsers: 156
          },
          {
            id: 'tool-2',
            toolName: 'Khan Academy AI Tutor',
            vendorName: 'Khan Academy',
            description: 'Personalized tutoring and learning assistance',
            category: 'Tutoring & Support',
            approvedRoles: ['Students', 'Teachers'],
            approvedSubjects: ['Math', 'Science'],
            approvedGradeLevels: ['K-12'],
            usageRestrictions: ['Supervised use only'],
            lastComplianceReview: '2024-07-15',
            complianceStatus: 'Compliant',
            activeUsers: 89
          },
          {
            id: 'tool-3',
            toolName: 'Grammarly Education',
            vendorName: 'Grammarly',
            description: 'Writing enhancement and grammar checking tool',
            category: 'Content Creation',
            approvedRoles: ['Teachers', 'Students'],
            approvedSubjects: ['English', 'Writing'],
            approvedGradeLevels: ['6-12'],
            usageRestrictions: ['No sensitive document processing'],
            lastComplianceReview: '2024-08-10',
            complianceStatus: 'Minor Issues',
            activeUsers: 234
          }
        ]
        setApprovedTools(mockTools)
      }
    } catch (error) {
      console.error('Error loading approved tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTools = () => {
    let filtered = approvedTools

    if (searchTerm) {
      filtered = filtered.filter(tool =>
        tool.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedRole) {
      filtered = filtered.filter(tool => tool.approvedRoles.includes(selectedRole))
    }

    if (selectedSubject) {
      filtered = filtered.filter(tool => tool.approvedSubjects.includes(selectedSubject))
    }

    if (selectedGrade) {
      filtered = filtered.filter(tool => tool.approvedGradeLevels.some(grade => grade.includes(selectedGrade)))
    }

    setFilteredTools(filtered)
  }

  const submitIntakeForm = async () => {
    if (!formData.toolName || !formData.vendorName || !formData.submittedBy) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/vendor-vetting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitIntakeForm',
          ...formData
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Intake form submitted successfully! You will receive an email with the risk assessment results within 24 hours.')
        setActiveTab('status')
        // Reset form
        setFormData({})
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error submitting intake form:', error)
      alert('Error submitting intake form')
    } finally {
      setSubmitting(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Vendor Vetting System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Vendor Vetting & Tool Approval</h1>
        <p className="text-green-100">
          System of record for GenAI tool approvals • Automated compliance screening • Board-ready decisions
        </p>
        <div className="flex gap-4 mt-4">
          <Badge className="bg-white text-green-600">
            🛡️ COPPA/FERPA/PPRA Screening
          </Badge>
          <Badge className="bg-white text-blue-600">
            📋 Board Decision Briefs
          </Badge>
          <Badge className="bg-white text-purple-600">
            📚 Approved Tool Catalog
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'catalog' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Search className="h-4 w-4" />
          Approved Tool Catalog
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'submit' ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          Submit New Tool
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'status' ? 'bg-white shadow text-purple-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="h-4 w-4" />
          Review Status
        </button>
      </div>

      {/* Approved Tool Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Approved Tools
              </CardTitle>
              <CardDescription>
                Find AI tools that have been vetted and approved for use in {institutionName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Tools</Label>
                  <Input
                    id="search"
                    placeholder="Tool name or vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Filter by Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All roles</SelectItem>
                      <SelectItem value="Teachers">Teachers</SelectItem>
                      <SelectItem value="Students">Students</SelectItem>
                      <SelectItem value="Administrators">Administrators</SelectItem>
                      <SelectItem value="Parents">Parents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Filter by Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All subjects</SelectItem>
                      <SelectItem value="Math">Math</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="grade">Filter by Grade</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="All grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All grades</SelectItem>
                      <SelectItem value="K">Kindergarten</SelectItem>
                      <SelectItem value="1">Grade 1</SelectItem>
                      <SelectItem value="6">Grade 6</SelectItem>
                      <SelectItem value="9">Grade 9</SelectItem>
                      <SelectItem value="12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approved Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tool.toolName}</CardTitle>
                      <CardDescription>{tool.vendorName}</CardDescription>
                    </div>
                    <Badge className={statusColors[tool.complianceStatus as keyof typeof statusColors]}>
                      {tool.complianceStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{tool.description}</p>
                  
                  <div>
                    <span className="text-sm font-medium">Approved for:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.approvedRoles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Subjects:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.approvedSubjects.map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Grade Levels:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.approvedGradeLevels.map((grade) => (
                        <Badge key={grade} variant="outline" className="text-xs">
                          {grade}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Users: {tool.activeUsers}</span>
                    <span className="text-gray-600">
                      Last Review: {new Date(tool.lastComplianceReview).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{tool.toolName} - Usage Guidelines</DialogTitle>
                          <DialogDescription>
                            Approved usage guidelines and restrictions for {tool.vendorName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Usage Restrictions:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {tool.usageRestrictions.map((restriction, index) => (
                                <li key={index} className="text-gray-600">{restriction}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Compliance Status:</h4>
                            <Badge className={statusColors[tool.complianceStatus as keyof typeof statusColors]}>
                              {tool.complianceStatus}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Usage Guide
                            </Button>
                            <Button variant="outline" size="sm">
                              Training Materials
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or submit a new tool request.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Submit New Tool Tab */}
      {activeTab === 'submit' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                AI Tool Intake Form
              </CardTitle>
              <CardDescription>
                Submit a new AI tool for automated compliance screening and board review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="submittedBy">Submitted By *</Label>
                    <Input
                      id="submittedBy"
                      value={formData.submittedBy || ''}
                      onChange={(e) => updateFormData('submittedBy', e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requestingDepartment">Department *</Label>
                    <Select
                      value={formData.requestingDepartment || ''}
                      onValueChange={(value) => updateFormData('requestingDepartment', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Curriculum">Curriculum</SelectItem>
                        <SelectItem value="English">English Department</SelectItem>
                        <SelectItem value="Math">Math Department</SelectItem>
                        <SelectItem value="Science">Science Department</SelectItem>
                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                        <SelectItem value="Special Education">Special Education</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="toolName">Tool Name *</Label>
                    <Input
                      id="toolName"
                      value={formData.toolName || ''}
                      onChange={(e) => updateFormData('toolName', e.target.value)}
                      placeholder="e.g., ChatGPT, Grammarly, Khan Academy AI"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendorName">Vendor Name *</Label>
                    <Input
                      id="vendorName"
                      value={formData.vendorName || ''}
                      onChange={(e) => updateFormData('vendorName', e.target.value)}
                      placeholder="e.g., OpenAI, Google, Microsoft"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="toolDescription">Tool Description</Label>
                  <Textarea
                    id="toolDescription"
                    value={formData.toolDescription || ''}
                    onChange={(e) => updateFormData('toolDescription', e.target.value)}
                    placeholder="Describe what the tool does and its key features"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="requestedUseCase">Requested Use Case</Label>
                  <Textarea
                    id="requestedUseCase"
                    value={formData.requestedUseCase || ''}
                    onChange={(e) => updateFormData('requestedUseCase', e.target.value)}
                    placeholder="How do you plan to use this tool? What educational goals will it support?"
                    rows={3}
                  />
                </div>
              </div>

              {/* Usage Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Usage Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAge">Minimum Age</Label>
                    <Input
                      id="minAge"
                      type="number"
                      value={formData.minAge || ''}
                      onChange={(e) => updateFormData('minAge', parseInt(e.target.value))}
                      placeholder="13"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAge">Maximum Age</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      value={formData.maxAge || ''}
                      onChange={(e) => updateFormData('maxAge', parseInt(e.target.value))}
                      placeholder="18"
                    />
                  </div>
                </div>
                <div>
                  <Label>Target Users</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['Teachers', 'Students', 'Administrators', 'Parents'].map((user) => (
                      <div key={user} className="flex items-center space-x-2">
                        <Checkbox
                          id={user}
                          checked={formData.targetUsers?.includes(user) || false}
                          onCheckedChange={(checked) => {
                            const current = formData.targetUsers || []
                            if (checked) {
                              updateFormData('targetUsers', [...current, user])
                            } else {
                              updateFormData('targetUsers', current.filter(u => u !== user))
                            }
                          }}
                        />
                        <Label htmlFor={user}>{user}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Technical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      value={formData.websiteUrl || ''}
                      onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="hostingLocation">Hosting Location</Label>
                    <Select
                      value={formData.hostingLocation || ''}
                      onValueChange={(value) => updateFormData('hostingLocation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="European Union">European Union</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Data Handling */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Data Handling & Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dataSharing"
                      checked={formData.dataSharing || false}
                      onCheckedChange={(checked) => updateFormData('dataSharing', checked)}
                    />
                    <Label htmlFor="dataSharing">Tool shares data with third parties</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trainingOnUserData"
                      checked={formData.trainingOnUserData || false}
                      onCheckedChange={(checked) => updateFormData('trainingOnUserData', checked)}
                    />
                    <Label htmlFor="trainingOnUserData">User data is used for AI model training</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="optOutAvailable"
                      checked={formData.optOutAvailable || false}
                      onCheckedChange={(checked) => updateFormData('optOutAvailable', checked)}
                    />
                    <Label htmlFor="optOutAvailable">Users can opt-out of data collection</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ageGateImplemented"
                      checked={formData.ageGateImplemented || false}
                      onCheckedChange={(checked) => updateFormData('ageGateImplemented', checked)}
                    />
                    <Label htmlFor="ageGateImplemented">Age verification is implemented</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parentalConsentRequired"
                      checked={formData.parentalConsentRequired || false}
                      onCheckedChange={(checked) => updateFormData('parentalConsentRequired', checked)}
                    />
                    <Label htmlFor="parentalConsentRequired">Parental consent is required</Label>
                  </div>
                </div>
              </div>

              {/* Cost Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Cost Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedCost">Estimated Annual Cost ($)</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      value={formData.estimatedCost || ''}
                      onChange={(e) => updateFormData('estimatedCost', parseFloat(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contractLength">Contract Length</Label>
                    <Select
                      value={formData.contractLength || ''}
                      onValueChange={(value) => updateFormData('contractLength', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="1 year">1 year</SelectItem>
                        <SelectItem value="2 years">2 years</SelectItem>
                        <SelectItem value="3 years">3 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button variant="outline" onClick={() => setFormData({})}>
                  Clear Form
                </Button>
                <Button onClick={submitIntakeForm} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Status Tab */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Review Status Dashboard
              </CardTitle>
              <CardDescription>
                Track the status of submitted AI tool reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Sample pending review */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">ChatGPT for Education</h3>
                    <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Submitted:</span> Aug 20, 2024
                    </div>
                    <div>
                      <span className="font-medium">Reviewer:</span> Privacy Officer
                    </div>
                    <div>
                      <span className="font-medium">Est. Completion:</span> Aug 27, 2024
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: Risk assessment completed. Generating board decision brief.
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Progress
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Brief
                    </Button>
                  </div>
                </div>

                {/* Sample approved tool */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Khan Academy AI Tutor</h3>
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Approved:</span> Aug 15, 2024
                    </div>
                    <div>
                      <span className="font-medium">Risk Score:</span> 25/100 (Low)
                    </div>
                    <div>
                      <span className="font-medium">Active Users:</span> 89
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Approved with standard monitoring. Training materials available.
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Usage Guidelines
                    </Button>
                    <Button size="sm" variant="outline">
                      Training Materials
                    </Button>
                  </div>
                </div>

                {/* Sample rejected tool */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Generic AI Writer</h3>
                    <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Reviewed:</span> Aug 18, 2024
                    </div>
                    <div>
                      <span className="font-medium">Risk Score:</span> 85/100 (High)
                    </div>
                    <div>
                      <span className="font-medium">Primary Issue:</span> COPPA Violations
                    </div>
                  </div>
                  <div className="text-sm text-red-600">
                    Rejected due to inadequate privacy protections for under-13 users.
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Decision Brief
                    </Button>
                    <Button size="sm" variant="outline">
                      Alternative Recommendations
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Value Proposition */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Monthly Vendor Vetting Value</CardTitle>
          <CardDescription>
            Automated compliance screening and decision support for AI tool approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">Automated Screening</h4>
                <p className="text-sm text-gray-600">COPPA/FERPA/PPRA compliance checks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">Board-Ready Briefs</h4>
                <p className="text-sm text-gray-600">One-page decision summaries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Search className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Approved Tool Catalog</h4>
                <p className="text-sm text-gray-600">Searchable by role and subject</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
