import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    });

    // Simple test - just try to retrieve account info
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({
      success: true,
      account_id: account.id,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted
    });
    
  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json(
      { 
        error: 'Stripe test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
