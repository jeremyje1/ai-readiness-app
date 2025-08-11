'use client';

import React, { useState, useEffect } from 'react';
import K12AutonomousDashboard from '@/components/K12AutonomousDashboard';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  School,
  Users,
  BookOpen,
  Settings,
  Zap
} from 'lucide-react';

interface SchoolOnboarding {
  contactName: string;
  contactEmail: string;
  schoolName: string;
  schoolType: 'elementary' | 'middle' | 'high' | 'k12_district';
  studentCount: number;
  teacherCount: number;
  subscriptionTier: 'basic' | 'comprehensive' | 'complete';
  billingPeriod?: 'monthly' | 'yearly';
  hasExistingImplementation: boolean;
}

export default function K12ImplementationPage() {
  const [hasImplementation, setHasImplementation] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<SchoolOnboarding>({
    contactName: '',
    contactEmail: '',
    schoolName: '',
    schoolType: 'elementary',
    studentCount: 0,
    teacherCount: 0,
    subscriptionTier: 'complete',
    billingPeriod: 'monthly',
    hasExistingImplementation: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingImplementation();
    
    // Check if returning from successful Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const setupComplete = urlParams.get('setup');
    
    if (setupComplete === 'complete') {
      // Complete the implementation setup
      completeImplementationSetup();
    }
  }, []);

  const checkExistingImplementation = async () => {
    try {
      // Check if user has existing implementation
      const response = await fetch('/api/k12-implementation?action=status&schoolId=current');
      if (response.ok) {
        const data = await response.json();
        setHasImplementation(data.hasImplementation);
      } else {
        setHasImplementation(false);
      }
    } catch (error) {
      console.error('Failed to check implementation status:', error);
      setHasImplementation(false);
    } finally {
      setLoading(false);
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const deepLinkId = urlParams.get('institutionId');
      if (deepLinkId) {
        const r = await fetch(`/api/k12-implementation?action=status&schoolId=${encodeURIComponent(deepLinkId)}`);
        if (r.status === 404) {
          await fetch('/api/k12-implementation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start_implementation', schoolData: { id: deepLinkId, name: '', type: 'elementary', studentCount: 0, teacherCount: 0, subscriptionTier: 'complete', implementationPhases: [], currentPhase: 0, startDate: new Date(), progressOverall: 0 } }) });
          setHasImplementation(true);
        }
      }
    } catch {}
  };

  const completeImplementationSetup = async () => {
    try {
      setLoading(true);
      
      // Get the stored onboarding data
      const storedData = sessionStorage.getItem('k12_onboarding_data');
      if (!storedData) {
        console.error('No onboarding data found in session storage');
        // Clean up URL and stay on form
        window.history.replaceState({}, document.title, window.location.pathname);
        setShowOnboarding(true);
        setLoading(false);
        return;
      }
      
      const onboardingData = JSON.parse(storedData);
      console.log('Retrieved onboarding data:', onboardingData);
      
      const schoolData = {
        id: `school-${Date.now()}`,
        name: onboardingData.schoolName,
        type: onboardingData.schoolType,
        size: onboardingData.studentCount < 500 ? 'small' : onboardingData.studentCount < 1500 ? 'medium' : 'large',
        studentCount: onboardingData.studentCount,
        teacherCount: onboardingData.teacherCount,
        currentAIReadiness: 0,
        subscriptionTier: 'complete',
        implementationPhases: [],
        currentPhase: 1,
        startDate: new Date(),
        progressOverall: 0
      };

      const response = await fetch('/api/k12-implementation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_implementation',
          schoolData
        })
      });

      if (response.ok) {
        console.log('Implementation setup successful');
        setHasImplementation(true);
        // Clear the stored data
        sessionStorage.removeItem('k12_onboarding_data');
        // Remove the setup parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error('Failed to start implementation');
      }
    } catch (error) {
      console.error('Failed to complete implementation setup:', error);
      alert('Failed to complete setup. Please contact support.');
      // Clear the stored data even on error to prevent infinite loop
      sessionStorage.removeItem('k12_onboarding_data');
      // Remove the setup parameter from URL and show form
      window.history.replaceState({}, document.title, window.location.pathname);
      setShowOnboarding(true);
      setLoading(false);
    }
  };

  const startNewImplementation = async () => {
    // Validate required fields
    if (!onboardingData.contactName || !onboardingData.contactEmail || !onboardingData.schoolName || !onboardingData.studentCount || !onboardingData.teacherCount) {
      alert('Please fill in all required fields including contact name and email.');
      return;
    }

    try {
      setLoading(true);
      
      // Store the school data in sessionStorage for after payment
      sessionStorage.setItem('k12_onboarding_data', JSON.stringify(onboardingData));
      
      // Use POST to unified Stripe checkout with contact information
      const billing = onboardingData.billingPeriod || 'monthly';
      
      const response = await fetch('/api/stripe/unified-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingPeriod: billing,
          returnTo: 'k12',
          contactEmail: onboardingData.contactEmail,
          contactName: onboardingData.contactName
        })
      });
      
      if (response.ok) {
        // The API will redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
      
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading your implementation dashboard...</p>
        </div>
      </div>
    );
  }

  // Show onboarding form if no implementation exists
  if (!hasImplementation && !showOnboarding) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Autonomous K12 AI Implementation
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-white">
                Complete 90-day AI integration delivered automatically without phone calls or manual intervention
              </p>
              <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
                <Button 
                  onClick={() => setShowOnboarding(true)}
                  className="bg-yellow-500 text-black px-8 py-4 text-lg font-bold hover:bg-yellow-400 shadow-lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start 7-Day Free Trial
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Onboarding Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={onboardingData.contactName}
                  onChange={(e) => setOnboardingData({...onboardingData, contactName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={onboardingData.contactEmail}
                  onChange={(e) => setOnboardingData({...onboardingData, contactEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., john.smith@school.edu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  value={onboardingData.schoolName}
                  onChange={(e) => setOnboardingData({...onboardingData, schoolName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your school name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Type *
                </label>
                <select
                  value={onboardingData.schoolType}
                  onChange={(e) => setOnboardingData({...onboardingData, schoolType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="elementary">Elementary School (K-5)</option>
                  <option value="middle">Middle School (6-8)</option>
                  <option value="high">High School (9-12)</option>
                  <option value="k12_district">K-12 District</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Count *
                  </label>
                  <input
                    type="number"
                    value={onboardingData.studentCount || ''}
                    onChange={(e) => setOnboardingData({...onboardingData, studentCount: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Number of students"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher Count *
                  </label>
                  <input
                    type="number"
                    value={onboardingData.teacherCount || ''}
                    onChange={(e) => setOnboardingData({...onboardingData, teacherCount: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Number of teachers"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Period
                </label>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setOnboardingData({ ...onboardingData, billingPeriod: 'monthly' })}
                    className={`px-4 py-2 text-sm font-medium border ${onboardingData.billingPeriod === 'monthly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'}`}
                  >
                    Monthly ($99)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingData({ ...onboardingData, billingPeriod: 'yearly' })}
                    className={`px-4 py-2 text-sm font-medium border ${onboardingData.billingPeriod === 'yearly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'}`}
                  >
                    Yearly ($999)
                  </button>
                </div>
                <p className="text-xs text-green-700 mt-2">🎉 7-Day Free Trial • Cancel anytime</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setShowOnboarding(false)}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={startNewImplementation}
                disabled={!onboardingData.schoolName || !onboardingData.studentCount || !onboardingData.teacherCount || loading}
                className="flex-1 bg-yellow-500 text-black font-bold hover:bg-yellow-400 disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start 7-Day Free Trial
              </Button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>7-Day Free Trial</strong> starts immediately - no charge until trial ends</li>
                <li>• AI immediately begins your infrastructure assessment</li>
                <li>• Automated teacher readiness survey is deployed</li>
                <li>• COPPA compliance review starts automatically</li>
                <li>• All deliverables generate without manual work</li>
                <li>• Implementation proceeds through 5 phases autonomously</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!loading && hasImplementation === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">No Implementation Started</h2>
          <p className="text-gray-600 mb-6">Start your autonomous implementation to populate your dashboard.</p>
          <Button onClick={() => setShowOnboarding(true)}>Begin Onboarding</Button>
        </div>
      </div>
    );
  }

  // Show implementation dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <K12AutonomousDashboard />
      </div>
    </div>
  );
}
