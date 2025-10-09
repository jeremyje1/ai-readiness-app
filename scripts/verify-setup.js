#!/usr/bin/env node

/**
 * Setup Verification Script for AI Readiness Platform
 * Verifies database tables, storage bucket, and environment configuration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && !process.env[key]) {
        process.env[key] = value.join('=').replace(/^["']|["']$/g, '').trim();
      }
    });
  }
} catch (err) {
  // Ignore errors, environment variables might be set elsewhere
}

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

// Tables to verify
const requiredTables = [
  'uploaded_documents',
  'streamlined_assessment_responses',
  'gap_analysis_results',
  'implementation_roadmaps',
  'user_activity_log'
];

// Environment variables to check
const requiredEnvVars = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL, public: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, public: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY, public: false },
  { name: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY, public: false }
];

// Verification results
const results = {
  environment: [],
  database: [],
  storage: [],
  overall: { passed: 0, failed: 0, warnings: 0 }
};

function log(message, type = 'info') {
  const typeColors = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.cyan,
    header: colors.blue + colors.bright
  };
  const color = typeColors[type] || colors.reset;
  console.log(color + message + colors.reset);
}

async function verifyEnvironment() {
  log('\n📋 Verifying Environment Variables', 'header');
  log('─'.repeat(50));

  for (const envVar of requiredEnvVars) {
    if (envVar.value) {
      const displayValue = envVar.public
        ? envVar.value.substring(0, 20) + '...'
        : '***' + envVar.value.substring(envVar.value.length - 4);
      log(`  ✅ ${envVar.name}: ${displayValue}`, 'success');
      results.environment.push({ name: envVar.name, status: 'passed' });
      results.overall.passed++;
    } else {
      log(`  ❌ ${envVar.name}: NOT SET`, 'error');
      results.environment.push({ name: envVar.name, status: 'failed' });
      results.overall.failed++;
    }
  }

  // Check Vercel environment variables
  if (process.env.VERCEL) {
    log('\n  🔍 Vercel Environment Detected', 'info');
    log(`  📍 Vercel URL: ${process.env.VERCEL_URL}`, 'info');
  }
}

async function verifyDatabase() {
  log('\n🗄️  Verifying Database Tables', 'header');
  log('─'.repeat(50));

  if (!supabaseServiceKey) {
    log('  ⚠️  Cannot verify database without service role key', 'warning');
    results.overall.warnings++;
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  for (const tableName of requiredTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        log(`  ❌ ${tableName}: NOT FOUND - ${error.message}`, 'error');
        results.database.push({ name: tableName, status: 'failed', error: error.message });
        results.overall.failed++;
      } else {
        log(`  ✅ ${tableName}: EXISTS (${count || 0} records)`, 'success');
        results.database.push({ name: tableName, status: 'passed', count });
        results.overall.passed++;

        // Check RLS status
        const rlsCheckSQL = `
          SELECT tablename, rowsecurity
          FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename = '${tableName}';
        `;

        try {
          const { data: rlsData } = await supabase.rpc('query', { query_text: rlsCheckSQL }).single();
          if (rlsData && rlsData[0] && rlsData[0].rowsecurity) {
            log(`     🔐 RLS: ENABLED`, 'info');
          } else {
            log(`     ⚠️  RLS: May not be enabled`, 'warning');
            results.overall.warnings++;
          }
        } catch (rlsErr) {
          // RLS check failed, but table exists
        }
      }
    } catch (err) {
      log(`  ❌ ${tableName}: ERROR - ${err.message}`, 'error');
      results.database.push({ name: tableName, status: 'failed', error: err.message });
      results.overall.failed++;
    }
  }
}

async function verifyStorage() {
  log('\n🗂️  Verifying Storage Bucket', 'header');
  log('─'.repeat(50));

  if (!supabaseServiceKey) {
    log('  ⚠️  Cannot verify storage without service role key', 'warning');
    results.overall.warnings++;
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      log(`  ❌ Cannot list buckets: ${bucketsError.message}`, 'error');
      results.storage.push({ name: 'list_buckets', status: 'failed', error: bucketsError.message });
      results.overall.failed++;
      return;
    }

    const documentsBucket = buckets?.find(b => b.id === 'documents');

    if (!documentsBucket) {
      log('  ❌ Storage bucket "documents" NOT FOUND', 'error');
      results.storage.push({ name: 'documents_bucket', status: 'failed' });
      results.overall.failed++;
    } else {
      log('  ✅ Storage bucket "documents" EXISTS', 'success');
      results.storage.push({ name: 'documents_bucket', status: 'passed' });
      results.overall.passed++;

      // Display bucket configuration
      log(`     📊 Bucket ID: ${documentsBucket.id}`, 'info');
      log(`     🔒 Public: ${documentsBucket.public ? 'Yes' : 'No'}`, 'info');
      if (documentsBucket.file_size_limit) {
        const sizeMB = documentsBucket.file_size_limit / (1024 * 1024);
        log(`     📦 Size limit: ${sizeMB} MB`, 'info');
      }

      // Test bucket access
      const { data: files, error: listError } = await supabase.storage
        .from('documents')
        .list('test', { limit: 1 });

      if (listError) {
        log(`     ⚠️  Bucket access test: ${listError.message}`, 'warning');
        results.overall.warnings++;
      } else {
        log(`     ✅ Bucket is accessible`, 'success');
      }
    }
  } catch (err) {
    log(`  ❌ Storage verification error: ${err.message}`, 'error');
    results.storage.push({ name: 'storage_check', status: 'failed', error: err.message });
    results.overall.failed++;
  }
}

async function verifyAPIKeys() {
  log('\n🔑 Verifying API Keys', 'header');
  log('─'.repeat(50));

  // Check OpenAI API key
  if (openaiKey) {
    log('  ✅ OpenAI API Key: SET', 'success');
    results.overall.passed++;

    // Test OpenAI API connection
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey}`
        }
      });

      if (response.ok) {
        log('     ✅ OpenAI API: Connected', 'success');
      } else if (response.status === 401) {
        log('     ❌ OpenAI API: Invalid key', 'error');
        results.overall.failed++;
      } else {
        log(`     ⚠️  OpenAI API: Status ${response.status}`, 'warning');
        results.overall.warnings++;
      }
    } catch (err) {
      log('     ⚠️  Could not test OpenAI connection', 'warning');
      results.overall.warnings++;
    }
  } else {
    log('  ❌ OpenAI API Key: NOT SET', 'error');
    log('     ℹ️  Required for AI document analysis', 'info');
    results.overall.failed++;
  }
}

async function printSummary() {
  log('\n' + '═'.repeat(60), 'header');
  log('📊 VERIFICATION SUMMARY', 'header');
  log('═'.repeat(60), 'header');

  const total = results.overall.passed + results.overall.failed + results.overall.warnings;
  const passRate = total > 0 ? Math.round((results.overall.passed / total) * 100) : 0;

  log(`\n  ✅ Passed: ${results.overall.passed}`, 'success');
  log(`  ❌ Failed: ${results.overall.failed}`, 'error');
  log(`  ⚠️  Warnings: ${results.overall.warnings}`, 'warning');
  log(`\n  📈 Pass Rate: ${passRate}%`);

  if (results.overall.failed > 0) {
    log('\n❌ SETUP INCOMPLETE', 'error');
    log('\n📝 Required Actions:', 'header');

    if (results.environment.some(r => r.status === 'failed')) {
      log('\n  1. Set missing environment variables:', 'warning');
      results.environment
        .filter(r => r.status === 'failed')
        .forEach(r => log(`     • ${r.name}`));
    }

    if (results.database.some(r => r.status === 'failed')) {
      log('\n  2. Create missing database tables:', 'warning');
      log('     Run: npm run setup:database');
    }

    if (results.storage.some(r => r.status === 'failed')) {
      log('\n  3. Create storage bucket:', 'warning');
      log('     Run: npm run setup:storage');
      log('     Or manually create in Supabase Dashboard → Storage');
    }
  } else if (results.overall.warnings > 0) {
    log('\n⚠️  SETUP COMPLETE WITH WARNINGS', 'warning');
    log('   Review warnings above for optimal configuration');
  } else {
    log('\n✅ SETUP VERIFIED SUCCESSFULLY!', 'success');
    log('   Your AI Readiness Platform is ready to use! 🎉');
  }

  log('\n📚 Documentation:', 'info');
  log('   • Setup guide: SETUP.md');
  log('   • Platform guide: PLATFORM_REDESIGN_PLAN.md');
  log('   • Test the app: https://aiblueprint.educationaiblueprint.com\n');
}

async function runVerification() {
  log('\n🔍 AI READINESS PLATFORM - SETUP VERIFICATION', 'header');
  log('═'.repeat(60), 'header');

  await verifyEnvironment();
  await verifyDatabase();
  await verifyStorage();
  await verifyAPIKeys();
  await printSummary();

  // Exit with appropriate code
  process.exit(results.overall.failed > 0 ? 1 : 0);
}

// Run verification
runVerification().catch((error) => {
  log(`\n❌ Verification failed: ${error.message}`, 'error');
  process.exit(1);
});