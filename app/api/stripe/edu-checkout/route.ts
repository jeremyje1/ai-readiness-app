import { AI_BLUEPRINT_EDU_PRODUCT } from '@/lib/ai-blueprint-edu-product';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe without API version to avoid compatibility issues
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
    try {
        // Initialize without API version for maximum compatibility
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        console.log('Stripe initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Stripe:', error);
    }
}

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
        
        // Only monthly pricing is available
        const priceId = process.env.STRIPE_PRICE_MONTHLY?.trim();

        if (!priceId) {
            return NextResponse.json(
                { 
                    error: 'Stripe price ID not configured',
                    debug: {
                        monthlyPriceExists: !!process.env.STRIPE_PRICE_MONTHLY
                    }
                },
                { status: 500 }
            );
        }

        console.log('Creating Stripe session with:', {
            priceId,
            priceIdLength: priceId?.length,
            priceIdRaw: JSON.stringify(priceId),
            stripeInitialized: !!stripe
        });

        // Create Stripe checkout session
        const baseUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://aiblueprint.educationaiblueprint.com').trim();
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
                billing_period: 'monthly',
                tier: 'ai-blueprint-edu' // For webhook processing
            },
            subscription_data: {
                trial_period_days: 7, // 7-day trial
                metadata: {
                    product_id: AI_BLUEPRINT_EDU_PRODUCT.id,
                    billing_period: 'monthly',
                    tier: 'ai-blueprint-edu'
                }
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        
        // Provide more detailed error information
        const errorResponse: any = {
            error: error.message || 'Failed to create checkout session',
            type: error.type || 'unknown_error',
            code: error.code || null
        };
        
        // In development, include more details
        if (process.env.NODE_ENV === 'development') {
            errorResponse.stack = error.stack;
            errorResponse.details = error;
        }
        
        // Check for specific Stripe errors
        if (error.type === 'StripeInvalidRequestError') {
            errorResponse.hint = 'Check Stripe configuration and price IDs';
        }
        
        return NextResponse.json(errorResponse, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    // Support GET method for backward compatibility if needed
    try {
        // Check if Stripe is configured
        if (!stripe) {
            return NextResponse.json(
                { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
                { status: 503 }
            );
        }
        // Only monthly pricing is available
        const priceId = process.env.STRIPE_PRICE_MONTHLY?.trim();

        if (!priceId) {
            return NextResponse.json(
                { error: 'Stripe price ID not configured' },
                { status: 500 }
            );
        }

        const baseUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://aiblueprint.educationaiblueprint.com').trim();
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
                billing_period: 'monthly',
                tier: 'ai-blueprint-edu'
            },
            subscription_data: {
                trial_period_days: 7,
                metadata: {
                    product_id: AI_BLUEPRINT_EDU_PRODUCT.id,
                    billing_period: 'monthly',
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