#!/usr/bin/env node
/**
 * Stripe Price Verification Script
 *
 * Verifies that required Stripe price IDs (from environment variables) exist and
 * prints their metadata (recurring interval, currency, unit amount, product name).
 *
 * Required env vars (set in your shell or .env.local):
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_EDU_MONTHLY_199
 *   STRIPE_PRICE_EDU_YEARLY_1990
 *   STRIPE_PRICE_JEREMY_CONSULTATION
 *
 * Usage:
 *   node scripts/verify-stripe-prices.mjs
 *
 * (Optionally) pass --all to list all active recurring prices for manual inspection:
 *   node scripts/verify-stripe-prices.mjs --all
 */

import Stripe from 'stripe';

function fatal(msg) {
  console.error(`\n❌ ${msg}`);
  process.exit(1);
}

const requiredEnv = ['STRIPE_SECRET_KEY'];
for (const key of requiredEnv) {
  if (!process.env[key]) fatal(`Missing required env var ${key}`);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-06-30.basil' });

const PRICE_ENV_MAP = {
  EDU_MONTHLY_199: process.env.STRIPE_PRICE_EDU_MONTHLY_199,
  EDU_YEARLY_1990: process.env.STRIPE_PRICE_EDU_YEARLY_1990,
  JEREMY_CONSULTATION: process.env.STRIPE_PRICE_JEREMY_CONSULTATION
};

async function fetchPrice(priceId) {
  try {
    const price = await stripe.prices.retrieve(priceId);
    let productName = 'Unknown Product';
    if (typeof price.product === 'string') {
      try {
        const product = await stripe.products.retrieve(price.product);
        productName = product.name;
      } catch {
        // ignore
      }
    } else if (price.product && price.product.name) {
      productName = price.product.name;
    }
    return {
      id: price.id,
      currency: price.currency,
      unitAmount: price.unit_amount,
      interval: price.recurring?.interval || 'one_time',
      intervalCount: price.recurring?.interval_count || 1,
      productName
    };
  } catch (err) {
    return { error: err.message || String(err) };
  }
}

async function main() {
  console.log('🔍 Verifying configured Stripe price IDs...');
  const results = {};
  for (const [label, priceId] of Object.entries(PRICE_ENV_MAP)) {
    if (!priceId) {
      results[label] = { error: 'MISSING_ENV_VAR' };
      continue;
    }
    results[label] = await fetchPrice(priceId);
  }

  console.log('\nConfigured Prices:');
  for (const [label, info] of Object.entries(results)) {
    if (info.error) {
      console.log(`  ${label}: ❌ ${info.error}`);
    } else {
      console.log(`  ${label}: ✅ ${info.id} (${info.productName}) -> ${info.unitAmount / 100} ${info.currency.toUpperCase()} / ${info.interval}${info.interval === 'one_time' ? '' : ` (every ${info.intervalCount})`}`);
    }
  }

  if (process.argv.includes('--all')) {
    console.log('\n📋 Listing up to 50 active recurring prices (for manual reference) ...');
    const list = await stripe.prices.list({ active: true, limit: 50, expand: ['data.product'] });
    for (const p of list.data) {
      const name = typeof p.product === 'string' ? p.product : p.product?.name;
      const recurring = p.recurring ? `${p.recurring.interval} (${p.recurring.interval_count})` : 'one_time';
      console.log(`  ${p.id} :: ${name} :: ${recurring} :: ${(p.unit_amount || 0) / 100} ${p.currency.toUpperCase()}`);
    }
  }

  console.log('\nDone.');
}

main().catch(e => fatal(e.message || String(e)));
