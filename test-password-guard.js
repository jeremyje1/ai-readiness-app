#!/usr/bin/env node

// Script to test the password setup guard by creating a user without a password
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const crypto = require('crypto');

// Read environment variables
let supabaseUrl, supabaseServiceKey;
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envLines = envContent.split('\n');
    envLines.forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].replace(/['"]/g, '');
        } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
            supabaseServiceKey = line.split('=')[1].replace(/['"]/g, '');
        }
    });
} catch (err) {
    console.log('Error reading .env.local:', err.message);
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUserWithoutPassword() {
    const email = process.argv[2] || 'test-password-guard@example.com';
    const name = process.argv[3] || 'Test Password Guard User';

    console.log(`🧪 Creating test user for password guard testing: ${email}...`);

    try {
        // Step 1: Create user without password (simulating Stripe webhook)
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            email_confirm: true,
            user_metadata: {
                full_name: name,
                created_via: 'stripe_webhook', // This will trigger password setup requirement
                payment_verified: true
            }
        });

        if (createError && !createError.message.includes('already registered')) {
            console.log('❌ Error creating user:', createError.message);
            return;
        }

        let userId;
        if (createError && createError.message.includes('already registered')) {
            console.log('ℹ️  User already exists, finding existing user...');
            const { data: users } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
            if (!existingUser) {
                console.log('❌ Could not find existing user');
                return;
            }
            userId = existingUser.id;
        } else {
            userId = userData.user.id;
            console.log('✅ User created successfully!');
        }

        // Step 2: Create password setup token
        const token = crypto.randomBytes(24).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

        const { error: tokenError } = await supabaseAdmin
            .from('auth_password_setup_tokens')
            .insert({
                user_id: userId,
                email: email,
                token: token,
                expires_at: expires
            });

        if (tokenError) {
            console.log('❌ Error creating password setup token:', tokenError.message);
            return;
        }

        console.log('✅ Password setup token created!');
        console.log('');
        console.log('📋 Test Summary:');
        console.log(`   📧 Email: ${email}`);
        console.log(`   👤 User ID: ${userId}`);
        console.log(`   🔑 Token: ${token}`);
        console.log(`   ⏰ Expires: ${new Date(expires).toLocaleString()}`);
        console.log('');
        console.log('🧪 Testing Instructions:');
        console.log(`1. 🔗 Get a magic link for this user by calling:`);
        console.log(`   /api/auth/password/setup/request with email: ${email}`);
        console.log('');
        console.log(`2. 🌐 OR visit the password setup page directly:`);
        console.log(`   /auth/password/setup?token=${token}`);
        console.log('');
        console.log('3. 🔐 Expected behavior:');
        console.log('   - User should be redirected to password setup when accessing any protected page');
        console.log('   - After setting password, user should be redirected back to the original page');
        console.log('   - Password setup guard should no longer trigger');
        console.log('');
        console.log('4. 🧹 To clean up this test user later:');
        console.log(`   node cleanup-test-users.js`);

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }
}

createTestUserWithoutPassword();