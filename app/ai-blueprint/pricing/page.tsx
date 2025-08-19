'use client';

import Link from 'next/link';
import { AI_BLUEPRINT_PRICING_TIERS } from '@/lib/ai-blueprint-tier-configuration';
import { generateAIBlueprintStripeCheckoutUrl } from '@/lib/ai-blueprint-tier-mapping';
import type { AIBlueprintTier } from '@/lib/ai-blueprint-tier-configuration';

export default function AIBlueprintPricingPage() {
  const handleGetStarted = (tier: AIBlueprintTier) => {
    // Handle Enterprise Partnership and AI Transformation Blueprint with consultation link
    if (tier === 'ai-enterprise-partnership' || tier === 'ai-transformation-blueprint') {
      window.open('https://calendly.com/jeremyestrella/30min?month=2025-07', '_blank');
      return;
    }
    
    const priceIds = {
      'higher-ed-ai-pulse-check': 'price_1RomXAELd2WOuqIWUJT4cY29',
      'ai-readiness-comprehensive': 'price_1Ro4tAELd2WOuqIWaDPEWxX3',
      'ai-transformation-blueprint': 'price_1RomY5ELd2WOuqIWd3wUhiQm',
      'ai-enterprise-partnership': 'price_1RomYtELd2WOuqIWKdsStKyQ'
    };
    
    const checkoutUrl = `/api/ai-blueprint/stripe/create-checkout?tier=${tier}&price_id=${priceIds[tier]}`;
    window.location.href = checkoutUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                North Path Strategies
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-blue-600 font-semibold">AI Blueprint Pricing</span>
            </div>
            <Link 
              href="/pricing" 
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Organizational Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-800 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI Blueprint for Higher Education
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            From Assessment to Action in 90 Days - The most comprehensive AI transformation program for colleges and universities
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-blue-700 px-4 py-2 rounded-full">✓ Patent-Pending Algorithms</span>
            <span className="bg-blue-700 px-4 py-2 rounded-full">✓ Higher Ed Focused</span>
            <span className="bg-blue-700 px-4 py-2 rounded-full">✓ Implementation Support</span>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your AI Transformation Path</h2>
          <p className="text-xl text-gray-600">Select the tier that best fits your institution's needs and strategic priorities</p>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {Object.entries(AI_BLUEPRINT_PRICING_TIERS).map(([tierKey, config]) => (
            <div 
              key={tierKey}
              className={`bg-white rounded-xl shadow-lg p-8 relative ${
                tierKey === 'ai-transformation-blueprint' ? 'ring-2 ring-blue-500 transform scale-105' : ''
              }`}
            >
              {tierKey === 'ai-transformation-blueprint' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{config.name}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {tierKey === 'ai-transformation-blueprint' || tierKey === 'ai-enterprise-partnership' 
                    ? 'Contact for Pricing' 
                    : `$${config.price.toLocaleString()}`}
                </div>
                <p className="text-gray-600 text-sm">{config.targetCustomer}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Assessment Scope</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {config.assessmentScope.questionCount} questions</li>
                    <li>• {config.assessmentScope.reportPages}-page report</li>
                    <li>• {config.assessmentScope.algorithms.join(', ')} algorithms</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {config.features.uploadSupport && <li>• Document upload & analysis</li>}
                    {config.features.policyGeneration && <li>• Custom policy generation</li>}
                    {config.features.scenarioBuilder && <li>• AI scenario builder</li>}
                    {config.features.facultyEnablement && <li>• Faculty enablement program</li>}
                    {config.features.implementationCoaching && <li>• Implementation coaching</li>}
                    {config.features.slackSupport && <li>• Dedicated Slack support</li>}
                    {config.features.officeHours && <li>• Monthly office hours</li>}
                    {config.features.quarterlyReassessment && <li>• Quarterly re-assessments</li>}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleGetStarted(tierKey as AIBlueprintTier)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  tierKey === 'ai-transformation-blueprint'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Algorithm Definitions */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Proprietary AI Algorithms
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">AIRIX™</h4>
              <p className="text-sm text-blue-800">AI Readiness Index - Core institutional AI readiness across strategic domains</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">AIRS™</h4>
              <p className="text-sm text-green-800">AI Readiness Scoring - Domain-specific maturity assessment</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">AICS™</h4>
              <p className="text-sm text-purple-800">AI Implementation Capacity - Resource capability analysis</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">AIMS™</h4>
              <p className="text-sm text-orange-800">AI Implementation Maturity - Current state assessment</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">AIPS™</h4>
              <p className="text-sm text-red-800">AI Implementation Priority - Action prioritization engine</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">AIBS™</h4>
              <p className="text-sm text-indigo-800">AI Benchmarking Scoring - Peer institution comparison</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h3>
          <p className="text-lg text-gray-600 mb-6">
            Learn more about our AI Blueprint methodology and implementation process
          </p>
          <div className="space-x-4">
            <Link 
              href="/ai-blueprint/implementation-guide"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Implementation Guide
            </Link>
            <Link 
              href="mailto:support@northpathstrategies.org"
              className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors inline-block"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
