'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface PaymentGateProps {
  children: React.ReactNode;
  requiredTier?: string;
}

export function PaymentGate({ 
  children, 
  requiredTier = 'ai-readiness-comprehensive'
}: PaymentGateProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Check for test mode first
      const isTestMode = searchParams?.get('test') === 'true';
      
      if (isTestMode) {
        setIsVerified(true);
        setLoading(false);
        return;
      }

      // Check for Stripe success parameters
      const sessionId = searchParams?.get('session_id');
      const paymentIntent = searchParams?.get('payment_intent');
      
      if (sessionId || paymentIntent) {
        // Verify payment with your backend
        const response = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            payment_intent: paymentIntent,
            required_tier: requiredTier,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.verified) {
            setIsVerified(true);
            // Store verification in sessionStorage
            sessionStorage.setItem(`payment-verified-${requiredTier}`, 'true');
            sessionStorage.setItem('client-tier', data.tier);
            sessionStorage.setItem('client-session', data.sessionId);
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        } else {
          setError('Unable to verify payment. Please try refreshing or contact support.');
        }
      } else {
        // Check if already verified in session
        const cachedVerification = sessionStorage.getItem(`payment-verified-${requiredTier}`);
        if (cachedVerification === 'true') {
          setIsVerified(true);
        } else {
          setError('No valid payment found. Please complete payment to access this assessment.');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your access...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button 
            onClick={() => window.location.href = '/pricing'}
            className="w-full"
          >
            View Pricing Options
          </Button>
        </Card>
      </div>
    );
  }

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl text-center">
        <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Verified
        </h2>
        <p className="text-gray-600 mb-6">
          Welcome to your AI Readiness Assessment
        </p>
      </Card>
    </div>
  );
}
