import React from 'react';
import { PaymentGate } from '@/components/PaymentGate';
import { Suspense } from 'react';

// Import your existing AI readiness assessment component
function AIReadinessAssessment() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            AI Readiness Comprehensive Assessment
          </h1>
          <p className="text-gray-600 mb-8">
            Welcome to your comprehensive AI readiness assessment. This evaluation will analyze your organization's readiness for AI implementation across multiple dimensions.
          </p>
          
          {/* Your existing assessment component would go here */}
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Assessment Loading...
              </h3>
              <p className="text-gray-600">
                Your comprehensive AI readiness assessment will load here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaidAIReadinessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentGate requiredTier="ai-readiness-comprehensive">
        <AIReadinessAssessment />
      </PaymentGate>
    </Suspense>
  );
}
