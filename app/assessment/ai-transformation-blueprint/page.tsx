import React from 'react';
import { PaymentGate } from '@/components/PaymentGate';
import { Suspense } from 'react';

function TransformationBlueprintAssessment() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            AI Transformation Blueprint
          </h1>
          <p className="text-gray-600 mb-8">
            Comprehensive transformation planning with detailed roadmap and implementation strategy for AI adoption.
          </p>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Blueprint Assessment Loading...
              </h3>
              <p className="text-gray-600">
                Your AI transformation blueprint assessment will load here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaidBlueprintPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentGate requiredTier="ai-transformation-blueprint">
        <TransformationBlueprintAssessment />
      </PaymentGate>
    </Suspense>
  );
}
