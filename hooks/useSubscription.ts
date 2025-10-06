import { useEffect, useState } from 'react';

interface SubscriptionStatus {
    isLoading: boolean;
    hasActiveSubscription: boolean;
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
                const isTrialUser = data.subscriptionStatus === 'trial';
                const hasActiveSubscription = data.hasActiveSubscription;

                let daysLeftInTrial = 0;
                if (isTrialUser && trialEndsAt) {
                    const diffTime = trialEndsAt.getTime() - now.getTime();
                    daysLeftInTrial = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                const canAccessPremiumFeatures = hasActiveSubscription || (isTrialUser && daysLeftInTrial > 0);

                setStatus({
                    isLoading: false,
                    hasActiveSubscription,
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