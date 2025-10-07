import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // First, let's find the customer in Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 10
    });

    if (!customers.data.length) {
      return NextResponse.json({ 
        error: 'No Stripe customer found',
        email: email 
      }, { status: 404 });
    }

    // Get all subscriptions for found customers
    const subscriptionPromises = customers.data.map(customer => 
      stripe.subscriptions.list({
        customer: customer.id,
        limit: 100
      })
    );

    const subscriptionsResults = await Promise.all(subscriptionPromises);
    const allSubscriptions = subscriptionsResults.flatMap(result => result.data);
    
    // Filter for active subscriptions
    const activeSubscriptions = allSubscriptions.filter(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    );

    // Now let's check the database
    const supabase = await createClient();
    
    // Get user from auth.users using a simpler approach
    let userId = null;
    let userEmail = null;
    
    // Try to get user from profiles first
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (profile) {
      userId = profile.id;
      userEmail = profile.email;
    }
    
    // Get payment records
    const { data: paymentRecords } = await supabase
      .from('user_payments')
      .select('*')
      .or(`email.eq.${email}${userId ? `,user_id.eq.${userId}` : ''}`);

    return NextResponse.json({
      email,
      stripe: {
        customers: customers.data.map(c => ({
          id: c.id,
          email: c.email,
          created: new Date(c.created * 1000).toISOString()
        })),
        activeSubscriptions: activeSubscriptions.map(s => ({
          id: s.id,
          status: s.status,
          customer: s.customer,
          price: s.items.data[0]?.price.id,
          created: new Date(s.created * 1000).toISOString()
        }))
      },
      database: {
        userId: userId,
        userEmail: userEmail,
        paymentRecords: paymentRecords || []
      }
    });

  } catch (error) {
    console.error('Debug subscription error:', error);
    return NextResponse.json({ 
      error: 'Failed to debug subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Simple sync endpoint that doesn't require auth
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email;
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Search for customer in Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 10
    });

    if (!customers.data.length) {
      return NextResponse.json({ 
        error: 'No Stripe customer found',
        email: email 
      }, { status: 404 });
    }

    // Get the most recent active subscription
    let activeSubscription = null;
    let stripeCustomerId = null;

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 10
      });

      if (subscriptions.data.length > 0) {
        activeSubscription = subscriptions.data[0];
        stripeCustomerId = customer.id;
        break;
      }
    }

    if (!activeSubscription) {
      return NextResponse.json({ 
        error: 'No active subscription found',
        email: email
      }, { status: 404 });
    }

    // Get the price ID
    const priceId = activeSubscription.items.data[0]?.price.id;
    
    // Get user from database
    const supabase = await createClient();
    
    // Try to find user by email
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (!profiles) {
      return NextResponse.json({ 
        error: 'User not found in database',
        email: email,
        hint: 'User must exist in profiles table'
      }, { status: 404 });
    }

    // Update user_payments with profile user
    const { error: upsertError } = await supabase
      .from('user_payments')
      .upsert({
        user_id: profiles.id,
        email: email,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: activeSubscription.id,
        stripe_price_id: priceId,
        payment_status: 'active',
        plan_type: 'ai-blueprint-edu',
        access_granted: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Failed to update payment record:', upsertError);
      return NextResponse.json({ 
        error: 'Failed to update payment record',
        details: upsertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      userId: profiles.id,
      email: email,
      subscriptionId: activeSubscription.id
    });

  } catch (error) {
    console.error('Sync subscription error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}