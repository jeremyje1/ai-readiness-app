import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const sig = headersList.get('stripe-signature')

    if (!sig || !endpointSecret) {
      console.error('Missing signature or endpoint secret')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      const error = err as Error
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Processing webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  
  // Track analytics
  await trackAnalytics('checkout_completed', {
    session_id: session.id,
    customer_id: session.customer,
    amount_total: session.amount_total,
    currency: session.currency,
    service_type: session.metadata?.service_type || 'main_service',
    billing_period: session.metadata?.billing_period
  })

  // Handle consultation service purchases
  if (session.metadata?.service_type === 'consultation') {
    await handleConsultationPurchase(session)
  }

  // Send welcome email for main service
  if (session.metadata?.service === 'ai-readiness-complete') {
    await sendWelcomeEmail(session)
  }
}

async function handleConsultationPurchase(session: Stripe.Checkout.Session) {
  try {
    const serviceName = session.metadata?.consultation_service
    const customerEmail = session.metadata?.customer_email
    const customerName = session.metadata?.customer_name

    if (customerEmail && serviceName) {
      // Send consultation confirmation email
      await fetch(`${process.env.NEXTAUTH_URL}/api/send-consultation-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerEmail,
          name: customerName,
          serviceName: serviceName,
          serviceType: serviceName.toLowerCase().replace(/\s+/g, '_')
        })
      })

      console.log('Consultation confirmation email sent:', customerEmail)
    }
  } catch (error) {
    console.error('Error handling consultation purchase:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  await trackAnalytics('subscription_created', {
    subscription_id: subscription.id,
    customer_id: subscription.customer,
    status: subscription.status,
    trial_end: subscription.trial_end
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  await trackAnalytics('subscription_updated', {
    subscription_id: subscription.id,
    customer_id: subscription.customer,
    status: subscription.status,
    trial_end: subscription.trial_end
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  await trackAnalytics('subscription_cancelled', {
    subscription_id: subscription.id,
    customer_id: subscription.customer,
    status: subscription.status,
    ended_at: subscription.ended_at
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id)
  
  await trackAnalytics('payment_succeeded', {
    invoice_id: invoice.id,
    customer_id: invoice.customer,
    amount_paid: invoice.amount_paid,
    currency: invoice.currency
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id)
  
  await trackAnalytics('payment_failed', {
    invoice_id: invoice.id,
    customer_id: invoice.customer,
    amount_due: invoice.amount_due,
    currency: invoice.currency
  })
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Trial will end:', subscription.id)
  
  await trackAnalytics('trial_will_end', {
    subscription_id: subscription.id,
    customer_id: subscription.customer,
    trial_end: subscription.trial_end
  })
}

async function sendWelcomeEmail(session: Stripe.Checkout.Session) {
  try {
    if (session.customer_email) {
      await fetch(`${process.env.NEXTAUTH_URL}/api/send-welcome-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.customer_email,
          billingPeriod: session.metadata?.billing_period || 'monthly'
        })
      })
      console.log('Welcome email sent:', session.customer_email)
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

async function trackAnalytics(event: string, properties: Record<string, any>) {
  try {
    await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties })
    })
  } catch (error) {
    console.error('Analytics tracking failed:', error)
  }
}
