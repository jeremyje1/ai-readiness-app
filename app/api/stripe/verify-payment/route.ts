import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { session_id, payment_intent, required_tier } = await request.json();

    let paymentVerified = false;
    let customerEmail = '';
    let tier = '';
    let sessionId = '';

    if (session_id) {
      // Verify Stripe Checkout Session
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === 'paid') {
        paymentVerified = true;
        customerEmail = session.customer_details?.email || '';
        sessionId = session_id;
        
        // Determine tier based on price ID
        const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
        const priceId = lineItems.data[0]?.price?.id;
        
        switch (priceId) {
          case process.env.STRIPE_PRICE_HIGHER_ED_PULSE_CHECK:
            tier = 'higher-ed-pulse-check';
            break;
          case process.env.STRIPE_PRICE_AI_READINESS_COMPREHENSIVE:
            tier = 'ai-readiness-comprehensive';
            break;
          case process.env.STRIPE_PRICE_AI_TRANSFORMATION_BLUEPRINT:
            tier = 'ai-transformation-blueprint';
            break;
          case process.env.STRIPE_PRICE_ENTERPRISE_PARTNERSHIP:
            tier = 'enterprise-partnership';
            break;
          default:
            tier = 'unknown';
        }
      }
    } else if (payment_intent) {
      // Verify Payment Intent
      const intent = await stripe.paymentIntents.retrieve(payment_intent);
      
      if (intent.status === 'succeeded') {
        paymentVerified = true;
        customerEmail = intent.receipt_email || '';
        tier = required_tier; // Fallback to required tier
      }
    }

    // Log successful payment verification
    if (paymentVerified) {
      console.log('Payment verified:', {
        tier,
        email: customerEmail,
        sessionId: sessionId || payment_intent,
        timestamp: new Date().toISOString(),
      });

      // TODO: Store in Supabase for tracking
      // await supabase.from('payment_verifications').insert({
      //   stripe_session_id: sessionId || payment_intent,
      //   customer_email: customerEmail,
      //   tier: tier,
      //   verified_at: new Date().toISOString(),
      // });
    }

    return NextResponse.json({
      verified: paymentVerified,
      tier: tier,
      email: customerEmail,
      sessionId: sessionId || payment_intent,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { verified: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
