'use client';

import InstitutionSelector from '@/components/InstitutionSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Star
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';

function StartPageContent() {
  const searchParams = useSearchParams();
  const billing = searchParams.get('billing') || 'monthly';
  const contextParam = searchParams.get('context'); // 'HigherEd' from marketing page

  const [step, setStep] = useState<'institution' | 'registration'>('institution');
  const [institutionType, setInstitutionType] = useState<'K12' | 'HigherEd' | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    phone: '',
    title: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-select institution type if coming from marketing page
  React.useEffect(() => {
    if (contextParam === 'HigherEd' && !institutionType) {
      setInstitutionType('HigherEd');
      setStep('registration');
      localStorage.setItem('ai_blueprint_institution_type', 'HigherEd');
    }
  }, [contextParam, institutionType]);

  const handleInstitutionSelect = (type: 'K12' | 'HigherEd') => {
    setInstitutionType(type);
    setStep('registration');
    // Store in localStorage for persistence
    localStorage.setItem('ai_blueprint_institution_type', type);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
    if (!formData.organization.trim()) newErrors.organization = `${institutionType === 'HigherEd' ? 'Institution' : 'School/District'} name is required`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          billing,
          institutionType
        }),
      });
      if (response.ok) {
        // Simple checkout redirect - include user data to ensure correct account creation
        const encodedEmail = encodeURIComponent(formData.email);
        const encodedName = encodeURIComponent(`${formData.firstName} ${formData.lastName}`);
        const encodedOrganization = encodeURIComponent(formData.organization);
        window.location.href = `/api/stripe/unified-checkout?billing=${billing}&tier=team&userId=${response.headers.get('user-id')}&contact_email=${encodedEmail}&contact_name=${encodedName}&organization=${encodedOrganization}&institution_type=${institutionType}`;
      } else {
        const text = await response.text();
        alert('Registration failed: ' + text);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.organization;

  const planDetails = {
    monthly: {
      price: '$995',
      period: 'per month',
      total: '$995',
      savings: null
    },
    yearly: {
      price: '$9,950',
      period: 'per year',
      total: '$9,950',
      savings: 'Save $2,390 (17% off)'
    }
  };

  const currentPlan = planDetails[billing as keyof typeof planDetails];

  // Get contextual content based on institution type
  const getContextualContent = () => {
    if (institutionType === 'HigherEd') {
      return {
        title: 'Higher Education AI Blueprint',
        subtitle: 'Transform your university with responsible AI implementation',
        orgLabel: 'Institution Name',
        orgPlaceholder: 'University of...',
        features: [
          'Faculty governance frameworks',
          'Research integration guidance',
          'Academic policy templates',
          'Institutional assessment tools'
        ]
      };
    } else {
      return {
        title: 'K-12 AI Blueprint',
        subtitle: 'Empower your district with safe, effective AI integration',
        orgLabel: 'School/District Name',
        orgPlaceholder: 'Your School District',
        features: [
          'District-wide implementation plans',
          'Teacher professional development',
          'Student safety frameworks',
          'Curriculum integration guides'
        ]
      };
    }
  };

  if (step === 'institution') {
    return <InstitutionSelector onSelect={handleInstitutionSelect} />;
  }

  const content = getContextualContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header with context */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              {content.title}
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
            <button
              onClick={() => setStep('institution')}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Change institution type
            </button>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">
                  Start Your Free Trial
                </CardTitle>
                <p className="text-slate-600">
                  7-day free trial • No credit card required • Cancel anytime
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="organization">{content.orgLabel}</Label>
                    <Input
                      id="organization"
                      name="organization"
                      placeholder={content.orgPlaceholder}
                      value={formData.organization}
                      onChange={handleInputChange}
                      className={errors.organization ? 'border-red-500' : ''}
                    />
                    {errors.organization && <p className="text-red-500 text-sm mt-1">{errors.organization}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Start Free Trial - {currentPlan.price} {currentPlan.period}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {currentPlan.savings && (
                    <p className="text-center text-green-600 font-semibold">
                      {currentPlan.savings}
                    </p>
                  )}

                  <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <a
                        href="/auth/login"
                        className="text-blue-600 hover:text-blue-700 font-medium underline"
                      >
                        Sign in here
                      </a>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {content.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4 flex items-center">
                  <Shield className="w-8 h-8 text-blue-400 mr-4" />
                  <div>
                    <h4 className="font-semibold text-white">7-Day Free Trial</h4>
                    <p className="text-slate-300 text-sm">Full access, no credit card required</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4 flex items-center">
                  <Clock className="w-8 h-8 text-green-400 mr-4" />
                  <div>
                    <h4 className="font-semibold text-white">Instant Access</h4>
                    <p className="text-slate-300 text-sm">Start using all tools immediately</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4 flex items-center">
                  <Star className="w-8 h-8 text-yellow-400 mr-4" />
                  <div>
                    <h4 className="font-semibold text-white">Expert Support</h4>
                    <p className="text-slate-300 text-sm">Direct access to AI implementation experts</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <StartPageContent />
    </Suspense>
  );
}
