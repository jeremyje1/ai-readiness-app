'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock,
    GraduationCap,
    School,
    Shield,
    Sparkles,
    Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GetStartedPage() {
    const router = useRouter();
    const supabase = createClient();

    // Form state
    const [institutionType, setInstitutionType] = useState<'K12' | 'HigherEd'>('K12');
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        organization: '',
        title: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    console.log('✅ Existing session found, redirecting to dashboard...');
                    router.push('/dashboard/personalized');
                }
            } catch (error) {
                console.error('❌ Error checking session:', error);
            }
        };
        checkUser();
    }, [router]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return false;
        }

        if (authMode === 'signup') {
            if (!formData.name || !formData.organization) {
                setError('Please fill in all required fields');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters');
                return false;
            }
        }

        return true;
    };

    const handleSignIn = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email.trim(),
                password: formData.password
            });

            if (error) throw error;

            if (data.session) {
                router.push('/dashboard/personalized');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        }
    };

    const handleSignUp = async () => {
        try {
            console.log('🚀 Starting signup process...');

            // Sign up the user with auto-confirm for trial users
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: formData.email.trim(),
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/welcome`,
                    data: {
                        name: formData.name,
                        organization: formData.organization,
                        title: formData.title,
                        phone: formData.phone,
                        institution_type: institutionType,
                        tier: 'ai-blueprint-edu',
                        subscription_status: 'trial',
                        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    }
                }
            });

            if (signUpError) {
                console.error('❌ Signup error:', signUpError);
                throw signUpError;
            }

            console.log('✅ Signup successful, user:', authData.user?.id);

            if (authData.user && authData.session) {
                console.log('✅ Session created automatically');

                // Don't create profile here - let the webhook handle it
                // This avoids race conditions and duplicate key errors
                console.log('⏭️ Skipping manual profile creation (webhook will handle it)');

                // Send welcome email
                try {
                    console.log('📧 Sending welcome email...');
                    await fetch('/api/email/welcome', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: formData.email,
                            name: formData.name,
                            organization: formData.organization,
                            institutionType: institutionType,
                        }),
                    });
                } catch (emailError) {
                    console.error('Failed to send welcome email:', emailError);
                    // Don't block signup if email fails
                }

                // Navigate to welcome page immediately
                console.log('🎉 Redirecting to welcome page...');
                console.log('🔍 Current URL:', window.location.href);
                console.log('🔍 Router ready:', router);

                // Use Next.js router for client-side navigation
                try {
                    await router.push('/welcome');
                    console.log('✅ Router.push called successfully');
                } catch (routerError) {
                    console.error('❌ Router.push failed:', routerError);
                    // Fallback to hard navigation
                    console.log('🔄 Falling back to window.location...');
                    window.location.href = '/welcome';
                }
            } else if (authData.user && !authData.session) {
                // Email confirmation required (fallback)
                console.log('📧 Email confirmation required');
                setError('Please check your email to confirm your account');
            }
        } catch (err: any) {
            console.error('❌ Signup error:', err);
            setError(err.message || 'Failed to create account');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            if (authMode === 'signin') {
                await handleSignIn();
            } else {
                await handleSignUp();
            }
        } finally {
            setLoading(false);
        }
    };

    const features = institutionType === 'K12' ? [
        'District-wide AI readiness assessment',
        'Teacher training resources',
        'Student safety frameworks',
        'Curriculum integration guides'
    ] : [
        'Faculty governance frameworks',
        'Research integration tools',
        'Academic policy templates',
        'Institutional benchmarking'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-indigo-600">AI Blueprint for Education</h1>
                    <div className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                            className="text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            {authMode === 'signin' ? 'Sign up' : 'Sign in'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Transform Your Institution with AI
                    </h2>
                    <p className="text-xl text-gray-600">
                        Start your 7-day free trial • No credit card required
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left side - Benefits */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Institution Type Selector */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Select Your Institution Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={institutionType} onValueChange={(value) => setInstitutionType(value as 'K12' | 'HigherEd')}>
                                    <div className="space-y-4">
                                        <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-lg border-2 hover:border-indigo-500 transition-colors"
                                            style={{ borderColor: institutionType === 'K12' ? '#6366f1' : '#e5e7eb' }}>
                                            <RadioGroupItem value="K12" id="K12" />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <School className="h-5 w-5 text-indigo-600" />
                                                    <span className="font-semibold">K-12 Education</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    For elementary, middle, and high schools or districts
                                                </p>
                                            </div>
                                        </label>

                                        <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-lg border-2 hover:border-indigo-500 transition-colors"
                                            style={{ borderColor: institutionType === 'HigherEd' ? '#6366f1' : '#e5e7eb' }}>
                                            <RadioGroupItem value="HigherEd" id="HigherEd" />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                                                    <span className="font-semibold">Higher Education</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    For colleges, universities, and research institutions
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        {/* Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What's Included in Your Trial</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {features.map((feature, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start space-x-3"
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                            <span className="text-gray-700">{feature}</span>
                                        </motion.li>
                                    ))}
                                </ul>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-2 text-blue-900 font-semibold mb-2">
                                        <Sparkles className="h-5 w-5" />
                                        <span>Special Launch Offer</span>
                                    </div>
                                    <p className="text-sm text-blue-800">
                                        Get 17% off with annual billing after your trial
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right side - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {authMode === 'signin' ? 'Sign In to Your Account' : 'Create Your Account'}
                                </CardTitle>
                                <CardDescription>
                                    {authMode === 'signin'
                                        ? 'Welcome back! Sign in to access your dashboard.'
                                        : 'Get instant access to all features with your 7-day free trial'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {authMode === 'signup' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="name">Full Name *</Label>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                                        placeholder="John Doe"
                                                        required={authMode === 'signup'}
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="title">Job Title</Label>
                                                    <Input
                                                        id="title"
                                                        type="text"
                                                        value={formData.title}
                                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                                        placeholder="Principal"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="organization">
                                                    {institutionType === 'K12' ? 'School/District Name' : 'Institution Name'} *
                                                </Label>
                                                <Input
                                                    id="organization"
                                                    type="text"
                                                    value={formData.organization}
                                                    onChange={(e) => handleInputChange('organization', e.target.value)}
                                                    placeholder={institutionType === 'K12' ? 'Springfield School District' : 'State University'}
                                                    required={authMode === 'signup'}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="you@institution.edu"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Password *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            disabled={loading}
                                            minLength={8}
                                        />
                                        {authMode === 'signup' && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Must be at least 8 characters
                                            </p>
                                        )}
                                    </div>

                                    {authMode === 'signup' && (
                                        <div>
                                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                placeholder="••••••••"
                                                required={authMode === 'signup'}
                                                disabled={loading}
                                                minLength={8}
                                            />
                                        </div>
                                    )}

                                    {authMode === 'signup' && (
                                        <div>
                                            <Label htmlFor="phone">Phone Number (Optional)</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                placeholder="(555) 123-4567"
                                                disabled={loading}
                                            />
                                        </div>
                                    )}

                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            'Please wait...'
                                        ) : authMode === 'signin' ? (
                                            'Sign In'
                                        ) : (
                                            <>
                                                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center text-sm text-gray-500">
                                        {authMode === 'signin' ? (
                                            <>
                                                <a href="/auth/password/reset" className="text-indigo-600 hover:text-indigo-500">
                                                    Forgot your password?
                                                </a>
                                            </>
                                        ) : (
                                            <>
                                                By creating an account, you agree to our{' '}
                                                <a href="/terms" className="underline">Terms of Service</a> and{' '}
                                                <a href="/privacy" className="underline">Privacy Policy</a>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Security badges */}
                        <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                                <Shield className="h-4 w-4" />
                                <span>SSL Encrypted</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>7-Day Trial</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4" />
                                <span>No Card Required</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}