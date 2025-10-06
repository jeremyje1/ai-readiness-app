'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Brain,
    CheckCircle2,
    Shield,
    Sparkles,
    TrendingUp,
    Users,
    X
} from 'lucide-react';

interface ConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason: 'trial_expired' | 'subscription_required' | 'feature_upgrade';
    onUpgrade?: () => void;
}

export default function ConversionModal({ isOpen, onClose, reason, onUpgrade }: ConversionModalProps) {
    const handleUpgrade = async () => {
        try {
            // Create Stripe checkout session
            const response = await fetch('/api/stripe/unified-checkout?' + new URLSearchParams({
                product: 'platform',
                billing: 'monthly',
                price_id: 'price_1SDnhlRMpSG47vNmDQr1WeJ3',
                trial_days: '0', // No trial for conversions
                return_to: 'dashboard'
            }));

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                console.error('Checkout error:', data.error);
            }
        } catch (error) {
            console.error('Failed to create checkout session:', error);
        }

        if (onUpgrade) {
            onUpgrade();
        }
    };

    const getContent = () => {
        switch (reason) {
            case 'trial_expired':
                return {
                    title: 'Your Trial Has Ended',
                    subtitle: 'Continue your AI transformation journey with unlimited access',
                    cta: 'Upgrade Now - $199/month',
                    features: [
                        'Unlimited AI Blueprint generation',
                        'Real-time collaboration tools',
                        'Executive dashboards & reporting',
                        'AIRIX framework benchmarking',
                        'Priority support & expert guidance',
                        'Quarterly progress reviews'
                    ]
                };
            case 'subscription_required':
                return {
                    title: 'Unlock Your AI Blueprint',
                    subtitle: 'Get instant access to personalized AI implementation strategies',
                    cta: 'Start Now - $199/month',
                    features: [
                        'Custom AI readiness assessment',
                        'Personalized implementation roadmap',
                        'ROI calculator & business case builder',
                        'Policy templates & governance tools',
                        'Progress tracking & benchmarking',
                        'Expert recommendations'
                    ]
                };
            case 'feature_upgrade':
                return {
                    title: 'Premium Features Available',
                    subtitle: 'Enhance your AI strategy with advanced tools and insights',
                    cta: 'Upgrade to Premium - $199/month',
                    features: [
                        'Advanced analytics & insights',
                        'Custom policy generation',
                        'Team collaboration workspace',
                        'API access for integrations',
                        'White-label reports',
                        'Dedicated success manager'
                    ]
                };
            default:
                return {
                    title: 'Upgrade Your Plan',
                    subtitle: 'Access all features and accelerate your AI journey',
                    cta: 'Upgrade Now',
                    features: []
                };
        }
    };

    const content = getContent();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="w-full max-w-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card className="relative overflow-hidden bg-white shadow-2xl">
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 opacity-50" />

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>

                            <div className="relative p-8">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                                        <Sparkles className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h2>
                                    <p className="text-lg text-gray-600">{content.subtitle}</p>
                                </div>

                                {/* Features grid */}
                                <div className="grid md:grid-cols-2 gap-4 mb-8">
                                    {content.features.map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Value props */}
                                <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-900">30% Faster</p>
                                        <p className="text-xs text-gray-600">Implementation</p>
                                    </div>
                                    <div className="text-center">
                                        <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-900">500+ Leaders</p>
                                        <p className="text-xs text-gray-600">Trust AI Blueprint</p>
                                    </div>
                                    <div className="text-center">
                                        <Shield className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-900">Enterprise</p>
                                        <p className="text-xs text-gray-600">Security</p>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleUpgrade}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 text-lg group"
                                    >
                                        {content.cta}
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    <p className="text-center text-sm text-gray-600">
                                        Cancel anytime • Secure payment • Instant access
                                    </p>
                                </div>

                                {/* Trust badges */}
                                <div className="mt-6 pt-6 border-t flex items-center justify-center gap-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Shield className="h-4 w-4" />
                                        <span>SOC 2 Compliant</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>FERPA Ready</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Brain className="h-4 w-4" />
                                        <span>AIRIX Certified</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}