#!/usr/bin/env node
import Stripe from 'stripe';

const PRICE_RECOMMENDATION = 34900; // $349.00 USD

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required to create the consultation product.`);
    }
    return value.trim();
}

async function main() {
    const secretKey = requireEnv('STRIPE_SECRET_KEY');
    const stripe = new Stripe(secretKey, { apiVersion: '2025-06-30.basil' });

    console.log('Creating "Jeremy Estrella AI Blueprint Consultation" product...');
    const product = await stripe.products.create({
        name: 'Jeremy Estrella AI Blueprint Consultation',
        description: '45-minute strategic AI planning intensive with Jeremy Estrella, founder of AI Blueprint and NorthPath Strategies.',
        metadata: {
            service: 'expert-session',
            focus: 'ai-education',
            duration_minutes: '45'
        }
    });

    console.log('Creating price at $349 USD...');
    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: PRICE_RECOMMENDATION,
        currency: 'usd',
        nickname: 'Founder consultation (one-time)',
        metadata: {
            service: 'expert-session',
            price_source: 'expert-session-upgrade-oct-2025'
        }
    });

    console.log('\n✅ Product created:', product.id);
    console.log('✅ Price created:', price.id);
    console.log('\nAdd the following to your environment configuration:');
    console.log(`STRIPE_PRICE_JEREMY_CONSULTATION=${price.id}`);
}

main().catch((error) => {
    console.error('Failed to create consultation product:', error);
    process.exitCode = 1;
});
