import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received Stripe webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id);
  
  const { metadata } = session;
  if (!metadata) return;

  const { tier, service } = metadata;
  
  if (service === 'ai-blueprint') {
    // For AI Blueprint services, we can trigger autonomous implementation start
    console.log(`Starting autonomous implementation for tier: ${tier}`);
    
    // Store customer info for later access
    if (session.customer_email) {
      await storeCustomerAccess({
        email: session.customer_email,
        tier: tier,
        sessionId: session.id,
        subscriptionId: session.subscription as string,
        status: 'active'
      });
    }

    // If it's a subscription tier, the autonomous implementation will be handled by subscription events
    if (tier === 'ai-blueprint-essentials' || tier === 'ai-blueprint-professional') {
      console.log('Monthly subscription tier - implementation will start via subscription.created');
    } else {
      // For one-time payments, immediately trigger autonomous implementation
      await triggerAutonomousImplementation(tier, session.customer_email);
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription created:', subscription.id);
  
  const { metadata } = subscription;
  if (!metadata) return;

  const { tier } = metadata;
  
  if (tier === 'ai-blueprint-essentials' || tier === 'ai-blueprint-professional') {
    // Get customer email
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const customerEmail = (customer as Stripe.Customer).email;
    
    if (customerEmail) {
      await storeCustomerAccess({
        email: customerEmail,
        tier: tier,
        subscriptionId: subscription.id,
        status: 'active'
      });
      
      // Trigger autonomous implementation
      await triggerAutonomousImplementation(tier, customerEmail);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  // Update customer access based on subscription status
  await updateCustomerAccess(subscription.id, {
    status: subscription.status === 'active' ? 'active' : 'inactive'
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log('Processing subscription canceled:', subscription.id);
  
  // Deactivate customer access
  await updateCustomerAccess(subscription.id, {
    status: 'canceled'
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing payment succeeded:', invoice.id);
  
  if (invoice.subscription) {
    // Ensure subscription remains active
    await updateCustomerAccess(invoice.subscription as string, {
      status: 'active',
      lastPaymentDate: new Date().toISOString()
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing payment failed:', invoice.id);
  
  if (invoice.subscription) {
    // Mark as payment issue but don't immediately deactivate
    await updateCustomerAccess(invoice.subscription as string, {
      status: 'payment_failed',
      lastPaymentAttempt: new Date().toISOString()
    });
  }
}

// Helper functions for customer access management
async function storeCustomerAccess(data: {
  email: string;
  tier: string;
  sessionId?: string;
  subscriptionId?: string;
  status: string;
}) {
  try {
    // Store in your database (Supabase, etc.)
    console.log('Storing customer access:', data);
    
    // For now, we'll use localStorage simulation in the webhook logs
    // In a real implementation, this would be stored in Supabase
    
  } catch (error) {
    console.error('Failed to store customer access:', error);
  }
}

async function updateCustomerAccess(subscriptionId: string, updates: Record<string, any>) {
  try {
    console.log('Updating customer access for subscription:', subscriptionId, updates);
    
    // Update in your database
    
  } catch (error) {
    console.error('Failed to update customer access:', error);
  }
}

async function triggerAutonomousImplementation(tier: string, customerEmail: string | null) {
  try {
    console.log(`Triggering autonomous implementation for tier: ${tier}, email: ${customerEmail}`);
    
    // Determine implementation type based on tier
    let implementationType = 'k12'; // Default
    
    if (tier.includes('higher') || tier.includes('university') || tier.includes('college')) {
      implementationType = 'highered';
    }
    
    // Call the autonomous implementation API
    const implementationEndpoint = implementationType === 'k12' 
      ? '/api/k12-implementation'
      : '/api/highered-implementation';
    
    // In a real implementation, you would make an internal API call here
    // For now, we'll just log the action
    console.log(`Would trigger ${implementationType} autonomous implementation via ${implementationEndpoint}`);
    
    // Send welcome email with access instructions
    if (customerEmail) {
      await sendWelcomeEmail(customerEmail, tier, implementationType);
    }
    
  } catch (error) {
    console.error('Failed to trigger autonomous implementation:', error);
  }
}

async function sendWelcomeEmail(email: string, tier: string, implementationType: string) {
  try {
    console.log(`Sending welcome email to: ${email} for ${tier} (${implementationType})`);
    
    // Email content would include:
    // - Welcome message
    // - Link to autonomous implementation dashboard
    // - Login credentials or access instructions
    // - Next steps
    
    const implementationUrl = implementationType === 'k12'
      ? 'https://ai-readiness-app.vercel.app/k12-implementation'
      : 'https://ai-readiness-app.vercel.app/highered-implementation';
    
    console.log(`Implementation URL: ${implementationUrl}`);
    
    // Use SendGrid or your email service
    // await sendEmail({
    //   to: email,
    //   subject: `Welcome to AI Blueprint ${tier}`,
    //   html: `Your autonomous implementation is ready at: ${implementationUrl}`
    // });
    
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}
