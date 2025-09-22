#!/usr/bin/env node

// Script to grant dashboard access to test users by creating payment records
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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

if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function grantTestAccess() {
    const email = process.argv[2];

    if (!email) {
        console.log('❌ Usage: node scripts/grant-test-access.js email@example.com');
        process.exit(1);
    }

    console.log(`🔐 Granting dashboard access to ${email}...`);

    try {
        // First, find the user
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        if (userError) {
            console.log('❌ Error listing users:', userError.message);
            return;
        }

        const user = userData.users.find(u => u.email === email);
        if (!user) {
            console.log(`❌ User ${email} not found`);
            return;
        }

        console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

        // Check if payment record already exists
        const { data: existingPayment, error: checkError } = await supabaseAdmin
            .from('user_payments')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (existingPayment && !checkError) {
            console.log('✅ User already has payment access');
            console.log(`   Tier: ${existingPayment.tier}`);
            console.log(`   Status: ${existingPayment.status}`);
            return;
        }

        // Create a test payment record
        const { data: payment, error: paymentError } = await supabaseAdmin
            .from('user_payments')
            .insert({
                user_id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || 'Test User',
                tier: 'ai-readiness-comprehensive',
                payment_status: 'completed',
                payment_amount: 0, // Test access (0 cents)
                stripe_customer_id: `test_cust_${Date.now()}`,
                stripe_session_id: `test_sess_${Date.now()}`,
                organization: 'Test Organization',
                access_granted: true,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (paymentError) {
            console.log('❌ Error creating payment record:', paymentError.message);
            console.log('Details:', paymentError);
            return;
        }

        console.log('✅ Test access granted successfully!');
        console.log(`   Payment ID: ${payment.id}`);
        console.log(`   Tier: ${payment.tier}`);
        console.log(`   Status: ${payment.status}`);
        console.log('\n🎯 User can now access the dashboard!');

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
        console.log(err.stack);
    }
}

grantTestAccess().then(() => process.exit(0)).catch(err => {
    console.log('❌ Script failed:', err.message);
    process.exit(1);
});