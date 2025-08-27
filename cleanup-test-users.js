#!/usr/bin/env node

// Script to clean up all test users and related data
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

async function cleanupTestUsers() {
    console.log('🧹 Starting cleanup of test users and data...\n');

    try {
        // Step 1: List all users
        console.log('📋 Fetching all users...');
        const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
            console.log('❌ Error listing users:', listError.message);
            return;
        }

        const users = userData.users;
        console.log(`Found ${users.length} users total\n`);

        if (users.length === 0) {
            console.log('✅ No users to clean up!');
            return;
        }

        // Show all users first
        console.log('👥 Current users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
            console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
            console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        });
        console.log('');

        // Step 2: Clean up database tables (related data first due to foreign keys)
        console.log('🗑️  Cleaning up database tables...');

        // Clean assessment results
        const { count: assessmentCount, error: assessmentError } = await supabaseAdmin
            .from('ai_readiness_assessments')
            .delete()
            .gte('id', 0); // Delete all records by using a condition that matches all

        if (assessmentError && assessmentError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.log('⚠️  Warning cleaning assessments:', assessmentError.message);
        } else {
            console.log(`✅ Cleaned ${assessmentCount || 0} assessment records`);
        }

        // Clean enterprise algorithm results
        const { count: algorithmCount, error: algorithmError } = await supabaseAdmin
            .from('enterprise_algorithm_results')
            .delete()
            .gte('id', 0);

        if (algorithmError && algorithmError.code !== 'PGRST116') {
            console.log('⚠️  Warning cleaning algorithm results:', algorithmError.message);
        } else {
            console.log(`✅ Cleaned ${algorithmCount || 0} algorithm result records`);
        }

        // Clean institution memberships
        const { count: membershipCount, error: membershipError } = await supabaseAdmin
            .from('institution_memberships')
            .delete()
            .gte('id', 0);

        if (membershipError && membershipError.code !== 'PGRST116') {
            console.log('⚠️  Warning cleaning memberships:', membershipError.message);
        } else {
            console.log(`✅ Cleaned ${membershipCount || 0} membership records`);
        }

        // Clean institutions
        const { count: institutionCount, error: institutionError } = await supabaseAdmin
            .from('institutions')
            .delete()
            .gte('id', 0);

        if (institutionError && institutionError.code !== 'PGRST116') {
            console.log('⚠️  Warning cleaning institutions:', institutionError.message);
        } else {
            console.log(`✅ Cleaned ${institutionCount || 0} institution records`);
        }

        // Clean password setup tokens
        const { count: tokenCount, error: tokenError } = await supabaseAdmin
            .from('auth_password_setup_tokens')
            .delete()
            .gte('id', 0);

        if (tokenError && tokenError.code !== 'PGRST116') {
            console.log('⚠️  Warning cleaning password tokens:', tokenError.message);
        } else {
            console.log(`✅ Cleaned ${tokenCount || 0} password setup tokens`);
        }

        console.log('');

        // Step 3: Delete auth users
        console.log('🗑️  Deleting auth users...');
        let deletedCount = 0;
        
        for (const user of users) {
            try {
                const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
                if (error) {
                    console.log(`❌ Error deleting ${user.email}:`, error.message);
                } else {
                    console.log(`✅ Deleted ${user.email}`);
                    deletedCount++;
                }
            } catch (err) {
                console.log(`❌ Unexpected error deleting ${user.email}:`, err.message);
            }
        }

        console.log('');
        console.log('🎉 Cleanup complete!');
        console.log(`📊 Summary:`);
        console.log(`   • Deleted ${deletedCount}/${users.length} auth users`);
        console.log(`   • Cleaned database tables of related data`);
        console.log(`   • Ready for fresh testing!`);
        
        if (deletedCount < users.length) {
            console.log('\n⚠️  Some users could not be deleted. You may need to:');
            console.log('   • Check for any remaining foreign key constraints');
            console.log('   • Run the script again');
            console.log('   • Manually clean up any remaining data');
        }

        console.log('\n✅ You can now test the checkout flow from scratch!');

    } catch (err) {
        console.log('❌ Unexpected error during cleanup:', err.message);
        console.log(err.stack);
    }
}

// Add confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('⚠️  WARNING: This will delete ALL users and related data!');
console.log('This action cannot be undone.');
console.log('');

rl.question('Are you sure you want to proceed? (type "yes" to confirm): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
        cleanupTestUsers().then(() => {
            rl.close();
            process.exit(0);
        }).catch(err => {
            console.log('❌ Script failed:', err.message);
            rl.close();
            process.exit(1);
        });
    } else {
        console.log('❌ Cleanup cancelled');
        rl.close();
        process.exit(0);
    }
});
