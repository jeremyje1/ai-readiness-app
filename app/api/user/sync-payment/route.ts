/**
 * Sync Payment Status to User Profile
 * Updates user profile with current subscription status from user_payments table
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Syncing payment status for user:', user.email);

    // Fetch payment record
    const { data: payment, error: paymentError } = await supabase
      .from('user_payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('access_granted', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If no payment by user_id, try by email
    let paymentRecord = payment;
    if (!payment && user.email) {
      const { data: emailPayment } = await supabase
        .from('user_payments')
        .select('*')
        .eq('email', user.email.toLowerCase())
        .eq('access_granted', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      paymentRecord = emailPayment;

      // Claim the payment if found
      if (emailPayment && !emailPayment.user_id) {
        await supabase
          .from('user_payments')
          .update({ user_id: user.id })
          .eq('id', emailPayment.id);
      }
    }

    // Determine subscription status
    let subscriptionStatus: 'active' | 'inactive' | 'trial' | 'expired' = 'inactive';
    let subscriptionTier: string | null = null;

    if (paymentRecord) {
      if (paymentRecord.access_granted && !paymentRecord.access_revoked_at) {
        subscriptionStatus = 'active';
        subscriptionTier = paymentRecord.tier;
      } else if (paymentRecord.access_revoked_at) {
        subscriptionStatus = 'expired';
        subscriptionTier = paymentRecord.tier;
      }
    }

    // Update user profile with subscription info
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        email: user.email!,
        subscription_status: subscriptionStatus,
        subscription_tier: subscriptionTier,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating profile with subscription:', updateError);
      return NextResponse.json(
        { error: 'Failed to sync subscription', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Subscription synced:', {
      status: subscriptionStatus,
      tier: subscriptionTier,
      hasPayment: !!paymentRecord
    });

    return NextResponse.json({
      success: true,
      subscription: {
        status: subscriptionStatus,
        tier: subscriptionTier,
        hasPayment: !!paymentRecord,
        paymentDetails: paymentRecord ? {
          organization: paymentRecord.organization,
          created_at: paymentRecord.created_at
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Payment sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request); // Allow GET for easy testing
}
