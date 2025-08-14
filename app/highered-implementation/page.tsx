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
  const [pricing, setPricing] = useState<{
    monthlyCents: number | null;
    yearlyCents: number | null;
    selfServeCents?: number | null;
    boardReadyCents?: number | null;
    enterpriseCents?: number | null;
  }>({ monthlyCents: null, yearlyCents: null, selfServeCents: null, boardReadyCents: null, enterpriseCents: null });
  
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
    // Load Stripe pricing to ensure accurate display
  fetch('/api/pricing/unified')
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        setPricing({
          monthlyCents: typeof data?.monthly?.unit_amount === 'number' ? data.monthly.unit_amount : null,
          yearlyCents: typeof data?.yearly?.unit_amount === 'number' ? data.yearly.unit_amount : null,
      selfServeCents: typeof data?.selfServeAssessment?.unit_amount === 'number' ? data.selfServeAssessment.unit_amount : null,
      boardReadyCents: typeof data?.boardReadyPro?.unit_amount === 'number' ? data.boardReadyPro.unit_amount : null,
      enterpriseCents: typeof data?.enterpriseReadinessProgram?.unit_amount === 'number' ? data.enterpriseReadinessProgram.unit_amount : null,
        });
      })
      .catch(() => {});

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
  const checkoutUrl = `/api/stripe/unified-checkout?product=team&billing=${formData.billingPeriod}&trial_days=7&return_to=highered`;
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

      {/* Marketing Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">Autonomous Higher Ed AI Implementation</h2>
              <p className="mt-4 text-indigo-100 text-lg">90-day AI integration for universities—delivered automatically with no sales calls, no meetings, and no friction.</p>
              <ul className="mt-6 space-y-2 text-indigo-100">
                <li className="flex items-start"><CheckCircle className="h-5 w-5 text-emerald-300 mr-2 mt-0.5" /> Strategic roadmap, policies, training, and integration guidance generated by AI</li>
                <li className="flex items-start"><Shield className="h-5 w-5 text-emerald-300 mr-2 mt-0.5" /> FERPA-aligned deliverables and institutional data safeguards</li>
                <li className="flex items-start"><BookOpen className="h-5 w-5 text-emerald-300 mr-2 mt-0.5" /> Faculty development plans and curriculum integration playbooks</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-md p-4 text-center">
                  <div className="text-3xl font-bold">{pricing.monthlyCents ? `$${(pricing.monthlyCents/100).toLocaleString()}` : '$—'}</div>
                  <div className="text-indigo-100">Monthly</div>
                </div>
                <div className="bg-white/10 rounded-md p-4 text-center">
                  <div className="text-3xl font-bold">{pricing.yearlyCents ? `$${(pricing.yearlyCents/100).toLocaleString()}` : '$—'}</div>
                  <div className="text-indigo-100">Yearly</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-indigo-100">7‑day free trial • Cancel anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credibility + What’s Included */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What’s Included</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>AI Strategy & Roadmap</li>
              <li>Academic AI Policies</li>
              <li>Faculty Development Plan</li>
              <li>Integration Guide</li>
              <li>Compliance & Risk Controls</li>
            </ul>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Why Institutions Choose Us</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Autonomous delivery (no meetings needed)</li>
              <li>Rapid setup and visible outcomes in days</li>
              <li>Aligned to higher-ed governance and FERPA</li>
              <li>Clear milestones and measurable progress</li>
            </ul>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Proof & Credibility</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Policy frameworks used across districts and universities</li>
              <li>Security-first approach to institutional data</li>
              <li>Backed by continuous AI improvements</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pricing</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {/* Self-Serve Assessment */}
          <div className="bg-white border rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-gray-900">Self‑Serve Assessment</h3>
            <p className="text-sm text-gray-600 mt-1">One‑time</p>
            <div className="text-3xl font-bold mt-4">{pricing.selfServeCents ? `$${(pricing.selfServeCents/100).toLocaleString()}` : '$1,950'}</div>
            <ul className="text-sm text-gray-600 mt-4 space-y-1">
              <li>Readiness survey</li>
              <li>12‑page AI narrative report</li>
              <li>30‑min office hours</li>
            </ul>
            <Button className="mt-auto w-full" onClick={() => { window.location.href = `/api/stripe/unified-checkout?product=self-serve&return_to=highered`; }}>Buy Now</Button>
          </div>

          {/* Team Subscription */}
          <div className="bg-white border rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-gray-900">Team Subscription</h3>
            <p className="text-sm text-gray-600 mt-1">Monthly or Yearly</p>
            <div className="mt-4">
              <div className="text-sm text-gray-500">Monthly</div>
              <div className="text-2xl font-bold">{pricing.monthlyCents ? `$${(pricing.monthlyCents/100).toLocaleString()}/mo` : '$995/mo'}</div>
              <div className="text-sm text-gray-500 mt-3">Yearly</div>
              <div className="text-2xl font-bold">{pricing.yearlyCents ? `$${(pricing.yearlyCents/100).toLocaleString()}/yr` : '$10,000/yr'}</div>
            </div>
            <ul className="text-sm text-gray-600 mt-4 space-y-1">
              <li>Unlimited departmental assessments</li>
              <li>Quarterly updates</li>
              <li>60‑min office hours/month</li>
              <li>Export pack</li>
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { window.location.href = `/api/stripe/unified-checkout?product=team&billing=monthly&trial_days=7&return_to=highered`; }}>Monthly</Button>
              <Button onClick={() => { window.location.href = `/api/stripe/unified-checkout?product=team&billing=yearly&trial_days=7&return_to=highered`; }}>Yearly</Button>
            </div>
          </div>

          {/* Board‑Ready Pro */}
          <div className="bg-white border rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-gray-900">Board‑Ready Pro</h3>
            <p className="text-sm text-gray-600 mt-1">One‑time</p>
            <div className="text-3xl font-bold mt-4">{pricing.boardReadyCents ? `$${(pricing.boardReadyCents/100).toLocaleString()}` : '$7,500'}</div>
            <ul className="text-sm text-gray-600 mt-4 space-y-1">
              <li>25‑page roadmap</li>
              <li>Executive brief</li>
              <li>90‑min strategy session</li>
            </ul>
            <Button className="mt-auto w-full" onClick={() => { window.location.href = `/api/stripe/unified-checkout?product=board&return_to=highered`; }}>Buy Now</Button>
          </div>

          {/* Enterprise Readiness Program */}
          <div className="bg-white border rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-gray-900">Enterprise Readiness Program</h3>
            <p className="text-sm text-gray-600 mt-1">One‑time</p>
            <div className="text-3xl font-bold mt-4">{pricing.enterpriseCents ? `$${(pricing.enterpriseCents/100).toLocaleString()}` : '$18,000'}</div>
            <ul className="text-sm text-gray-600 mt-4 space-y-1">
              <li>On‑site/virtual facilitation day</li>
              <li>Quarterly check‑ins</li>
              <li>Integration roadmap</li>
            </ul>
            <Button className="mt-auto w-full" onClick={() => { window.location.href = `/api/stripe/unified-checkout?product=enterprise&return_to=highered`; }}>Buy Now</Button>
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
                    {`Monthly${pricing.monthlyCents ? ` ($${(pricing.monthlyCents/100).toLocaleString()})` : ''}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('billingPeriod', 'yearly')}
                    className={`px-4 py-2 text-sm font-medium border ${formData.billingPeriod === 'yearly' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'}`}
                  >
                    {`Yearly${pricing.yearlyCents ? ` ($${(pricing.yearlyCents/100).toLocaleString()})` : ''}`}
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
