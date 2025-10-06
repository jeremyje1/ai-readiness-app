import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user_payments table for subscription status
    const { data: payment, error: paymentError } = await supabase
      .from('user_payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('payment_status', 'active')
      .single();

    if (paymentError && paymentError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Payment status error:', paymentError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Return payment status
    return NextResponse.json({
      isVerified: !!payment,
      hasActiveSubscription: !!payment,
      tier: payment?.plan_type || 'free',
      email: user.email,
      userId: user.id,
      subscriptionId: payment?.stripe_subscription_id,
      customerId: payment?.stripe_customer_id,
      priceId: payment?.stripe_price_id
    });

  } catch (error) {
    console.error('Payment status route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}