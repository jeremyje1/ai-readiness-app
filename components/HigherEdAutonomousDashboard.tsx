'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Users, GraduationCap, Building2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface HigherEdDashboardProps {
  institutionId: string;
}

interface ImplementationPhase {
  phaseNumber: number;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  duration: string;
  deliverables: string[];
  automatedTasks: any[];
}

interface Institution {
  id: string;
  name: string;
  type: string;
  size: string;
  studentCount: number;
  facultyCount: number;
  subscriptionTier: string;
  progressOverall: number;
  currentPhase: number;
  implementationPhases: ImplementationPhase[];
}

interface DashboardData {
  institution: Institution;
  summary: {
    totalPhases: number;
    completedPhases: number;
    inProgressPhases: number;
    overallProgress: number;
    estimatedCompletion: string;
    nextMilestone: {
      phase: string;
      milestone: string;
      date: string;
    } | null;
  };
  phases: ImplementationPhase[];
  recentActivity: Array<{
    date: string;
    activity: string;
    type: string;
  }>;
  upcomingTasks: Array<{
    task: string;
    dueDate: string;
    priority: string;
  }>;
}

export default function HigherEdAutonomousDashboard({ institutionId }: HigherEdDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingDocument, setGeneratingDocument] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [institutionId]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/highered-implementation?institutionId=${institutionId}&action=dashboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async (documentType: string) => {
    setGeneratingDocument(documentType);
    try {
      const response = await fetch('/api/highered-implementation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-document',
          institutionId,
          documentType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const result = await response.json();
      // Handle successful document generation
      alert(`${documentType} generated successfully!`);
    } catch (err) {
      alert(`Failed to generate ${documentType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGeneratingDocument(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatInstitutionType = (type: string) => {
    switch (type) {
      case 'community_college':
        return 'Community College';
      case 'university':
        return 'University';
      case 'private_college':
        return 'Private College';
      case 'research_university':
        return 'Research University';
      default:
        return 'Higher Education Institution';
    }
  };

  const documentTypes = [
    { id: 'institutional-assessment', name: 'Institutional Assessment Report', icon: Building2 },
    { id: 'faculty-development', name: 'Faculty Development Plan', icon: Users },
    { id: 'department-analysis', name: 'Academic Department Analysis', icon: GraduationCap },
    { id: 'ai-strategy', name: 'AI Strategy Document', icon: FileText },
    { id: 'ai-policies', name: 'Academic AI Policies', icon: FileText },
    { id: 'ferpa-compliance', name: 'FERPA Compliance Framework', icon: FileText },
    { id: 'budget-plan', name: 'Budget & Resource Plan', icon: FileText },
    { id: 'faculty-training', name: 'Faculty Training Curriculum', icon: Users },
    { id: 'integration-guide', name: 'Platform Integration Guide', icon: FileText },
    { id: 'deployment-report', name: 'Campus Deployment Report', icon: FileText },
    { id: 'research-enhancement', name: 'Research Enhancement Report', icon: GraduationCap }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading dashboard: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No dashboard data available.
        </AlertDescription>
      </Alert>
    );
  }

  if (!loading && dashboardData === null && !error) {
    return (
      <div className="p-8 bg-white rounded-lg border border-dashed border-gray-300 text-center">
        <h2 className="text-xl font-semibold mb-4">No Implementation Data Yet</h2>
        <p className="text-gray-600 mb-4">Your implementation workspace has been created (ID: {institutionId}) but no details have been added.</p>
        <p className="text-gray-500 text-sm">Complete the onboarding form to populate phases and begin tracking progress.</p>
      </div>
    )
  }

  const { institution, summary, phases, recentActivity, upcomingTasks } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{institution.name}</h1>
            <p className="text-indigo-100 mt-1">
              {formatInstitutionType(institution.type)} • {institution.studentCount.toLocaleString()} Students • {institution.facultyCount.toLocaleString()} Faculty
            </p>
            <Badge className="mt-2 bg-white/20 text-white">
              {institution.subscriptionTier.charAt(0).toUpperCase() + institution.subscriptionTier.slice(1)} Plan
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{Math.round(summary.overallProgress)}%</div>
            <div className="text-indigo-100">Overall Progress</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Phases</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPhases}</div>
            <p className="text-xs text-muted-foreground">
              Implementation phases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completedPhases}</div>
            <p className="text-xs text-muted-foreground">
              Phases completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.inProgressPhases}</div>
            <p className="text-xs text-muted-foreground">
              Active phases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Completion</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(summary.estimatedCompletion).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Target completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Progress</CardTitle>
          <CardDescription>
            Overall progress across all implementation phases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(summary.overallProgress)}%</span>
            </div>
            <Progress value={summary.overallProgress} className="h-3" />
            {summary.nextMilestone && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Next Milestone</h4>
                <p className="text-blue-700">{summary.nextMilestone.milestone}</p>
                <p className="text-sm text-blue-600 mt-1">
                  Due: {new Date(summary.nextMilestone.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="phases" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phases">Implementation Phases</TabsTrigger>
          <TabsTrigger value="documents">Documents & Reports</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="tasks">Upcoming Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid gap-6">
            {phases.map((phase) => (
              <Card key={phase.phaseNumber} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(phase.status)}
                      <div>
                        <CardTitle className="text-lg">
                          Phase {phase.phaseNumber}: {phase.name}
                        </CardTitle>
                        <CardDescription>{phase.duration}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(phase.status)}>
                      {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Phase Progress</span>
                        <span className="text-sm text-muted-foreground">{Math.round(phase.progress)}%</span>
                      </div>
                      <Progress value={phase.progress} />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Key Deliverables</h4>
                      <ul className="space-y-1">
                        {phase.deliverables.map((deliverable, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {phase.status === 'in-progress' && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Autonomous Tasks</h4>
                        <div className="space-y-2">
                          {phase.automatedTasks.map((task, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{task.name}</span>
                              <Badge className={getStatusColor(task.status)} variant="outline">
                                {task.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Documents & Reports</CardTitle>
              <CardDescription>
                Generate and download implementation documents automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentTypes.map((docType) => {
                  const IconComponent = docType.icon;
                  return (
                    <div key={docType.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-semibold text-sm">{docType.name}</h4>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => generateDocument(docType.id)}
                        disabled={generatingDocument === docType.id}
                        className="w-full"
                      >
                        {generatingDocument === docType.id ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Download className="h-4 w-4 mr-2" />
                            Generate
                          </span>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and milestones in your implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.activity}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()} • {activity.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>
                Tasks and milestones scheduled for completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{task.task}</h4>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
