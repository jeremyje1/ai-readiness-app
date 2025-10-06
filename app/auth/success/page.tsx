'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthSuccessPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            setLoading(false);
            return;
        }
        setUser(user);

        if (!user) {
            console.warn('No authenticated user found on auth success page');
            router.push('/auth/login');
            return;
        }

        // Check if trial user - redirect immediately to dashboard
        const isTrial = user?.user_metadata?.subscription_status === 'trial' ||
            user?.user_metadata?.subscription_status === 'trialing';

        if (isTrial) {
            console.log('Trial user detected, redirecting to dashboard...');
            router.push('/dashboard/personalized');
            return;
        }

        // Check user metadata first
        if (user?.user_metadata?.payment_verified || user?.user_metadata?.tier) {
            console.log('User has paid subscription (metadata), redirecting to dashboard...');
            router.push('/dashboard/personalized');
            return;
        }

        // Also check user_payments table in case webhook hasn't updated metadata yet
        const { data: payment } = await supabase
            .from('user_payments')
            .select('*')
            .eq('user_id', user.id)
            .eq('payment_status', 'completed')
            .maybeSingle();

        if (payment) {
            console.log('User has paid subscription (payment record), redirecting to dashboard...');

            // Update user metadata to reflect payment
            await supabase.auth.updateUser({
                data: {
                    payment_verified: true,
                    tier: payment.tier || 'platform-monthly'
                }
            });

            router.push('/dashboard/personalized');
            return;
        }

        // No payment found - free user, redirect to welcome or assessment
        console.log('No payment found, showing free user options...');
        setLoading(false);
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    const navigateToAssessment = () => {
        router.push('/assessment');
    };

    const navigateToPricing = () => {
        router.push('/pricing');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                <div className="bg-white shadow rounded-lg p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking your payment status...</p>
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
                            You've successfully logged in. Since you don't have a paid subscription yet,
                            you can explore the following options:
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