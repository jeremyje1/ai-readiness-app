import { getLatestGrantedPayment, hasActivePayment, resolvePaymentTier } from '@/lib/payments/access';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
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
      accessGranted: payment?.access_granted === true
    });

  } catch (error) {
    console.error('Payment status route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}