import { buildSiteUrl, getStripeServerClient } from '@/lib/stripe/server';
import { NextRequest, NextResponse } from 'next/server';

function getConsultationPriceId(): string {
    const priceId = process.env.STRIPE_PRICE_JEREMY_CONSULTATION;
    if (!priceId) {
        throw new Error('STRIPE_PRICE_JEREMY_CONSULTATION is not set. Please configure the Stripe price ID.');
    }
    return priceId.trim();
}

function resolveSuccessUrl() {
    return `${buildSiteUrl('/expert-sessions/consultation/success')}?session_id={CHECKOUT_SESSION_ID}`;
}

function resolveCancelUrl() {
    return buildSiteUrl('/expert-sessions/schedule?checkout=cancelled');
}

async function createCheckoutSession(email?: string) {
    const stripe = getStripeServerClient();

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
            {
                price: getConsultationPriceId(),
                quantity: 1
            }
        ],
        success_url: resolveSuccessUrl(),
        cancel_url: resolveCancelUrl(),
        allow_promotion_codes: false,
        customer_email: email,
        metadata: {
            product: 'jeremy-consultation',
            service: 'expert-session',
            scheduling: 'calendly'
        }
    });
    return session;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const contactEmail = typeof body?.email === 'string' ? body.email.trim() : undefined;

        const session = await createCheckoutSession(contactEmail);

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Consultation checkout error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to initiate consultation checkout', details: message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    // Alias to POST for convenience; avoids accidental caching on GET
    return POST(request);
}
