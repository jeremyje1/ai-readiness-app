'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthSuccessPage() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            return;
        }
        setUser(user);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    const navigateToAssessment = () => {
        router.push('/ai-readiness/assessment');
    };

    const navigateToPricing = () => {
        router.push('/pricing');
    };

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