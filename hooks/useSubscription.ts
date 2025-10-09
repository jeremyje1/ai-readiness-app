import { useEffect, useState } from 'react';

interface SubscriptionStatus {
    isLoading: boolean;
    hasActiveSubscription: boolean;
    hasPremiumAccess: boolean;
    isTrialUser: boolean;
    trialEndsAt: Date | null;
    daysLeftInTrial: number;
    subscriptionTier: string | null;
    canAccessPremiumFeatures: boolean;
}

export function useSubscription(): SubscriptionStatus {
    const [status, setStatus] = useState<SubscriptionStatus>({
        isLoading: true,
        hasActiveSubscription: false,
    hasPremiumAccess: false,
        isTrialUser: false,
        trialEndsAt: null,
        daysLeftInTrial: 0,
        subscriptionTier: null,
        canAccessPremiumFeatures: false
    });

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const response = await fetch('/api/payments/status');
                const data = await response.json();

                const now = new Date();
                const trialEndsAt = data.trialEndsAt ? new Date(data.trialEndsAt) : null;

                const normalizedStatus = (data.subscriptionStatus || '').toLowerCase();
                const trialStatuses = new Set(['trial', 'trialing', 'premium_trial', 'grace_period', 'onboarding']);
                const isTrialUser = trialStatuses.has(normalizedStatus);

                const hasActiveSubscription = Boolean(data.hasActiveSubscription);

                let daysLeftInTrial = 0;
                if (isTrialUser && trialEndsAt) {
                    const diffTime = trialEndsAt.getTime() - now.getTime();
                    daysLeftInTrial = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                const hasPremiumAccess = data.hasPremiumAccess ?? (hasActiveSubscription || (isTrialUser && daysLeftInTrial > 0));
                const canAccessPremiumFeatures = hasPremiumAccess;

                setStatus({
                    isLoading: false,
                    hasActiveSubscription,
                    hasPremiumAccess,
                    isTrialUser,
                    trialEndsAt,
                    daysLeftInTrial,
                    subscriptionTier: data.subscriptionTier,
                    canAccessPremiumFeatures
                });
            } catch (error) {
                console.error('Failed to check subscription status:', error);
                setStatus(prev => ({ ...prev, isLoading: false }));
            }
        };

        checkSubscription();
    }, []);

    return status;
}