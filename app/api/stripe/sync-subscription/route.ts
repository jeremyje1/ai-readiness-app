import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Syncing subscription for user:', user.id, user.email);

    // Search for customer in Stripe by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 10
    });

    if (!customers.data.length) {
      return NextResponse.json({ 
        error: 'No Stripe customer found',
        email: user.email 
      }, { status: 404 });
    }

    const customer = customers.data[0];
    console.log('Found Stripe customer:', customer.id);

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10
    });

    if (!subscriptions.data.length) {
      return NextResponse.json({ 
        error: 'No active subscriptions found',
        customerId: customer.id
      }, { status: 404 });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;
    
    console.log('Found active subscription:', subscription.id, 'with price:', priceId);

    // Update user_payments table
    const { data: payment, error: upsertError } = await supabase
      .from('user_payments')
      .upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        payment_status: 'active',
        plan_type: 'ai-blueprint-edu',
        access_granted: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Failed to upsert payment record:', upsertError);
      return NextResponse.json({ 
        error: 'Failed to update payment record',
        details: upsertError.message 
      }, { status: 500 });
    }

    console.log('Successfully synced subscription:', payment);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        priceId: priceId,
        customerId: customer.id
      },
      payment: payment
    });

  } catch (error) {
    console.error('Sync subscription error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}