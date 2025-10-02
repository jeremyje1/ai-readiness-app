'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase-enhanced';
import { AlertCircle, ArrowRight, CheckCircle, Loader2, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'email' | 'sent' | 'verifying' | 'complete'>('email');
  const [showPasswordOption, setShowPasswordOption] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoTried, setAutoTried] = useState(false);
  const sessionId = searchParams.get('session_id');
  const auto = searchParams.get('auto');
  const autoTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Already logged in, redirect to dashboard
        router.push('/dashboard/personalized?verified=true');
        return;
      }
    };

    checkAuth();

    // Bootstrap from Stripe session and automatically redirect to password setup
    const bootstrap = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // First get the session details
        const res = await fetch(`/api/stripe/session?id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.email) {
            setEmail(data.email);

            // Always try to get password setup URL
            try {
              const r2 = await fetch('/api/stripe/post-checkout/bootstrap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
              });

              if (r2.ok) {
                const b = await r2.json();
                if (b.passwordSetupUrl) {
                  // Directly redirect to password setup - no intermediate screen
                  window.location.href = b.passwordSetupUrl;
                  return;
                }
              }
            } catch (e) {
              console.warn('Password bootstrap failed:', e);
            }

            // If password setup failed, show the email form
            setLoading(false);
          }
        }
      } catch (e) {
        console.warn('Session bootstrap failed', e);
        setLoading(false);
      }
    };

    bootstrap();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setStep('complete');
        // Small delay to show success message, then redirect
        setTimeout(() => {
          router.push('/dashboard/personalized?verified=true');
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSendMagicLink = async (e: React.FormEvent, silent?: boolean) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard/personalized?verified=true`,
        },
      });

      if (error) {
        if (!silent) setError(error.message); else console.warn('Auto magic link error', error.message);
      } else if (!silent) {
        setStep('sent');
      }
    } catch (err) {
      if (!silent) setError('Failed to send login link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    // Show loading spinner while bootstrapping
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Setting up your account...</p>
          <p className="text-gray-500 text-sm mt-2">You'll be redirected in a moment</p>
        </div>
      );
    }

    switch (step) {
      case 'email':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600">
                Your AI Blueprint™ Assessment access is active. {email ? 'Please check your email to set up your password.' : 'Enter your email to continue.'}
              </p>
            </div>

            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="mt-1"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Login Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Secure Login Link
                  </>
                )}
              </Button>
              {showPasswordOption && (
                <Button type="button" variant="outline" className="w-full" onClick={() => { router.push('/auth/password/setup') }}>
                  Prefer to Create a Password
                </Button>
              )}
            </form>
          </div>
        );

      case 'sent':
        return (
          <div className="text-center space-y-6">
            <Mail className="w-16 h-16 text-blue-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-4">
                We've sent a secure login link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in your email to access your AI Blueprint™ Assessment dashboard.
                The link will expire in 1 hour for security.
              </p>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('email')}
                className="mr-2"
              >
                Use Different Email
              </Button>
              <Button
                onClick={() => handleSendMagicLink({ preventDefault: () => { } } as any)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend Link'
                )}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to AI Blueprint™!
              </h2>
              <p className="text-gray-600 mb-4">
                You're now logged in and will be redirected to your assessment dashboard.
              </p>
            </div>

            <Button onClick={() => router.push('/dashboard/personalized?verified=true')}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">AI Blueprint™ Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}
