/**
 * Admin Assessment Detail Page
 * View individual assessment details
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building2, 
  Calendar, 
  Mail, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Users,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface AssessmentDetailPageProps {
  params: {
    id: string;
  };
}

// Mock assessment data - in production, fetch from database
const getAssessmentData = (id: string) => {
  return {
    id,
    institution: 'Test Institution',
    contactName: 'Jeremy Estrella',
    contactEmail: 'jeremy.estrella@gmail.com',
    tier: 'comprehensive',
    completedAt: '2025-08-19T14:57:12.377Z',
    scores: {
      airix: 74,
      airs: 'Moderate Risk',
      aics: 68,
      aims: 'Developing',
      aips: 12,
      aibs: 'Top 35%'
    },
    status: 'completed',
    paymentStatus: 'paid'
  };
};

export default function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
  const assessment = getAssessmentData(params.id);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes('Low')) return 'bg-green-100 text-green-800';
    if (risk.includes('Moderate')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Assessment Details</h1>
          <p className="text-gray-600">Assessment ID: {assessment.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Institution Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Institution</label>
                <p className="text-lg font-semibold">{assessment.institution}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact</label>
                <p className="font-medium">{assessment.contactName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-blue-600">{assessment.contactEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tier</label>
                <Badge variant="secondary" className="capitalize">{assessment.tier}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Completed</label>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(assessment.completedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Scores */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                AI Readiness Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.scores.airix)}`}>
                    {assessment.scores.airix}/100
                  </div>
                  <p className="text-sm text-gray-600">AIRIX™ Readiness</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Badge className={getRiskColor(assessment.scores.airs)}>
                    {assessment.scores.airs}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">AIRS™ Risk</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.scores.aics)}`}>
                    {assessment.scores.aics}%
                  </div>
                  <p className="text-sm text-gray-600">AICS™ Capacity</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {assessment.scores.aims}
                  </div>
                  <p className="text-sm text-gray-600">AIMS™ Maturity</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {assessment.scores.aips}
                  </div>
                  <p className="text-sm text-gray-600">AIPS™ Priorities</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {assessment.scores.aibs}
                  </div>
                  <p className="text-sm text-gray-600">AIBS™ Ranking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Client
              </Button>
              <Button variant="outline" className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Add to CRM
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Assessment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Assessment Completed</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Payment Processed</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Emails Sent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
