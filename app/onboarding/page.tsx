'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import {
    ArrowRight,
    Building,
    CheckCircle,
    Clock,
    GraduationCap,
    Plus,
    Target,
    Users,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OnboardingData {
    // Step 1: Educator Profile
    userName: string;
    userRole: string;
    department: string;
    yearsInEducation: string;

    // Step 2: Institution Context
    institutionName: string;
    institutionSize: string;
    currentAIAdoption: string;

    // Step 3: Implementation Goals
    primaryGoals: string[];
    biggestChallenges: string[];
    timeline: string;

    // Step 4: Team Setup
    inviteColleagues: boolean;
    colleagueEmails: string[];
    createClassroom: boolean;
}

const ROLES = [
    { value: 'faculty', label: 'Faculty/Professor', icon: GraduationCap },
    { value: 'admin', label: 'Administrator', icon: Building },
    { value: 'department_head', label: 'Department Head', icon: Users },
    { value: 'it_staff', label: 'IT Staff', icon: Target },
];

const INSTITUTION_SIZES = [
    { value: 'small', label: 'Small (<2,000 students)' },
    { value: 'medium', label: 'Medium (2,000-10,000)' },
    { value: 'large', label: 'Large (10,000-50,000)' },
    { value: 'very_large', label: 'Very Large (50,000+)' },
];

const AI_ADOPTION_LEVELS = [
    { value: 'none', label: 'Not started', description: 'No AI initiatives yet' },
    { value: 'exploring', label: 'Exploring', description: 'Researching options' },
    { value: 'piloting', label: 'Piloting', description: 'Testing with small groups' },
    { value: 'implementing', label: 'Implementing', description: 'Rolling out institution-wide' },
];

const PRIMARY_GOALS = [
    'Improve student engagement and outcomes',
    'Streamline administrative processes',
    'Enhance faculty productivity',
    'Develop AI literacy programs',
    'Create ethical AI guidelines',
    'Implement AI-powered learning tools',
];

const BIGGEST_CHALLENGES = [
    'Faculty resistance to change',
    'Budget constraints',
    'Lack of technical expertise',
    'Data privacy concerns',
    'Integration with existing systems',
    'Unclear ROI',
];

export default function EducatorOnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [data, setData] = useState<OnboardingData>({
        userName: '',
        userRole: '',
        department: '',
        yearsInEducation: '',
        institutionName: '',
        institutionSize: '',
        currentAIAdoption: '',
        primaryGoals: [],
        biggestChallenges: [],
        timeline: '',
        inviteColleagues: false,
        colleagueEmails: [],
        createClassroom: false,
    });

    const supabase = createClient();

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
            } else {
                setUserId(user.id);
                // Pre-fill user data if available
                if (user.user_metadata?.name) {
                    setData(prev => ({ ...prev, userName: user.user_metadata.name }));
                }
            }
        };
        checkAuth();
    }, [router, supabase]);

    const handleComplete = async () => {
        setLoading(true);
        try {
            if (!userId) return;

            // Save onboarding data
            const { error } = await supabase
                .from('user_onboarding')
                .upsert({
                    user_id: userId,
                    educator_profile: {
                        name: data.userName,
                        role: data.userRole,
                        department: data.department,
                        years_in_education: data.yearsInEducation,
                    },
                    institution_context: {
                        name: data.institutionName,
                        size: data.institutionSize,
                        current_ai_adoption: data.currentAIAdoption,
                    },
                    implementation_goals: {
                        primary_goals: data.primaryGoals,
                        biggest_challenges: data.biggestChallenges,
                        timeline: data.timeline,
                    },
                    team_setup: {
                        invite_colleagues: data.inviteColleagues,
                        colleague_emails: data.colleagueEmails,
                        create_classroom: data.createClassroom,
                    },
                    completed_at: new Date().toISOString(),
                });

            if (error) throw error;

            // Update user metadata
            await supabase.auth.updateUser({
                data: {
                    onboarding_completed: true,
                    institution_name: data.institutionName,
                    user_role: data.userRole,
                }
            });

            // Send colleague invitations if requested
            if (data.inviteColleagues && data.colleagueEmails.length > 0) {
                await fetch('/api/invite-colleagues', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emails: data.colleagueEmails,
                        inviterName: data.userName,
                        institutionName: data.institutionName,
                    }),
                });
            }

            // Redirect to dashboard
            router.push('/dashboard/personalized');
        } catch (error) {
            console.error('Onboarding error:', error);
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(data.userName && data.userRole && data.department);
            case 2:
                return !!(data.institutionName && data.institutionSize && data.currentAIAdoption);
            case 3:
                return data.primaryGoals.length > 0 && data.biggestChallenges.length > 0 && !!data.timeline;
            case 4:
                return true; // Optional step
            default:
                return false;
        }
    };

    const handleAddColleague = () => {
        setData(prev => ({
            ...prev,
            colleagueEmails: [...prev.colleagueEmails, '']
        }));
    };

    const handleRemoveColleague = (index: number) => {
        setData(prev => ({
            ...prev,
            colleagueEmails: prev.colleagueEmails.filter((_, i) => i !== index)
        }));
    };

    const handleColleagueEmailChange = (index: number, value: string) => {
        setData(prev => ({
            ...prev,
            colleagueEmails: prev.colleagueEmails.map((email, i) =>
                i === index ? value : email
            )
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to AI Blueprint for Education
                    </h1>
                    <p className="text-gray-600">
                        Let&rsquo;s personalize your experience in just a few steps
                    </p>
                </div>

                <Progress value={(currentStep / 4) * 100} className="mb-8" />

                <Card className="p-8">
                    {/* Step 1: Educator Profile */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Tell us about yourself</h2>
                                <p className="text-gray-600">This helps us tailor recommendations to your role</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Your Name</Label>
                                    <Input
                                        id="name"
                                        value={data.userName}
                                        onChange={(e) => setData({ ...data, userName: e.target.value })}
                                        placeholder="Dr. Jane Smith"
                                    />
                                </div>

                                <div>
                                    <Label>Your Role</Label>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {ROLES.map((role) => (
                                            <button
                                                key={role.value}
                                                onClick={() => setData({ ...data, userRole: role.value })}
                                                className={`p-4 rounded-lg border-2 transition-all ${data.userRole === role.value
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <role.icon className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                                                <p className="text-sm font-medium">{role.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        value={data.department}
                                        onChange={(e) => setData({ ...data, department: e.target.value })}
                                        placeholder="e.g., Computer Science, Administration"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="years">Years in Education</Label>
                                    <Input
                                        id="years"
                                        type="number"
                                        value={data.yearsInEducation}
                                        onChange={(e) => setData({ ...data, yearsInEducation: e.target.value })}
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Institution Context */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">About your institution</h2>
                                <p className="text-gray-600">Help us understand your institutional context</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="institution">Institution Name</Label>
                                    <Input
                                        id="institution"
                                        value={data.institutionName}
                                        onChange={(e) => setData({ ...data, institutionName: e.target.value })}
                                        placeholder="State University"
                                    />
                                </div>

                                <div>
                                    <Label>Institution Size</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {INSTITUTION_SIZES.map((size) => (
                                            <button
                                                key={size.value}
                                                onClick={() => setData({ ...data, institutionSize: size.value })}
                                                className={`p-3 rounded-lg border text-left transition-all ${data.institutionSize === size.value
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <p className="text-sm font-medium">{size.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Current AI Adoption Level</Label>
                                    <div className="space-y-2 mt-2">
                                        {AI_ADOPTION_LEVELS.map((level) => (
                                            <button
                                                key={level.value}
                                                onClick={() => setData({ ...data, currentAIAdoption: level.value })}
                                                className={`w-full p-4 rounded-lg border text-left transition-all ${data.currentAIAdoption === level.value
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <p className="font-medium">{level.label}</p>
                                                <p className="text-sm text-gray-600">{level.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Implementation Goals */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Your AI implementation goals</h2>
                                <p className="text-gray-600">What do you hope to achieve with AI?</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Primary Goals (select all that apply)</Label>
                                    <div className="space-y-2 mt-2">
                                        {PRIMARY_GOALS.map((goal) => (
                                            <label
                                                key={goal}
                                                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={data.primaryGoals.includes(goal)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setData({
                                                                ...data,
                                                                primaryGoals: [...data.primaryGoals, goal]
                                                            });
                                                        } else {
                                                            setData({
                                                                ...data,
                                                                primaryGoals: data.primaryGoals.filter(g => g !== goal)
                                                            });
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm">{goal}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Biggest Challenges (select all that apply)</Label>
                                    <div className="space-y-2 mt-2">
                                        {BIGGEST_CHALLENGES.map((challenge) => (
                                            <label
                                                key={challenge}
                                                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={data.biggestChallenges.includes(challenge)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setData({
                                                                ...data,
                                                                biggestChallenges: [...data.biggestChallenges, challenge]
                                                            });
                                                        } else {
                                                            setData({
                                                                ...data,
                                                                biggestChallenges: data.biggestChallenges.filter(c => c !== challenge)
                                                            });
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm">{challenge}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Implementation Timeline</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {[
                                            { value: '1-3months', label: '1-3 months' },
                                            { value: '3-6months', label: '3-6 months' },
                                            { value: '6-12months', label: '6-12 months' },
                                            { value: 'over1year', label: 'Over 1 year' },
                                        ].map((timeline) => (
                                            <button
                                                key={timeline.value}
                                                onClick={() => setData({ ...data, timeline: timeline.value })}
                                                className={`p-3 rounded-lg border text-center transition-all ${data.timeline === timeline.value
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Clock className="h-5 w-5 mx-auto mb-1 text-indigo-600" />
                                                <p className="text-sm font-medium">{timeline.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Team Setup (Optional) */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Build your team (optional)</h2>
                                <p className="text-gray-600">Collaborate with colleagues on your AI journey</p>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center space-x-3">
                                    <Checkbox
                                        checked={data.inviteColleagues}
                                        onCheckedChange={(checked) =>
                                            setData({ ...data, inviteColleagues: checked as boolean })
                                        }
                                    />
                                    <span>Invite colleagues to join AI Blueprint</span>
                                </label>

                                {data.inviteColleagues && (
                                    <div className="space-y-3">
                                        <Label>Colleague Email Addresses</Label>
                                        {data.colleagueEmails.map((email, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => handleColleagueEmailChange(index, e.target.value)}
                                                    placeholder="colleague@university.edu"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleRemoveColleague(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleAddColleague}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Another Colleague
                                        </Button>
                                    </div>
                                )}

                                <label className="flex items-center space-x-3">
                                    <Checkbox
                                        checked={data.createClassroom}
                                        onCheckedChange={(checked) =>
                                            setData({ ...data, createClassroom: checked as boolean })
                                        }
                                    />
                                    <span>Create a virtual classroom for AI training</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                        >
                            Back
                        </Button>

                        {currentStep < 4 ? (
                            <Button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!isStepValid(currentStep)}
                            >
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>Completing...</>
                                ) : (
                                    <>
                                        Complete Setup
                                        <CheckCircle className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}