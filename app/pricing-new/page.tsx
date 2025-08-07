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

export default function UnifiedPricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleGetStarted = (period: 'monthly' | 'yearly') => {
    const trialDays = AI_SERVICE_COMPLETE.trialDays;
    const baseUrl = '/api/stripe/unified-checkout';
    
    // Redirect to the new unified checkout API
    window.location.href = `${baseUrl}?billing=${period}&trial_days=${trialDays}`;
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
              <Link href="/pricing" className="text-indigo-600 font-medium">Pricing</Link>
              <Link href="/ai-blueprint" className="text-gray-600 hover:text-gray-900">AI Blueprint</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            className="text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <Badge className="bg-white/20 text-white px-4 py-2 text-sm font-medium">
                <Star className="h-3 w-3 mr-1" />
                Everything Included
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Complete AI Transformation Service
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-4xl mx-auto">
              One comprehensive service that includes everything you need for successful AI adoption - from assessment to implementation and ongoing support.
            </p>
            <p className="text-lg text-blue-200 mb-8">
              7-day free trial • Cancel anytime • All features included
            </p>
          </motion.div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="container mx-auto px-4 py-8 -mt-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-lg border">
            <div className="flex space-x-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                  Save ${getAnnualSavings().toFixed(0)}
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative border-2 border-indigo-500 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-indigo-500 text-white px-6 py-2 text-sm font-medium">
                  <Star className="h-3 w-3 mr-1" />
                  Complete Service
                </Badge>
              </div>
              
              <CardHeader className="text-center pb-4 pt-8">
                <CardTitle className="text-2xl font-bold mb-2 text-gray-900">
                  {AI_SERVICE_COMPLETE.name}
                </CardTitle>
                <p className="text-gray-600 mb-6">
                  {AI_SERVICE_COMPLETE.description}
                </p>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  ${billingPeriod === 'monthly' 
                    ? PRICING_DISPLAY.monthly.price 
                    : PRICING_DISPLAY.yearly.price}
                </div>
                <p className="text-gray-500">
                  {billingPeriod === 'monthly' ? 'per month' : 'per year'}
                  {billingPeriod === 'yearly' && (
                    <span className="block text-sm text-green-600 font-medium mt-1">
                      Only ${(PRICING_DISPLAY.yearly.price / 12).toFixed(2)}/month
                    </span>
                  )}
                </p>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mt-4 inline-block">
                  {AI_SERVICE_COMPLETE.trialDays}-Day Free Trial
                </div>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {AI_SERVICE_COMPLETE.features.map((feature, index) => (
                    <div key={index} className="flex items-start text-sm">
                      <div className="mr-3 mt-0.5 text-green-500">
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="text-gray-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => handleGetStarted(billingPeriod)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 text-lg font-semibold"
                  size="lg"
                >
                  Start {AI_SERVICE_COMPLETE.trialDays}-Day Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  No credit card required for trial • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="container mx-auto px-4 py-16 bg-white rounded-lg shadow-lg mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for AI Success</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our complete service combines all assessment tiers, advanced analytics, implementation support, and ongoing strategic guidance in one comprehensive package.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Complete Assessment Suite</h3>
            <p className="text-gray-600 text-sm">
              Access to all assessment levels from quick pulse checks to comprehensive enterprise evaluations. Unlimited assessments with our proprietary algorithms.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Implementation Support</h3>
            <p className="text-gray-600 text-sm">
              Strategic coaching, faculty enablement programs, policy generation, and hands-on implementation guidance to ensure successful AI adoption.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ongoing Partnership</h3>
            <p className="text-gray-600 text-sm">
              Monthly office hours, dedicated Slack support, quarterly re-assessments, and strategic partnership access for continuous improvement.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in the service?</h3>
              <p className="text-gray-600">
                Everything! You get access to all assessment tiers, unlimited evaluations, comprehensive reports up to 85 pages, all proprietary algorithms, implementation coaching, strategic support, and ongoing partnership access.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the 7-day free trial work?</h3>
              <p className="text-gray-600">
                Start your trial immediately with no credit card required. You'll have full access to all features for 7 days. If you decide to continue, billing begins after the trial period.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I switch between monthly and yearly billing?</h3>
              <p className="text-gray-600">
                Yes, you can change your billing period at any time. Yearly subscribers save over $200 annually compared to monthly billing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What if I need to cancel?</h3>
              <p className="text-gray-600">
                You can cancel anytime with no long-term commitments. Your access continues until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your AI Strategy?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join leading institutions using our complete AI transformation service. Start your free trial today.
          </p>
          <Button
            onClick={() => handleGetStarted(billingPeriod)}
            className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            size="lg"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
