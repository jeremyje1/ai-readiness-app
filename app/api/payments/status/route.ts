import { getLatestGrantedPayment, hasActivePayment, resolvePaymentTier } from '@/lib/payments/access';
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

    const subscriptionStatus = profile?.subscription_status || (isVerified ? (payment?.payment_status ?? 'active') : 'inactive');
    const subscriptionTier = profile?.subscription_tier || tier || null;
    const trialEndsAt = profile?.trial_ends_at ?? null;

    return NextResponse.json({
      isVerified,
      hasActiveSubscription: isVerified,
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
      trialEndsAt
    });

  } catch (error) {
    console.error('Payment status route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}