import { AI_BLUEPRINT_EDU_PRODUCT } from '@/lib/ai-blueprint-edu-product';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe only if API key is available
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil'
}) : null;

export async function POST(request: NextRequest) {
    try {
        // Check if Stripe is configured
        if (!stripe) {
            return NextResponse.json(
                { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { billingPeriod = 'monthly' } = body;

        // Get the appropriate price ID based on billing period
        const priceId = billingPeriod === 'yearly'
            ? process.env.STRIPE_PRICE_EDU_YEARLY_1990
            : process.env.STRIPE_PRICE_EDU_MONTHLY_199;

        if (!priceId) {
            return NextResponse.json(
                { error: `Stripe price ID not configured for ${billingPeriod} billing` },
                { status: 500 }
            );
        }

        // Create Stripe checkout session
        const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://aiblueprint.educationaiblueprint.com';
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${baseUrl}/auth/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/pricing?status=cancelled`,
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            customer_email: body.email || undefined,
            metadata: {
                product_id: AI_BLUEPRINT_EDU_PRODUCT.id,
                billing_period: billingPeriod,
                tier: 'ai-blueprint-edu' // For webhook processing
            },
            subscription_data: {
                trial_period_days: 7, // 7-day trial
                metadata: {
                    product_id: AI_BLUEPRINT_EDU_PRODUCT.id,
                    billing_period: billingPeriod,
                    tier: 'ai-blueprint-edu'
                }
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    // Support GET method for backward compatibility if needed
    const { searchParams } = new URL(request.url);
    const billingPeriod = searchParams.get('billing') || 'monthly';

    try {
        // Check if Stripe is configured
        if (!stripe) {
            return NextResponse.json(
                { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
                { status: 503 }
            );
        }
        const priceId = billingPeriod === 'yearly'
            ? process.env.STRIPE_PRICE_EDU_YEARLY_1990
            : process.env.STRIPE_PRICE_EDU_MONTHLY_199;

        if (!priceId) {
            return NextResponse.json(
                { error: `Stripe price ID not configured for ${billingPeriod} billing` },
                { status: 500 }
            );
        }

        const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://aiblueprint.educationaiblueprint.com';
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${baseUrl}/auth/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/pricing?status=cancelled`,
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            metadata: {
                product_id: AI_BLUEPRINT_EDU_PRODUCT.id,
                billing_period: billingPeriod,
                tier: 'ai-blueprint-edu'
            },
            subscription_data: {
                trial_period_days: 7,
                metadata: {
                    product_id: AI_BLUEPRINT_EDU_PRODUCT.id,
                    billing_period: billingPeriod,
                    tier: 'ai-blueprint-edu'
                }
            }
        });

        // Redirect directly to Stripe checkout
        return NextResponse.redirect(session.url || '');
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}