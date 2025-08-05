import React from 'react';
import { PaymentGate } from '@/components/PaymentGate';
import { Suspense } from 'react';

function EnterpriseAssessment() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Enterprise AI Partnership Program
          </h1>
          <p className="text-gray-600 mb-8">
            Premium enterprise-level assessment with dedicated support, custom analysis, and ongoing partnership opportunities.
          </p>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Enterprise Assessment Loading...
              </h3>
              <p className="text-gray-600">
                Your enterprise partnership assessment will load here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaidEnterprisePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentGate requiredTier="enterprise-partnership">
        <EnterpriseAssessment />
      </PaymentGate>
    </Suspense>
  );
}
