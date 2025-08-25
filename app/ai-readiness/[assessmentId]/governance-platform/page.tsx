'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import VendorVettingSystem from '@/components/VendorVettingSystem'
import { 
  Shield, 
  FileText, 
  BookOpen, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  BarChart3,
  Calendar,
  AlertTriangle,
  Download,
  Settings,
  Star
} from 'lucide-react'

interface AIGovernancePlatformProps {
  params: {
    assessmentId: string
  }
}

interface PlatformMetrics {
  documentsProcessed: number
  policiesGenerated: number
  toolsVetted: number
  complianceScore: number
  monthlyValue: number
  userSatisfaction: number
  timeToImplementation: number
  riskReduction: number
}

export default function AIGovernancePlatform({ params }: AIGovernancePlatformProps) {
  const router = useRouter()
  const { assessmentId } = params
  
  // Mock institution data - in real app this would come from assessment
  const institutionName = "Sample School District"
  const institutionType: 'K12' | 'HigherEd' = 'K12'
  const subscriptionTier = "Enterprise"
  const [activeModule, setActiveModule] = useState<'assessment' | 'policy' | 'vendor'>('assessment')
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>({
    documentsProcessed: 0,
    policiesGenerated: 0,
    toolsVetted: 0,
    complianceScore: 0,
    monthlyValue: 0,
    userSatisfaction: 0,
    timeToImplementation: 0,
    riskReduction: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlatformMetrics()
  }, [assessmentId])

  const loadPlatformMetrics = async () => {
    try {
      // In a real implementation, this would fetch actual metrics
      // For now, we'll simulate realistic metrics
      const mockMetrics: PlatformMetrics = {
        documentsProcessed: 47,
        policiesGenerated: 12,
        toolsVetted: 8,
        complianceScore: 94,
        monthlyValue: 2850,
        userSatisfaction: 4.7,
        timeToImplementation: 72, // hours saved
        riskReduction: 87 // percentage
      }
      
      setPlatformMetrics(mockMetrics)
    } catch (error) {
      console.error('Error loading platform metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateROI = () => {
    const monthlyCost = 995
    const timeValue = platformMetrics.timeToImplementation * 75 // $75/hour value
    const riskMitigation = platformMetrics.riskReduction * 50 // $50 per risk point
    const totalValue = platformMetrics.monthlyValue + timeValue + riskMitigation
    return ((totalValue - monthlyCost) / monthlyCost * 100).toFixed(0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold">Loading AI Governance Platform...</h2>
          <p className="text-gray-600">Initializing your turn-key AI governance system</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Platform Header */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Governance Platform</h1>
              <p className="text-blue-100 text-lg">
                Turn-key AI governance + implementation program for {institutionName}
              </p>
              <div className="flex items-center gap-6 mt-4">
                <Badge className="bg-white text-blue-900 text-sm px-3 py-1">
                  {subscriptionTier} Plan - $995/month
                </Badge>
                <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                  ROI: {calculateROI()}%
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
                  ⭐ {platformMetrics.userSatisfaction}/5.0
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">${platformMetrics.monthlyValue.toLocaleString()}</div>
              <div className="text-blue-100">Monthly Value Delivered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Metrics Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics.documentsProcessed}</div>
              <p className="text-xs text-muted-foreground">
                +23 this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Policies Generated</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics.policiesGenerated}</div>
              <p className="text-xs text-muted-foreground">
                +4 this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tools Vetted</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics.toolsVetted}</div>
              <p className="text-xs text-muted-foreground">
                +3 this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics.complianceScore}%</div>
              <p className="text-xs text-muted-foreground">
                +12% this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Value Justification */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              $995/Month Value Justification
            </CardTitle>
            <CardDescription>
              Comprehensive AI governance delivering measurable monthly value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">${platformMetrics.monthlyValue}</div>
                <div className="text-sm text-gray-600">Direct Value Delivered</div>
                <div className="text-xs text-gray-500 mt-1">
                  Assessment + Policy + Vendor services
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{platformMetrics.timeToImplementation}h</div>
                <div className="text-sm text-gray-600">Time Saved Monthly</div>
                <div className="text-xs text-gray-500 mt-1">
                  Equivalent to ${(platformMetrics.timeToImplementation * 75).toLocaleString()} in consulting
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{platformMetrics.riskReduction}%</div>
                <div className="text-sm text-gray-600">Risk Reduction</div>
                <div className="text-xs text-gray-500 mt-1">
                  Compliance violations prevented
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                Total Monthly ROI: {calculateROI()}% • Payback in &lt;30 days
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Three Core Modules */}
        <Tabs value={activeModule} onValueChange={(value) => setActiveModule(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Assessment 2.0
              <Badge className="ml-2 bg-blue-100 text-blue-800">Document-In Policy-Out</Badge>
            </TabsTrigger>
            <TabsTrigger value="policy" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Policy Pack Library
              <Badge className="ml-2 bg-green-100 text-green-800">Monthly Redlines</Badge>
            </TabsTrigger>
            <TabsTrigger value="vendor" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Vendor Vetting
              <Badge className="ml-2 bg-purple-100 text-purple-800">Tool Approvals</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assessment 2.0: Document-In Policy-Out
                </CardTitle>
                <CardDescription>
                  Patent-pending document processing with automated policy generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{platformMetrics.documentsProcessed}</div>
                    <div className="text-sm text-gray-600">Documents Processed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">18min</div>
                    <div className="text-sm text-gray-600">Avg Processing Time</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">97%</div>
                    <div className="text-sm text-gray-600">PII Detection Accuracy</div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment 2.0 Module</h3>
                  <p className="text-gray-600 mb-4">
                    Document processing pipeline with PII detection and policy generation
                  </p>
                  <Button>
                    Upload Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Policy Pack Library: Monthly Redlines
                </CardTitle>
                <CardDescription>
                  Maintained policy templates anchored to external authorities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{platformMetrics.policiesGenerated}</div>
                    <div className="text-sm text-gray-600">Active Policies</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">15</div>
                    <div className="text-sm text-gray-600">External Sources</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">23</div>
                    <div className="text-sm text-gray-600">Redlines This Month</div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Policy Pack Library</h3>
                  <p className="text-gray-600 mb-4">
                    Maintained policy templates with monthly redlines from external authorities
                  </p>
                  <Button>
                    Browse Policy Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Vendor Vetting & Tool Approval System
                </CardTitle>
                <CardDescription>
                  Automated compliance screening with board-ready decision briefs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{platformMetrics.toolsVetted}</div>
                    <div className="text-sm text-gray-600">Tools Approved</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">24h</div>
                    <div className="text-sm text-gray-600">Avg Review Time</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">100%</div>
                    <div className="text-sm text-gray-600">COPPA/FERPA Screening</div>
                  </div>
                </div>
                <VendorVettingSystem 
                  assessmentId={assessmentId}
                  institutionType={institutionType}
                  institutionName={institutionName}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Integration Success Stories */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Platform Integration Success
            </CardTitle>
            <CardDescription>
              How the three modules work together to deliver comprehensive AI governance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium mb-2">Assessment 2.0</h3>
                  <p className="text-sm text-gray-600">
                    Processes district documents to generate custom AI policies automatically
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium mb-2">Policy Pack Library</h3>
                  <p className="text-sm text-gray-600">
                    Maintains policies with monthly updates from NIST, ED, FTC sources
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium mb-2">Vendor Vetting</h3>
                  <p className="text-sm text-gray-600">
                    Screens AI tools against generated policies for compliance approvals
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button onClick={() => router.push('/enterprise')}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Platform Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Retention Value */}
        <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Monthly Subscription Value Validation
            </CardTitle>
            <CardDescription>
              Concrete deliverables justifying $995/month investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Document Processing & Policy Generation</span>
                </div>
                <Badge className="bg-green-100 text-green-800">$350/month value</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Policy Library Maintenance & Redlines</span>
                </div>
                <Badge className="bg-green-100 text-green-800">$250/month value</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Vendor Vetting & Compliance Screening</span>
                </div>
                <Badge className="bg-green-100 text-green-800">$395/month value</Badge>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="font-bold">Total Monthly Value Delivered</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                    ${platformMetrics.monthlyValue}/month
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
