'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function SuccessPage() {
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment details from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const tier = urlParams.get('tier');
    const status = urlParams.get('status');
    const returnTo = urlParams.get('return_to');

    // Unified checkout may not include status or tier
    if (sessionId) {
      setPaymentDetails({
        tier: tier || 'ai-readiness-complete',
        sessionId,
        timestamp: new Date().toISOString(),
        returnTo
      });
    } else if (status === 'success' && tier) {
      // Legacy flow support
      setPaymentDetails({ tier, sessionId, timestamp: new Date().toISOString(), returnTo });
    }
    
    setLoading(false);
  }, []);

  const getImplementationUrl = (tier: string, returnTo?: string | null) => {
    if (returnTo === 'k12') return '/k12-implementation?setup=complete';
    if (returnTo === 'highered') return '/highered-implementation?setup=complete';
    // Determine which implementation track based on tier (legacy path)
    if (tier && (tier.includes('k12') || tier.includes('school') || tier.includes('district'))) {
      return '/k12-implementation?setup=complete';
    }
    return '/highered-implementation?setup=complete';
  };

  const getTierDisplayName = (tier: string) => {
    const tierMap: Record<string, string> = {
      'ai-blueprint-essentials': 'AI Blueprint Essentials',
      'ai-blueprint-professional': 'AI Blueprint Professional',
      'higher-ed-ai-pulse-check': 'Higher Ed AI Pulse Check',
      'ai-readiness-comprehensive': 'AI Readiness Comprehensive',
      'ai-transformation-blueprint': 'AI Transformation Blueprint',
      'ai-enterprise-partnership': 'Enterprise AI Partnership'
    };
    return tierMap[tier] || 'AI Readiness Complete';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Payment Status Unknown</CardTitle>
            <CardDescription>
              We couldn't verify your payment status. Please check your email for confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/">Return to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
          <CardDescription className="text-lg">
            Welcome to {getTierDisplayName(paymentDetails.tier)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your autonomous AI implementation is now being prepared. You'll receive an email with access details shortly.
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">🚀 What Happens Next:</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mr-3 mt-0.5">1</span>
                <span>Your autonomous implementation begins immediately</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mr-3 mt-0.5">2</span>
                <span>AI systems start generating your custom strategy and policies</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mr-3 mt-0.5">3</span>
                <span>Access your real-time dashboard to monitor progress</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mr-3 mt-0.5">4</span>
                <span>Download generated documents as they become available</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              asChild 
              className="w-full"
              size="lg"
            >
              <a href={getImplementationUrl(paymentDetails.tier, paymentDetails.returnTo)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Access Your Dashboard
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="w-full"
              size="lg"
            >
              <a href="mailto:support@northpathstrategies.org">
                Contact Support
              </a>
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              <strong>Session ID:</strong> {paymentDetails.sessionId?.slice(-8) || 'N/A'}
            </p>
            <p>
              If you have any questions, please don't hesitate to reach out to our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
