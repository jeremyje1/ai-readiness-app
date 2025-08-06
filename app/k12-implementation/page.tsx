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
  schoolName: string;
  schoolType: 'elementary' | 'middle' | 'high' | 'k12_district';
  studentCount: number;
  teacherCount: number;
  subscriptionTier: 'basic' | 'comprehensive';
  hasExistingImplementation: boolean;
}

export default function K12ImplementationPage() {
  const [hasImplementation, setHasImplementation] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<SchoolOnboarding>({
    schoolName: '',
    schoolType: 'elementary',
    studentCount: 0,
    teacherCount: 0,
    subscriptionTier: 'basic',
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
  };

  const completeImplementationSetup = async () => {
    try {
      setLoading(true);
      
      // Get the stored onboarding data
      const storedData = sessionStorage.getItem('k12_onboarding_data');
      if (!storedData) {
        throw new Error('No onboarding data found');
      }
      
      const onboardingData = JSON.parse(storedData);
      
      const schoolData = {
        id: `school-${Date.now()}`,
        name: onboardingData.schoolName,
        type: onboardingData.schoolType,
        size: onboardingData.studentCount < 500 ? 'small' : onboardingData.studentCount < 1500 ? 'medium' : 'large',
        studentCount: onboardingData.studentCount,
        teacherCount: onboardingData.teacherCount,
        currentAIReadiness: 0,
        subscriptionTier: onboardingData.subscriptionTier,
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
      setLoading(false);
    }
  };

  const startNewImplementation = async () => {
    try {
      setLoading(true);
      
      // Redirect to Stripe checkout based on subscription tier
      const priceId = onboardingData.subscriptionTier === 'basic' 
        ? 'price_1Rsp7LGrA5DxvwDNHgskPPpl' // Essentials
        : 'price_1Rsp7MGrA5DxvwDNUNqx3Lsf'; // Professional
      
      const tier = onboardingData.subscriptionTier === 'basic' 
        ? 'ai-blueprint-essentials' 
        : 'ai-blueprint-professional';
      
      // Store the school data in sessionStorage for after payment
      sessionStorage.setItem('k12_onboarding_data', JSON.stringify(onboardingData));
      
      // Redirect to Stripe checkout with trial
      const checkoutUrl = `/api/ai-blueprint/stripe/create-checkout?tier=${tier}&price_id=${priceId}&trial_days=7&success_url=${encodeURIComponent(window.location.origin + '/k12-implementation?setup=complete')}&cancel_url=${encodeURIComponent(window.location.origin + '/k12-implementation')}`;
      window.location.href = checkoutUrl;
      
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your implementation dashboard...</p>
        </div>
      </div>
    );
  }

  // Show onboarding form if no implementation exists
  if (!hasImplementation && !showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Autonomous K12 AI Implementation
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
                Complete 90-day AI integration delivered automatically without phone calls or manual intervention
              </p>
              <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
                <Button 
                  onClick={() => setShowOnboarding(true)}
                  className="bg-white text-pink-600 px-8 py-4 text-lg font-semibold hover:bg-gray-100"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Autonomous Implementation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fully Autonomous Implementation</h2>
            <p className="text-xl text-gray-600">Everything delivered automatically through AI-powered systems</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Zero Manual Work</h3>
              <p className="text-gray-600">All assessments, reports, and deliverables generated automatically using AI</p>
            </Card>

            <Card className="p-8 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Intelligent Automation</h3>
              <p className="text-gray-600">AI monitors progress and automatically moves through implementation phases</p>
            </Card>

            <Card className="p-8 text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Complete Deliverables</h3>
              <p className="text-gray-600">Receive all 20+ implementation deliverables without any manual intervention</p>
            </Card>
          </div>

          {/* What You Get */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What You Get Automatically</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                'AI Readiness Assessment',
                'Infrastructure Gap Analysis',
                'Teacher Training Materials',
                'COPPA Compliance Checklist',
                'Implementation Roadmap',
                'AI Tool Recommendations',
                'Security Setup Guides',
                'Parent Communication Templates',
                'Usage Analytics Dashboard',
                'Deployment Success Reports',
                'Policy Templates',
                'Training Video Series',
                'Workshop Materials',
                'Progress Tracking',
                'Automated Monitoring',
                'Success Metrics'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding form
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            <div className="text-center mb-8">
              <School className="h-12 w-12 text-pink-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Setup Your Autonomous Implementation</h2>
              <p className="text-gray-600 mt-2">Tell us about your school to customize your AI implementation</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  value={onboardingData.schoolName}
                  onChange={(e) => setOnboardingData({...onboardingData, schoolName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
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
                    value={onboardingData.studentCount}
                    onChange={(e) => setOnboardingData({...onboardingData, studentCount: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
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
                    value={onboardingData.teacherCount}
                    onChange={(e) => setOnboardingData({...onboardingData, teacherCount: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Number of teachers"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Implementation Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer ${
                      onboardingData.subscriptionTier === 'basic' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                    }`}
                    onClick={() => setOnboardingData({...onboardingData, subscriptionTier: 'basic'})}
                  >
                    <h4 className="font-semibold">Basic Implementation</h4>
                    <p className="text-sm text-gray-600">$199/month • Essential AI integration</p>
                  </div>
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer ${
                      onboardingData.subscriptionTier === 'comprehensive' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                    }`}
                    onClick={() => setOnboardingData({...onboardingData, subscriptionTier: 'comprehensive'})}
                  >
                    <h4 className="font-semibold">Comprehensive Implementation</h4>
                    <p className="text-sm text-gray-600">$499/month • Full support & training</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowOnboarding(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={startNewImplementation}
                  disabled={!onboardingData.schoolName || !onboardingData.studentCount || !onboardingData.teacherCount || loading}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Start Autonomous Implementation
                </Button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
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

  // Show implementation dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <K12AutonomousDashboard />
      </div>
    </div>
  );
}
