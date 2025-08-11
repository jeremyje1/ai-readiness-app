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
    subscriptionTier: 'complete',
    billingPeriod: 'monthly'
  });

  // Check if user already has an active implementation
  useEffect(() => {
    // Support deep link from email: /highered-implementation?institutionId=...
    const initialParams = new URLSearchParams(window.location.search);
    const deepLinkInstitutionId = initialParams.get('institutionId');
    if (deepLinkInstitutionId) {
      localStorage.setItem('higheredInstitutionId', deepLinkInstitutionId);
      setInstitutionId(deepLinkInstitutionId);
      // Attempt to load; if 404, start blank implementation
      fetch(`/api/highered-implementation?institutionId=${encodeURIComponent(deepLinkInstitutionId)}&action=status`).then(async r => {
        if (r.status === 404) {
          await fetch('/api/highered-implementation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'initialize_blank', institutionData: { id: deepLinkInstitutionId } })
          });
        }
        setCurrentStep('dashboard');
      });
      return;
    }

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
            
            // Send welcome email with deep-link institutionId
            fetch('/api/send-welcome-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: institutionData.contactEmail,
                name: institutionData.contactName,
                implementationType: 'highered',
                subscriptionTier: 'complete',
                billingPeriod: institutionData.billingPeriod,
                institutionId: result.institutionId
              })
            }).catch(err => console.error('Failed to send welcome email:', err));
            
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
      // Store the institution data in sessionStorage for after payment
      sessionStorage.setItem('higherEdInstitutionData', JSON.stringify(formData));

      // Redirect to unified Stripe checkout (7-day free trial)
      const checkoutUrl = `/api/stripe/unified-checkout?billing=${formData.billingPeriod}&trial_days=7&return_to=highered`;
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
      subscriptionTier: 'complete',
      billingPeriod: 'monthly'
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
              <h1 className="text-xl font-semibold">Higher Ed AI Blueprint</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Start Your Autonomous Implementation</CardTitle>
            <CardDescription>7‑day free trial • Cancel anytime</CardDescription>
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
                <Label htmlFor="subscriptionTier">Billing Period</Label>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => handleInputChange('billingPeriod', 'monthly')}
                    className={`px-4 py-2 text-sm font-medium border ${formData.billingPeriod === 'monthly' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'}`}
                  >
                    Monthly ($99)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('billingPeriod', 'yearly')}
                    className={`px-4 py-2 text-sm font-medium border ${formData.billingPeriod === 'yearly' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'}`}
                  >
                    Yearly ($999)
                  </button>
                </div>
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
