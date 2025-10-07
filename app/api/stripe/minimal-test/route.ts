import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Test 1: Check if Stripe module can be imported
        let stripeModule;
        try {
            stripeModule = await import('stripe');
            console.log('Stripe module imported successfully');
        } catch (importError: any) {
            return NextResponse.json({
                error: 'Failed to import Stripe module',
                details: importError.message
            }, { status: 500 });
        }

        // Test 2: Check environment variable
        const apiKey = process.env.STRIPE_SECRET_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: 'No STRIPE_SECRET_KEY environment variable'
            }, { status: 500 });
        }

        // Test 3: Try to create Stripe instance
        let stripe;
        try {
            const Stripe = stripeModule.default;
            stripe = new Stripe(apiKey);
            console.log('Stripe instance created');
        } catch (createError: any) {
            return NextResponse.json({
                error: 'Failed to create Stripe instance',
                details: createError.message,
                keyLength: apiKey.length,
                keyPrefix: apiKey.substring(0, 7)
            }, { status: 500 });
        }

        // Test 4: Try a simple API call
        try {
            const prices = await stripe.prices.list({ limit: 1 });
            return NextResponse.json({
                success: true,
                priceCount: prices.data.length,
                hasMore: prices.has_more,
                message: 'Stripe connection successful!'
            });
        } catch (apiError: any) {
            console.error('Stripe API error:', apiError);
            return NextResponse.json({
                error: 'Stripe API call failed',
                message: apiError.message,
                type: apiError.type,
                statusCode: apiError.statusCode,
                keyPrefix: apiKey.substring(0, 7),
                raw: apiError.raw ? {
                    message: apiError.raw.message,
                    type: apiError.raw.type
                } : null
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Minimal test error:', error);
        return NextResponse.json({
            error: 'Unexpected error',
            message: error.message
        }, { status: 500 });
    }
}