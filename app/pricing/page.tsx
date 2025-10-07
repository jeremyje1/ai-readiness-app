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
  Brain,
  GraduationCap,
  Target,
  BarChart3,
  Calendar
} from 'lucide-react';
import { AI_BLUEPRINT_EDU_PRODUCT, formatPrice, getYearlySavings, getYearlySavingsPercent } from '@/lib/ai-blueprint-edu-product';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AIBlueprintPricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/stripe/edu-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          billingPeriod: billingPeriod
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Checkout error:', data);
        alert(`Error: ${data.error || 'Failed to create checkout session'}`);
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned', data);
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('Faculty') || feature.includes('Colleague')) return <Users className="h-5 w-5" />;
    if (feature.includes('Course') || feature.includes('Classroom')) return <GraduationCap className="h-5 w-5" />;
    if (feature.includes('Roadmap') || feature.includes('Workbook')) return <FileText className="h-5 w-5" />;
    if (feature.includes('Benchmark') || feature.includes('ROI')) return <BarChart3 className="h-5 w-5" />;
    if (feature.includes('AIRIX') || feature.includes('AIRS')) return <Brain className="h-5 w-5" />;
    if (feature.includes('Accreditation')) return <Shield className="h-5 w-5" />;
    if (feature.includes('Progress') || feature.includes('Reviews')) return <Calendar className="h-5 w-5" />;
    return <CheckCircle2 className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              AI Blueprint for Education
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/pricing" className="text-indigo-600 font-medium">Pricing</Link>
              <Link href="/dashboard/personalized" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6">
              <Brain className="h-4 w-4 mr-2" />
              Trusted by 200+ Higher Ed Institutions
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI Blueprint for Education
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transform your institution's AI readiness with our comprehensive assessment, 
              implementation roadmap, and ongoing support designed specifically for higher education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center space-x-4">
          <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
            Yearly
            {billingPeriod === 'yearly' && (
              <span className="ml-2 text-green-600 font-semibold">
                Save {getYearlySavingsPercent()}%
              </span>
            )}
          </span>
        </div>
      </section>

      {/* Single Product Card */}
      <section className="container mx-auto px-4 py-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative bg-white shadow-xl border-0 overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                  Most Popular
                </div>
              </div>

              <CardHeader className="text-center pt-8 pb-6">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {AI_BLUEPRINT_EDU_PRODUCT.name}
                </CardTitle>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {AI_BLUEPRINT_EDU_PRODUCT.description}
                </p>
                
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-indigo-600">
                    {formatPrice(billingPeriod).split('/')[0]}
                  </span>
                  <span className="text-xl text-gray-600 ml-2">
                    {billingPeriod === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-green-600 font-medium">
                    Save ${getYearlySavings()} compared to monthly billing
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <ul className="space-y-3 mb-8">
                  {AI_BLUEPRINT_EDU_PRODUCT.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 mt-0.5 text-indigo-600">
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="text-gray-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-semibold"
                  size="lg"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  No setup fees · Cancel anytime · Secure checkout
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Higher Ed Leaders Choose AI Blueprint
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tailored for Higher Ed</h3>
              <p className="text-gray-600">
                Built specifically for colleges and universities, addressing unique challenges in governance, 
                faculty adoption, and student success.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Data-Driven Insights</h3>
              <p className="text-gray-600">
                Compare your institution against peers, track progress over time, and make informed 
                decisions with comprehensive benchmarking data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance Ready</h3>
              <p className="text-gray-600">
                Stay ahead of regulations with built-in FERPA compliance, accreditation alignment, 
                and ethical AI frameworks designed for education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Institution's AI Strategy?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of institutions already using AI Blueprint to navigate their AI transformation journey.
          </p>
          <Button
            onClick={handleCheckout}
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
          >
            Start Your Assessment Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}