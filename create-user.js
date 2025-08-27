#!/usr/bin/env node

// Script to create user accounts directly for testing
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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createDirectUser() {
    const email = process.argv[2];
    const password = process.argv[3] || 'TempPassword123!';
    const name = process.argv[4] || 'Test User';

    if (!email) {
        console.log('❌ Usage: node create-user.js email@example.com [password] [name]');
        process.exit(1);
    }

    console.log(`🔐 Creating user account for ${email}...`);

    try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: name,
                created_via: 'direct_script'
            }
        });

        if (error) {
            console.log('❌ Error creating user:', error.message);
        } else {
            console.log(`✅ User created successfully!`);
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 Password: ${password}`);
            console.log(`👤 Name: ${name}`);
            console.log(`🆔 User ID: ${data.user.id}`);
            console.log('\n🎯 You can now login with these credentials!');
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }
}

createDirectUser().then(() => process.exit(0)).catch(err => {
    console.log('❌ Script failed:', err.message);
    process.exit(1);
});
