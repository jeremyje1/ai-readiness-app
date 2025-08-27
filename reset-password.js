#!/usr/bin/env node

// Script to reset password for jeremy.estrella@gmail.com
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

async function resetPassword() {
    const email = 'jeremy.estrella@gmail.com';
    const newPassword = 'TempPassword123!';

    console.log(`🔐 Resetting password for ${email}...`);

    try {
        // First, find the user
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
            console.log('❌ Error listing users:', listError.message);
            return;
        }

        const user = users.users.find(u => u.email === email);
        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('✅ User found:', user.id);

        // Reset password
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password: newPassword
        });

        if (error) {
            console.log('❌ Error resetting password:', error.message);
        } else {
            console.log(`✅ Password reset successfully!`);
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 New Password: ${newPassword}`);
            console.log('\n🎯 You can now login with these credentials!');
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }
}

resetPassword().then(() => process.exit(0)).catch(err => {
    console.log('❌ Script failed:', err.message);
    process.exit(1);
});
