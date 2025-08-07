// Load environment variables first
require('dotenv').config({ path: '.env.local' });

// Check for Stripe key first
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  console.log('Please add your Stripe secret key to .env.local file');
  console.log('You can get this from your Stripe dashboard at https://dashboard.stripe.com/apikeys');
  process.exit(1);
}

console.log('🔑 Using Stripe key:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createUnifiedPricingStructure() {
  try {
    console.log('🚀 Creating unified AI service package with new pricing...');

    // Create the unified AI service product
    const aiServiceProduct = await stripe.products.create({
      name: 'AI Readiness Complete',
      description: 'Complete AI transformation service including assessments, analysis, implementation guidance, and ongoing support. Everything you need for successful AI adoption.',
      metadata: {
        tier: 'ai-readiness-complete',
        service_type: 'complete_ai_transformation',
        includes: 'assessments, analysis, coaching, support, algorithms, reports',
        billing_model: 'subscription_with_trial'
      }
    });

    // Create monthly subscription price ($99.99/month)
    const monthlyPrice = await stripe.prices.create({
      product: aiServiceProduct.id,
      unit_amount: 9999, // $99.99
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        tier: 'ai-readiness-complete',
        billing_interval: 'monthly',
        trial_period_days: '7'
      }
    });

    // Create yearly subscription price ($999.99/year - $200 discount)
    const yearlyPrice = await stripe.prices.create({
      product: aiServiceProduct.id,
      unit_amount: 99999, // $999.99
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        tier: 'ai-readiness-complete',
        billing_interval: 'annual',
        trial_period_days: '7',
        discount: '$200 savings compared to monthly'
      }
    });

    // Create launch coupon (optional)
    const launchCoupon = await stripe.coupons.create({
      id: 'NEWPRICING2025',
      percent_off: 25,
      duration: 'once',
      max_redemptions: 500,
      metadata: {
        campaign: 'New Pricing Launch 2025',
        description: '25% off first payment for new pricing structure'
      }
    });

    console.log('✅ Successfully created unified pricing structure:');
    
    console.log('\n🏢 AI Readiness Complete Service:');
    console.log(`   Product ID: ${aiServiceProduct.id}`);
    console.log(`   Monthly Price ID: ${monthlyPrice.id}`);
    console.log(`   Monthly Amount: $${monthlyPrice.unit_amount / 100}/month`);
    console.log(`   Yearly Price ID: ${yearlyPrice.id}`);
    console.log(`   Yearly Amount: $${yearlyPrice.unit_amount / 100}/year`);

    console.log('\n🎫 Launch Coupon Created:');
    console.log(`   Coupon ID: ${launchCoupon.id}`);
    console.log(`   Discount: ${launchCoupon.percent_off}% off first payment`);
    console.log(`   Max Redemptions: ${launchCoupon.max_redemptions}`);

    console.log('\n📝 Add these to your environment variables:');
    console.log(`STRIPE_PRODUCT_AI_READINESS_COMPLETE=${aiServiceProduct.id}`);
    console.log(`STRIPE_PRICE_AI_READINESS_COMPLETE_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_AI_READINESS_COMPLETE_YEARLY=${yearlyPrice.id}`);
    console.log(`STRIPE_COUPON_NEWPRICING2025=${launchCoupon.id}`);

    console.log('\n🔗 Checkout URLs:');
    console.log(`Monthly: https://your-domain.com/api/stripe/create-checkout?price_id=${monthlyPrice.id}&trial_days=7`);
    console.log(`Yearly: https://your-domain.com/api/stripe/create-checkout?price_id=${yearlyPrice.id}&trial_days=7`);

  } catch (error) {
    console.error('❌ Error creating unified pricing structure:', error.message);
    
    if (error.code === 'resource_already_exists') {
      console.log('💡 Some products may already exist. Check your Stripe dashboard.');
    }
  }
}

createUnifiedPricingStructure();
