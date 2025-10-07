import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    // Test with a simple Stripe API call
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      return NextResponse.json({ 
        error: 'No Stripe key configured',
        keyExists: false 
      }, { status: 500 });
    }

    // Try initializing Stripe with the current API version
    let stripe;
    let apiVersion = '2025-06-30.basil';
    
    try {
      stripe = new Stripe(stripeKey, { apiVersion: '2025-06-30.basil' as any });
    } catch (versionError) {
      // If that fails, try without specifying version
      console.log('Failed with API version, trying without version');
      stripe = new Stripe(stripeKey, {});
      apiVersion = 'default';
    }

    // Try a simple API call to test the connection
    try {
      // List prices with a limit of 1 to test the connection
      const prices = await stripe.prices.list({ limit: 1 });
      
      return NextResponse.json({
        success: true,
        connection: 'working',
        apiVersion,
        keyPrefix: stripeKey.substring(0, 7),
        pricesFound: prices.data.length,
        firstPriceId: prices.data[0]?.id || null
      });
    } catch (apiError: any) {
      console.error('Stripe API error:', apiError);
      
      return NextResponse.json({
        success: false,
        connection: 'failed',
        error: apiError.message,
        type: apiError.type,
        code: apiError.code,
        statusCode: apiError.statusCode,
        apiVersion,
        keyPrefix: stripeKey.substring(0, 7),
        hint: apiError.type === 'StripeAuthenticationError' ? 
          'Invalid API key - check if the key is correct and active' : 
          'Check network connectivity or API key permissions'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test connection error:', error);
    return NextResponse.json({ 
      error: error.message,
      type: 'initialization_error'
    }, { status: 500 });
  }
}