'use client';

import SubscriptionValueDashboard from '@/components/SubscriptionValueDashboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-enhanced';
import { AlertCircle, BarChart3, BookOpen, CheckCircle, FileText, Loader2, Lock, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [institutionType, setInstitutionType] = useState<'K12' | 'HigherEd'>('K12');
  const [hydrated, setHydrated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');  // Add this to store actual user ID
  const debugMode = searchParams.get('debug') === '1';
  const assessmentMode = searchParams.get('assessment'); // 'quick', 'full', or null

  // Handle hydration and get institution type from localStorage or user profile
  useEffect(() => {
    setHydrated(true);
    
    // Try multiple sources for institution type
    // 1. Direct localStorage setting
    const storedType = localStorage.getItem('ai_blueprint_institution_type');
    if (storedType === 'HigherEd' || storedType === 'K12') {
      setInstitutionType(storedType);
      return;
    }
    
    // 2. Check onboarding data
    const onboardingData = localStorage.getItem('ai_readiness_onboarding');
    if (onboardingData) {
      try {
        const parsed = JSON.parse(onboardingData);
        const orgType = parsed.organizationType;
        if (orgType === 'K12' || orgType === 'District') {
          setInstitutionType('K12');
          localStorage.setItem('ai_blueprint_institution_type', 'K12');
        } else if (orgType === 'HigherEd' || orgType === 'University' || orgType === 'Community College') {
          setInstitutionType('HigherEd');
          localStorage.setItem('ai_blueprint_institution_type', 'HigherEd');
        }
      } catch (e) {
        console.error('Failed to parse onboarding data:', e);
      }
    }
    
    // 3. Fall back to domain detection
    const hostname = window.location.hostname;
    if (hostname.includes('k12')) {
      setInstitutionType('K12');
      localStorage.setItem('ai_blueprint_institution_type', 'K12');
    } else if (hostname.includes('highered')) {
      setInstitutionType('HigherEd');
      localStorage.setItem('ai_blueprint_institution_type', 'HigherEd');
    }
  }, []);

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
      
      // Store the actual user ID from session
      setCurrentUserId(session.user.id);
      
      const accessToken = session.access_token;
      // Prepare client-side debug details (does not expose full secrets)
      const clientDebug: any = debugMode ? {
        clientPhase: 'have-session',
        sessionUserId: session.user.id,
        sessionEmail: session.user.email,
        accessTokenLength: accessToken?.length,
        accessTokenPreview: accessToken ? (accessToken.length > 24 ? accessToken.slice(0, 12) + '…' + accessToken.slice(-8) : accessToken) : null,
      } : null;
      if (debugMode && accessToken) {
        try {
          const [h, p] = accessToken.split('.');
          if (p) {
            const json = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
            clientDebug.jwt = {
              iss: json.iss,
              aud: json.aud,
              subPresent: Boolean(json.sub),
              exp: json.exp,
              expInFuture: typeof json.exp === 'number' ? (json.exp * 1000 > Date.now()) : undefined,
              projectRefFromIss: typeof json.iss === 'string' ? json.iss.split('//')[1]?.split('.')[0] : undefined
            };
            try {
              const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
              if (envUrl) {
                const host = new URL(envUrl).host;
                const envProjectRef = host.split('.supabase.co')[0];
                clientDebug.envProjectRef = envProjectRef;
                clientDebug.projectRefMismatch = clientDebug.jwt.projectRefFromIss && envProjectRef && clientDebug.jwt.projectRefFromIss !== envProjectRef;
              }
            } catch (_) { }
          }
        } catch (e) {
          clientDebug.jwtDecodeError = true;
        }
      }
      // Call unified status endpoint with bearer token (propagate debug flag)
      const statusEndpoint = debugMode ? '/api/payments/status?debug=1' : '/api/payments/status';
      console.log('[verifyPaymentAccess] sending Authorization header?', Boolean(accessToken));
      let res = await fetch(statusEndpoint, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        cache: 'no-store'
      });
      let json: any = {};
      try { json = await res.json(); } catch (e) { json = { parseError: true }; }
      if (debugMode) clientDebug.primaryFetch = { ok: res.ok, status: res.status, url: statusEndpoint, hadAuthHeader: Boolean(accessToken) };
      if (debugMode) setDebugInfo({ server: json.debug || json, client: clientDebug });

      // Fallback: some proxies / static hosts may strip Authorization.
      if ((!res.ok && json?.error === 'not_authenticated') || (!json.isVerified && json?.error === 'not_authenticated')) {
        const tokenParamUrl = `/api/payments/status?token=${encodeURIComponent(accessToken)}&debug=1&origin=fallback`;
        const fallback = await fetch(tokenParamUrl, { cache: 'no-store' });
        const fallbackJson = await fallback.json();
        if (debugMode) clientDebug.fallbackFetch = { ok: fallback.ok, status: fallback.status, url: tokenParamUrl };
        if (debugMode) setDebugInfo({ server: { primary: json, fallback: fallbackJson }, client: clientDebug });
        if (fallback.ok && fallbackJson.isVerified) {
          json = fallbackJson;
          res = fallback; // treat as success
        }
      }

      // Extra echo test (debug mode) to see what headers arrive server-side
      if (debugMode) {
        try {
          const echoRes = await fetch(`/api/debug/echo?ts=${Date.now()}`, {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            cache: 'no-store'
          });
          const echoJson = await echoRes.json();
          clientDebug.echo = echoJson;
          setDebugInfo((prev: any) => ({ ...(prev || {}), client: clientDebug }));
        } catch (e) {
          clientDebug.echoError = (e as Error).message;
        }
      }

      if ((!res.ok && res.status === 404) && debugMode) {
        console.warn('Primary status endpoint returned 404. This may indicate a deployment lag or path mismatch.');
      }
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

  // Helper functions for institution-specific content
  const getWelcomeMessage = () => {
    if (institutionType === 'HigherEd') {
      return "Welcome to your Higher Education AI Blueprint Dashboard. Track your institution's AI readiness progress and access implementation resources tailored for universities, community colleges, and trade schools.";
    }
    return "Welcome to your K-12 AI Blueprint Dashboard. Track your district's AI readiness progress and access implementation resources designed for school environments.";
  }; const getAssessmentStartText = () => {
    if (institutionType === 'HigherEd') {
      return "Begin your comprehensive AI readiness assessment designed specifically for universities, community colleges, and trade schools.";
    }
    return "Begin your comprehensive AI readiness assessment designed specifically for K-12 school districts.";
  };

  const getInstitutionTerms = () => {
    if (institutionType === 'HigherEd') {
      return {
        institution: 'institution',
        context: 'higher education environment',
        stakeholders: 'faculty, staff, and students',
        leadership: 'leadership team'
      };
    }
    return {
      institution: 'district',
      context: 'K-12 environment',
      stakeholders: 'teachers and students',
      leadership: 'superintendents and principals'
    };
  };

  const startAssessment = () => {
    if (verification.accessUrl) {
      // If we have an assessment mode parameter, append it to the URL
      if (assessmentMode === 'quick') {
        router.push(`${verification.accessUrl}&mode=quick`);
      } else if (assessmentMode === 'full') {
        router.push(`${verification.accessUrl}&mode=full`);
      } else {
        router.push(verification.accessUrl);
      }
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

  // Prevent hydration mismatch by showing loading until client-side detection completes
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Preparing your experience...</p>
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
              Purchase Full Assessment
            </Button>
            <Button
              onClick={() => router.push('/ai-readiness/assessment?mode=quick&tier=ai-readiness-comprehensive')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Try Free Quick Assessment
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
                {(() => {
                  try {
                    const token = (debugInfo?.client?.accessTokenPreview && verification.isVerified === false) ? 'hidden-for-security' : null;
                  } catch (_) { }
                  return null;
                })()}
              </pre>
            )}
            {debugMode && debugInfo?.client?.accessTokenPreview && (
              <div className="text-[10px] text-gray-600 mt-2 break-all">
                <strong>Direct API (token param) test:</strong>{' '}
                <a
                  className="underline text-blue-600"
                  href={`/api/payments/status?debug=1&token=${encodeURIComponent((debugInfo as any)?.client?.accessTokenPreview?.includes('…') ? '' : '')}`}
                  onClick={(e) => { e.preventDefault(); alert('Open console and use fetch(\'/api/payments/status?debug=1&token=ACCESS_TOKEN\') with the real token. For security the direct link omits the full token.'); }}
                >Instructions</a>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="p-8 mb-6">
          <div className="flex items-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {institutionType === 'HigherEd' ? 'Higher Ed AI Blueprint Dashboard' : 'K-12 AI Blueprint Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">Your ongoing AI transformation journey • Active subscription</p>
              {assessmentMode && (
                <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    🎯 Ready to start your {assessmentMode === 'quick' ? 'Quick Assessment (8-10 min)' : 'Comprehensive Assessment (25-35 min)'}
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    Click "Take Assessment" below to begin with your selected assessment type.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button
              onClick={startAssessment}
              className="flex flex-col items-center gap-2 h-20 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              variant="outline"
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm">Take Assessment</span>
            </Button>

            <Button
              onClick={() => window.location.href = '/resources/templates'}
              className="flex flex-col items-center gap-2 h-20 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
              variant="outline"
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-sm">Resource Library</span>
            </Button>

            <Button
              onClick={() => {
                // Try to open Calendly in a new window first
                const calendlyUrl = 'https://calendly.com/jeremyestrella/30min';
                const popup = window.open(
                  calendlyUrl,
                  'calendly-popup',
                  'width=800,height=700,scrollbars=yes,resizable=yes,toolbar=no,location=no'
                );
                
                // If popup is blocked, show instructions and fallback
                if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                  alert('🕐 Scheduling Information\n\n✅ Expert Sessions Available!\n\n⚠️ Pop-up Blocked\nYour browser blocked the scheduling window.\n\n📋 To Schedule:\n1. Allow pop-ups for this site\n2. Or copy this link: ' + calendlyUrl + '\n\n⏰ Time Zone Details:\n• Calendly shows Pacific Time by default\n• Jeremy is in Central Time (CST/CDT)\n• You can adjust time zone on the booking page\n• 30-minute sessions available\n\n📅 What to Expect:\n• AI implementation strategy discussion\n• Personalized recommendations review\n• Q&A about your assessment results\n• Next steps planning');
                  
                  // Fallback: Navigate in current tab after user acknowledges
                  if (confirm('Would you like to open the scheduling page in this tab?')) {
                    window.location.href = calendlyUrl;
                  }
                }
              }}
              className="flex flex-col items-center gap-2 h-20 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
              variant="outline"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Expert Sessions</span>
            </Button>

            <Button
              onClick={() => window.location.href = '/ai-readiness/results'}
              className="flex flex-col items-center gap-2 h-20 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
              variant="outline"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">View Results</span>
            </Button>
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
              {getAssessmentStartText()}
            </p>
          </div>
        </Card>

        {/* Add the new Subscription Value Dashboard here */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Subscription Value</h2>
          <SubscriptionValueDashboard
            userId={currentUserId || verification.email || 'unknown'}
            tier={verification.tier || 'comprehensive'}
            institutionType={institutionType}
          />
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Assessment & Results</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-semibold">
                  {institutionType === 'HigherEd' ? 'Take Your Higher Ed AI Readiness Assessment' : 'Take Your K-12 AI Readiness Assessment'}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Get comprehensive insights with our 6-algorithm assessment suite designed for {getInstitutionTerms().context}
                </p>
              </div>
              <Button
                onClick={startAssessment}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Assessment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>6 patent-pending algorithms (AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, AIBS™)</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Quarterly progress tracking and reassessment</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Peer benchmarking and competitive analysis</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Implementation roadmap with 90-day milestones</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Monthly expert strategy sessions</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Exclusive community and resource library</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
