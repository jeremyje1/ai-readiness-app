'use client'

import React from 'react'
import PolicyPackLibrary from '@/components/PolicyPackLibrary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Calendar, 
  ExternalLink, 
  BookOpen, 
  Users, 
  FileText,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react'

export default function PolicyPackDemoPage() {
  // Demo configuration
  const demoConfig = {
    assessmentId: 'demo-policy-pack-' + Date.now(),
    institutionType: 'K12' as const,
    institutionName: 'Demo School District',
    state: 'California'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Policy Pack Library
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Maintained templates with monthly redlines • Anchored to external authorities
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-white text-blue-600 text-lg px-4 py-2">
                🎯 Source-Anchored Templates
              </Badge>
              <Badge className="bg-white text-purple-600 text-lg px-4 py-2">
                📅 Monthly Redline Updates
              </Badge>
              <Badge className="bg-white text-indigo-600 text-lg px-4 py-2">
                ⚖️ Board-Ready Policies
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  External Authority Anchoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 mb-4">
                  Every template linked to authoritative sources for justifiable adoption:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    NIST AI Risk Management Framework
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    U.S. Department of Education Guidance
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Federal Trade Commission (COPPA)
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    State AI Guidance (Auto-Updated)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Monthly Redline Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 mb-4">
                  Automatic policy updates when source guidance changes:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• NIST GenAI Profile updates</li>
                  <li>• ED guidance revisions</li>
                  <li>• State legislation changes</li>
                  <li>• Compliance requirement updates</li>
                  <li>• Side-by-side change tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Complete Policy Ecosystem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 mb-4">
                  Full governance implementation package:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Board-ready policy drafts</li>
                  <li>• Parent communication letters</li>
                  <li>• Student guides and FAQs</li>
                  <li>• Syllabus language generators</li>
                  <li>• State-specific addenda</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Monthly Subscription Value Justification
          </h2>
          <p className="text-xl text-gray-600">
            Replaces $50,000+ consultant engagements with automated policy maintenance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-800">Cost Savings</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-green-700 mb-1">$58K - $128K</div>
              <p className="text-green-600 text-sm">Annual savings vs consultants</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-blue-800">Time Savings</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-blue-700 mb-1">97%</div>
              <p className="text-blue-600 text-sm">Reduction in policy development time</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-purple-800">Compliance</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-purple-700 mb-1">100%</div>
              <p className="text-purple-600 text-sm">Source-anchored compliance</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="text-center">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-orange-800">Updates</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-orange-700 mb-1">Monthly</div>
              <p className="text-orange-600 text-sm">Automatic redline updates</p>
            </CardContent>
          </Card>
        </div>

        {/* Policy Categories Overview */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Complete Policy Coverage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Core Governance
                </CardTitle>
                <CardDescription>NIST AI RMF aligned frameworks</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• AI Governance Charter</li>
                  <li>• Third-Party Tool Policies</li>
                  <li>• Vendor DPA Requirements</li>
                  <li>• Risk Management Frameworks</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Teaching & Learning
                </CardTitle>
                <CardDescription>U.S. Dept. of Education aligned</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• Classroom AI Guidelines</li>
                  <li>• Academic Integrity Policies</li>
                  <li>• Assessment Considerations</li>
                  <li>• Educator Training Requirements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Privacy & Student Data
                </CardTitle>
                <CardDescription>FERPA & COPPA compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• FERPA GenAI Considerations</li>
                  <li>• COPPA K-12 Language</li>
                  <li>• Data De-identification</li>
                  <li>• Privacy Impact Assessments</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Policy Pack Library Component */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Interactive Policy Pack Library Demo</CardTitle>
            <CardDescription className="text-center">
              Experience the complete policy template system for {demoConfig.institutionName} ({demoConfig.institutionType} in {demoConfig.state})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PolicyPackLibrary
              assessmentId={demoConfig.assessmentId}
              institutionType={demoConfig.institutionType}
              institutionName={demoConfig.institutionName}
              state={demoConfig.state}
            />
          </CardContent>
        </Card>
      </div>

      {/* Implementation Value */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              $995/Month Subscription Value Delivered
            </h3>
            <p className="text-gray-600">
              Transform policy development from 6-month consultant project to instant delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Traditional Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    ❌ <span>$25K-$50K initial consultant engagement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ❌ <span>6-12 month development timeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ❌ <span>Generic templates without source anchoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ❌ <span>Manual updates when guidance changes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ❌ <span>Separate communication development</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ❌ <span>No ongoing maintenance included</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-600">Policy Pack Library</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    ✅ <span>$995/month with complete coverage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ <span>Instant policy pack generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ <span>Source-anchored authoritative templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ <span>Automatic monthly redline updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ <span>Complete communication kit included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ <span>Continuous maintenance and updates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
