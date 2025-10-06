import { NextResponse } from 'next/server';

export async function GET() {
    // Debug endpoint to check Stripe configuration
    const config = {
        stripe_secret_key_exists: !!process.env.STRIPE_SECRET_KEY,
        stripe_secret_key_prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'not set',
        price_monthly_exists: !!process.env.STRIPE_PRICE_EDU_MONTHLY_199,
        price_yearly_exists: !!process.env.STRIPE_PRICE_EDU_YEARLY_1990,
        next_public_site_url: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
        site_url: process.env.SITE_URL || 'not set',
        vercel_url: process.env.VERCEL_URL || 'not set',
        node_env: process.env.NODE_ENV
    };

    return NextResponse.json({ config }, { status: 200 });
}