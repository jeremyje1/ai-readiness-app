#!/usr/bin/env node

/**
 * Enhanced Authentication Test Script
 * Tests both SDK and REST API fallback authentication
 */

const fs = require('fs');

// Read environment variables
let supabaseUrl, supabaseAnonKey, supabaseServiceKey;
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envLines = envContent.split('\n');
    envLines.forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].replace(/['"]/g, '').trim();
        } else if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            supabaseAnonKey = line.split('=')[1].replace(/['"]/g, '').trim();
        } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
            supabaseServiceKey = line.split('=')[1].replace(/['"]/g, '').trim();
        }
    });
} catch (err) {
    console.log('❌ Error reading .env.local:', err.message);
    process.exit(1);
}

console.log('🔍 Enhanced Authentication Test\n');
console.log('Environment Check:');
console.log('  URL:', supabaseUrl ? `✅ ${supabaseUrl}` : '❌ Missing');
console.log('  Anon Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing');
console.log('  Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Missing required environment variables!');
    process.exit(1);
}

// Test 1: Direct REST API Authentication
async function testRestApiAuth(email, password) {
    console.log('\n📡 Testing Direct REST API Authentication...');
    
    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ REST API auth successful!');
            console.log('  User ID:', data.user?.id);
            console.log('  Email:', data.user?.email);
            console.log('  Access Token:', data.access_token ? 'Present' : 'Missing');
            console.log('  Refresh Token:', data.refresh_token ? 'Present' : 'Missing');
            return { success: true, data };
        } else {
            console.log('❌ REST API auth failed:', data.error || data.msg || response.status);
            return { success: false, error: data.error || data.msg };
        }
    } catch (err) {
        console.log('❌ REST API request failed:', err.message);
        return { success: false, error: err.message };
    }
}

// Test 2: SDK Authentication with Timeout
async function testSdkAuth(email, password) {
    console.log('\n🔐 Testing SDK Authentication...');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('SDK timeout after 5s')), 5000);
    });

    try {
        const authPromise = supabase.auth.signInWithPassword({
            email,
            password
        });

        // Race between auth and timeout
        const { data, error } = await Promise.race([authPromise, timeoutPromise]);

        if (error) {
            console.log('❌ SDK auth failed:', error.message);
            return { success: false, error: error.message };
        }

        console.log('✅ SDK auth successful!');
        console.log('  User ID:', data.user?.id);
        console.log('  Session:', data.session ? 'Present' : 'Missing');
        return { success: true, data };

    } catch (err) {
        console.log('❌ SDK auth error:', err.message);
        return { success: false, error: err.message };
    }
}

// Test 3: Create test user if needed
async function createTestUser(email, password) {
    console.log('\n👤 Creating test user...');
    
    if (!supabaseServiceKey) {
        console.log('❌ Service key required for user creation');
        return false;
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: 'Test User',
                created_via: 'enhanced_test_script'
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                console.log('ℹ️  User already exists');
                return true;
            }
            console.log('❌ Create user failed:', error.message);
            return false;
        }

        console.log('✅ Test user created successfully');
        return true;
    } catch (err) {
        console.log('❌ Create user error:', err.message);
        return false;
    }
}

// Main test flow
async function runTests() {
    const testEmail = 'test-enhanced@example.com';
    const testPassword = 'TestPassword123!';

    console.log('\n🧪 Running Enhanced Authentication Tests...');
    console.log(`Test credentials: ${testEmail}`);

    // Create test user first
    await createTestUser(testEmail, testPassword);

    // Test REST API
    const restResult = await testRestApiAuth(testEmail, testPassword);

    // Test SDK
    const sdkResult = await testSdkAuth(testEmail, testPassword);

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('  REST API:', restResult.success ? '✅ Working' : '❌ Failed');
    console.log('  SDK:', sdkResult.success ? '✅ Working' : '❌ Failed');

    if (restResult.success && !sdkResult.success) {
        console.log('\n⚠️  SDK is failing but REST API works - fallback will be used');
    } else if (!restResult.success && !sdkResult.success) {
        console.log('\n❌ Both methods failed - check Supabase configuration');
    } else if (restResult.success && sdkResult.success) {
        console.log('\n✅ Both methods working correctly');
    }

    // Test with actual user email
    console.log('\n🔐 Testing with jeremy.estrella@gmail.com...');
    const actualUserRest = await testRestApiAuth('jeremy.estrella@gmail.com', 'TempPassword123!');
    
    if (!actualUserRest.success) {
        console.log('ℹ️  Note: This may fail if the password is incorrect');
    }
}

// Run tests
runTests().then(() => {
    console.log('\n✅ Enhanced authentication test complete!');
    process.exit(0);
}).catch(err => {
    console.log('\n❌ Test failed:', err.message);
    process.exit(1);
});
