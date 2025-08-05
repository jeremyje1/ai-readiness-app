/**
 * AI Readiness Assessment Start Page
 * Entry point for AI readiness assessments after Stripe checkout
 * 
 * @version 1.0.0
 * @author NorthPath Strategies
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function AIReadinessStartContent() {
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and redirect to assessment
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (tier) {
        window.location.href = `/ai-readiness/assessment?tier=${tier}`;
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [tier]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Setting up your AI Readiness Assessment
          </h1>
          <p className="text-gray-600 mb-4">
            Tier: <span className="font-semibold">{tier === 'basic' ? 'Advanced' : 'Comprehensive'} AI Assessment</span>
          </p>
          <p className="text-sm text-gray-500">
            Please wait while we prepare your personalized assessment experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Begin!
        </h1>
        <p className="text-gray-600 mb-6">
          Your AI readiness assessment is ready. You'll be redirected to the assessment form momentarily.
        </p>
        <button 
          onClick={() => window.location.href = `/ai-readiness/assessment?tier=${tier}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Start Assessment Now
        </button>
      </div>
    </div>
  );
}

export default function AIReadinessStartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Loading AI Readiness Assessment
          </h1>
          <p className="text-sm text-gray-500">
            Please wait...
          </p>
        </div>
      </div>
    }>
      <AIReadinessStartContent />
    </Suspense>
  );
}
