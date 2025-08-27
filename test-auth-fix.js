#!/usr/bin/env node

/**
 * Test the auth fix with proper timeout and fallback
 */

const fs = require('fs');

// Read environment variables
let supabaseUrl, supabaseAnonKey;
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envLines = envContent.split('\n');
    envLines.forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].replace(/['"]/g, '').trim();
        } else if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            supabaseAnonKey = line.split('=')[1].replace(/['"]/g, '').trim();
        }
    });
} catch (err) {
    console.log('❌ Error reading .env.local:', err.message);
    process.exit(1);
}

console.log('🧪 Testing Auth Fix\n');

// Test direct API with proper timing
async function testDirectAuth() {
    const email = 'jeremy.estrella@gmail.com';
    const password = 'TempPassword123!';

    console.log('📡 Testing direct REST API...');
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({ email, password }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        const data = await response.json();

        console.log(`✅ Response received in ${duration}ms`);
        console.log('  Status:', response.status);
        console.log('  Has access token:', !!data.access_token);
        console.log('  Has user:', !!data.user);

        if (data.error) {
            console.log('  Error:', data.error);
        }

        return { success: response.ok, duration, data };
    } catch (err) {
        const duration = Date.now() - startTime;
        console.log(`❌ Request failed after ${duration}ms:`, err.message);
        return { success: false, duration, error: err.message };
    }
}

// Test SDK with timeout
async function testSDKAuth() {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const email = 'jeremy.estrella@gmail.com';
    const password = 'TempPassword123!';

    console.log('\n🔐 Testing SDK auth with timeout...');
    const startTime = Date.now();

    try {
        // Create promise that will timeout
        const authPromise = supabase.auth.signInWithPassword({ email, password });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SDK timeout')), 8000)
        );

        const { data, error } = await Promise.race([authPromise, timeoutPromise]);
        const duration = Date.now() - startTime;

        if (error) {
            console.log(`❌ SDK auth failed after ${duration}ms:`, error.message);
            return { success: false, duration, error: error.message };
        }

        console.log(`✅ SDK auth successful in ${duration}ms`);
        console.log('  Has session:', !!data.session);
        console.log('  Has user:', !!data.user);

        // Sign out to clean up
        await supabase.auth.signOut();

        return { success: true, duration };
    } catch (err) {
        const duration = Date.now() - startTime;
        console.log(`❌ SDK auth error after ${duration}ms:`, err.message);
        return { success: false, duration, error: err.message };
    }
}

// Run tests
async function runTests() {
    console.log('Testing with URL:', supabaseUrl);
    console.log('Key present:', !!supabaseAnonKey);

    const directResult = await testDirectAuth();
    const sdkResult = await testSDKAuth();

    console.log('\n📊 Summary:');
    console.log(`  Direct API: ${directResult.success ? '✅' : '❌'} (${directResult.duration}ms)`);
    console.log(`  SDK: ${sdkResult.success ? '✅' : '❌'} (${sdkResult.duration}ms)`);

    if (directResult.success && !sdkResult.success) {
        console.log('\n⚠️  SDK is failing, fallback will be used');
        console.log('This is expected and the auth service will handle it automatically');
    }
}

runTests().catch(console.error);
