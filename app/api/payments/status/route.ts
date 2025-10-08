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
    const { data: payment, error: paymentError } = await supabase
      .from('user_payments')
      .select('*')
      .eq('user_id', user.id)
      .in('payment_status', ['active', 'completed', 'premium'])
      .eq('access_granted', true)
      .single();

    if (paymentError && paymentError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Payment status error:', paymentError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Return payment status
    const isVerified = payment?.access_granted === true;

    return NextResponse.json({
      isVerified,
      hasActiveSubscription: isVerified,
      tier: payment?.plan_type || 'free',
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