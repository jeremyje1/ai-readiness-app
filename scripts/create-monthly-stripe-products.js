// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createMonthlySubscriptionProducts() {
  try {
    console.log('Creating monthly subscription products for AI Blueprint...');

    // Create AI Blueprint Essentials Monthly
    const essentialsProduct = await stripe.products.create({
      name: 'AI Blueprint Essentials',
      description: 'Monthly subscription for AI readiness assessments, stakeholder feedback integration, and continuous improvement tracking. Perfect for institutions starting their AI transformation journey.',
      metadata: {
        tier: 'ai-blueprint-essentials',
        features: JSON.stringify([
          'Unlimited AI readiness assessments',
          'Real-time stakeholder feedback integration', 
          'Dynamic report generation (8-12 pages)',
          'AIRIX™ core algorithm analysis',
          'Document upload & AI analysis',
          'Progress tracking dashboard',
          'Monthly assessment iterations',
          'Up to 5 users',
          'Email support',
          'Policy template library',
          'Implementation tracking tools'
        ])
      }
    });

    const essentialsPrice = await stripe.prices.create({
      product: essentialsProduct.id,
      unit_amount: 19900, // $199.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        tier: 'ai-blueprint-essentials',
        trial_period_days: '7'
      }
    });

    // Create AI Blueprint Professional Monthly
    const professionalProduct = await stripe.products.create({
      name: 'AI Blueprint Professional',
      description: 'Comprehensive monthly subscription with advanced AI analysis, stakeholder collaboration, and implementation coaching. For institutions ready for deep AI transformation.',
      metadata: {
        tier: 'ai-blueprint-professional',
        features: JSON.stringify([
          'Everything in Essentials',
          'Comprehensive 150-question assessments',
          'Advanced AI-enhanced analysis (25-40 pages)',
          'Full algorithm suite: AIRIX™, AIRS™, AICS™, AIMS™',
          'Stakeholder collaboration workspace',
          'Adaptive recommendations engine',
          'Custom policy generation',
          'Advanced scenario modeling',
          'Up to 15 users',
          'Priority support & monthly office hours',
          'Implementation coaching sessions',
          'ROI tracking & benchmarking'
        ])
      }
    });

    const professionalPrice = await stripe.prices.create({
      product: professionalProduct.id,
      unit_amount: 49900, // $499.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        tier: 'ai-blueprint-professional',
        trial_period_days: '7'
      }
    });

    // Create coupon code for launch offer
    const launchCoupon = await stripe.coupons.create({
      id: 'AIREADY2025',
      percent_off: 50,
      duration: 'once',
      max_redemptions: 1000,
      metadata: {
        campaign: 'AI Blueprint Launch 2025',
        description: '50% off first month for new AI Blueprint subscribers'
      }
    });

    console.log('✅ Successfully created monthly subscription products:');
    console.log('\n🔵 AI Blueprint Essentials:');
    console.log(`   Product ID: ${essentialsProduct.id}`);
    console.log(`   Price ID: ${essentialsPrice.id}`);
    console.log(`   Amount: $${essentialsPrice.unit_amount / 100}/month`);
    
    console.log('\n🟣 AI Blueprint Professional:');
    console.log(`   Product ID: ${professionalProduct.id}`);
    console.log(`   Price ID: ${professionalPrice.id}`);
    console.log(`   Amount: $${professionalPrice.unit_amount / 100}/month`);

    console.log('\n🎫 Launch Coupon Created:');
    console.log(`   Coupon ID: ${launchCoupon.id}`);
    console.log(`   Discount: ${launchCoupon.percent_off}% off first month`);
    console.log(`   Max Redemptions: ${launchCoupon.max_redemptions}`);

    console.log('\n📝 Add these to your .env.local:');
    console.log(`STRIPE_PRICE_AI_BLUEPRINT_ESSENTIALS_MONTHLY=${essentialsPrice.id}`);
    console.log(`STRIPE_PRICE_AI_BLUEPRINT_PROFESSIONAL_MONTHLY=${professionalPrice.id}`);
    console.log(`STRIPE_COUPON_AIREADY2025=${launchCoupon.id}`);

  } catch (error) {
    console.error('❌ Error creating monthly subscription products:', error.message);
    
    if (error.code === 'resource_already_exists') {
      console.log('💡 Some products may already exist. Check your Stripe dashboard.');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

createMonthlySubscriptionProducts();
