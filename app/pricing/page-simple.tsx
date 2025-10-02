'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SimplePricingPage() {
  const handleGetStarted = () => {
    window.location.href = '/start?billing=monthly';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              AI Blueprint
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/pricing" className="text-indigo-600 font-medium">Pricing</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white py-16">
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Everything you need to transform your institution with AI - one price, complete access
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-indigo-500 shadow-2xl">
              <CardHeader className="text-center bg-gradient-to-br from-indigo-50 to-blue-50 pb-8">
                <div className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
                  Complete Platform Access
                </div>
                <CardTitle className="text-4xl font-bold mb-2">
                  <span className="text-5xl">$199</span>
                  <span className="text-2xl text-gray-600">/month</span>
                </CardTitle>
                <p className="text-gray-600 mt-4">
                  7-day free trial • Cancel anytime • Full access to everything
                </p>
              </CardHeader>

              <CardContent className="pt-8 pb-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Comprehensive AI Readiness Assessment</p>
                      <p className="text-sm text-gray-600">Complete institutional analysis and benchmarking</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Interactive Dashboard</p>
                      <p className="text-sm text-gray-600">Real-time analytics and progress tracking</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Custom Implementation Roadmap</p>
                      <p className="text-sm text-gray-600">Tailored action plans for your institution</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Policy & Governance Templates</p>
                      <p className="text-sm text-gray-600">Ready-to-use frameworks and documentation</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Expert Support</p>
                      <p className="text-sm text-gray-600">Email support and implementation guidance</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">All Future Features</p>
                      <p className="text-sm text-gray-600">Continuous platform updates at no extra cost</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
                  size="lg"
                >
                  Start 7-Day Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  No credit card required for trial • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
