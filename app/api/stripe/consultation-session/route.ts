import { getStripeServerClient } from '@/lib/stripe/server';
import { NextRequest, NextResponse } from 'next/server';

function parseSessionId(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('session_id') || searchParams.get('sessionId');
    if (!id) {
        throw new Error('Missing session_id parameter');
    }
    return id;
}

export async function GET(request: NextRequest) {
    try {
        const sessionId = parseSessionId(request);
        const stripe = getStripeServerClient();

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent', 'customer']
        });

        if (session.metadata?.product !== 'jeremy-consultation') {
            return NextResponse.json({
                success: false,
                status: 'invalid_product',
                message: 'Checkout session does not match consultation product.'
            }, { status: 400 });
        }

        const paid = session.payment_status === 'paid';

        return NextResponse.json({
            success: paid,
            status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
            customer_email: session.customer_details?.email || session.customer_email,
            customer_name: session.customer_details?.name,
            created: session.created
        }, { status: paid ? 200 : 202 });
    } catch (error) {
        console.error('Consultation session lookup error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, status: 'error', message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return GET(request);
}
