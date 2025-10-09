import type { SupabaseClient } from '@supabase/supabase-js';

interface UserPayment {
    id: string;
    user_id: string;
    email?: string | null;
    name?: string | null;
    organization?: string | null;
    tier?: string | null;
    plan_type?: string | null;
    role?: string | null;
    payment_status?: string | null;
    access_granted?: boolean | null;
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    stripe_price_id?: string | null;
    stripe_session_id?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
}

export async function getLatestGrantedPayment(
    supabase: SupabaseClient<any>,
    userId: string
): Promise<UserPayment | null> {
    const { data, error } = await supabase
        .from('user_payments')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false, nullsFirst: false })
        .limit(5);

    if (error) {
        console.error('Failed to load latest payment for user', { userId, error });
        return null;
    }

    if (!data || data.length === 0) {
        return null;
    }

    const granted = data.find((record) => record.access_granted === true);
    if (granted) {
        return granted;
    }

    const activeStatuses = new Set(['active', 'completed', 'paid', 'premium', 'trialing']);
    const active = data.find((record) => {
        const status = record.payment_status?.toLowerCase();
        return status ? activeStatuses.has(status) : false;
    });

    return active ?? data[0];
}

export function resolvePaymentTier(payment: UserPayment | null | undefined): string | null {
    if (!payment) return null;
    return payment.plan_type || payment.tier || null;
}

export function hasActivePayment(payment: UserPayment | null | undefined): boolean {
    if (!payment) return false;

    const normalizedStatus = payment.payment_status?.toLowerCase();
    const activeStatuses = new Set(['active', 'completed', 'paid', 'premium', 'trialing']);

    if (payment.access_granted === true) {
        return normalizedStatus ? activeStatuses.has(normalizedStatus) : true;
    }

    if (payment.access_granted === false) {
        return normalizedStatus ? activeStatuses.has(normalizedStatus) : false;
    }

    return normalizedStatus ? activeStatuses.has(normalizedStatus) : false;
}

const PREMIUM_PROFILE_STATUSES = new Set(['active', 'trial', 'trialing', 'premium_trial', 'grace_period', 'onboarding']);

export function hasPremiumAccess(
    payment: UserPayment | null | undefined,
    profileStatus?: string | null,
    profileTier?: string | null,
    trialEndsAt?: string | null
): boolean {
    if (hasActivePayment(payment)) {
        return true;
    }

    const normalizedStatus = profileStatus?.toLowerCase();
    if (normalizedStatus && PREMIUM_PROFILE_STATUSES.has(normalizedStatus)) {
        return true;
    }

    const normalizedTier = profileTier?.toLowerCase();
    if (normalizedTier && (normalizedTier.includes('premium') || normalizedTier.includes('trial'))) {
        return true;
    }

    if (trialEndsAt) {
        const trialExpiry = new Date(trialEndsAt);
        if (!Number.isNaN(trialExpiry.getTime()) && trialExpiry.getTime() > Date.now()) {
            return true;
        }
    }

    return false;
}

export async function getOrganizationForUser(
    supabase: SupabaseClient<any>,
    userId: string
): Promise<{
    organization: string | null;
    payment: UserPayment | null;
    subscriptionStatus: string | null;
    subscriptionTier: string | null;
    trialEndsAt: string | null;
}> {
    const payment = await getLatestGrantedPayment(supabase, userId);

    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('institution_name, subscription_status, subscription_tier, trial_ends_at')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.warn('Failed to resolve organization from profile', { userId, error });
    }

    const organization = payment?.organization || profile?.institution_name || null;

    return {
        organization,
        payment,
        subscriptionStatus: profile?.subscription_status ?? null,
        subscriptionTier: profile?.subscription_tier ?? null,
        trialEndsAt: profile?.trial_ends_at ?? null,
    };
}
