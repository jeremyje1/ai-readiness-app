'use client';

import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { createClient } from '@/lib/supabase/browser-client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function AuthSuccessPage() {
    const router = useRouter();
    const subscription = useSubscription();
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        let cancelled = false;

        const loadUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) {
                    console.error('[AuthSuccess] Failed to load user:', error.message);
                }

                if (!cancelled) {
                    setUser(data?.user ?? null);
                }

                if (!data?.user) {
                    console.warn('[AuthSuccess] No authenticated user, redirecting to login');
                    router.replace('/auth/login');
                    return;
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('[AuthSuccess] Unexpected user load error:', error);
                }
            } finally {
                if (!cancelled) {
                    setLoadingUser(false);
                }
            }
        };

        void loadUser();

        return () => {
            cancelled = true;
        };
    }, [router, supabase]);

    useEffect(() => {
        if (loadingUser || subscription.isLoading) {
            return;
        }

        if (subscription.hasPremiumAccess || subscription.hasActiveSubscription) {
            const timeout = setTimeout(() => {
                router.replace('/dashboard/personalized');
            }, 2000);

            return () => clearTimeout(timeout);
        }
    }, [loadingUser, subscription.hasActiveSubscription, subscription.hasPremiumAccess, subscription.isLoading, router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/auth/login');
    };

    const navigateToAssessment = () => {
        router.push('/assessment');
    };

    const navigateToPricing = () => {
        router.push('/pricing');
    };

    const isLoading = loadingUser || subscription.isLoading;
    const showPremiumSuccess = !isLoading && (subscription.hasPremiumAccess || subscription.hasActiveSubscription);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                <div className="bg-white shadow rounded-lg p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking your payment status...</p>
                </div>
            </div>
        );
    }

    if (showPremiumSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                <div className="bg-white shadow rounded-lg p-8 max-w-2xl w-full text-center space-y-6">
                    <h1 className="text-3xl font-bold">🎉 Subscription Activated!</h1>
                    <p className="text-gray-600">
                        You now have full access to AI Blueprint premium features. We&rsquo;ll take you to your dashboard in just a moment.
                    </p>
                    <Button onClick={() => router.replace('/dashboard/premium')} size="lg" className="mx-auto">
                        Go to Premium Dashboard
                    </Button>
                    <p className="text-xs text-gray-400">
                        If the page doesn&rsquo;t refresh automatically, use the button above.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="bg-white shadow rounded-lg p-8 max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-center mb-6">🎉 Welcome to AI Blueprint!</h1>

                {user && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Logged in as:</p>
                        <p className="text-lg font-semibold">{user.email}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <h2 className="text-xl font-semibold mb-3">✅ Login Successful!</h2>
                        <p className="text-gray-600 mb-4">
                            You&rsquo;re all set. Take the AI readiness assessment and explore our premium plans when you&rsquo;re ready.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={navigateToAssessment}
                                className="w-full"
                                variant="default"
                            >
                                Take the AI Readiness Assessment
                            </Button>

                            <Button
                                onClick={navigateToPricing}
                                className="w-full"
                                variant="outline"
                            >
                                View Pricing & Subscribe
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> The main dashboard requires an active subscription.
                            Complete the AI Readiness Assessment first to see your results, then subscribe
                            to unlock the full dashboard features.
                        </p>
                    </div>

                    <div className="text-center pt-4">
                        <Button
                            onClick={handleSignOut}
                            variant="ghost"
                            className="text-gray-500"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}