'use client';

import React from 'react';
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
import { AI_READINESS_PRODUCTS } from '@/lib/ai-readiness-products';
import Link from 'next/link';

export default function AIReadinessPricingPage() {
  const handleSelectPlan = (product: any) => {
    // Map product IDs to Stripe checkout tiers
    const stripeCheckoutMap: { [key: string]: string } = {
      'higher-ed-ai-pulse-check': 'higher-ed-ai-pulse-check',
      'ai-readiness-comprehensive': 'ai-readiness-comprehensive', 
      'ai-transformation-blueprint': 'ai-transformation-blueprint',
      'ai-enterprise-partnership': 'ai-enterprise-partnership'
    };
    
    const stripeTier = stripeCheckoutMap[product.id];
    if (stripeTier) {
      window.location.href = `https://app.northpathstrategies.org/api/stripe/create-tier-checkout?tier=${stripeTier}`;
    } else {
      // Fallback to contact for enterprise
      window.location.href = `/contact?service=enterprise-ai`;
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('team') || feature.includes('members') || feature.includes('Faculty')) return <Users className="h-4 w-4" />;
    if (feature.includes('support') || feature.includes('advisory') || feature.includes('office hours')) return <Headphones className="h-4 w-4" />;
    if (feature.includes('report') || feature.includes('Blueprint') || feature.includes('slides')) return <FileText className="h-4 w-4" />;
    if (feature.includes('analysis') || feature.includes('benchmarking') || feature.includes('dashboard')) return <TrendingUp className="h-4 w-4" />;
    if (feature.includes('session') || feature.includes('strategy') || feature.includes('workshop')) return <Brain className="h-4 w-4" />;
    if (feature.includes('policy') || feature.includes('governance')) return <Shield className="h-4 w-4" />;
    if (feature.includes('sprint') || feature.includes('implementation')) return <Target className="h-4 w-4" />;
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

      {/* Pricing Cards - New 4-Tier Structure */}
      <section className="container mx-auto px-4 py-16 -mt-8">
        <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {AI_READINESS_PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className={`relative h-full ${
                product.isPopular 
                  ? 'border-2 border-indigo-500 shadow-xl scale-105' 
                  : product.name === 'Enterprise AI Partnership'
                  ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0'
                  : 'border border-slate-200 shadow-lg'
              }`}>
                {product.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-indigo-500 text-white px-4 py-1 text-sm font-medium">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className={`text-xl font-bold mb-2 ${
                    product.name === 'Enterprise AI Partnership' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {product.name}
                  </CardTitle>
                  <p className={`text-sm mb-4 ${
                    product.name === 'Enterprise AI Partnership' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {product.goal}
                  </p>
                  <div className={`text-3xl font-bold mb-2 ${
                    product.name === 'Enterprise AI Partnership' 
                      ? 'text-yellow-400' 
                      : 'text-indigo-600'
                  }`}>
                    ${product.price.toLocaleString()}
                  </div>
                  <p className={`text-sm ${
                    product.name === 'Enterprise AI Partnership' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {product.duration}
                  </p>
                </CardHeader>
                
                <CardContent className="px-6 pb-6">
                  <ul className="space-y-2 mb-6">
                    {product.features.slice(0, 8).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-sm">
                        <div className={`mr-2 mt-0.5 ${
                          product.name === 'Enterprise AI Partnership' 
                            ? 'text-yellow-400' 
                            : 'text-green-500'
                        }`}>
                          {getFeatureIcon(feature)}
                        </div>
                        <span className={
                          product.name === 'Enterprise AI Partnership' ? 'text-gray-100' : 'text-gray-700'
                        }>
                          {feature}
                        </span>
                      </li>
                    ))}
                    {product.features.length > 8 && (
                      <li className={`text-sm italic ${
                        product.name === 'Enterprise AI Partnership' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        + {product.features.length - 8} more features...
                      </li>
                    )}
                  </ul>
                  
                  <Button
                    onClick={() => handleSelectPlan(product)}
                    className={`w-full ${
                      product.isPopular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : product.name === 'Enterprise AI Partnership'
                        ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900'
                        : product.name === 'AI Pulse Check'
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                    }`}
                  >
                    {product.name === 'Enterprise AI Partnership' 
                      ? 'Contact Sales' 
                      : `Start ${product.name.split(' ')[0]} ${product.name.split(' ')[1] || ''}`
                    }
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
