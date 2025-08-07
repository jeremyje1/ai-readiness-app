import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { AI_SERVICE_COMPLETE } from '@/lib/unified-pricing-config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { serviceType, userEmail, customerName } = await request.json()

    if (!serviceType || !userEmail) {
      return NextResponse.json({ error: 'Service type and email are required' }, { status: 400 })
    }

    // Find the consultation service
    const consultationService = AI_SERVICE_COMPLETE.consultationServices.services.find(
      service => service.name.toLowerCase().replace(/\s+/g, '_') === serviceType.toLowerCase()
    )

    if (!consultationService) {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
    }

    const isSubscription = consultationService.type === 'subscription'
    
    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: consultationService.priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}&service=${serviceType}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?cancelled=true`,
      customer_email: userEmail,
      metadata: {
        service_type: 'consultation',
        consultation_service: serviceType,
        customer_email: userEmail,
        customer_name: customerName || ''
      },
      // For subscriptions, allow promotional codes
      ...(isSubscription && { allow_promotion_codes: true }),
      // Custom fields for consultation services
      custom_fields: [
        {
          key: 'preferred_meeting_time',
          label: { type: 'custom', custom: 'Preferred Meeting Time' },
          type: 'text',
          optional: true,
        },
        {
          key: 'consultation_focus',
          label: { type: 'custom', custom: 'Main Focus Areas' },
          type: 'text',
          optional: true,
        }
      ]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Track consultation checkout in analytics
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'consultation_checkout_initiated',
          properties: {
            service_type: serviceType,
            service_name: consultationService.name,
            price: consultationService.price,
            customer_email: userEmail,
            subscription_type: consultationService.type
          }
        })
      })
    } catch (analyticsError) {
      console.error('Analytics tracking failed:', analyticsError)
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Consultation checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
