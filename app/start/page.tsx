'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowRight,
  User,
  Mail,
  Building,
  Phone,
  CheckCircle2,
  Shield,
  Clock,
  Star
} from 'lucide-react';
import Link from 'next/link';

function StartPageContent() {
  const searchParams = useSearchParams();
  const billing = searchParams.get('billing') || 'monthly';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    phone: '',
    title: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create user account and proceed to checkout
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          billing
        }),
      });
      
      if (response.ok) {
        // Proceed to unified checkout
        window.location.href = `/api/stripe/unified-checkout?billing=${billing}&tier=team&userId=${response.headers.get('user-id')}`;
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              NorthPath Strategies
            </Link>
            <Link href="/ai-readiness" className="text-gray-600 hover:text-gray-900">
              ← Back to AI Readiness
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Registration Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Start Your AI Readiness Journey
              </h1>
              <p className="text-gray-600 mb-8">
                Create your account to access the complete AI readiness assessment platform with all patent-pending algorithms.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="organization">Organization/Institution *</Label>
                  <Input
                    id="organization"
                    name="organization"
                    type="text"
                    required
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center text-blue-800 text-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Your information is secure and will only be used to provide your AI readiness assessment and support.
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
                  size="lg"
                >
                  {isSubmitting ? (
                    'Creating Account...'
                  ) : (
                    <>
                      Continue to Secure Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          </div>

          {/* Plan Summary */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-xl">
                    AI Readiness Team Plan
                    <div className="text-sm font-normal text-gray-600 mt-1">
                      {billing === 'yearly' ? 'Annual Subscription' : 'Monthly Subscription'}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">
                      {currentPlan.price}
                    </div>
                    <div className="text-gray-600 text-sm">{currentPlan.period}</div>
                    {currentPlan.savings && (
                      <div className="text-green-600 text-sm font-medium mt-1">
                        {currentPlan.savings}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-gray-900">What's Included:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Complete 105-question assessment
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        All 6 patent-pending algorithms (AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, AIBS™)
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        25-page detailed analysis report
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Strategic document analysis
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Ongoing platform access & updates
                      </div>
                      {billing === 'yearly' && (
                        <>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                            Priority support
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                            Quarterly strategy sessions
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center text-gray-600 text-sm mb-2">
                      <Clock className="h-4 w-4 mr-2" />
                      7-day free trial included
                    </div>
                    <div className="text-xs text-gray-500">
                      Cancel anytime during trial period
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StartPageContent />
    </Suspense>
  );
}
