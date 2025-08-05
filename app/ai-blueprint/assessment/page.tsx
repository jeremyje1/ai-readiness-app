'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { getAIBlueprintTierFeatures } from '@/lib/ai-blueprint-tier-configuration';
import type { AIBlueprintTier } from '@/lib/ai-blueprint-tier-configuration';

function AssessmentContent() {
  const searchParams = useSearchParams();
  const [tier, setTier] = useState<AIBlueprintTier | null>(null);
  const [tierConfig, setTierConfig] = useState<any>(null);

  useEffect(() => {
    const tierParam = searchParams.get('tier') as AIBlueprintTier;
    if (tierParam) {
      setTier(tierParam);
      setTierConfig(getAIBlueprintTierFeatures(tierParam));
    }
  }, [searchParams]);

  if (!tier || !tierConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Access</h1>
          <p className="text-gray-600 mb-6">Please select a valid AI Blueprint tier to continue.</p>
          <Link 
            href="/ai-blueprint/pricing"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View AI Blueprint Pricing
          </Link>
        </div>
      </div>
    );
  }

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
              <span className="text-blue-600 font-semibold">AI Blueprint Assessment</span>
            </div>
            <div className="text-sm text-gray-600">
              {tierConfig.name} - ${tierConfig.price.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your AI Blueprint Assessment
            </h1>
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {tierConfig.name}
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You're about to begin a comprehensive AI readiness assessment designed specifically for higher education institutions. 
              This assessment will analyze your institution across {tierConfig.assessmentScope.sections.length} key domains.
            </p>
          </div>

          {/* Assessment Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {tierConfig.assessmentScope.questionCount}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {tierConfig.assessmentScope.algorithms.length}
              </div>
              <div className="text-sm text-gray-600">AI Algorithms</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {tierConfig.assessmentScope.reportPages}
              </div>
              <div className="text-sm text-gray-600">Page Report</div>
            </div>
          </div>

          {/* Algorithms Used */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Proprietary Algorithms</h3>
            <div className="flex flex-wrap gap-2">
              {tierConfig.assessmentScope.algorithms.map((algorithm: string, index: number) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {algorithm}
                </span>
              ))}
            </div>
          </div>

          {/* Assessment Sections */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Domains</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {tierConfig.assessmentScope.sections.map((section: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{section}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Assessment Button */}
          <div className="text-center">
            <button 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              onClick={() => {
                // TODO: Implement assessment start logic
                alert('Assessment functionality will be implemented next');
              }}
            >
              Begin AI Blueprint Assessment
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Estimated time: {Math.ceil(tierConfig.assessmentScope.questionCount / 2)} minutes
            </p>
          </div>
        </div>

        {/* Features & Support */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">What's Included</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Core Deliverables</h4>
              <ul className="space-y-2">
                {tierConfig.coreDeliverables.map((deliverable: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2 text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Support & Follow-up</h4>
              <div className="text-sm text-gray-600">
                <p>{tierConfig.assessmentScope.followUpSupport}</p>
                {tierConfig.features.slackSupport && (
                  <p className="mt-2">✓ Dedicated Slack advisory channel</p>
                )}
                {tierConfig.features.officeHours && (
                  <p className="mt-2">✓ Monthly strategy office hours</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIBlueprintAssessmentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <AssessmentContent />
    </Suspense>
  );
}
