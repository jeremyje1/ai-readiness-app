'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/browser-client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function WelcomePage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [initializing, setInitializing] = useState(true);

    const loadingProfileRef = useRef(false);
    const lastLoadedUserRef = useRef<string | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const loadProfileForUser = useCallback(async (authUser: User) => {
        if (!authUser?.id) {
            return;
        }

        if (loadingProfileRef.current && lastLoadedUserRef.current === authUser.id) {
            return;
        }

        loadingProfileRef.current = true;
        lastLoadedUserRef.current = authUser.id;

        try {
            // Load user profile with retries (profile might be created asynchronously)
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                console.log(`🔄 Attempt ${attempts + 1}/${maxAttempts}: Loading profile for ${authUser.email}...`);
                const { data: profileData, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .maybeSingle();

                if (profileData) {
                    console.log('✅ Profile loaded:', profileData);
                    if (isMountedRef.current) {
                        setProfile(profileData);
                    }
                    return;
                }

                if (error && error.code !== 'PGRST116') {
                    console.error('❌ Error loading profile:', error);
                }

                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }

            if (!isMountedRef.current) {
                return;
            }

            console.log('⚠️ Profile not found after retries, creating minimal profile...');

            const { data: existingMembership } = await supabase
                .from('institution_memberships')
                .select('*, institutions(*)')
                .eq('user_id', authUser.id)
                .eq('active', true)
                .single();

            let institutionId = existingMembership?.institution_id;

            if (!institutionId) {
                const orgName = authUser.user_metadata?.organization || authUser.email?.split('@')[1]?.split('.')[0] || 'My Institution';
                const { data: newInstitution } = await supabase
                    .from('institutions')
                    .insert({
                        name: orgName,
                        slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
                        headcount: 500,
                        budget: 1000000,
                        org_type: authUser.user_metadata?.institution_type || 'K12'
                    })
                    .select()
                    .single();

                if (newInstitution) {
                    institutionId = newInstitution.id;

                    await supabase
                        .from('institution_memberships')
                        .insert({
                            user_id: authUser.id,
                            institution_id: institutionId,
                            role: 'admin',
                            active: true
                        });
                }
            }

            const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: authUser.id,
                    email: authUser.email,
                    full_name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                    institution_id: institutionId || null,
                    institution_name: authUser.user_metadata?.organization || '',
                    institution_type: authUser.user_metadata?.institution_type || 'K12',
                    job_title: authUser.user_metadata?.title || '',
                    phone: authUser.user_metadata?.phone || '',
                    subscription_tier: 'trial',
                    subscription_status: 'trial',
                    trial_ends_at: authUser.user_metadata?.trial_ends_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    onboarding_completed: false
                }, {
                    onConflict: 'user_id'
                })
                .select()
                .single();

            if (!isMountedRef.current) {
                return;
            }

            if (newProfile) {
                console.log('✅ Profile created:', newProfile);
                setProfile(newProfile);
            } else {
                console.error('❌ Failed to create profile:', createError);
                setProfile({
                    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                    organization: authUser.user_metadata?.organization || '',
                    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        } catch (error) {
            console.error('❌ Error in loadProfileForUser:', error);
            if (isMountedRef.current) {
                setProfile({
                    name: 'User',
                    organization: '',
                    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        } finally {
            loadingProfileRef.current = false;
        }
    }, [supabase]);

    useEffect(() => {
        let cancelled = false;

        const initialise = async () => {
            try {
                console.log('🔍 Welcome page: Loading user session...');
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('❌ Welcome page session error:', error.message);
                }

                if (cancelled) {
                    return;
                }

                const sessionUser = data?.session?.user ?? null;

                if (sessionUser) {
                    console.log('✅ User loaded:', sessionUser.email);
                    setUser(sessionUser);
                    await loadProfileForUser(sessionUser);
                } else {
                    console.log('❌ No authenticated session found on welcome page initial load');
                }
            } finally {
                if (!cancelled) {
                    setInitializing(false);
                }
            }
        };

        void initialise();

        const { data: listener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
            if (cancelled) {
                return;
            }

            const authUser = session?.user ?? null;

            if (authUser) {
                console.log('🔁 Auth state change detected on welcome page:', authUser.email);
                setUser(authUser);
                void loadProfileForUser(authUser);
            } else {
                console.log('👋 Auth state cleared on welcome page');
                setUser(null);
                setProfile(null);
            }

            setInitializing(false);
        });

        return () => {
            cancelled = true;
            listener?.subscription.unsubscribe();
        };
    }, [loadProfileForUser, supabase]);

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
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-pulse">Loading your account...</div>
                            {!initializing && (
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/dashboard/personalized')}
                                >
                                    Continue Anyway <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If profile doesn't exist yet, show a simpler welcome screen with continue option
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
                            <Button onClick={() => router.push('/assessment')} className="w-full">
                                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/dashboard/personalized')}
                                className="w-full"
                            >
                                Go to Dashboard
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
                        <CardContent className="space-y-3">
                            <Button onClick={handleStepAction} size="lg" className="w-full">
                                {onboardingSteps[currentStep].action}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                onClick={skipToChDashboard}
                                variant="ghost"
                                className="w-full"
                            >
                                Skip Tour → Go to Dashboard
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