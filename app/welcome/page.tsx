'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    CheckCircle2,
    FileText,
    Settings,
    Sparkles,
    Target,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WelcomePage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const loadUser = async () => {
            console.log('🔍 Welcome page: Loading user...');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('❌ No user found, redirecting to get-started');
                router.push('/get-started');
                return;
            }
            console.log('✅ User loaded:', user.email);
            setUser(user);

            // Load user profile with retries (profile might be created asynchronously)
            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
                console.log(`🔄 Attempt ${attempts + 1}/${maxAttempts}: Loading profile...`);
                const { data: profileData, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileData) {
                    console.log('✅ Profile loaded:', profileData);
                    setProfile(profileData);
                    return;
                }

                if (error) {
                    console.log('⚠️ Profile not found yet, will retry...', error);
                }

                // Wait 1 second before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }

            // If profile still doesn't exist after retries, create a minimal one
            console.log('⚠️ Profile not found after retries, proceeding without profile or redirecting to dashboard');
            // Redirect to dashboard which will handle profile creation
            router.push('/dashboard/personalized');
        };
        loadUser();
    }, [router]);

    const onboardingSteps = [
        {
            title: 'Welcome to AI Blueprint!',
            description: 'Let\'s get you started with a quick tour',
            icon: <Sparkles className="h-6 w-6" />,
            action: 'Next'
        },
        {
            title: 'Take Your AI Readiness Assessment',
            description: 'Evaluate your institution\'s current AI capabilities',
            icon: <FileText className="h-6 w-6" />,
            action: 'Start Assessment',
            route: '/assessment'
        },
        {
            title: 'Explore Your Dashboard',
            description: 'View personalized insights and recommendations',
            icon: <BarChart3 className="h-6 w-6" />,
            action: 'View Dashboard',
            route: '/dashboard/personalized'
        },
        {
            title: 'Access Resources',
            description: 'Download templates, guides, and best practices',
            icon: <BookOpen className="h-6 w-6" />,
            action: 'Browse Resources',
            route: '/resources/templates'
        }
    ];

    const handleStepAction = () => {
        const currentStepData = onboardingSteps[currentStep];
        if (currentStepData.route) {
            router.push(currentStepData.route);
        } else if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const skipToChDashboard = () => {
        router.push('/dashboard/personalized');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Loading your account...</div>
            </div>
        );
    }

    // If profile doesn't exist yet, show a simpler welcome screen
    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Welcome to AI Blueprint! 🎉</CardTitle>
                        <CardDescription>
                            Setting up your account...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="animate-pulse flex items-center space-x-2">
                                <div className="h-4 w-4 bg-indigo-600 rounded-full"></div>
                                <span>Creating your profile...</span>
                            </div>
                            <Button onClick={() => router.push('/dashboard/personalized')} className="w-full">
                                Continue to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const trialEndDate = new Date(profile.trial_ends_at);
    const daysRemaining = Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-indigo-600">AI Blueprint for Education</h1>
                    <Button variant="ghost" onClick={skipToChDashboard}>
                        Skip to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome, {profile.name?.split(' ')[0]}! 🎉
                    </h2>
                    <p className="text-xl text-gray-600">
                        Your 7-day trial at {profile.organization} has begun
                    </p>
                    <div className="flex items-center justify-center space-x-2 mt-4 text-sm">
                        <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Account created successfully</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{daysRemaining} days remaining in trial</span>
                    </div>
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Onboarding Progress</span>
                        <span className="text-sm text-gray-600">{currentStep + 1} of {onboardingSteps.length}</span>
                    </div>
                    <Progress value={(currentStep + 1) / onboardingSteps.length * 100} className="h-2" />
                </div>

                {/* Current Step Card */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="mb-8">
                        <CardHeader>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                                    {onboardingSteps[currentStep].icon}
                                </div>
                                <div>
                                    <CardTitle>{onboardingSteps[currentStep].title}</CardTitle>
                                    <CardDescription>{onboardingSteps[currentStep].description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleStepAction} size="lg" className="w-full">
                                {onboardingSteps[currentStep].action}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/assessment')}>
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <Target className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-semibold">AI Assessment</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Evaluate your readiness
                            </p>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/pricing')}>
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <Settings className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-semibold">Upgrade Plan</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                View pricing options
                            </p>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/resources/templates')}>
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <Users className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-semibold">Get Support</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Contact our team
                            </p>
                        </CardHeader>
                    </Card>
                </div>

                {/* Institution Type Specific Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12"
                >
                    <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
                        <CardHeader>
                            <CardTitle>
                                {profile.institution_type === 'HigherEd' ? 'Higher Education' : 'K-12'} Quick Start Guide
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2">Recommended First Steps:</h4>
                                    <ul className="space-y-2">
                                        {profile.institution_type === 'HigherEd' ? (
                                            <>
                                                <li className="flex items-start space-x-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <span className="text-sm">Complete faculty readiness survey</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <span className="text-sm">Review academic integrity policies</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <span className="text-sm">Explore research integration tools</span>
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="flex items-start space-x-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <span className="text-sm">Assess teacher AI readiness</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <span className="text-sm">Review student safety protocols</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <span className="text-sm">Download curriculum guides</span>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Resources Available:</h4>
                                    <ul className="space-y-2">
                                        <li className="text-sm text-gray-600">• Policy templates library</li>
                                        <li className="text-sm text-gray-600">• Implementation roadmaps</li>
                                        <li className="text-sm text-gray-600">• Best practices guides</li>
                                        <li className="text-sm text-gray-600">• Community forum access</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}