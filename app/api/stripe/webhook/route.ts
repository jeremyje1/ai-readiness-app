import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { emailService } from '@/lib/email-service';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2025-06-30.basil' });

// Check if supabaseAdmin is available
if (!supabaseAdmin) {
  console.error('CRITICAL: Supabase admin client not available - webhook will not function properly');
}

// Define tier mapping based on Stripe price IDs
const tierMapping: Record<string, string> = {
  'price_1QbQzOBUNyUCMaZKH36B4wlU': 'ai-readiness-comprehensive', // $995
  'price_1QbR0VBUNyUCMaZK7wGCqhXt': 'ai-transformation-blueprint', // $2,499
  'price_1QbR1fBUNyUCMaZKGvfpHgJj': 'enterprise-partnership', // $9,999
  'price_1QbR2vBUNyUCMaZKTwDuNnZz': 'custom-enterprise', // $24,500
};

interface UserData {
  email: string;
  name: string;
  organization?: string;
  tier: string;
  stripeCustomerId: string;
  stripeSessionId: string;
}

async function createPasswordSetupToken(userId: string, email: string) {
  if (!supabaseAdmin) return null;
  const token = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour
  const { error } = await supabaseAdmin.from('auth_password_setup_tokens').insert({
    user_id: userId,
    email,
    token,
    expires_at: expires
  });
  if (error) {
    console.error('Failed to store password setup token', error);
    return null;
  }
  return { token, expires };
}

async function createUserAccount(userData: UserData): Promise<string> {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available - check environment variables');
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        organization: userData.organization,
        tier: userData.tier,
        stripe_customer_id: userData.stripeCustomerId,
        stripe_session_id: userData.stripeSessionId,
        payment_verified: true,
        access_granted_at: new Date().toISOString()
      }
    });

    if (authError) {
      console.error('Failed to create user:', authError);
      throw authError;
    }

    const userId = authData.user.id;

    // Create user record in our database
    const { error: dbError } = await supabaseAdmin
      .from('user_payments')
      .insert({
        user_id: userId,
        email: userData.email,
        name: userData.name,
        organization: userData.organization,
        tier: userData.tier,
        stripe_customer_id: userData.stripeCustomerId,
        stripe_session_id: userData.stripeSessionId,
        payment_amount: getTierPrice(userData.tier),
        payment_status: 'completed',
        access_granted: true,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Failed to create user record:', dbError);
      // Don't throw here, auth user is already created
    }

    console.log(`✅ User account created successfully: ${userId}`);
    return userId;
  } catch (error) {
    console.error('Error creating user account:', error);
    throw error;
  }
}

function getTierPrice(tier: string): number {
  const prices: Record<string, number> = {
    'ai-readiness-comprehensive': 995,
    'ai-transformation-blueprint': 2499,
    'enterprise-partnership': 9999,
    'custom-enterprise': 24500
  };
  return prices[tier] || 0;
}

async function sendAssessmentAccessEmail(email: string, name: string, tier: string, baseUrl: string) {
  try {
    const successUrl = `${baseUrl}/ai-readiness/success?checkout=success`;
    // Create a password setup token
    const { data: userList } = supabaseAdmin ? await supabaseAdmin.auth.admin.listUsers() : { data: { users: [] } as any };
    const user = userList?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    let passwordSetupTokenUrl = `${baseUrl}/auth/password/setup`;
    if (user) {
      const token = await createPasswordSetupToken(user.id, email);
      if (token) passwordSetupTokenUrl = `${baseUrl}/auth/password/setup?token=${token.token}`;
    }
    // Try to generate a magic link using admin API if available
    let magicLinkUrl: string | undefined = successUrl;
    try {
      if (supabaseAdmin && (supabaseAdmin as any).auth?.admin?.generateLink) {
        const { data, error } = await (supabaseAdmin as any).auth.admin.generateLink({ type: 'magiclink', email });
        if (!error && data?.properties?.action_link) {
          magicLinkUrl = data.properties.action_link;
        }
      }
    } catch (e) {
      console.warn('Magic link generation failed, fallback to success page');
    }
    await emailService.sendOnboardingEmail({
      to: email,
      name,
      dashboardUrl: `${baseUrl}/ai-readiness/dashboard`,
      passwordSetupUrl: passwordSetupTokenUrl,
      magicLinkUrl,
  tier,
  loginUrl: `${baseUrl}/auth/login`,
  passwordResetUrl: `${baseUrl}/auth/password/reset`
    });
    console.log(`✅ Onboarding email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send assessment access email:', error);
  }
}

// Event handler implementation with real user provisioning
const handlers: Record<string, (event: Stripe.Event) => Promise<void>> = {
  'checkout.session.completed': async (event) => {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('[webhook] checkout.session.completed', session.id, session.metadata);
    
    if (session.payment_status === 'paid' && session.customer_details?.email) {
      // Get price ID to determine tier
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      const tier = priceId ? tierMapping[priceId] : 'unknown';
      
      if (tier === 'unknown') {
        console.error('❌ Unknown price ID:', priceId);
        return;
      }

      const userData: UserData = {
        email: session.customer_details.email,
        name: session.customer_details.name || 'Customer',
        organization: session.metadata?.organization,
        tier,
        stripeCustomerId: session.customer as string,
        stripeSessionId: session.id
      };

      // Create user account and grant access
      const userId = await createUserAccount(userData);
      
      // Send access email
      const baseUrl = process.env.NEXTAUTH_URL || 'https://aiblueprint.k12aiblueprint.com';
      await sendAssessmentAccessEmail(userData.email, userData.name, tier, baseUrl);
      
      console.log(`🎉 Customer ${userData.email} granted access to ${tier} (User ID: ${userId})`);
    }
  },
  'customer.subscription.created': async (event) => {
    const sub = event.data.object as Stripe.Subscription;
    console.log('[webhook] subscription.created', sub.id, sub.items.data[0]?.price?.id);
    
    // Handle subscription-based access (if applicable)
    const customer = await stripe.customers.retrieve(sub.customer as string);
    if ('email' in customer && customer.email) {
      console.log('🔄 Subscription access granted for:', customer.email);
    }
  },
  'customer.subscription.updated': async (event) => {
    const sub = event.data.object as Stripe.Subscription;
    console.log('[webhook] subscription.updated', sub.id, sub.status);
    // Handle subscription changes (upgrades/downgrades)
  },
  'customer.subscription.deleted': async (event) => {
    const sub = event.data.object as Stripe.Subscription;
    console.log('[webhook] subscription.deleted', sub.id);
    
    // Revoke access for cancelled subscriptions
    const cancelledCustomer = await stripe.customers.retrieve(sub.customer as string);
    if ('email' in cancelledCustomer && cancelledCustomer.email) {
      try {
        if (!supabaseAdmin) {
          console.error('Cannot revoke access - Supabase admin client not available');
          return;
        }
        
        const { error } = await supabaseAdmin
          .from('user_payments')
          .update({ 
            access_granted: false,
            access_revoked_at: new Date().toISOString() 
          })
          .eq('stripe_customer_id', sub.customer);
        
        if (error) {
          console.error('Failed to revoke access:', error);
        } else {
          console.log('🚫 Access revoked for cancelled subscription:', cancelledCustomer.email);
        }
      } catch (error) {
        console.error('Error revoking access:', error);
      }
    }
  },
  'invoice.payment_succeeded': async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    console.log('[webhook] invoice.payment_succeeded', invoice.id);
    // Handle recurring payment success
  },
  'invoice.payment_failed': async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    console.warn('[webhook] invoice.payment_failed', invoice.id);
    // Handle failed payment - could suspend access
  },
  'customer.subscription.trial_will_end': async (event) => {
    const sub = event.data.object as Stripe.Subscription;
    console.log('[webhook] subscription.trial_will_end', sub.id);
    // Send trial ending notification
  }
};

async function handleEvent(event: Stripe.Event) {
  const handler = handlers[event.type];
  if (handler) {
    await handler(event);
  } else {
    if (!event.type.startsWith('charge.')) {
      console.log('[webhook] unhandled event', event.type);
    }
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
  }
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (e) {
    return NextResponse.json({ error: 'Unable to read body' }, { status: 400 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    await handleEvent(event);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook signature verification failed', err.message);
    return NextResponse.json({ error: 'Invalid signature', details: err.message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ service: 'stripe-webhook', ok: true });
}
