import { emailService } from '@/lib/email-service';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2025-06-30.basil' });

// Check if supabaseAdmin is available
if (!supabaseAdmin) {
  console.error('CRITICAL: Supabase admin client not available - webhook will not function properly');
}

// Define tier mapping based on Stripe price IDs (current canonical production)
// NOTE: Keep legacy IDs for backward compatibility; add new production IDs from pricing reference.
const tierMapping: Record<string, string> = {
  // AI Blueprint EDU pricing - these will be set via environment variables
  [process.env.STRIPE_PRICE_EDU_MONTHLY_199 || '']: 'ai-blueprint-edu',
  [process.env.STRIPE_PRICE_EDU_YEARLY_1990 || '']: 'ai-blueprint-edu',
  // Production $199/month platform access (7-day trial)
  'price_1SDnhlRMpSG47vNmDQr1WeJ3': 'platform-monthly', // $199/month LIVE with 7-day trial
  // Test price
  'price_1SDnMYK8PKpLCKDZEa0MRCBf': 'platform-monthly', // $199/month TEST with 7-day trial
  // Legacy pricing (kept for backward compatibility)
  'price_1RxbFkRMpSG47vNmLp4LCRHZ': 'team-monthly', // $995/month (correct)
  'price_1RxbFkRMpSG47vNmLp4CRHZ': 'team-monthly',  // legacy/typo variant retained for safety
  'price_1RxbGlRMpSG47vNmWEOu1otZ': 'team-yearly',  // $10,000/year
};

interface UserData {
  email: string; // login email we should associate with the account
  billingEmail: string; // email supplied to Stripe during checkout
  name: string;
  organization?: string;
  tier: string;
  stripeCustomerId: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  userIdFromMetadata?: string | null;
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

async function createOrFindUserAndGrantAccess(userData: UserData): Promise<string> {
  if (!supabaseAdmin) throw new Error('Supabase admin client not available - check environment variables');

  const normalizedLoginEmail = userData.email?.toLowerCase() || '';
  const normalizedBillingEmail = userData.billingEmail?.toLowerCase() || normalizedLoginEmail;
  let resolvedUser: any | null = null;

  if (userData.userIdFromMetadata) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userData.userIdFromMetadata);
      if (error) {
        console.warn('Unable to fetch user by metadata user_id:', error.message);
      } else if (data?.user) {
        resolvedUser = data.user;
        console.log(`ℹ️  Resolved user by metadata user_id ${userData.userIdFromMetadata}`);
      }
    } catch (error) {
      console.warn('Error fetching user by metadata user_id:', error);
    }
  }

  let listedUsers: any[] = [];
  if (!resolvedUser) {
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error('Failed to list users while resolving Stripe checkout:', listErr.message);
    } else {
      listedUsers = list?.users ?? [];
    }

    if (!resolvedUser && normalizedLoginEmail) {
      resolvedUser = listedUsers.find((u: any) => u.email?.toLowerCase() === normalizedLoginEmail) || null;
    }

    if (!resolvedUser && normalizedBillingEmail) {
      resolvedUser = listedUsers.find((u: any) => u.email?.toLowerCase() === normalizedBillingEmail) || null;
    }
  }

  if (!resolvedUser) {
    const emailToUse = normalizedLoginEmail || normalizedBillingEmail;
    if (!emailToUse) {
      throw new Error('Unable to resolve login email for Stripe checkout completion');
    }

    console.warn(`⚠️  No existing user found for ${emailToUse}, creating new user`);
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        organization: userData.organization,
        tier: userData.tier,
        stripe_customer_id: userData.stripeCustomerId,
        stripe_session_id: userData.stripeSessionId,
        stripe_subscription_id: userData.stripeSubscriptionId,
        subscription_status: userData.subscriptionStatus,
        payment_verified: true,
        access_granted_at: new Date().toISOString(),
        billing_email: normalizedBillingEmail,
        created_via: 'stripe_webhook'
      }
    });

    if (createErr) {
      console.error('Failed to create user:', createErr);
      throw createErr;
    } else if (created?.user?.id) {
      resolvedUser = created.user;
      console.log(`✅ User account created: ${resolvedUser.id}`);
    }
  }

  if (!resolvedUser) {
    throw new Error('User ID unresolved');
  }

  const userId = resolvedUser.id as string;

  // 2. Upsert payment record idempotently (by stripe_session_id)
  const { data: existingPayment, error: findPaymentErr } = await supabaseAdmin
    .from('user_payments')
    .select('id')
    .eq('stripe_session_id', userData.stripeSessionId)
    .limit(1);
  if (findPaymentErr) {
    console.warn('Payment lookup failed (non-fatal):', findPaymentErr.message);
  }

  const paymentPayload = {
    user_id: userId,
    email: normalizedLoginEmail || normalizedBillingEmail,
    name: userData.name,
    organization: userData.organization,
    tier: userData.tier,
    stripe_customer_id: userData.stripeCustomerId,
    stripe_subscription_id: userData.stripeSubscriptionId,
    stripe_session_id: userData.stripeSessionId,
    payment_amount: getTierPrice(userData.tier),
    payment_status: userData.subscriptionStatus || 'active',
    access_granted: true,
    updated_at: new Date().toISOString()
  } as const;

  if (!existingPayment || existingPayment.length === 0) {
    const { error: insertErr } = await supabaseAdmin
      .from('user_payments')
      .insert({
        ...paymentPayload,
        created_at: new Date().toISOString()
      });
    if (insertErr) {
      console.error('Failed to insert payment row:', insertErr);
    } else {
      console.log(`💾 Payment row inserted for user ${userId}`);
    }
  } else {
    const targetId = existingPayment[0].id;
    const { error: updatePaymentErr } = await supabaseAdmin
      .from('user_payments')
      .update(paymentPayload)
      .eq('id', targetId);
    if (updatePaymentErr) {
      console.error('Failed to update payment row:', updatePaymentErr);
    } else {
      console.log(`🔄 Payment row updated for session ${userData.stripeSessionId}`);
    }
  }

  // Update the existing user's metadata with payment info
  const mergedMetadata = {
    ...resolvedUser.user_metadata,
    tier: userData.tier,
    stripe_customer_id: userData.stripeCustomerId,
    stripe_session_id: userData.stripeSessionId,
    stripe_subscription_id: userData.stripeSubscriptionId,
    payment_verified: true,
    access_granted_at: new Date().toISOString(),
    subscription_status: userData.subscriptionStatus,
    trial_ends_at: userData.trialEndsAt,
    billing_email: normalizedBillingEmail,
    login_email: normalizedLoginEmail || (typeof resolvedUser.email === 'string' ? resolvedUser.email.toLowerCase() : undefined)
  };

  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: mergedMetadata
  });

  if (updateErr) {
    console.error('Failed to update user metadata:', updateErr);
  } else {
    console.log(`✅ Updated user ${userId} with payment info`);
  }

  // 3. Update user_profiles with subscription status
  const { error: profileErr } = await supabaseAdmin
    .from('user_profiles')
    .upsert({
      user_id: userId,
      email: normalizedLoginEmail || normalizedBillingEmail,
      institution_name: userData.organization,
      subscription_status: userData.subscriptionStatus || 'active',
      subscription_tier: userData.tier,
      stripe_customer_id: userData.stripeCustomerId,
      trial_ends_at: userData.trialEndsAt,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (profileErr) {
    console.error('Failed to update user_profiles:', profileErr);
  } else {
    console.log(`✅ User profile updated with active subscription for ${userId}`);
  }

  return userId;
}

function getTierPrice(tier: string): number {
  const prices: Record<string, number> = {
    'platform-monthly': 199, // New $199/month tier
    'team-monthly': 995, // Legacy
    'team-yearly': 10000,
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
      dashboardUrl: `${baseUrl}/dashboard/personalized`,
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
      let tier = priceId ? tierMapping[priceId] : undefined;

      if (!tier) {
        // Attempt fallback to metadata.tier if provided
        const metaTier = session.metadata?.tier;
        if (metaTier && getTierPrice(metaTier) > 0) {
          tier = metaTier;
          console.warn('⚠️  Price ID not in mapping; using metadata.tier fallback:', priceId, '→', metaTier);
        } else {
          console.error('❌ Unknown price ID and no valid metadata.tier fallback:', priceId, metaTier);
          return; // still bail to avoid creating incorrect account
        }
      }

      let subscriptionStatus: string | undefined;
      let trialEndsAt: string | null = null;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : undefined;

      if (subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          subscriptionStatus = subscription.status;
          if (subscription.trial_end) {
            trialEndsAt = new Date(subscription.trial_end * 1000).toISOString();
          }
        } catch (error) {
          console.warn('Unable to retrieve subscription details for status sync:', error);
        }
      }

      const metadataLoginEmail = session.metadata?.login_email ? String(session.metadata.login_email).toLowerCase() : '';
      const billingEmail = String(session.customer_details.email || '').toLowerCase();
      const resolvedLoginEmail = metadataLoginEmail || billingEmail;
      const metadataUserId = session.metadata?.user_id ? String(session.metadata.user_id) : undefined;

      const userData: UserData = {
        email: resolvedLoginEmail,
        billingEmail,
        name: session.customer_details.name || 'Customer',
        organization: session.metadata?.organization,
        tier,
        stripeCustomerId: session.customer as string,
        stripeSessionId: session.id,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus,
        trialEndsAt,
        userIdFromMetadata: metadataUserId
      };

      // Create user account and grant access
      const userId = await createOrFindUserAndGrantAccess(userData);

      // Send access email
      const baseUrl = process.env.NEXTAUTH_URL || 'https://aiblueprint.educationaiblueprint.com';
      await sendAssessmentAccessEmail(userData.email, userData.name, tier, baseUrl);

      // Send admin notification about new customer
      try {
        await emailService.sendNewCustomerNotification({
          customerEmail: userData.billingEmail || userData.email,
          customerName: userData.name,
          tier: tier,
          organization: userData.organization,
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string,
          dashboardUrl: `${baseUrl}/admin/dashboard`
        });
        console.log(`📧 Admin notification sent for new customer: ${userData.email}`);
      } catch (error) {
        console.error('❌ Failed to send admin notification (customer email still sent):', error);
      }

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
