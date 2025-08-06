'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HigherEdAutonomousDashboard from '@/components/HigherEdAutonomousDashboard';
import { CheckCircle, GraduationCap, Users, Building2, Zap, BookOpen, Shield } from 'lucide-react';

export default function HigherEdImplementationPage() {
  const [currentStep, setCurrentStep] = useState<'onboarding' | 'dashboard'>('onboarding');
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    name: '',
    type: '',
    size: '',
    studentCount: '',
    facultyCount: '',
    subscriptionTier: 'professional'
  });

  // Check if user already has an active implementation
  useEffect(() => {
    const savedInstitutionId = localStorage.getItem('higheredInstitutionId');
    if (savedInstitutionId) {
      setInstitutionId(savedInstitutionId);
      setCurrentStep('dashboard');
      return;
    }

    // Check if returning from successful Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const setupComplete = urlParams.get('setup');
    
    if (setupComplete === 'complete') {
      const storedData = sessionStorage.getItem('higherEdInstitutionData');
      if (storedData) {
        const institutionData = JSON.parse(storedData);
        
        // Start the implementation with the stored data
        fetch('/api/highered-implementation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            institutionData: {
              ...institutionData,
              studentCount: parseInt(institutionData.studentCount),
              facultyCount: parseInt(institutionData.facultyCount)
            }
          })
        })
        .then(response => response.json())
        .then(result => {
          if (result.institutionId) {
            setInstitutionId(result.institutionId);
            localStorage.setItem('higheredInstitutionId', result.institutionId);
            setCurrentStep('dashboard');
            
            // Clean up
            sessionStorage.removeItem('higherEdInstitutionData');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(error => {
          console.error('Failed to complete setup:', error);
          setError('Failed to complete setup. Please contact support.');
          // Clean up session data even on error to prevent infinite loop
          sessionStorage.removeItem('higherEdInstitutionData');
          window.history.replaceState({}, document.title, window.location.pathname);
        });
      } else {
        // No stored data, clean up URL and redirect to form
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startImplementation = async () => {
    if (!formData.contactName || !formData.contactEmail || !formData.name || !formData.type || !formData.size || !formData.studentCount || !formData.facultyCount) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get price IDs based on subscription tier
      const priceId = formData.subscriptionTier === 'essentials' 
        ? 'price_1Rsp7LGrA5DxvwDNHgskPPpl' // Essentials price ID
        : 'price_1Rsp7MGrA5DxvwDNUNqx3Lsf'; // Professional price ID
      
      const tier = formData.subscriptionTier === 'essentials' 
        ? 'essentials' 
        : 'professional';

      // Store the institution data in sessionStorage for after payment
      sessionStorage.setItem('higherEdInstitutionData', JSON.stringify(formData));

      // Redirect to Stripe checkout (7-day free trial)
      const checkoutUrl = `/api/ai-blueprint/stripe/create-checkout?tier=${tier}&price_id=${priceId}&trial_days=7&success_url=${encodeURIComponent(window.location.origin + '/highered-implementation?setup=complete')}&cancel_url=${encodeURIComponent(window.location.origin + '/highered-implementation')}`;
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Failed to start checkout:', error);
      setError('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetImplementation = () => {
    localStorage.removeItem('higheredInstitutionId');
    setInstitutionId(null);
    setCurrentStep('onboarding');
    setFormData({
      contactName: '',
      contactEmail: '',
      name: '',
      type: '',
      size: '',
      studentCount: '',
      facultyCount: '',
      subscriptionTier: 'professional'
    });
  };

  if (currentStep === 'dashboard' && institutionId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                <h1 className="text-xl font-semibold">Higher Ed AI Blueprint Dashboard</h1>
              </div>
              <Button variant="outline" onClick={resetImplementation}>
                Start New Implementation
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HigherEdAutonomousDashboard institutionId={institutionId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-semibold">Higher Ed AI Blueprint Implementation</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-lg mb-8">
            <h2 className="text-4xl font-bold mb-4">Transform Your Institution with AI</h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Get your comprehensive AI implementation plan with all deliverables generated autonomously - no manual work required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fully Autonomous</h3>
                <p className="text-gray-600 text-sm">
                  AI generates all reports, policies, and training materials automatically
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Complete Documentation</h3>
                <p className="text-gray-600 text-sm">
                  All implementation guides, policies, and training curricula included
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">FERPA Compliant</h3>
                <p className="text-gray-600 text-sm">
                  Built-in compliance framework and data protection protocols
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Implementation Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>What You Get - 100% Autonomous Delivery</span>
            </CardTitle>
            <CardDescription>
              Every deliverable is generated automatically by AI - no manual work or consulting calls required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-indigo-600">Phase 1: Assessment & Strategy (Days 1-21)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive institutional AI readiness assessment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Faculty development needs analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Academic department integration analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Student services enhancement opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Research infrastructure evaluation</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-indigo-600">Phase 2: Policy & Planning (Days 22-42)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Institutional AI strategy document</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Academic AI usage policies</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>FERPA compliance framework</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Budget and resource allocation plan</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Student AI ethics framework</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-indigo-600">Phase 3: Infrastructure (Days 43-63)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Platform integration configuration guide</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>LMS and SIS integration documentation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Data security implementation framework</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Department-specific AI tool configurations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Research infrastructure enhancement setup</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-indigo-600">Phase 4: Training & Deployment (Days 64-105)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive faculty training curriculum</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Department-specific training materials</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Student AI literacy program</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Pilot course implementation results</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Academic support staff training resources</span>
                  </li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-semibold mb-3 text-indigo-600">Phase 5: Campus-Wide Excellence (Days 106-150)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Campus deployment success report</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Student services AI integration</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Administrative optimization results</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Research collaboration platform</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Ongoing excellence monitoring framework</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Quarterly performance reports (automated)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Form */}
        <Card>
          <CardHeader>
            <CardTitle>Start Your Autonomous AI Implementation</CardTitle>
            <CardDescription>
              Provide your institution details to begin the fully automated implementation process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="e.g., John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="e.g., john.smith@university.edu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Institution Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., State University"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Institution Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community_college">Community College</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="private_college">Private College</SelectItem>
                    <SelectItem value="research_university">Research University</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Institution Size *</Label>
                <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (Under 5,000 students)</SelectItem>
                    <SelectItem value="medium">Medium (5,000-15,000 students)</SelectItem>
                    <SelectItem value="large">Large (Over 15,000 students)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionTier">Subscription Plan</Label>
                <Select value={formData.subscriptionTier} onValueChange={(value) => handleInputChange('subscriptionTier', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essentials">AI Blueprint Essentials ($199/month)</SelectItem>
                    <SelectItem value="professional">AI Blueprint Professional ($499/month)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-green-600 font-medium mt-1">
                  🎉 7-Day Free Trial - No charge until trial ends
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  For custom enterprise solutions, contact us at <a href="mailto:info@northpathstrategies.org" className="text-blue-600 hover:underline">info@northpathstrategies.org</a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentCount">Student Count *</Label>
                <Input
                  id="studentCount"
                  type="number"
                  value={formData.studentCount}
                  onChange={(e) => handleInputChange('studentCount', e.target.value)}
                  placeholder="e.g., 10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facultyCount">Faculty Count *</Label>
                <Input
                  id="facultyCount"
                  type="number"
                  value={formData.facultyCount}
                  onChange={(e) => handleInputChange('facultyCount', e.target.value)}
                  placeholder="e.g., 500"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={startImplementation} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Implementation...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Start 7-Day Free Trial
                  </span>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>🎉 <strong className="text-green-600">7-Day Free Trial</strong> - Start immediately with full access</p>
              <p>🚀 Implementation begins right away with AI-generated deliverables</p>
              <p>📊 All reports, policies, and training materials created autonomously</p>
              <p>💳 No charge until your trial period ends</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
