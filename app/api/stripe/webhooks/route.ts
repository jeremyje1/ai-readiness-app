import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createPlaceholderHigherEdInstitution, createPlaceholderK12School } from '@/lib/implementation-bootstrap'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
const appBaseUrl = (process.env.NEXTAUTH_URL || 'https://aireadiness.northpathstrategies.org').replace(/\/$/, '')

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
  // Prefer collected email from customer_details when customer_email was not provided
  const details = (session as any).customer_details
  let customerEmail: string | undefined | null = session.customer_email || details?.email || undefined

  if (!customerEmail && typeof session.customer === 'string') {
    try {
      const customer = await stripe.customers.retrieve(session.customer)
      if (!('deleted' in customer)) customerEmail = customer.email || undefined
    } catch (e) {
      console.warn('Could not retrieve customer email from Stripe:', e)
    }
  }

  console.log('Checkout completed:', session.id)
  console.log('Session metadata:', session.metadata)
  console.log('Customer email (resolved):', customerEmail)
  
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

  // Send welcome email for main service - check multiple metadata fields
  if (session.metadata?.service === 'ai-readiness-complete' || 
      session.mode === 'subscription' || 
      session.metadata?.billing_period) {
    console.log('Triggering welcome email for AI service subscription')
    await sendWelcomeEmail(session, customerEmail || undefined)
  } else {
    console.log('Not triggering welcome email - metadata check failed:', {
      service: session.metadata?.service,
      mode: session.mode,
      billing_period: session.metadata?.billing_period
    })
  }
}

async function handleConsultationPurchase(session: Stripe.Checkout.Session) {
  try {
    const serviceName = session.metadata?.consultation_service
    const customerEmail = session.metadata?.customer_email
    const customerName = session.metadata?.customer_name

    if (customerEmail && serviceName) {
      // Send consultation confirmation email
      await fetch(`${appBaseUrl}/api/send-consultation-email`, {
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

async function sendWelcomeEmail(session: Stripe.Checkout.Session, resolvedEmail?: string) {
  try {
    const email = resolvedEmail
    if (email) {
      // Create user account for the customer
      const { createUserAccount } = await import('@/lib/user-management')
      
      // Create subscription object from session metadata
      const subscription = {
        status: 'trialing',
        plan: session.metadata?.billing_period || 'monthly',
        trial_end: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days from now
      }
      
      const userAccount = createUserAccount(email, subscription)
      console.log('Created user account:', userAccount)
      
      // Map return_to -> implementationType for better CTA routing
      const implementationType = session.metadata?.return_to === 'highered' ? 'highered' : (session.metadata?.return_to === 'k12' ? 'k12' : 'complete')

      // Bootstrap placeholder implementation so deep link works immediately
      let institutionId: string | undefined
      try {
        if (implementationType === 'highered') {
          institutionId = createPlaceholderHigherEdInstitution(email).id
        } else if (implementationType === 'k12') {
          institutionId = createPlaceholderK12School(email).id
        }
      } catch (e) {
        console.warn('Failed to bootstrap placeholder implementation:', e)
      }

      const resp = await fetch(`${appBaseUrl}/api/send-welcome-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          billingPeriod: session.metadata?.billing_period || 'monthly',
          loginPassword: userAccount.password,
          isNewAccount: true,
          implementationType,
          institutionId
        })
      })
      if (!resp.ok) {
        console.error('Welcome email request failed', resp.status, await resp.text())
      } else {
        console.log('Welcome email sent (webhook path):', email, 'institutionId:', institutionId)
      }
    } else {
      console.warn('No customer email found on checkout.session.completed; welcome email not sent.')
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

async function trackAnalytics(event: string, properties: Record<string, any>) {
  try {
    await fetch(`${appBaseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties })
    })
  } catch (error) {
    console.error('Analytics tracking failed:', error)
  }
}
