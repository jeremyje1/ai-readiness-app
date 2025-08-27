/**
 * Audience-Aware Assessment Page
 * Modern assessment interface with audience-specific questions and autosave
 */

import React from 'react';
import { Metadata } from 'next/server';
import { AudienceAwareAssessment } from '@/components/assessment/AudienceAwareAssessment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  BarChart3, 
  CheckCircle, 
  BookOpen,
  Users,
  GraduationCap,
  Brain,
  AlertTriangle,
  Zap
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Readiness Assessment | AI Blueprint Platform',
  description: 'Take our comprehensive AI readiness assessment tailored for your educational environment. Get personalized recommendations and insights.',
  keywords: ['AI assessment', 'AI readiness', 'education technology', 'K-12', 'higher education']
};

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Readiness Assessment</h1>
              <p className="text-gray-600 mt-1">Discover your organization's AI readiness with personalized insights</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Brain className="w-4 h-4 mr-1" />
              Audience-Aware
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AudienceAwareAssessment />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assessment Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Audience-Specific</div>
                    <div className="text-xs text-gray-600">Questions tailored to K-12 or Higher Ed</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Auto-Save Progress</div>
                    <div className="text-xs text-gray-600">Resume anytime, never lose your work</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Detailed Analytics</div>
                    <div className="text-xs text-gray-600">Comprehensive scoring and insights</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Privacy Protected</div>
                    <div className="text-xs text-gray-600">Your responses are secure and private</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Get */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You'll Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Readiness Score</div>
                    <div className="text-xs text-gray-600">Overall AI readiness level with detailed breakdown</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Action Plan</div>
                    <div className="text-xs text-gray-600">Specific recommendations for improvement</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Resource Library</div>
                    <div className="text-xs text-gray-600">Curated resources based on your needs</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Peer Benchmarking</div>
                    <div className="text-xs text-gray-600">Compare against similar organizations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span>Leadership & Governance</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span>Curriculum & Instruction</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Professional Development</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <span>Data Privacy & Security</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <BarChart3 className="w-4 h-4 text-red-500" />
                  <span>Technology Infrastructure</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Brain className="w-4 h-4 text-indigo-500" />
                  <span>Innovation & Research</span>
                </div>
              </CardContent>
            </Card>

            {/* Time Estimate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Time Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">25-35</div>
                  <div className="text-sm text-gray-600 mb-4">minutes</div>
                  <div className="text-xs text-gray-500">
                    Complete in one session or save and resume later
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-blue-800">
                  <Shield className="w-5 h-5 mr-2" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    Your assessment responses are encrypted and stored securely.
                  </p>
                  <p>
                    Data is used only to generate your personalized recommendations.
                  </p>
                  <p>
                    You can delete your data at any time from your dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <a href="/docs/assessment-guide" className="text-blue-600 hover:text-blue-800">
                    📚 Assessment Guide
                  </a>
                </div>
                <div className="text-sm">
                  <a href="/docs/scoring" className="text-blue-600 hover:text-blue-800">
                    🎯 How Scoring Works
                  </a>
                </div>
                <div className="text-sm">
                  <a href="/support" className="text-blue-600 hover:text-blue-800">
                    💬 Contact Support
                  </a>
                </div>
                <div className="text-sm">
                  <a href="/docs/privacy" className="text-blue-600 hover:text-blue-800">
                    🔒 Privacy Policy
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}