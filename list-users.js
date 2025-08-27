#!/usr/bin/env node

// Script to list current users (preview before cleanup)
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

async function listUsers() {
    console.log('📋 Current users in the system:\n');

    try {
        const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
            console.log('❌ Error listing users:', listError.message);
            return;
        }

        const users = userData.users;

        if (users.length === 0) {
            console.log('✅ No users found - database is clean!');
            return;
        }

        console.log(`Found ${users.length} users:\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. 📧 ${user.email}`);
            console.log(`   🆔 ID: ${user.id}`);
            console.log(`   📅 Created: ${new Date(user.created_at).toLocaleString()}`);
            console.log(`   ✅ Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
            console.log(`   🔗 Provider: ${user.app_metadata?.provider || 'Unknown'}`);
            console.log('');
        });

        // Also check database tables
        console.log('📊 Related data counts:');

        const { count: userProfiles } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true });
        console.log(`   👤 User profiles: ${userProfiles || 0}`);

        const { count: institutions } = await supabaseAdmin
            .from('institutions')
            .select('*', { count: 'exact', head: true });
        console.log(`   🏢 Institutions: ${institutions || 0}`);

        const { count: memberships } = await supabaseAdmin
            .from('institution_memberships')
            .select('*', { count: 'exact', head: true });
        console.log(`   👥 Memberships: ${memberships || 0}`);

        const { count: assessments } = await supabaseAdmin
            .from('ai_readiness_assessments')
            .select('*', { count: 'exact', head: true });
        console.log(`   📝 Assessments: ${assessments || 0}`);

        const { count: tokens } = await supabaseAdmin
            .from('auth_password_setup_tokens')
            .select('*', { count: 'exact', head: true });
        console.log(`   🔑 Password tokens: ${tokens || 0}`);

        console.log('\n💡 To clean up all this data, run: node cleanup-test-users.js');

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }
}

listUsers().then(() => process.exit(0)).catch(err => {
    console.log('❌ Script failed:', err.message);
    process.exit(1);
});
