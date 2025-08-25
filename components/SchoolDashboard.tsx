'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { 
  Download, 
  Building, 
  Users, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

interface SchoolDashboardProps {
  schoolName: string
  principalName: string
  enrollment: number
  grade_levels: string
}

export default function SchoolDashboard({ 
  schoolName = "Lincoln Elementary", 
  principalName = "Dr. Sarah Johnson",
  enrollment = 450,
  grade_levels = "K-5"
}: SchoolDashboardProps) {
  const [screenshotMode, setScreenshotMode] = useState(false)

  // School-specific data
  const schoolReadiness = {
    overallScore: 82,
    domains: [
      { name: 'Policy Compliance', score: 85, status: 'good' },
      { name: 'Teacher Training', score: 78, status: 'needs_attention' },
      { name: 'Student Safety', score: 92, status: 'excellent' },
      { name: 'Technology Integration', score: 74, status: 'needs_attention' },
      { name: 'Data Privacy', score: 88, status: 'good' }
    ]
  }

  const teacherProgress = [
    { department: 'Kindergarten', completed: 5, total: 6, percentage: 83 },
    { department: '1st Grade', completed: 4, total: 5, percentage: 80 },
    { department: '2nd Grade', completed: 6, total: 6, percentage: 100 },
    { department: '3rd Grade', completed: 3, total: 5, percentage: 60 },
    { department: '4th Grade', completed: 4, total: 4, percentage: 100 },
    { department: '5th Grade', completed: 5, total: 6, percentage: 83 },
    { department: 'Specialists', completed: 8, total: 10, percentage: 80 }
  ]

  const aiToolsUsage = [
    { tool: 'Grammarly Education', users: 28, total: 32, percentage: 88, status: 'approved' },
    { tool: 'Khan Academy AI Tutor', users: 15, total: 32, percentage: 47, status: 'pilot' },
    { tool: 'Microsoft Copilot', users: 12, total: 32, percentage: 38, status: 'approved' },
    { tool: 'Canva AI Features', users: 22, total: 32, percentage: 69, status: 'approved' }
  ]

  const upcomingActions = [
    {
      title: 'K-2 Teacher AI Training Session',
      date: '2025-09-05',
      priority: 'high',
      attendees: 11,
      status: 'scheduled'
    },
    {
      title: 'Parent AI Information Night',
      date: '2025-09-12',
      priority: 'medium',
      attendees: 45,
      status: 'planning'
    },
    {
      title: 'AI Policy Review - Grade Level Teams',
      date: '2025-09-18',
      priority: 'high',
      attendees: 32,
      status: 'pending'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const generateScreenshot = () => {
    setScreenshotMode(true)
    setTimeout(() => {
      window.print()
      setScreenshotMode(false)
    }, 100)
  }

  return (
    <div className={`space-y-6 ${screenshotMode ? 'screenshot-mode' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{schoolName} - AI Readiness Dashboard</h1>
          <p className="text-muted-foreground">
            Principal: {principalName} • {enrollment} students • Grades {grade_levels} • Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={generateScreenshot}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Screenshot for Meeting
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{schoolReadiness.overallScore}</div>
            <div className="text-sm text-muted-foreground">Overall AI Readiness</div>
            <Badge className="mt-2 bg-blue-100 text-blue-800">On Track</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {teacherProgress.reduce((sum, dept) => sum + dept.completed, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Teachers Trained</div>
            <div className="text-xs text-green-600">
              of {teacherProgress.reduce((sum, dept) => sum + dept.total, 0)} total
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{aiToolsUsage.length}</div>
            <div className="text-sm text-muted-foreground">Approved AI Tools</div>
            <div className="text-xs text-blue-600">Active in classrooms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{upcomingActions.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming Actions</div>
            <div className="text-xs text-orange-600">Next 30 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Readiness by Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            School Readiness by Domain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schoolReadiness.domains.map((domain, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{domain.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{domain.score}</span>
                      <Badge className={getStatusColor(domain.status)}>
                        {domain.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={domain.score} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Training Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teacher Training Progress by Grade Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teacherProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip formatter={(value, name) => [value, 'Teachers Trained']} />
              <Bar dataKey="completed" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teacherProgress.map((dept, index) => (
              <div key={index} className="text-center">
                <div className="font-medium text-sm">{dept.department}</div>
                <div className="text-lg font-bold">{dept.completed}/{dept.total}</div>
                <div className="text-sm text-muted-foreground">{dept.percentage}% complete</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Tools Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            AI Tools Adoption in Classrooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiToolsUsage.map((tool, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{tool.tool}</h3>
                    <Badge variant={tool.status === 'approved' ? 'default' : 'secondary'}>
                      {tool.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={tool.percentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{tool.users}/{tool.total} teachers</span>
                    <span className="text-sm text-muted-foreground">{tool.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Upcoming Actions & Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{action.title}</h3>
                    <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'}>
                      {action.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Date: {action.date} • Expected attendance: {action.attendees}
                  </div>
                </div>
                <div className="text-right">
                  {action.status === 'scheduled' && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      SCHEDULED
                    </Badge>
                  )}
                  {action.status === 'planning' && (
                    <Badge className="bg-yellow-100 text-yellow-800">PLANNING</Badge>
                  )}
                  {action.status === 'pending' && (
                    <Badge className="bg-orange-100 text-orange-800">PENDING</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions for Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <Users className="h-4 w-4" />
              Schedule Teacher Training
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-12">
              <BookOpen className="h-4 w-4" />
              Review Tool Requests
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-12">
              <TrendingUp className="h-4 w-4" />
              View District Comparison
            </Button>
          </div>
        </CardContent>
      </Card>

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
