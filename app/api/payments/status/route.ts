import { getLatestGrantedPayment, hasActivePayment, hasPremiumAccess, resolvePaymentTier } from '@/lib/payments/access';
import { resolveServerUser } from '@/lib/supabase/resolve-user';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { user, error: authError } = await resolveServerUser(supabase, request);

    if (!user) {
      console.error('Payment status auth error:', authError);
      return NextResponse.json({
        error: 'Unauthorized',
        details: authError?.message || 'No user found',
        hint: 'Check if cookies are being sent correctly'
      }, { status: 401 });
    }

    // Check user_payments table for subscription status
    const payment = await getLatestGrantedPayment(supabase, user.id);

    const isVerified = hasActivePayment(payment);
    const tier = resolvePaymentTier(payment) || 'free';

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_status, subscription_tier, trial_ends_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const metadataStatus = typeof user.user_metadata?.subscription_status === 'string'
      ? user.user_metadata.subscription_status
      : null;
    const metadataTier = typeof user.user_metadata?.tier === 'string'
      ? user.user_metadata.tier
      : null;
    const metadataTrialEndsAt = (user.user_metadata?.trial_ends_at || user.user_metadata?.trialEndsAt) ?? null;

    const userCreatedAt = user?.created_at || null;

    let subscriptionStatus = profile?.subscription_status
      || metadataStatus
      || (isVerified ? (payment?.payment_status ?? 'active') : 'inactive');
    let subscriptionTier = profile?.subscription_tier
      || metadataTier
      || tier
      || null;
    let trialEndsAt = profile?.trial_ends_at ?? metadataTrialEndsAt ?? null;

    if (!trialEndsAt && userCreatedAt) {
      const createdAtDate = new Date(userCreatedAt);
      if (!Number.isNaN(createdAtDate.getTime())) {
        const fallbackTrialEnd = new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        if (fallbackTrialEnd.getTime() > Date.now()) {
          trialEndsAt = fallbackTrialEnd.toISOString();
        }
      }
    }

    if (!subscriptionStatus && trialEndsAt) {
      const parsedTrialEnd = new Date(trialEndsAt);
      if (!Number.isNaN(parsedTrialEnd.getTime()) && parsedTrialEnd.getTime() > Date.now()) {
        subscriptionStatus = 'trialing';
        if (!subscriptionTier) {
          subscriptionTier = 'trial';
        }
      }
    }

    const hasAccess = hasPremiumAccess(payment, subscriptionStatus, subscriptionTier, trialEndsAt, userCreatedAt);

    console.info('[payments/status] Computed payment status', {
      userId: user.id,
      email: user.email,
      subscriptionStatus,
      subscriptionTier,
      trialEndsAt,
      metadataStatus,
      metadataTier,
      metadataTrialEndsAt,
      payment: payment ? {
        id: payment.id,
        payment_status: payment.payment_status,
        access_granted: payment.access_granted,
        stripe_subscription_id: payment.stripe_subscription_id,
        updated_at: payment.updated_at
      } : null,
      isVerified,
      hasAccess
    });

    return NextResponse.json({
      isVerified,
      hasActiveSubscription: isVerified,
      hasPremiumAccess: hasAccess,
      tier,
      email: user.email,
      userId: user.id,
      subscriptionId: payment?.stripe_subscription_id,
      customerId: payment?.stripe_customer_id,
      priceId: payment?.stripe_price_id,
      paymentStatus: payment?.payment_status,
      accessGranted: payment?.access_granted === true,
      subscriptionStatus,
      subscriptionTier,
      trialEndsAt,
      metadataStatus,
      metadataTier,
      metadataTrialEndsAt
    });

  } catch (error) {
    console.error('Payment status route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}