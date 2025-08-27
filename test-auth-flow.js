#!/usr/bin/env node

// Test script to debug authentication flow
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables manually
let supabaseUrl, supabaseAnonKey, supabaseServiceKey;
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envLines = envContent.split('\n');
    envLines.forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].replace(/['"]/g, '');
        } else if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            supabaseAnonKey = line.split('=')[1].replace(/['"]/g, '');
        } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
            supabaseServiceKey = line.split('=')[1].replace(/['"]/g, '');
        }
    });
} catch (err) {
    console.log('Error reading .env.local:', err.message);
}

console.log('🔍 Testing Authentication Flow...\n');

// Test 1: Basic connection
console.log('1. Testing Supabase Connection:');
console.log('   URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('   Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Missing required environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testAuth() {
    try {
        console.log('\n2. Testing Connection to Supabase:');

        // Test basic connection
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.log('   ❌ Connection error:', error.message);
            return;
        }
        console.log('   ✅ Connection successful');

        console.log('\n3. Testing Login with New User:');

        // First, let's create a test user
        const testEmail = 'test.user@example.com';
        const testPassword = 'Test123!@#';

        console.log(`   Creating test user: ${testEmail}`);

        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true,
            user_metadata: {
                name: 'Test User',
                created_via: 'test_script'
            }
        });

        if (createError && !createError.message.includes('already registered')) {
            console.log('   ❌ Create user error:', createError.message);
            return;
        }

        console.log('   ✅ Test user ready');

        // Now test login
        console.log('   Testing login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });

        if (loginError) {
            console.log('   ❌ Login error:', loginError.message);

            // Check if it's an email confirmation issue
            if (loginError.message.includes('Email not confirmed')) {
                console.log('   🔧 Confirming email automatically...');

                const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
                    createData?.user?.id || '',
                    { email_confirm: true }
                );

                if (!confirmError) {
                    console.log('   ✅ Email confirmed, retrying login...');
                    const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                        email: testEmail,
                        password: testPassword
                    });

                    if (retryError) {
                        console.log('   ❌ Retry login error:', retryError.message);
                    } else {
                        console.log('   ✅ Login successful after email confirmation!');
                    }
                }
            }
        } else {
            console.log('   ✅ Login successful!');
        }

        // Clean up test user
        if (loginData?.user?.id) {
            await supabaseAdmin.auth.admin.deleteUser(loginData.user.id);
            console.log('   🧹 Test user cleaned up');
        }

    } catch (err) {
        console.log('   ❌ Unexpected error:', err.message);
    }
}

testAuth().then(() => {
    console.log('\n✅ Authentication test complete!');
    process.exit(0);
}).catch(err => {
    console.log('\n❌ Test failed:', err.message);
    process.exit(1);
});
