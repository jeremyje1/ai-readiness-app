import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      return NextResponse.json({ 
        error: 'No Stripe key configured' 
      }, { status: 500 });
    }

    // Initialize Stripe
    let stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: '2025-06-30.basil' });
    } catch (error) {
      // Fallback without API version
      stripe = new Stripe(stripeKey, {} as any);
    }

    // List all prices
    const prices = await stripe.prices.list({ 
      limit: 100,
      expand: ['data.product']
    });

    // Get configured price IDs
    const configuredMonthly = process.env.STRIPE_PRICE_EDU_MONTHLY_199;
    const configuredYearly = process.env.STRIPE_PRICE_EDU_YEARLY_1990;

    // Check if configured prices exist
    const monthlyExists = prices.data.some(p => p.id === configuredMonthly);
    const yearlyExists = prices.data.some(p => p.id === configuredYearly);

    // Format price data for response
    const priceData = prices.data.map(price => ({
      id: price.id,
      active: price.active,
      currency: price.currency,
      unit_amount: price.unit_amount,
      recurring: price.recurring,
      product: typeof price.product === 'string' ? 
        price.product : 
        (price.product && 'name' in price.product ? price.product.name : 'deleted'),
      type: price.type
    }));

    return NextResponse.json({
      success: true,
      totalPrices: prices.data.length,
      configuredPrices: {
        monthly: {
          id: configuredMonthly,
          exists: monthlyExists
        },
        yearly: {
          id: configuredYearly,
          exists: yearlyExists
        }
      },
      allPrices: priceData,
      hint: (!monthlyExists || !yearlyExists) ? 
        'One or more configured price IDs do not exist in your Stripe account' : 
        'All configured prices found'
    });
  } catch (error: any) {
    console.error('List prices error:', error);
    return NextResponse.json({ 
      error: error.message,
      type: error.type,
      code: error.code,
      hint: error.type === 'StripeAuthenticationError' ? 
        'Invalid API key' : 
        'Check network or permissions'
    }, { status: 500 });
  }
}