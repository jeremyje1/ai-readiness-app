/**
 * Subscription Guard Component
 * Verifies user has active subscription before allowing access
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier?: string[];
  redirectTo?: string;
}

export function SubscriptionGuard({
  children,
  requiredTier = [],
  redirectTo = '/pricing'
}: SubscriptionGuardProps) {
  const router = useRouter();
  const { profile, loading } = useUserProfile();
  const [checking, setChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // First sync payment status with profile
        await fetch('/api/user/sync-payment', { method: 'POST' });

        // Then check payment API
        const response = await fetch('/api/payments/status');
        const data = await response.json();

        setPaymentStatus(data);
        setChecking(false);

        // If not verified and not in loading state, redirect
        if (!loading && !data.isVerified) {
          console.log('❌ No active subscription found');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setChecking(false);
      }
    };

    if (!loading && profile) {
      checkSubscription();
    }
  }, [loading, profile]);

  // Still loading user profile
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Verifying Subscription...</h2>
          <p className="text-gray-600">Please wait while we check your access</p>
        </Card>
      </div>
    );
  }

  // Check if subscription is active
  const isSubscribed =
    paymentStatus?.isVerified ||
    profile?.subscription_status === 'active' ||
    profile?.subscription_status === 'trial';

  // Check tier requirements
  const hasRequiredTier =
    requiredTier.length === 0 ||
    (paymentStatus?.tier && requiredTier.includes(paymentStatus.tier)) ||
    (profile?.subscription_tier && requiredTier.includes(profile.subscription_tier));

  // Allow access if subscribed and has required tier
  if (isSubscribed && hasRequiredTier) {
    return <>{children}</>;
  }

  // Show subscription required screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subscription Required
          </h1>
          <p className="text-lg text-gray-600">
            You need an active subscription to access this feature
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3">Your Account Status:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{profile?.email || 'Not found'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Subscription Status:</span>
              <span className={`font-medium ${
                isSubscribed ? 'text-green-600' : 'text-red-600'
              }`}>
                {profile?.subscription_status || 'Inactive'}
              </span>
            </div>
            {profile?.subscription_tier && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Tier:</span>
                <span className="font-medium">{profile.subscription_tier}</span>
              </div>
            )}
          </div>
        </div>

        {/* What's Included */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">What's Included:</h3>
          <div className="grid gap-3">
            {[
              'Full AI Readiness Assessment',
              'Personalized Reports & Recommendations',
              'Grant Proposal Generator',
              'Custom Policy Pack Library',
              'Board Presentation Tools',
              '90-Day Implementation Plans',
              'Quarterly Benchmarking (AIBS™)',
              'Expert Support & Guidance'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push(redirectTo)}
            className="flex-1 flex items-center justify-center gap-2"
            size="lg"
          >
            <CreditCard className="w-5 h-5" />
            View Pricing & Subscribe
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="lg"
          >
            Back to Home
          </Button>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 p-4 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <pre className="mt-2 overflow-auto">
              {JSON.stringify({
                profile: {
                  email: profile?.email,
                  subscription_status: profile?.subscription_status,
                  subscription_tier: profile?.subscription_tier
                },
                paymentStatus
              }, null, 2)}
            </pre>
          </details>
        )}
      </Card>
    </div>
  );
}
