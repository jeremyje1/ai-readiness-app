'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import {
    ArrowRight,
    Building,
    CheckCircle,
    GraduationCap,
    Lightbulb,
    School,
    Target,
    Users,
    BookOpen,
    Rocket
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface OnboardingData {
    // Step 1: Institution Info
    institutionName: string;
    institutionType: 'k12' | 'higher-ed' | 'other';
    studentCount: string;

    // Step 2: Your Role
    userName: string;
    userRole: string;
    department: string;

    // Step 3: AI Goals
    aiExperience: 'none' | 'exploring' | 'piloting' | 'implementing';
    topPriority: string;
    timeline: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [data, setData] = useState<OnboardingData>({
        institutionName: '',
        institutionType: 'k12',
        studentCount: '',
        userName: '',
        userRole: '',
        department: '',
        aiExperience: 'none',
        topPriority: '',
        timeline: ''
    });

    const totalSteps = 4; // Welcome, Institution, Role, Goals
    const progress = (currentStep / totalSteps) * 100;

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/auth/login');
            return;
        }

        setUserId(user.id);

        // Pre-fill email if available
        if (user.email) {
            setData(prev => ({
                ...prev,
                userName: user.user_metadata?.full_name || ''
            }));
        }
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        if (!userId) return;

        setLoading(true);
        const supabase = createClient();

        try {
            // Save user profile
            const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: userId,
                    institution_name: data.institutionName,
                    institution_type: data.institutionType,
                    student_count: parseInt(data.studentCount) || null,
                    full_name: data.userName,
                    job_title: data.userRole,
                    department: data.department,
                    ai_experience: data.aiExperience,
                    top_priority: data.topPriority,
                    implementation_timeline: data.timeline,
                    onboarding_completed: true,
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.error('Error saving profile:', profileError);
            }

            // Redirect to streamlined assessment
            router.push('/assessment/streamlined');
        } catch (error) {
            console.error('Error completing onboarding:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 text-center">
                        <div className="flex justify-center">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl">
                                <Rocket className="h-16 w-16 text-white" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-4">Welcome to AI Blueprint! 🎉</h2>
                            <p className="text-gray-600 text-lg mb-6">
                                Let's get you set up in just 2 minutes. We'll personalize your
                                AI readiness journey based on your institution's unique needs.
                            </p>
                        </div>

                        <Card className="p-6 bg-blue-50 border-blue-200">
                            <h3 className="font-semibold text-lg mb-3">What you'll get:</h3>
                            <div className="space-y-3 text-left">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span>Personalized AI readiness assessment</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span>Custom implementation roadmap</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span>Policy templates & governance tools</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span>Ongoing support & resources</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Tell us about your institution</h2>
                            <p className="text-gray-600">This helps us customize your experience</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Institution Name *
                                </label>
                                <Input
                                    value={data.institutionName}
                                    onChange={(e) => setData({...data, institutionName: e.target.value})}
                                    placeholder="e.g., Springfield School District"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Institution Type *
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { value: 'k12', label: 'K-12', icon: School },
                                        { value: 'higher-ed', label: 'Higher Ed', icon: GraduationCap },
                                        { value: 'other', label: 'Other', icon: Building }
                                    ].map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setData({...data, institutionType: type.value as any})}
                                            className={`p-4 border-2 rounded-lg transition-all ${
                                                data.institutionType === type.value
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <type.icon className="h-8 w-8 mx-auto mb-2" />
                                            <div className="font-medium">{type.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Approximate Student Count
                                </label>
                                <Input
                                    type="number"
                                    value={data.studentCount}
                                    onChange={(e) => setData({...data, studentCount: e.target.value})}
                                    placeholder="e.g., 5000"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Your role & department</h2>
                            <p className="text-gray-600">Help us understand your perspective</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Your Name *
                                </label>
                                <Input
                                    value={data.userName}
                                    onChange={(e) => setData({...data, userName: e.target.value})}
                                    placeholder="John Smith"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Your Role *
                                </label>
                                <Input
                                    value={data.userRole}
                                    onChange={(e) => setData({...data, userRole: e.target.value})}
                                    placeholder="e.g., Technology Director, Principal, CTO"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Department
                                </label>
                                <Input
                                    value={data.department}
                                    onChange={(e) => setData({...data, department: e.target.value})}
                                    placeholder="e.g., IT, Curriculum, Administration"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Your AI journey</h2>
                            <p className="text-gray-600">Almost done! Tell us about your AI goals</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Where are you in your AI journey? *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'none', label: 'Just Starting' },
                                        { value: 'exploring', label: 'Exploring Options' },
                                        { value: 'piloting', label: 'Running Pilots' },
                                        { value: 'implementing', label: 'Implementing' }
                                    ].map((stage) => (
                                        <button
                                            key={stage.value}
                                            type="button"
                                            onClick={() => setData({...data, aiExperience: stage.value as any})}
                                            className={`p-3 border-2 rounded-lg transition-all ${
                                                data.aiExperience === stage.value
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {stage.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    What's your top priority?
                                </label>
                                <Input
                                    value={data.topPriority}
                                    onChange={(e) => setData({...data, topPriority: e.target.value})}
                                    placeholder="e.g., Create AI policy, train teachers, evaluate tools"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Implementation timeline
                                </label>
                                <select
                                    value={data.timeline}
                                    onChange={(e) => setData({...data, timeline: e.target.value})}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="">Select timeline</option>
                                    <option value="immediate">Immediate (This month)</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="semester">This Semester</option>
                                    <option value="year">This School Year</option>
                                    <option value="planning">Planning for Next Year</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return true; // Welcome screen
            case 2:
                return data.institutionName && data.institutionType;
            case 3:
                return data.userName && data.userRole;
            case 4:
                return data.aiExperience;
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Progress Bar */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-10">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                            Step {currentStep} of {totalSteps}
                        </span>
                        <span className="text-sm text-gray-500">
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Card className="p-8">
                    {renderStep()}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="min-w-[100px]"
                        >
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!canProceed() || loading}
                            className="min-w-[140px]"
                        >
                            {loading ? (
                                'Setting up...'
                            ) : currentStep === totalSteps ? (
                                <>
                                    Start Assessment <CheckCircle className="ml-2 h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </Card>

                {/* Help text */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    Need help? Contact support at support@aiblueprint.org
                </div>
            </div>
        </div>
    );
}