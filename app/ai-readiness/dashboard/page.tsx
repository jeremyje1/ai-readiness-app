'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react';

interface PaymentVerification {
  isVerified: boolean;
  tier?: string;
  email?: string;
  name?: string;
  organization?: string;
  accessUrl?: string;
}

export default function AIReadinessDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verification, setVerification] = useState<PaymentVerification>({ isVerified: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const debugMode = searchParams.get('debug') === '1';

  useEffect(() => {
    verifyPaymentAccess();
  }, []);

  const verifyPaymentAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        setError('Authentication error: ' + authError.message);
        setLoading(false);
        return;
      }
      if (!session?.user) {
        router.push('/ai-readiness');
        return;
      }
      const accessToken = session.access_token;
      // Call unified status endpoint with bearer token
      const res = await fetch('/api/payments/status', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        cache: 'no-store'
      });
      const json = await res.json();
      if (debugMode) setDebugInfo(json.debug || json);
      if (!res.ok || !json.isVerified) {
        setVerification({ isVerified: false });
        setError('No valid payment found. If you just completed checkout, wait a few seconds and retry.');
      } else {
        setVerification({
          isVerified: true,
          tier: json.tier,
          email: json.email,
          name: json.name,
          organization: json.organization,
          accessUrl: `/ai-readiness/assessment?tier=${json.tier}`
        });
      }
    } catch (e) {
      console.error('Verification error:', e);
      setError('Unable to verify access. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const getTierDisplayName = (tier: string) => {
    const names: Record<string, string> = {
      'ai-readiness-comprehensive': 'AI Readiness Comprehensive ($995)',
      'ai-transformation-blueprint': 'AI Transformation Blueprint ($2,499)',
      'enterprise-partnership': 'Enterprise Partnership ($9,999)',
      'custom-enterprise': 'Custom Enterprise ($24,500)'
    };
    return names[tier] || tier;
  };

  const startAssessment = () => {
    if (verification.accessUrl) {
      router.push(verification.accessUrl);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Verifying Access</h2>
          <p className="text-gray-600">Checking your payment status...</p>
        </Card>
      </div>
    );
  }

  if (error || !verification.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-6">
            {error || 'You need to complete your purchase to access the AI Readiness Assessment.'}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/ai-readiness')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Purchase Assessment
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry Verification
            </Button>
            {debugMode && (
              <pre className="text-left text-xs bg-white/70 p-3 rounded border overflow-auto max-h-40">
                {JSON.stringify({ debugInfo, search: searchParams.toString() }, null, 2)}
              </pre>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 mb-6">
          <div className="flex items-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome to Your AI Assessment</h1>
              <p className="text-gray-600 mt-1">Payment verified • Access granted</p>
            </div>
          </div>

          {debugMode && debugInfo && (
            <div className="mb-6 text-xs bg-yellow-50 border border-yellow-300 p-3 rounded">
              <strong className="block mb-1">Debug Diagnostics</strong>
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {verification.name}</p>
                <p><strong>Email:</strong> {verification.email}</p>
                {verification.organization && (
                  <p><strong>Organization:</strong> {verification.organization}</p>
                )}
                <p><strong>Tier:</strong> {getTierDisplayName(verification.tier!)}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3">Assessment Status</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Payment Verified
                </p>
                <p className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Access Granted
                </p>
                <p className="flex items-center">
                  <Lock className="w-4 h-4 text-blue-500 mr-2" />
                  Ready to Begin
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to Start Your AI Readiness Assessment?</h2>
            <p className="text-gray-600 mb-6">
              Your comprehensive AI assessment includes personalized recommendations, 
              maturity analysis, and actionable insights for your organization.
            </p>
            <Button 
              onClick={startAssessment}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Start Assessment
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">What's Included in Your Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Comprehensive 60+ question assessment</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>AI readiness scoring and maturity analysis</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Personalized recommendations and roadmap</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Detailed PDF report with insights</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Strategic planning guidance</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Implementation timeline</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
