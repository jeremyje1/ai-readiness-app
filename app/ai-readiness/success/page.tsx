'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    FileText,
    Loader2,
    Sparkles,
    TrendingUp,
    Users,
    X
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AIReadinessSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your subscription...');

    useEffect(() => {
        // Trigger celebration animation on success
        if (status === 'success') {
            // Could add confetti library later
            console.log('🎉 Subscription successful!');
        }
    }, [status]);

    useEffect(() => {
        const verifySubscription = async () => {
            try {
                const sessionId = searchParams.get('session_id');

                if (!sessionId) {
                    setStatus('error');
                    setMessage('Invalid session. Please try again.');
                    setLoading(false);
                    return;
                }

                // Give Stripe webhook a moment to process
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Verify the subscription status
                const response = await fetch('/api/payments/status');
                const data = await response.json();

                if (data.hasPremiumAccess || data.hasActiveSubscription) {
                    setStatus('success');
                    setMessage('Welcome to AI Blueprint Pro!');

                    // Check if user has a pending blueprint
                    const pendingBlueprint = localStorage.getItem('pending_blueprint_goals');
                    if (pendingBlueprint) {
                        // Auto-redirect to complete blueprint generation
                        setTimeout(() => {
                            router.push('/blueprint/new');
                        }, 3000);
                    }
                } else {
                    setStatus('error');
                    setMessage('Subscription verification pending. Please refresh in a moment.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage('Something went wrong. Please contact support.');
            } finally {
                setLoading(false);
            }
        };

        verifySubscription();
    }, [searchParams, router]);

    const features = [
        {
            icon: FileText,
            title: 'AI Blueprints',
            description: 'Generate unlimited custom implementation roadmaps'
        },
        {
            icon: BarChart3,
            title: 'Progress Tracking',
            description: 'Monitor your AI transformation with real-time dashboards'
        },
        {
            icon: Users,
            title: 'Team Collaboration',
            description: 'Invite colleagues and work together on your AI strategy'
        },
        {
            icon: TrendingUp,
            title: 'Expert Insights',
            description: 'Get personalized recommendations and best practices'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl"
            >
                <Card className="p-8 md:p-12 shadow-xl">
                    {loading ? (
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
                            <p className="text-gray-600">This will only take a moment...</p>
                        </div>
                    ) : status === 'success' ? (
                        <div>
                            {/* Success Header */}
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 15 }}
                                    className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                                >
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {message}
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Your subscription is active and you have full access to all features.
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.3 }}
                                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <feature.icon className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                                            <p className="text-sm text-gray-600">{feature.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Next Steps */}
                            <div className="bg-indigo-50 rounded-lg p-6 mb-8">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    What&rsquo;s Next?
                                </h3>
                                <ol className="space-y-2 text-sm text-gray-700">
                                    <li>1. Complete your AI readiness assessment if you haven&rsquo;t already</li>
                                    <li>2. Generate your personalized AI implementation blueprint</li>
                                    <li>3. Share with your team and start executing your roadmap</li>
                                    <li>4. Track progress and celebrate milestones along the way</li>
                                </ol>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => router.push('/dashboard/personalized')}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    onClick={() => router.push('/blueprint/new')}
                                    variant="outline"
                                    className="flex-1 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-6"
                                >
                                    Create Your First Blueprint
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <X className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
                            <p className="text-gray-600 mb-6">
                                If you continue to experience issues, please contact support.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button
                                    onClick={() => router.push('/pricing')}
                                    variant="outline"
                                >
                                    Back to Pricing
                                </Button>
                                <Button
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}