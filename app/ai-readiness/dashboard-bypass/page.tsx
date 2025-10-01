'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardBypass() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
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

            setUser(session.user);
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Card className="p-8 max-w-md">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2 text-center">Error</h2>
                    <p className="text-gray-600 text-center mb-4">{error}</p>
                    <Button onClick={() => router.push('/')} className="w-full">
                        Go Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="p-8">
                    <h1 className="text-3xl font-bold mb-6">Welcome to AI Readiness Dashboard</h1>

                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> This is a temporary bypass page for testing.
                            Payment verification has been skipped.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-600">Signed in as:</p>
                            <p className="font-semibold">{user?.email}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-gray-600">User ID:</p>
                            <p className="font-mono text-sm">{user?.id}</p>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button
                                onClick={() => router.push('/ai-readiness/assessment')}
                                className="flex-1"
                            >
                                Take Assessment
                            </Button>

                            <Button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    router.push('/');
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}