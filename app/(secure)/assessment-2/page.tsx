/**
 * Assessment 2.0 Page
 * Document-in, Policy-out interface
 * @version 2.0.0
 */

import React from 'react'
import { Metadata } from 'next'
import AssessmentWizard from '@/components/assessment/AssessmentWizard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  Upload,
  Users,
  AlertTriangle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Assessment 2.0 – Document‑in, Policy‑out | AI Readiness Platform',
  description: 'Upload your AI governance documents and receive comprehensive policy analysis with gap reports, redlined policies, and board presentations.',
}

export default function Assessment2Page() {
  // In a real app, these would come from authentication context
  const organizationId = 'org_demo'
  const userId = 'user_demo'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessment 2.0</h1>
              <p className="text-gray-600 mt-1">Document‑in, Policy‑out Analysis</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Shield className="w-4 h-4 mr-1" />
              Enhanced Security
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AssessmentWizard organizationId={organizationId} userId={userId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* What's New */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's New in 2.0</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Enhanced PII Detection</div>
                    <div className="text-xs text-gray-600">12 types of sensitive data detection</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">OCR Processing</div>
                    <div className="text-xs text-gray-600">Extract text from images and scanned docs</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">6 AI Frameworks</div>
                    <div className="text-xs text-gray-600">AIRIX, AIRS, AICS, AIMS, AIPS, AIBS</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Instant Artifacts</div>
                    <div className="text-xs text-gray-600">Gap reports, redlines, board decks</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Supported Formats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>PDF Documents</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Word Documents (.docx, .doc)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>PowerPoint (.pptx, .ppt)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-green-500" />
                  <span>Images (PNG, JPEG)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>Plain Text</span>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Maximum file size: 10MB
                </div>
              </CardContent>
            </Card>

            {/* Generated Artifacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Artifacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Gap Analysis Report</div>
                    <div className="text-xs text-gray-600">Comprehensive compliance assessment with scores</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Policy Redlines</div>
                    <div className="text-xs text-gray-600">Track changes with improvement suggestions</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Board Presentation</div>
                    <div className="text-xs text-gray-600">Executive summary for leadership review</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Notice */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-yellow-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Privacy Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p>
                    This tool performs PII detection and redaction to protect sensitive information.
                  </p>
                  <p>
                    Documents are processed securely and not stored permanently.
                  </p>
                  <p>
                    For FERPA/COPPA compliance, enable PII redaction mode.
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
                  <a href="/docs/assessment-2" className="text-blue-600 hover:text-blue-800">
                    📚 Assessment 2.0 Guide
                  </a>
                </div>
                <div className="text-sm">
                  <a href="/docs/frameworks" className="text-blue-600 hover:text-blue-800">
                    🔍 Framework Reference
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
  )
}
