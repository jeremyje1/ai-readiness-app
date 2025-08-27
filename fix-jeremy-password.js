#!/usr/bin/env node

/**
 * Fix password for jeremy.estrella@gmail.com
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables
let supabaseUrl, supabaseServiceKey;
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envLines = envContent.split('\n');
    envLines.forEach(line => {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].replace(/['"]/g, '').trim();
        } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
            supabaseServiceKey = line.split('=')[1].replace(/['"]/g, '').trim();
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

async function fixJeremyAccount() {
    const email = 'jeremy.estrella@gmail.com';
    const newPassword = 'TempPassword123!';

    console.log(`\n🔧 Fixing account for ${email}...`);

    try {
        // First, check if user exists
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
            console.log('❌ Error listing users:', listError.message);
            return;
        }

        const existingUser = users.users.find(u => u.email === email);

        if (existingUser) {
            console.log('✅ User found:', existingUser.id);
            console.log('   Created:', new Date(existingUser.created_at).toLocaleString());
            console.log('   Confirmed:', existingUser.email_confirmed_at ? 'Yes' : 'No');

            // Update password
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                password: newPassword,
                email_confirm: true
            });

            if (updateError) {
                console.log('❌ Error updating user:', updateError.message);
            } else {
                console.log('✅ Password reset successfully!');
                console.log(`\n📧 Email: ${email}`);
                console.log(`🔑 New Password: ${newPassword}`);
                console.log('\nYou can now log in at /auth/login');
            }
        } else {
            console.log('❌ User not found, creating new account...');

            // Create user
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: newPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: 'Jeremy Estrella',
                    created_via: 'fix_script'
                }
            });

            if (error) {
                console.log('❌ Error creating user:', error.message);
            } else {
                console.log('✅ User created successfully!');
                console.log(`\n📧 Email: ${email}`);
                console.log(`🔑 Password: ${newPassword}`);
                console.log(`👤 User ID: ${data.user.id}`);
            }
        }

        // Test the credentials
        console.log('\n🧪 Testing login...');
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
            },
            body: JSON.stringify({ email, password: newPassword }),
        });

        if (response.ok) {
            console.log('✅ Login test successful!');
        } else {
            const error = await response.json();
            console.log('❌ Login test failed:', error.error || error.msg);
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }
}

fixJeremyAccount().then(() => {
    console.log('\n✅ Account fix complete!');
    process.exit(0);
}).catch(err => {
    console.log('❌ Script failed:', err.message);
    process.exit(1);
});
