'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';

interface Assessment {
  id: string;
  client_name: string;
  client_email: string;
  assessment_type: string;
  score: number;
  created_at: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      // TODO: Replace with actual API call to Supabase
      const mockData: Assessment[] = [
        {
          id: '1',
          client_name: 'John Doe',
          client_email: 'john@example.com',
          assessment_type: 'AI Readiness Comprehensive',
          score: 85,
          created_at: '2024-01-15T10:30:00Z',
          status: 'completed'
        },
        {
          id: '2',
          client_name: 'Jane Smith',
          client_email: 'jane@university.edu',
          assessment_type: 'Higher Ed Pulse Check',
          score: 72,
          created_at: '2024-01-14T14:20:00Z',
          status: 'completed'
        }
      ];
      setAssessments(mockData);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedAssessments = assessments.filter(a => a.status === 'completed');
  const averageScore = completedAssessments.length > 0 
    ? Math.round(completedAssessments.reduce((sum, a) => sum + a.score, 0) / completedAssessments.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage assessments, review results, and track client progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{completedAssessments.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{averageScore}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="test">Test Assessment</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {assessments.slice(0, 5).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{assessment.client_name}</p>
                      <p className="text-sm text-gray-600">{assessment.assessment_type}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status}
                      </Badge>
                      {assessment.status === 'completed' && (
                        <p className="text-sm text-gray-600 mt-1">Score: {assessment.score}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">All Assessments</h3>
                <Button onClick={() => fetchAssessments()}>
                  Refresh
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Assessment Type</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment) => (
                      <tr key={assessment.id} className="bg-white border-b">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{assessment.client_name}</p>
                            <p className="text-gray-500">{assessment.client_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">{assessment.assessment_type}</td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {assessment.status === 'completed' ? `${assessment.score}%` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Test Assessment Links</h3>
              <p className="text-gray-600 mb-6">
                Use these links to test your assessment flows without payment:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Higher Ed Pulse Check</h4>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/assessment/higher-ed-pulse-check?test=true', '_blank')}
                  >
                    Test Assessment
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">AI Readiness Comprehensive</h4>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/assessment/ai-readiness-comprehensive?test=true', '_blank')}
                  >
                    Test Assessment
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">AI Transformation Blueprint</h4>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/assessment/ai-transformation-blueprint?test=true', '_blank')}
                  >
                    Test Assessment
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Enterprise Partnership</h4>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/assessment/enterprise-partnership?test=true', '_blank')}
                  >
                    Test Assessment
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Assessment Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Assessment Duration (minutes)
                  </label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    defaultValue={30}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Notifications
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Notify on assessment completion
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Weekly summary reports
                    </label>
                  </div>
                </div>
                <Button>Save Settings</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
