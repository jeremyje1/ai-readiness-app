// Quick test script to trigger a test checkout and observe webhook
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testCheckout() {
  console.log('Creating test checkout session...');
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_MONTHLY,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://ai-readiness-bta3opkci-jeremys-projects-73929cad.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ai-readiness-bta3opkci-jeremys-projects-73929cad.vercel.app/',
      customer_email: 'test@example.com',
      subscription_data: {
        trial_period_days: 7
      },
      metadata: {
        service: 'ai-readiness-complete',
        billing_period: 'monthly',
        trial_days: '7',
        return_to: 'highered'
      }
    });
    
    console.log('Test session created:', session.id);
    console.log('Test session URL:', session.url);
    console.log('Metadata:', session.metadata);
    
    // Now simulate checkout completion
    console.log('\nSimulating checkout completion...');
    
    // Retrieve the session to see what the webhook would receive
    const retrievedSession = await stripe.checkout.sessions.retrieve(session.id);
    console.log('Retrieved session for webhook simulation:');
    console.log('- ID:', retrievedSession.id);
    console.log('- Customer email:', retrievedSession.customer_email);
    console.log('- Customer details:', retrievedSession.customer_details);
    console.log('- Mode:', retrievedSession.mode);
    console.log('- Metadata:', retrievedSession.metadata);
    
  } catch (error) {
    console.error('Error creating test session:', error);
  }
}

testCheckout();
