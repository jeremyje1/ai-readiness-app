'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Upload, BookOpen, BarChart3, Users, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function AIReadinessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      // Redirect to sign in page if not authenticated
      router.push('/auth/signin');
      return;
    }
    
    setIsLoading(false);
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md w-full mx-4">
          <LogIn className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your AI readiness dashboard.</p>
          <Link href="/auth/signin">
            <Button className="w-full">
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }
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
              and AIBS™ algorithms. The only AI readiness tool built specifically for higher education institutions.
            </p>
            
            <div className="mb-8">
              <Link href="/ai-readiness/assessment">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Start Assessment
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

      {/* Assessment Options */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Start Your AI Readiness Assessment
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Choose your assessment tier based on your institution's needs and goals.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Higher Ed AI Pulse Check</h3>
              <p className="text-gray-600 mb-6">
                50-question streamlined AI readiness assessment with AI-generated quick insights report (8-10 pages)
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">$2,000</span>
                <span className="text-gray-500 ml-2">one-time</span>
              </div>
              <Link href="/ai-readiness/assessment?tier=higher-ed-ai-pulse-check">
                <Button className="w-full" size="lg">
                  Start Pulse Check
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 border-blue-200">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Readiness Comprehensive</h3>
              <p className="text-gray-600 mb-6">
                105-question comprehensive assessment with 25-page detailed report and strategic document analysis
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">$4,995</span>
                <span className="text-gray-500 ml-2">one-time</span>
              </div>
              <Link href="/ai-readiness/assessment?tier=ai-readiness-comprehensive">
                <Button className="w-full" size="lg">
                  Start Comprehensive Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-gray-500 mb-4">
              Need enterprise-level assessment or ongoing partnership?
            </p>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View All Pricing Options
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
