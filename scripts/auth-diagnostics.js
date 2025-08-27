#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Test script for comprehensive auth diagnostics
async function runAuthDiagnostics() {
  console.log('🔍 AI Readiness App - Authentication Diagnostics\n');
  
  // Environment validation
  console.log('📋 Environment Validation:');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log(`  ✓ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : '❌ Missing'}`);
  console.log(`  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey ? 'Set (***' + anonKey.slice(-4) + ')' : '❌ Missing'}`);
  console.log(`  ✓ SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? 'Set (***' + serviceKey.slice(-4) + ')' : '❌ Missing'}`);
  
  if (!supabaseUrl || !anonKey) {
    console.log('\n❌ Missing required environment variables. Please check your .env.local file.\n');
    return;
  }
  
  // URL validation
  try {
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split('.')[0];
    console.log(`  ✓ Project ref: ${projectRef}`);
    console.log(`  ✓ URL format: Valid`);
  } catch (error) {
    console.log(`  ❌ URL format: Invalid - ${error.message}`);
    return;
  }
  
  // Client initialization
  console.log('\n🔗 Client Initialization:');
  const supabase = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false, // Disable for testing
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
  
  console.log('  ✓ Supabase client created');
  
  // Connection test
  console.log('\n🌐 Connection Tests:');
  
  try {
    console.log('  Testing basic auth connection...');
    const start = performance.now();
    const { data, error } = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
    ]);
    const elapsed = Math.round(performance.now() - start);
    
    if (error) {
      console.log(`  ❌ Auth connection failed: ${error.message}`);
    } else {
      console.log(`  ✓ Auth connection successful (${elapsed}ms)`);
    }
  } catch (error) {
    console.log(`  ❌ Auth connection timeout or error: ${error.message}`);
  }
  
  try {
    console.log('  Testing direct REST API...');
    const start = performance.now();
    const response = await Promise.race([
      fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
    ]);
    const elapsed = Math.round(performance.now() - start);
    
    console.log(`  ✓ REST API response: ${response.status} (${elapsed}ms)`);
  } catch (error) {
    console.log(`  ❌ REST API timeout or error: ${error.message}`);
  }
  
  // Password grant test (if credentials provided)
  if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
    console.log('\n🔐 Password Grant Test:');
    const testEmail = process.env.TEST_EMAIL;
    const testPassword = process.env.TEST_PASSWORD;
    
    try {
      console.log(`  Testing SDK signInWithPassword for ${testEmail}...`);
      const start = performance.now();
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SDK Timeout')), 12000))
      ]);
      const elapsed = Math.round(performance.now() - start);
      
      if (error) {
        console.log(`  ❌ SDK auth failed: ${error.message} (${elapsed}ms)`);
      } else {
        console.log(`  ✓ SDK auth successful (${elapsed}ms)`);
        console.log(`    User ID: ${data.user?.id}`);
        console.log(`    Session expires: ${new Date(data.session?.expires_at * 1000).toISOString()}`);
      }
    } catch (error) {
      console.log(`  ❌ SDK auth timeout: ${error.message}`);
      
      // Try manual REST API fallback
      console.log('  Testing manual REST API fallback...');
      try {
        const grantUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
        const start = performance.now();
        const response = await fetch(grantUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey
          },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword
          })
        });
        const elapsed = Math.round(performance.now() - start);
        
        const responseText = await response.text();
        
        if (response.ok) {
          const tokens = JSON.parse(responseText);
          console.log(`  ✓ Manual auth successful (${elapsed}ms)`);
          console.log(`    Access token: ***${tokens.access_token?.slice(-8)}`);
          console.log(`    Token type: ${tokens.token_type}`);
        } else {
          console.log(`  ❌ Manual auth failed: ${response.status} ${responseText}`);
        }
      } catch (fallbackError) {
        console.log(`  ❌ Manual auth error: ${fallbackError.message}`);
      }
    }
  } else {
    console.log('\n💡 To test authentication, set TEST_EMAIL and TEST_PASSWORD environment variables');
  }
  
  // Network diagnostics
  console.log('\n🌍 Network Diagnostics:');
  
  try {
    console.log('  Testing DNS resolution...');
    const url = new URL(supabaseUrl);
    const response = await fetch(`https://dns.google/resolve?name=${url.hostname}&type=A`);
    const dnsData = await response.json();
    
    if (dnsData.Answer && dnsData.Answer.length > 0) {
      console.log(`  ✓ DNS resolution: ${dnsData.Answer[0].data}`);
    } else {
      console.log('  ⚠️ DNS resolution: No A records found');
    }
  } catch (error) {
    console.log(`  ❌ DNS resolution failed: ${error.message}`);
  }
  
  try {
    console.log('  Testing HTTPS connectivity...');
    const start = performance.now();
    const response = await fetch(supabaseUrl);
    const elapsed = Math.round(performance.now() - start);
    console.log(`  ✓ HTTPS connectivity: ${response.status} (${elapsed}ms)`);
  } catch (error) {
    console.log(`  ❌ HTTPS connectivity failed: ${error.message}`);
  }
  
  console.log('\n📊 Diagnostic Summary:');
  console.log('  - Check all ✓ marks above for successful tests');
  console.log('  - Any ❌ marks indicate issues that need attention');
  console.log('  - ⚠️ marks indicate warnings that may affect performance');
  console.log('\n🔧 Recommendations:');
  console.log('  1. Ensure all environment variables are correctly set');
  console.log('  2. Verify Supabase project is active and accessible');
  console.log('  3. Check network connectivity and firewall settings');
  console.log('  4. If SDK hangs but REST API works, consider using fallback auth');
  console.log('  5. Monitor response times - anything over 5s may indicate issues\n');
}

// Run diagnostics if called directly
if (require.main === module) {
  runAuthDiagnostics().catch(console.error);
}

module.exports = { runAuthDiagnostics };
