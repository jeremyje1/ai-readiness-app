'use client';

import Link from 'next/link';

export default function AIBlueprintAssessmentPage() {
  const handleGetStarted = (tier: string, priceId: string, trialDays?: number) => {
    let checkoutUrl = `/api/ai-blueprint/stripe/create-checkout?tier=${tier}&price_id=${priceId}`;
    if (trialDays) {
      checkoutUrl += `&trial_days=${trialDays}`;
    }
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
              <span className="text-blue-600 font-semibold">AI Blueprint</span>
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
      <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold mb-6">
              🚀 NEW: 100% Autonomous Implementation - No Manual Work Required!
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              AI Blueprint™
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
              The World's First 100% Autonomous AI Transformation System for Education
            </p>
            <p className="text-lg mb-12 max-width-3xl mx-auto opacity-80">
              Complete end-to-end implementation with zero manual work required. Get full AI transformation in 150 days with real-time progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleGetStarted('ai-blueprint-essentials', 'price_1Rsp7LGrA5DxvwDNHgskPPpl', 7)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Start Free Trial - $199/month
              </button>
              <Link 
                href="#pricing" 
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors border border-white border-opacity-20"
              >
                View All Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Revolutionary Autonomous Implementation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No consulting calls. No manual work. No waiting. Our AI system generates all documents, policies, training materials, and implementation plans automatically.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Autonomous Delivery</h3>
              <p className="text-gray-600">AI generates all reports, policies, training curricula, and implementation plans automatically.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Education Focused</h3>
              <p className="text-gray-600">Specifically designed for K12 and Higher Education with compliance frameworks and academic integrity.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Implementation</h3>
              <p className="text-gray-600">We don't just diagnose—we deliver complete transformation with all documentation and training included.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">11+ Documents Generated</h3>
              <p className="text-gray-600">Comprehensive documentation including strategies, policies, training curricula, and compliance frameworks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Tracks */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Implementation Track
            </h2>
            <p className="text-xl text-gray-600">
              Specialized autonomous implementation for your education sector
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200">
              <div className="text-center">
                <span className="text-4xl mb-4 block">🎓</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Higher Education</h3>
                <p className="text-gray-600 mb-6">Complete implementation for colleges and universities with FERPA compliance, faculty development, and research enhancement.</p>
                <Link 
                  href="/highered-implementation"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                >
                  Start Higher Ed Implementation
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
              <div className="text-center">
                <span className="text-4xl mb-4 block">🏫</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">K12 Education</h3>
                <p className="text-gray-600 mb-6">Comprehensive implementation for K12 schools and districts with COPPA compliance, teacher training, and student safety focus.</p>
                <Link 
                  href="/k12-implementation"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                >
                  Start K12 Implementation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Transparent Monthly Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your institution's needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Essentials Plan */}
            <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Blueprint Essentials</h3>
                <div className="text-4xl font-bold text-green-600 mb-2">$199<span className="text-lg text-gray-500">/month</span></div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  7-Day Free Trial
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Autonomous implementation (Higher Ed or K12)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Core AI assessment and planning</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Document generation (5 documents)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Basic progress tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Up to 5 users</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Email support</span>
                </li>
              </ul>
              
              <button
                onClick={() => handleGetStarted('ai-blueprint-essentials', 'price_1Rsp7LGrA5DxvwDNHgskPPpl', 7)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </button>
            </div>
            
            {/* Professional Plan */}
            <div className="bg-white rounded-xl shadow-xl border-2 border-blue-500 p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Blueprint Professional</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$499<span className="text-lg text-gray-500">/month</span></div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  7-Day Free Trial
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Everything in Essentials, plus:</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Advanced autonomous features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Complete document generation (11+ documents)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Enhanced stakeholder engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Priority AI processing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Up to 15 users</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Phone & priority support</span>
                </li>
              </ul>
              
              <button
                onClick={() => handleGetStarted('ai-blueprint-professional', 'price_1Rsp7MGrA5DxvwDNUNqx3Lsf', 7)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
          
          {/* Enterprise Option */}
          <div className="mt-12 text-center">
            <div className="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Blueprint Enterprise</h3>
              <p className="text-gray-600 mb-6">
                Multi-institution deployment, white-label solution, custom branding, unlimited users, and dedicated success manager.
              </p>
              <Link 
                href="https://northpathstrategies.org/contact/"
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Get Enterprise Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Institution with AI?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your 100% autonomous AI implementation today. Complete transformation in 150 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleGetStarted('ai-blueprint-essentials', 'price_1Rsp7LGrA5DxvwDNHgskPPpl', 7)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Start Free Trial - $199/month
            </button>
            <Link 
              href="https://calendly.com/jeremyestrella/30min?month=2025-08"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors border border-white border-opacity-20"
            >
              Schedule Consultation
            </Link>
          </div>
          
          <div className="mt-8 p-6 bg-yellow-400 bg-opacity-20 rounded-lg border border-yellow-400 border-opacity-30">
            <h4 className="font-bold mb-2">💡 Special Launch Offer</h4>
            <p className="text-sm opacity-90">Use code <strong>AIREADY2025</strong> for 50% off your first month on any subscription plan!</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold mb-2">AI Blueprint™</p>
          <p className="text-gray-400 mb-4">Powered by North Path Strategies</p>
          <p className="text-sm text-gray-400">
            100% Autonomous Implementation - From Assessment to Action in 150 Days
          </p>
          <p className="text-sm text-green-400 mt-2">
            🚀 The world's first autonomous AI transformation system for education
          </p>
        </div>
      </div>
    </div>
  );
}
            </div>
      </div>
    </div>
  );
}

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
