// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createWebhookEndpoint() {
  try {
    console.log('🔗 Creating webhook endpoint for unified pricing...');

    // Create webhook endpoint
    const webhook = await stripe.webhookEndpoints.create({
      url: 'https://aireadiness.northpathstrategies.org/api/stripe/webhooks',
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'customer.subscription.trial_will_end'
      ],
      metadata: {
        purpose: 'unified_pricing_webhooks',
        created_date: new Date().toISOString()
      }
    });

    console.log('✅ Successfully created webhook endpoint:');
    console.log(`   Webhook ID: ${webhook.id}`);
    console.log(`   URL: ${webhook.url}`);
    console.log(`   Secret: ${webhook.secret}`);

    console.log('\n📝 Add this to your environment variables:');
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);

    console.log('\n🎯 Enabled events:');
    webhook.enabled_events.forEach(event => {
      console.log(`   - ${event}`);
    });

  } catch (error) {
    console.error('❌ Error creating webhook endpoint:', error.message);
    
    if (error.code === 'resource_already_exists') {
      console.log('💡 Webhook endpoint may already exist. Check your Stripe dashboard.');
    }
  }
}

// Check for Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

createWebhookEndpoint();
