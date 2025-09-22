#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Ensures all required environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_ENV_VARS = {
  // Supabase Configuration
  'NEXT_PUBLIC_SUPABASE_URL': {
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
    description: 'Supabase project URL'
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    pattern: /^eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*$/,
    description: 'Supabase anonymous key (JWT format)'
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    pattern: /^eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*$/,
    description: 'Supabase service role key (JWT format)',
    optional: process.env.NODE_ENV !== 'production'
  },
  
  // Stripe Configuration
  'STRIPE_SECRET_KEY': {
    pattern: /^sk_(test|live)_[A-Za-z0-9]+$/,
    description: 'Stripe secret key'
  },
  'STRIPE_PUBLISHABLE_KEY': {
    pattern: /^pk_(test|live)_[A-Za-z0-9]+$/,
    description: 'Stripe publishable key'
  },
  'STRIPE_WEBHOOK_SECRET': {
    pattern: /^whsec_[A-Za-z0-9]+$/,
    description: 'Stripe webhook secret',
    optional: process.env.NODE_ENV === 'development'
  },
  
  // Email Configuration
  'POSTMARK_API_TOKEN': {
    pattern: /^[a-f0-9\-]+$/,
    description: 'Postmark API token',
    optional: process.env.NODE_ENV === 'development'
  },
  'POSTMARK_FROM_EMAIL': {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    description: 'From email address for Postmark'
  },
  
  // OpenAI Configuration
  'OPENAI_API_KEY': {
    pattern: /^sk-[A-Za-z0-9]+$/,
    description: 'OpenAI API key'
  },
  
  // App Configuration
  'NEXT_PUBLIC_APP_URL': {
    pattern: /^https?:\/\/.+$/,
    description: 'Application URL'
  }
};

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        let value = valueParts.join('=').trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key.trim()] = value;
      }
    }
  });
  
  return env;
}

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  const env = process.env.NODE_ENV === 'production' ? process.env : loadEnvFile();
  let hasErrors = false;
  let hasWarnings = false;
  
  Object.entries(REQUIRED_ENV_VARS).forEach(([varName, config]) => {
    const value = env[varName];
    
    if (!value && !config.optional) {
      console.error(`❌ ${varName}: Missing required variable`);
      console.log(`   ${config.description}\n`);
      hasErrors = true;
    } else if (!value && config.optional) {
      console.warn(`⚠️  ${varName}: Optional variable not set`);
      console.log(`   ${config.description}\n`);
      hasWarnings = true;
    } else if (value && config.pattern && !config.pattern.test(value)) {
      console.error(`❌ ${varName}: Invalid format`);
      console.log(`   Expected pattern: ${config.pattern}`);
      console.log(`   ${config.description}\n`);
      hasErrors = true;
    } else if (value) {
      console.log(`✅ ${varName}: Valid`);
    }
  });
  
  // Additional checks
  console.log('\n📋 Additional Checks:\n');
  
  // Check Stripe mode consistency
  const stripeSecretKey = env.STRIPE_SECRET_KEY;
  const stripePublishableKey = env.STRIPE_PUBLISHABLE_KEY;
  
  if (stripeSecretKey && stripePublishableKey) {
    const secretMode = stripeSecretKey.includes('_test_') ? 'test' : 'live';
    const publishableMode = stripePublishableKey.includes('_test_') ? 'test' : 'live';
    
    if (secretMode !== publishableMode) {
      console.error('❌ Stripe keys mode mismatch');
      console.log(`   Secret key is in ${secretMode} mode`);
      console.log(`   Publishable key is in ${publishableMode} mode\n`);
      hasErrors = true;
    } else {
      console.log(`✅ Stripe keys are both in ${secretMode} mode`);
    }
  }
  
  // Check production requirements
  if (process.env.NODE_ENV === 'production') {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET is required in production\n');
      hasErrors = true;
    }
    
    if (stripeSecretKey && stripeSecretKey.includes('_test_')) {
      console.warn('⚠️  Using Stripe test keys in production\n');
      hasWarnings = true;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.error('\n❌ Environment validation failed with errors');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('\n⚠️  Environment validation passed with warnings');
  } else {
    console.log('\n✅ All environment variables are properly configured');
  }
}

// Run validation
validateEnvironment();