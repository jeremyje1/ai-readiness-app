'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  ArrowRight,
  Star,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Headphones,
  Brain,
  Zap,
  Target,
  BarChart3,
  Clock
} from 'lucide-react';
import { AI_SERVICE_COMPLETE, PRICING_DISPLAY, getAnnualSavings } from '@/lib/unified-pricing-config';
import Link from 'next/link';

export default function AIReadinessPricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleGetStarted = (period: 'monthly' | 'yearly') => {
    // This will be updated when Stripe products are created
    const trialDays = AI_SERVICE_COMPLETE.trialDays;
    const baseUrl = 'https://app.northpathstrategies.org/api/stripe/create-checkout';
    
    if (period === 'monthly') {
      window.location.href = `${baseUrl}?tier=ai-readiness-complete-monthly&trial_days=${trialDays}`;
    } else {
      window.location.href = `${baseUrl}?tier=ai-readiness-complete-yearly&trial_days=${trialDays}`;
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('assessment') || feature.includes('analysis')) return <BarChart3 className="h-4 w-4" />;
    if (feature.includes('support') || feature.includes('office hours') || feature.includes('Slack')) return <Headphones className="h-4 w-4" />;
    if (feature.includes('report') || feature.includes('blueprint') || feature.includes('policy')) return <FileText className="h-4 w-4" />;
    if (feature.includes('tracking') || feature.includes('benchmarking') || feature.includes('ROI')) return <TrendingUp className="h-4 w-4" />;
    if (feature.includes('strategy') || feature.includes('coaching') || feature.includes('implementation')) return <Brain className="h-4 w-4" />;
    if (feature.includes('partnership') || feature.includes('team')) return <Users className="h-4 w-4" />;
    if (feature.includes('algorithm') || feature.includes('AI-enhanced')) return <Zap className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              NorthPath Strategies
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Organizational Assessment</Link>
              <Link href="/ai-readiness/pricing" className="text-indigo-600 font-medium">AI Readiness</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white py-16">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6">
              <Brain className="h-4 w-4 mr-2" />
              AI Transformation Blueprint™
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              From Assessment to Action in 90 Days
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Choose your AI transformation path—from quick diagnostics to comprehensive implementation support. 
              Each tier includes patent-pending analytics and higher education expertise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards - Placeholder for old structure */}
      <section className="container mx-auto px-4 py-16 -mt-8">
        <div className="text-center">
          <p className="text-gray-600">This is a backup of the old pricing structure.</p>
          <Link href="/pricing" className="text-blue-600 hover:underline">
            View current pricing
          </Link>
        </div>
      </section>

      {/* Value Communication Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-indigo-50 rounded-lg p-8 max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-indigo-900 mb-6 text-center">Why the AI Transformation Blueprint™?</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-indigo-800 mb-3">Risk Transfer & Implementation Support</h4>
              <p className="text-indigo-700 text-sm mb-4">
                Unlike traditional consultants who deliver reports and leave, we own the action plan and guide you through 
                the first 90 days of execution. You get tangible, board-ready operating plans with ongoing support.
              </p>
              <h4 className="font-semibold text-indigo-800 mb-3">Accreditation & Compliance Alignment</h4>
              <p className="text-indigo-700 text-sm">
                Every recommendation maps to SACSCOC, HLC, MSCHE, and NIST AI RMF controls. We understand higher education's 
                unique regulatory landscape and compliance requirements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-800 mb-3">Faculty-Centric Change Management</h4>
              <p className="text-indigo-700 text-sm mb-4">
                Our dedicated micro-course addresses the biggest hurdle in AI adoption—faculty resistance. 
                Maps directly to teaching effectiveness competencies and issues verifiable badges.
              </p>
              <h4 className="font-semibold text-indigo-800 mb-3">ROI Clarity & Scenario Modeling</h4>
              <p className="text-indigo-700 text-sm">
                Interactive workbooks show expected enrollment uplift, cost avoidance, and grant eligibility improvements. 
                Board members can see the financial impact before making decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Timeline */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our 90-Day Transformation Process</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Diagnostic → Design → Deploy methodology specifically built for higher education's pace and requirements.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Phase 1: Diagnostic</h3>
              <p className="text-gray-600 text-sm mb-4">Weeks 0-2</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Comprehensive AIRIX/AIRS diagnostic</li>
                <li>• Strategic document harvest</li>
                <li>• Stakeholder interviews</li>
                <li>• Baseline dashboard setup</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Phase 2: Design</h3>
              <p className="text-gray-600 text-sm mb-4">Weeks 2-6</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Virtual design studio</li>
                <li>• Scenario modeling (AIPS™)</li>
                <li>• Policy kit development</li>
                <li>• 40-page Blueprint creation</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Phase 3: Deploy</h3>
              <p className="text-gray-600 text-sm mb-4">Weeks 6-12</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 90-day sprint coaching</li>
                <li>• Weekly office hours</li>
                <li>• Faculty enablement course</li>
                <li>• KPI dashboard setup</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Institution's AI Future?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join forward-thinking institutions using our Blueprint™ methodology to move from assessment to implementation. 
            Start your transformation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/ai-readiness/start?tier=blueprint" 
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
            >
              Start Blueprint™ Program
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/contact?service=ai-transformation" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-500 text-sm">
              © 2025 NorthPath Strategies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
