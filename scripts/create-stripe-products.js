/**
 * Stripe Products Configuration Script for AI Blueprint
 * Creates all products and prices for the hybrid payment model
 * 
 * Usage: node scripts/create-stripe-products.js
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const AI_BLUEPRINT_PRODUCTS = [
  // K12 Products
  {
    name: 'K12 AI Blueprint Pulse Check',
    description: 'Quick AI readiness assessment designed specifically for K12 schools and districts',
    metadata: {
      target_audience: 'K12',
      product_type: 'assessment',
      payment_model: 'one_time',
      tier: 'k12_pulse_check',
      question_count: '45',
      report_pages: '15'
    },
    prices: [
      {
        nickname: 'K12 AI Blueprint Pulse Check',
        unit_amount: 19900, // $199
        currency: 'usd',
        metadata: {
          features: '45 questions, 15-page report, K12-specific recommendations, 30-day support',
          billing_type: 'one_time'
        }
      }
    ]
  },
  
  // Higher Ed Products  
  {
    name: 'Higher Ed AI Blueprint Pulse Check',
    description: 'Comprehensive AI readiness assessment for higher education institutions',
    metadata: {
      target_audience: 'HigherEd',
      product_type: 'assessment',
      payment_model: 'one_time',
      tier: 'higher_ed_pulse_check',
      question_count: '50',
      report_pages: '20'
    },
    prices: [
      {
        nickname: 'Higher Ed AI Blueprint Pulse Check',
        unit_amount: 29900, // $299
        currency: 'usd',
        metadata: {
          features: '50 questions, 20-page report, Higher ed benchmarking, 60-day support',
          billing_type: 'one_time'
        }
      }
    ]
  },

  // Comprehensive Assessment
  {
    name: 'AI Blueprint Comprehensive',
    description: 'Deep-dive AI readiness evaluation with strategic roadmap and implementation guidance',
    metadata: {
      target_audience: 'Both',
      product_type: 'assessment',
      payment_model: 'one_time',
      tier: 'ai_blueprint_comprehensive',
      question_count: '105',
      report_pages: '35'
    },
    prices: [
      {
        nickname: 'AI Blueprint Comprehensive Assessment',
        unit_amount: 99900, // $999
        currency: 'usd',
        metadata: {
          features: '105 questions, 35-page report, ROI projections, 90-day support, Implementation roadmap',
          billing_type: 'one_time'
        }
      }
    ]
  },

  // Transformation Blueprint
  {
    name: 'AI Transformation Blueprint',
    description: 'Complete AI transformation strategy with hands-on implementation support',
    metadata: {
      target_audience: 'Both',
      product_type: 'transformation',
      payment_model: 'one_time',
      tier: 'ai_transformation_blueprint',
      question_count: '125',
      report_pages: '50'
    },
    prices: [
      {
        nickname: 'AI Transformation Blueprint',
        unit_amount: 249900, // $2,499
        currency: 'usd',
        metadata: {
          features: 'Custom implementation plan, 6-month coaching, Faculty workshops, Change management',
          billing_type: 'one_time'
        }
      }
    ]
  },

  // Subscription Products
  {
    name: 'AI Blueprint Membership',
    description: 'Ongoing AI transformation support with quarterly assessments and continuous coaching',
    metadata: {
      target_audience: 'Both',
      product_type: 'subscription',
      payment_model: 'recurring',
      tier: 'ai_blueprint_membership'
    },
    prices: [
      {
        nickname: 'AI Blueprint Membership - Monthly',
        unit_amount: 19900, // $199/month
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          features: 'Monthly assessments, Quarterly reviews, Policy templates, Implementation coaching, Slack access',
          billing_interval: 'monthly',
          trial_days: '14'
        }
      },
      {
        nickname: 'AI Blueprint Membership - Annual',
        unit_amount: 199000, // $1,990/year (2 months free)
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        metadata: {
          features: 'Monthly assessments, Quarterly reviews, Policy templates, Implementation coaching, Slack access',
          billing_interval: 'annual',
          trial_days: '30',
          discount: '2 months free'
        }
      }
    ]
  },

  {
    name: 'AI Enterprise Partnership',
    description: 'Premium ongoing partnership with dedicated strategist and advanced support',
    metadata: {
      target_audience: 'Both',
      product_type: 'subscription',
      payment_model: 'recurring',
      tier: 'ai_enterprise_partnership'
    },
    prices: [
      {
        nickname: 'AI Enterprise Partnership - Monthly',
        unit_amount: 99900, // $999/month
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          features: 'Dedicated strategist, Unlimited assessments, Custom reporting, Board presentations',
          billing_interval: 'monthly',
          trial_days: '30'
        }
      },
      {
        nickname: 'AI Enterprise Partnership - Annual',
        unit_amount: 999000, // $9,990/year (2 months free)
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        metadata: {
          features: 'Dedicated strategist, Unlimited assessments, Custom reporting, Board presentations',
          billing_interval: 'annual',
          trial_days: '60',
          discount: '2 months free'
        }
      }
    ]
  }
];

async function createStripeProducts() {
  console.log('🚀 Creating AI Blueprint Products in Stripe...\n');
  
  const results = {
    products: [],
    prices: [],
    env_variables: []
  };

  for (const productConfig of AI_BLUEPRINT_PRODUCTS) {
    try {
      console.log(`📦 Creating product: ${productConfig.name}`);
      
      // Create product
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
        metadata: productConfig.metadata
      });

      console.log(`   ✅ Product created: ${product.id}`);
      results.products.push(product);
      
      // Create prices for this product
      for (const priceConfig of productConfig.prices) {
        console.log(`   💰 Creating price: ${priceConfig.nickname}`);
        
        const priceData = {
          product: product.id,
          nickname: priceConfig.nickname,
          unit_amount: priceConfig.unit_amount,
          currency: priceConfig.currency,
          metadata: priceConfig.metadata
        };

        if (priceConfig.recurring) {
          priceData.recurring = priceConfig.recurring;
        }

        const price = await stripe.prices.create(priceData);
        
        results.prices.push(price);
        console.log(`      ✅ Price created: ${price.id} ($${priceConfig.unit_amount / 100}${priceConfig.recurring ? `/${priceConfig.recurring.interval}` : ''})`);
        
        // Generate environment variable mapping
        const envVarName = generateEnvVarName(productConfig.metadata.tier, priceConfig.recurring?.interval);
        results.env_variables.push(`${envVarName}=${price.id}`);
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Error creating product ${productConfig.name}:`, error.message);
    }
  }

  return results;
}

function generateEnvVarName(tier, interval) {
  const tierMap = {
    'k12_pulse_check': 'STRIPE_PRICE_K12_PULSE_CHECK',
    'higher_ed_pulse_check': 'STRIPE_PRICE_HIGHER_ED_PULSE_CHECK',
    'ai_blueprint_comprehensive': 'STRIPE_PRICE_AI_BLUEPRINT_COMPREHENSIVE',
    'ai_transformation_blueprint': 'STRIPE_PRICE_AI_TRANSFORMATION_BLUEPRINT',
    'ai_blueprint_membership': interval === 'month' ? 'STRIPE_PRICE_AI_BLUEPRINT_MEMBERSHIP_MONTHLY' : 'STRIPE_PRICE_AI_BLUEPRINT_MEMBERSHIP_ANNUAL',
    'ai_enterprise_partnership': interval === 'month' ? 'STRIPE_PRICE_ENTERPRISE_PARTNERSHIP_MONTHLY' : 'STRIPE_PRICE_ENTERPRISE_PARTNERSHIP_ANNUAL'
  };
  
  return tierMap[tier] || `STRIPE_PRICE_${tier.toUpperCase()}`;
}

async function createWebhookEndpoint() {
  console.log('🔗 Creating webhook endpoint...');
  
  try {
    const endpoint = await stripe.webhookEndpoints.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-blueprint.vercel.app'}/api/stripe/webhooks`,
      enabled_events: [
        'checkout.session.completed',
        'checkout.session.expired',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed'
      ],
      description: 'AI Blueprint Webhook Endpoint'
    });

    console.log(`✅ Webhook endpoint created: ${endpoint.id}`);
    console.log(`🔑 Webhook secret: ${endpoint.secret}`);
    
    return endpoint;
  } catch (error) {
    console.error('❌ Failed to create webhook endpoint:', error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('🎯 AI Blueprint Stripe Configuration\n');
    console.log(`Using Stripe Account: ${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...`);
    console.log('');

    // Test Stripe connection
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.display_name || account.id}`);
    console.log('');

    // Create products and prices
    const results = await createStripeProducts();
    
    // Create webhook endpoint
    const webhook = await createWebhookEndpoint();
    
    console.log('\n🎉 AI Blueprint Stripe setup complete!');
    console.log('\n📋 Environment Variables to add to your .env.local:');
    console.log('');
    console.log('# AI Blueprint Stripe Price IDs');
    results.env_variables.forEach(envVar => {
      console.log(envVar);
    });
    
    if (webhook) {
      console.log('\n# Webhook Configuration');
      console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    }
    
    console.log('\n📊 Summary:');
    console.log(`Created ${results.products.length} products`);
    console.log(`Created ${results.prices.length} prices`);
    console.log(`Generated ${results.env_variables.length} environment variables`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Copy the environment variables above to your .env.local file');
    console.log('2. Update your Vercel environment variables');
    console.log('3. Test the checkout flows');
    console.log('4. Deploy to production');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
