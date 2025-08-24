'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { CheckCircle, Clock, BarChart3, ArrowRight } from 'lucide-react';

export default function AssessmentStartPage() {
  const [institutionType, setInstitutionType] = useState<'K12' | 'HigherEd'>('K12');

  useEffect(() => {
    // Detect domain context
    const hostname = window.location.hostname;
    if (hostname.includes('higheredaiblueprint.com')) {
      setInstitutionType('HigherEd');
    } else {
      setInstitutionType('K12');
    }
  }, []);

  const getTitle = () => {
    if (institutionType === 'HigherEd') {
      return 'Higher Education AI Readiness Assessment';
    }
    return 'K-12 AI Readiness Assessment';
  };

  const getContextualDescription = () => {
    if (institutionType === 'HigherEd') {
      return 'Choose your assessment approach for university and college environments';
    }
    return 'Choose your assessment approach for school district environments';
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {getTitle()}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {getContextualDescription()}
          </p>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Progress saves automatically
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Section-by-section results
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-purple-600" />
              No time limits
            </span>
          </div>
        </div>

        {/* Assessment Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Quick Assessment */}
          <Card className="p-8 border-2 border-transparent hover:border-blue-200 hover:shadow-lg transition-all">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚡</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Quick Assessment
              </h2>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">8-10 min</div>
                <p className="text-gray-600">
                  Core questions covering all key areas. Perfect for getting immediate insights and identifying priority areas in your {institutionType === 'HigherEd' ? 'institution' : 'district'}.
                </p>
              </div>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>20-25 carefully selected questions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Immediate results after each section</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Core readiness score & recommendations</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Option to upgrade to full assessment</span>
                </div>
              </div>

              <Link href="/ai-readiness/assessment?mode=quick">
                <Button className="w-full text-lg py-3" size="lg">
                  Start Quick Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <p className="text-xs text-gray-500 mt-3">
                Best for: First-time users, time-constrained {institutionType === 'HigherEd' ? 'faculty' : 'teams'}, initial exploration
              </p>
            </div>
          </Card>

          {/* Comprehensive Assessment */}
          <Card className="p-8 border-2 border-transparent hover:border-purple-200 hover:shadow-lg transition-all">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔬</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Comprehensive Assessment
              </h2>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">25-35 min</div>
                <p className="text-gray-600">
                  Complete evaluation with detailed analysis, benchmarking, and strategic roadmap development for {institutionType === 'HigherEd' ? 'university environments' : 'district-wide implementation'}.
                </p>
              </div>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>105 comprehensive questions across 8 domains</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Detailed scoring with peer benchmarking</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Strategic implementation roadmap</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>25-page detailed report & action plan</span>
                </div>
              </div>

              <Link href="/ai-readiness/assessment?mode=full">
                <Button className="w-full text-lg py-3" size="lg" variant="outline">
                  Start Comprehensive Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <p className="text-xs text-gray-500 mt-3">
                Best for: Strategic planning, detailed analysis, comprehensive {institutionType === 'HigherEd' ? 'institutional' : 'district'} roadmap
              </p>
            </div>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Both Assessments Include
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Patent-Pending Algorithms</h4>
              <p className="text-sm text-gray-600">
                AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, and AIBS™ scoring systems
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Immediate Insights</h4>
              <p className="text-sm text-gray-600">
                Results and recommendations available after each section
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Flexible Progress</h4>
              <p className="text-sm text-gray-600">
                Auto-save functionality lets you pause and resume anytime
              </p>
            </div>
          </div>
        </div>

        {/* Continue Previous Assessment */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Already started an assessment?</p>
          <Link href="/ai-readiness/assessment">
            <Button variant="outline">
              Continue Previous Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
