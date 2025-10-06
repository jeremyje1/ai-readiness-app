'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Clock,
    FileText,
    Lock,
    Sparkles,
    TrendingUp,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface BlueprintUpgradeCTAProps {
    isTrialUser?: boolean;
    daysLeftInTrial?: number;
    showFloatingCTA?: boolean;
}

export default function BlueprintUpgradeCTA({
    isTrialUser = false,
    daysLeftInTrial = 0,
    showFloatingCTA = true
}: BlueprintUpgradeCTAProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Show CTA after user has been on page for 30 seconds
        const timer = setTimeout(() => {
            if (!isDismissed && showFloatingCTA) {
                setIsVisible(true);
            }
        }, 30000);

        return () => clearTimeout(timer);
    }, [isDismissed, showFloatingCTA]);

    const handleUpgrade = async () => {
        try {
            const response = await fetch('/api/stripe/unified-checkout?' + new URLSearchParams({
                product: 'platform',
                billing: 'monthly',
                price_id: 'price_1SDnhlRMpSG47vNmDQr1WeJ3',
                trial_days: '0',
                return_to: 'dashboard'
            }));

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Failed to create checkout session:', error);
        }
    };

    const dismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
    };

    // Trial expiring banner
    if (isTrialUser && daysLeftInTrial <= 3 && daysLeftInTrial > 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-full">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {daysLeftInTrial === 1
                                        ? 'Your trial ends tomorrow!'
                                        : `Your trial ends in ${daysLeftInTrial} days`}
                                </h3>
                                <p className="text-gray-700 mt-1">
                                    Upgrade now to keep your blueprints and continue your AI transformation journey
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleUpgrade}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            Upgrade Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    // Floating upgrade prompt
    return (
        <AnimatePresence>
            {isVisible && showFloatingCTA && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed bottom-6 right-6 z-40 max-w-sm"
                >
                    <Card className="relative p-6 shadow-2xl border-0 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                        {/* Close button */}
                        <button
                            onClick={dismiss}
                            className="absolute right-2 top-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Icon */}
                        <div className="mb-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
                                <Sparkles className="h-6 w-6" />
                            </div>
                        </div>

                        {/* Content */}
                        <h4 className="text-lg font-semibold mb-2">
                            Unlock Full Blueprint Features
                        </h4>
                        <p className="text-sm text-white/90 mb-4">
                            Get unlimited blueprints, team collaboration, progress tracking, and expert guidance.
                        </p>

                        {/* Features */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4" />
                                <span>Export to PDF & share with stakeholders</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4" />
                                <span>Collaborate with your entire team</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4" />
                                <span>Track progress & celebrate wins</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Button
                            onClick={handleUpgrade}
                            className="w-full bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
                        >
                            Upgrade for $199/month
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <p className="text-xs text-white/70 mt-3 text-center">
                            Cancel anytime • 30-day money back guarantee
                        </p>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Inline CTA for locked features
export function LockedFeatureCTA({ feature }: { feature: string }) {
    const handleUpgrade = async () => {
        try {
            const response = await fetch('/api/stripe/unified-checkout?' + new URLSearchParams({
                product: 'platform',
                billing: 'monthly',
                price_id: 'price_1SDnhlRMpSG47vNmDQr1WeJ3',
                trial_days: '0',
                return_to: 'dashboard'
            }));

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Failed to create checkout session:', error);
        }
    };

    return (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-4">
                    <Lock className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature} is a Premium Feature
                </h3>
                <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                    Upgrade to access this feature and accelerate your AI transformation
                </p>
                <Button onClick={handleUpgrade} className="bg-indigo-600 hover:bg-indigo-700">
                    Unlock Premium Features
                    <Sparkles className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}