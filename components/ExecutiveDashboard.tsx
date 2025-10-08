'use client'

// ExecutiveTutorialTrigger removed - using simplified tutorial system
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserContext } from '@/components/UserProvider'
import {
  AlertTriangle,
  Building,
  Clock,
  DollarSign,
  Download,
  Shield,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface ReadinessScore {
  domain: string
  score: number
  risk: 'low' | 'medium' | 'high'
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
}

interface CampusScore {
  name: string
  overallScore: number
  domains: ReadinessScore[]
  enrollment: number
  completedAssessments: number
  totalAssessments: number
}

interface AdoptionMetric {
  category: string
  completed: number
  total: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

interface ComplianceItem {
  type: 'policy' | 'vendor' | 'training'
  title: string
  status: 'pending' | 'flagged' | 'expired'
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  assignedTo: string
}

interface FundingOpportunity {
  program: string
  amount: string
  deadline: string
  eligibility: string[]
  aiCategories: string[]
  matchedRecommendations: number
}

export default function ExecutiveDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current')
  const [screenshotMode, setScreenshotMode] = useState(false)
  const { user, institution, loading } = useUserContext()

  // Use actual institution name or fallback to generic name
  const institutionName = institution?.name || 'Your Institution'
  const institutionType = institution?.org_type || 'Educational Institution'

  // Sample data - replace with actual API calls
  const readinessData: ReadinessScore[] = [
    { domain: 'Policy Governance', score: 78, risk: 'medium', trend: 'up', lastUpdated: '2025-08-25' },
    { domain: 'Data Privacy', score: 92, risk: 'low', trend: 'up', lastUpdated: '2025-08-25' },
    { domain: 'Vendor Management', score: 65, risk: 'high', trend: 'down', lastUpdated: '2025-08-24' },
    { domain: 'Staff Training', score: 84, risk: 'low', trend: 'stable', lastUpdated: '2025-08-25' },
    { domain: 'Infrastructure', score: 71, risk: 'medium', trend: 'up', lastUpdated: '2025-08-23' }
  ]

  const campusData: CampusScore[] = [
    {
      name: 'Lincoln Elementary',
      overallScore: 82,
      domains: readinessData,
      enrollment: 450,
      completedAssessments: 8,
      totalAssessments: 10
    },
    {
      name: 'Washington Middle',
      overallScore: 76,
      domains: readinessData.map(d => ({ ...d, score: d.score - 10 })),
      enrollment: 680,
      completedAssessments: 6,
      totalAssessments: 10
    },
    {
      name: 'Roosevelt High',
      overallScore: 89,
      domains: readinessData.map(d => ({ ...d, score: d.score + 5 })),
      enrollment: 1200,
      completedAssessments: 9,
      totalAssessments: 10
    }
  ]

  const adoptionMetrics: AdoptionMetric[] = [
    { category: 'Policies Approved', completed: 12, total: 15, percentage: 80, trend: 'up' },
    { category: 'Professional Development Completed', completed: 145, total: 180, percentage: 81, trend: 'up' },
    { category: 'Approved Tools in Use', completed: 8, total: 12, percentage: 67, trend: 'stable' },
    { category: 'Vendor Assessments Complete', completed: 23, total: 30, percentage: 77, trend: 'up' },
    { category: 'Board Presentations Delivered', completed: 3, total: 4, percentage: 75, trend: 'stable' }
  ]

  const complianceItems: ComplianceItem[] = [
    {
      type: 'policy',
      title: 'AI Acceptable Use Policy Update',
      status: 'pending',
      dueDate: '2025-09-15',
      priority: 'high',
      assignedTo: 'Legal Team'
    },
    {
      type: 'vendor',
      title: 'ChatGPT Plus License Renewal',
      status: 'flagged',
      dueDate: '2025-09-01',
      priority: 'high',
      assignedTo: 'IT Director'
    },
    {
      type: 'training',
      title: 'Elementary Teacher AI Training',
      status: 'pending',
      dueDate: '2025-10-01',
      priority: 'medium',
      assignedTo: 'PD Coordinator'
    },
    {
      type: 'vendor',
      title: 'Grammarly Education Contract',
      status: 'expired',
      dueDate: '2025-08-20',
      priority: 'high',
      assignedTo: 'Procurement'
    }
  ]

  const fundingOpportunities: FundingOpportunity[] = [
    {
      program: 'Title IV - Student Support & Academic Enrichment',
      amount: '$50,000 - $200,000',
      deadline: '2025-10-15',
      eligibility: ['Technology integration', 'Professional development', 'Student support'],
      aiCategories: ['AI literacy training', 'Educational technology', 'Teacher professional development'],
      matchedRecommendations: 8
    },
    {
      program: 'ESSER Funds (remaining allocation)',
      amount: '$75,000 - $300,000',
      deadline: '2025-09-30',
      eligibility: ['Learning recovery', 'Technology infrastructure', 'Staff development'],
      aiCategories: ['Personalized learning platforms', 'Assessment tools', 'Teacher training'],
      matchedRecommendations: 12
    },
    {
      program: 'State AI Education Initiative Grant',
      amount: '$25,000 - $100,000',
      deadline: '2025-11-01',
      eligibility: ['AI curriculum development', 'Ethics training', 'Infrastructure'],
      aiCategories: ['AI governance', 'Ethical AI training', 'Policy development'],
      matchedRecommendations: 6
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const generateScreenshot = (dashboardType: string) => {
    setScreenshotMode(true)
    // Add timestamp and district info for screenshots
    setTimeout(() => {
      window.print()
      setScreenshotMode(false)
    }, 100)
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className={`space-y-6 ${screenshotMode ? 'screenshot-mode' : ''}`} data-testid="executive-dashboard">
      {/* Header with Screenshot Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Executive AI Readiness Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()} • {institutionName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => generateScreenshot('readiness')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Screenshot for Meeting
          </Button>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="current">Current Status</option>
            <option value="30day">30-Day Trend</option>
            <option value="quarter">Quarterly View</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="readiness" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="readiness">Readiness & Risk</TabsTrigger>
          <TabsTrigger value="adoption">Adoption Metrics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Watch</TabsTrigger>
          <TabsTrigger value="funding">Funding Justification</TabsTrigger>
        </TabsList>

        {/* Readiness & Risk Scorecards */}
        <TabsContent value="readiness" className="space-y-6">
          {/* District Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                District AI Readiness Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">78</div>
                  <div className="text-sm text-muted-foreground">Overall Readiness Score</div>
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">12</div>
                  <div className="text-sm text-muted-foreground">Policies Approved</div>
                  <div className="text-xs text-green-600">↑ 3 this month</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">2,330</div>
                  <div className="text-sm text-muted-foreground">Students Covered</div>
                  <div className="text-xs text-blue-600">100% enrollment</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Readiness by Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {readinessData.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{domain.domain}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{domain.score}</span>
                          {domain.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {domain.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                          <Badge className={getRiskColor(domain.risk)}>
                            {domain.risk.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={domain.score} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Last updated: {domain.lastUpdated}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campus/School Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Campus/School Readiness Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {campusData.map((campus, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-lg">{campus.name}</h3>
                        <div className="text-3xl font-bold text-primary">{campus.overallScore}</div>
                        <div className="text-sm text-muted-foreground">
                          {campus.enrollment} students • {campus.completedAssessments}/{campus.totalAssessments} assessments
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={campus.domains}>
                          <XAxis dataKey="domain" hide />
                          <YAxis hide />
                          <Tooltip />
                          <Bar dataKey="score" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adoption Telemetry */}
        <TabsContent value="adoption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Adoption Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adoptionMetrics.map((metric, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{metric.category}</h3>
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                        {metric.trend === 'stable' && <Clock className="h-4 w-4 text-yellow-600" />}
                      </div>
                      <div className="text-2xl font-bold mb-1">{metric.percentage}%</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {metric.completed} of {metric.total} completed
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Adoption Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Adoption Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { month: 'Jun', policies: 65, training: 45, tools: 30 },
                  { month: 'Jul', policies: 72, training: 62, tools: 45 },
                  { month: 'Aug', policies: 80, training: 81, tools: 67 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="policies" stroke="#8884d8" name="Policies Approved" />
                  <Line type="monotone" dataKey="training" stroke="#82ca9d" name="Training Completed" />
                  <Line type="monotone" dataKey="tools" stroke="#ffc658" name="Tools in Use" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Watchlist */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance Watchlist - Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">
                          {item.type.toUpperCase()}
                        </Badge>
                        <h3 className="font-medium">{item.title}</h3>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due: {item.dueDate} • Assigned to: {item.assignedTo}
                      </div>
                    </div>
                    <div className="text-right">
                      {item.status === 'expired' && (
                        <Badge className="bg-red-100 text-red-800">EXPIRED</Badge>
                      )}
                      {item.status === 'flagged' && (
                        <Badge className="bg-orange-100 text-orange-800">FLAGGED</Badge>
                      )}
                      {item.status === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">4</div>
                <div className="text-sm text-muted-foreground">Items Requiring Immediate Action</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">7</div>
                <div className="text-sm text-muted-foreground">Vendor Renewals Due (30 days)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">23</div>
                <div className="text-sm text-muted-foreground">Completed This Month</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funding Justification */}
        <TabsContent value="funding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Federal Funding Opportunities for AI Initiatives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {fundingOpportunities.map((opportunity, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{opportunity.program}</h3>
                          <div className="text-2xl font-bold text-green-600">{opportunity.amount}</div>
                          <div className="text-sm text-muted-foreground">Deadline: {opportunity.deadline}</div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {opportunity.matchedRecommendations} Matched Recommendations
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Eligible Categories:</h4>
                          <div className="space-y-1">
                            {opportunity.eligibility.map((item, i) => (
                              <Badge key={i} variant="outline" className="mr-2">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">AI Initiative Alignment:</h4>
                          <div className="space-y-1">
                            {opportunity.aiCategories.map((category, i) => (
                              <Badge key={i} className="mr-2 bg-green-100 text-green-800">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Auto-Generated Grant Narrative (Boilerplate):</h4>
                        <p className="text-sm text-gray-700">
                          “{institutionName} requests funding under {opportunity.program} to implement
                          AI governance and educational technology initiatives that directly support {opportunity.eligibility[0]}
                          and {opportunity.eligibility[1]}. Our comprehensive AI readiness assessment has identified
                          {opportunity.matchedRecommendations} specific recommendations that align with federal guidance
                          on allowable uses of funds for artificial intelligence in education…”
                        </p>
                        <Button className="mt-2" variant="outline" size="sm">
                          Generate Full Narrative
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Funding Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Alignment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$425K</div>
                  <div className="text-sm text-muted-foreground">Total Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">26</div>
                  <div className="text-sm text-muted-foreground">Matched Recommendations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-sm text-muted-foreground">Active Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">89%</div>
                  <div className="text-sm text-muted-foreground">Eligibility Match</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx>{`
        @media print {
          .screenshot-mode {
            background: white !important;
          }
          .screenshot-mode * {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  )
}
