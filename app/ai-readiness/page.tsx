'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Upload, BookOpen, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';

export default function AIReadinessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI Blueprint™ Assessment
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Comprehensive evaluation powered by our proprietary AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, 
              and AIBS™ algorithms. The only AI readiness tool built specifically for educational institutions, 
              with specialized frameworks for both K-12 districts and higher education universities.
            </p>
            
            <div className="mb-8">
              <Link href="/start?billing=monthly">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Start Monthly Plan - $995/month
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/start?billing=yearly" className="ml-4">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                  Annual Plan - Save 17%
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                50-200 Questions
              </div>
              <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                8 Key Domains
              </div>
              <div className="flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                <BookOpen className="w-4 h-4 mr-2" />
                Patent-Pending Algorithms
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contextualization Note */}
      <section className="px-6 py-8 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Tailored to Your Educational Context
            </h3>
            <p className="text-gray-600">
              During setup, you'll select your institution type (K-12 district or higher education university). 
              The assessment then contextualizes all questions, recommendations, and benchmarking to your specific 
              educational environment, ensuring relevance to your compliance requirements, governance structures, and operational needs.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comprehensive AI Readiness Evaluation
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Strategy & Governance</h3>
              <p className="text-gray-600">
                Evaluate institutional AI strategy, leadership, governance frameworks, 
                and success metrics.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pedagogical Integration</h3>
              <p className="text-gray-600">
                Assess faculty training, curriculum guidelines, student AI literacy, 
                and learning outcomes.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Technology Infrastructure</h3>
              <p className="text-gray-600">
                Evaluate computational resources, data systems, cybersecurity, 
                and technical expertise.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Organizational Culture</h3>
              <p className="text-gray-600">
                Assess innovation readiness, change management, leadership support, 
                and stakeholder engagement.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Compliance & Risk</h3>
              <p className="text-gray-600">
                Review regulatory compliance, risk assessment, and vendor 
                management for AI implementations.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Academic Integrity</h3>
              <p className="text-gray-600">
                Student guidelines, academic integrity frameworks, and learning 
                outcome preservation strategies.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Benchmarking & Standards</h3>
              <p className="text-gray-600">
                Peer institution comparison and accreditation alignment analysis
                using our proprietary AIBS™ algorithm.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mission Alignment</h3>
              <p className="text-gray-600">
                Ensuring AI initiatives support institutional mission and measurable 
                student success outcomes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Proprietary Algorithms Section */}
      <section className="px-6 py-16 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Patent-Pending Algorithm Suite
            </h2>
            <p className="text-lg text-gray-600">
              Our proprietary diagnostic science employs 6 specialized algorithms designed 
              specifically for AI transformation in higher education.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">AIRIX™</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Readiness Index</h3>
              <p className="text-gray-600 text-sm">
                Core institutional AI readiness across 8 strategic domains including governance, 
                infrastructure, culture, and resources.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">AIRS™</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Readiness Scoring</h3>
              <p className="text-gray-600 text-sm">
                Domain-specific maturity assessment measuring strategic readiness, 
                infrastructure security, and cultural preparedness.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">AICS™</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Implementation Capacity</h3>
              <p className="text-gray-600 text-sm">
                Resource capability analysis evaluating financial, human, and technological 
                capacity for AI implementation.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold text-lg">AIMS™</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Implementation Maturity</h3>
              <p className="text-gray-600 text-sm">
                Current state assessment of existing AI initiatives, pilot programs, 
                and institutional AI adoption levels.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 font-bold text-lg">AIPS™</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Implementation Priority</h3>
              <p className="text-gray-600 text-sm">
                Action prioritization engine that ranks initiatives by impact, 
                feasibility, and strategic alignment.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold text-lg">AIBS™</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Benchmarking Scoring</h3>
              <p className="text-gray-600 text-sm">
                Peer institution comparison analysis using anonymized data from 
                similar higher education organizations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Pricing */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            AI Readiness Team Plan
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Complete AI readiness assessment and ongoing guidance with all patent-pending algorithms included.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Monthly Subscription</h3>
              <p className="text-gray-600 mb-6">
                Full access to all AI readiness tools, assessments, and ongoing support
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">$995</span>
                <span className="text-gray-500 ml-2">per month</span>
              </div>
              <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                <li>✅ Complete 105-question assessment</li>
                <li>✅ All 6 patent-pending algorithms</li>
                <li>✅ 25-page detailed report</li>
                <li>✅ Strategic document analysis</li>
                <li>✅ Ongoing support & updates</li>
              </ul>
              <Link href="/start?billing=monthly">
                <Button className="w-full" size="lg">
                  Start Monthly Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 border-blue-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  2 Months Free
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Yearly Subscription</h3>
              <p className="text-gray-600 mb-6">
                Save $2,390 annually with our yearly commitment plan
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">$9,950</span>
                <span className="text-gray-500 ml-2">per year</span>
                <div className="text-sm text-green-600 font-medium">Save 17%</div>
              </div>
              <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                <li>✅ Everything in monthly plan</li>
                <li>✅ Priority support</li>
                <li>✅ Quarterly strategy sessions</li>
                <li>✅ Advanced benchmarking</li>
                <li>✅ Custom implementation roadmap</li>
              </ul>
              <Link href="/start?billing=yearly">
                <Button className="w-full" size="lg">
                  Start Yearly Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 text-left">
            <h4 className="font-semibold text-blue-900 mb-3">What's Included in Every Plan:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-2">Patent-Pending Algorithms:</h5>
                <ul className="space-y-1 text-xs">
                  <li>• AIRIX™ - Infrastructure Assessment</li>
                  <li>• AIRS™ - Risk & Security Analysis</li>
                  <li>• AICS™ - Culture & Change Management</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Additional Algorithms:</h5>
                <ul className="space-y-1 text-xs">
                  <li>• AIMS™ - Implementation Maturity</li>
                  <li>• AIPS™ - Priority Scoring</li>
                  <li>• AIBS™ - Benchmarking & Comparison</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">
              Need a custom assessment or enterprise-level partnership?
            </p>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Enterprise Options
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You'll Receive
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Comprehensive Scoring Report</h3>
                <p className="text-gray-600">
                  Domain-specific scores with weighted analysis across all five key areas
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Strategic Recommendations</h3>
                <p className="text-gray-600">
                  Actionable next steps prioritized by impact and institutional readiness
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Maturity Level Assessment</h3>
                <p className="text-gray-600">
                  Clear categorization from Beginning to Exemplary with improvement pathways
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Document Analysis (Comprehensive Tier)</h3>
                <p className="text-gray-600">
                  AI-powered analysis of strategic plans and institutional documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
