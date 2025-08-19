'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { Progress } from '@/components/progress';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  TrendingUp, 
  Users, 
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Assessment {
  id: string;
  institutionName: string;
  tier: string;
  status: 'completed' | 'in-progress' | 'pending-analysis';
  score?: number;
  completedAt?: string;
  questionsAnswered: number;
  totalQuestions: number;
  documentsUploaded: number;
  maturityLevel?: string;
}

interface DashboardStats {
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  inProgressAssessments: number;
}

export default function AIReadinessDashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTier]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assessments
      const assessmentsResponse = await fetch(`/api/ai-readiness/assessments?tier=${selectedTier}`);
      const assessmentsData = await assessmentsResponse.json();
      
      // Fetch stats
      const statsResponse = await fetch('/api/ai-readiness/dashboard-stats');
      const statsData = await statsResponse.json();
      
      setAssessments(assessmentsData.assessments || []);
      setStats(statsData.stats || null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Mock data for development
      setAssessments([
        {
          id: 'assessment-1',
          institutionName: 'State University',
          tier: 'comprehensive',
          status: 'completed',
          score: 74,
          completedAt: '2024-01-15',
          questionsAnswered: 105,
          totalQuestions: 105,
          documentsUploaded: 8,
          maturityLevel: 'Advanced'
        },
        {
          id: 'assessment-2',
          institutionName: 'Community College District',
          tier: 'pulse-check',
          status: 'in-progress',
          questionsAnswered: 32,
          totalQuestions: 50,
          documentsUploaded: 3
        },
        {
          id: 'assessment-3',
          institutionName: 'Private University',
          tier: 'transformation',
          status: 'pending-analysis',
          questionsAnswered: 150,
          totalQuestions: 150,
          documentsUploaded: 15
        }
      ]);
      
      setStats({
        totalAssessments: 3,
        completedAssessments: 1,
        averageScore: 74,
        inProgressAssessments: 2
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/ai-readiness/pdf?assessmentId=${assessmentId}`);
      const data = await response.json();
      
      if (data.pdfUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.pdfUrl;
        link.download = `ai-readiness-report-${assessmentId}.pdf`;
        link.click();
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const getStatusIcon = (status: Assessment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'pending-analysis':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Assessment['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending-analysis':
        return 'Analyzing';
      default:
        return 'Unknown';
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'pulse-check':
        return 'secondary';
      case 'comprehensive':
        return 'default';
      case 'transformation':
        return 'outline';
      case 'enterprise':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Readiness Dashboard</h1>
          <p className="text-gray-600">Manage and monitor your AI readiness assessments</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedTier} 
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Tiers</option>
            <option value="pulse-check">Pulse Check</option>
            <option value="comprehensive">Comprehensive</option>
            <option value="transformation">Transformation</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssessments}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAssessments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgressAssessments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Assessments List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Assessments</h2>
        
        {assessments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No assessments found
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div 
                key={assessment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(assessment.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{assessment.institutionName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getTierBadgeVariant(assessment.tier)}>
                        {assessment.tier.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <span className="text-sm text-gray-500">{getStatusText(assessment.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Progress */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900">
                        {assessment.questionsAnswered}/{assessment.totalQuestions}
                      </span>
                    </div>
                    <Progress 
                      value={(assessment.questionsAnswered / assessment.totalQuestions) * 100}
                      className="mt-1"
                    />
                  </div>

                  {/* Score */}
                  {assessment.score && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{assessment.score}%</div>
                      <div className="text-xs text-gray-500">{assessment.maturityLevel}</div>
                    </div>
                  )}

                  {/* Documents */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{assessment.documentsUploaded}</div>
                    <div className="text-xs text-gray-500">Documents</div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {assessment.status === 'completed' && (
                      <Button
                        onClick={() => handleDownloadReport(assessment.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => window.open(`/ai-readiness/assessment/${assessment.id}`, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
