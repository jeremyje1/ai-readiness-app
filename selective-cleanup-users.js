#!/usr/bin/env node

// Script to selectively clean up users and related data
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const readline = require('readline');

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

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

async function selectiveCleanup() {
    console.log('🧹 Selective User Cleanup Tool\n');

    try {
        // Step 1: List all users
        console.log('📋 Fetching all users...');
        const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
            console.log('❌ Error listing users:', listError.message);
            rl.close();
            return;
        }

        const users = userData.users;
        console.log(`Found ${users.length} users total\n`);

        if (users.length === 0) {
            console.log('✅ No users to clean up!');
            rl.close();
            return;
        }

        // Show all users
        console.log('👥 Current users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
            console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
            console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}\n`);
        });

        // Ask user what to do
        console.log('Choose an option:');
        console.log('1. Delete ALL users and data');
        console.log('2. Delete only test users (keep jeremy.estrella@gmail.com)');
        console.log('3. Select specific users to delete');
        console.log('4. Cancel\n');

        const choice = await askQuestion('Enter your choice (1-4): ');

        let usersToDelete = [];

        switch (choice) {
            case '1':
                usersToDelete = users;
                break;

            case '2':
                // Keep only jeremy.estrella@gmail.com
                usersToDelete = users.filter(u => u.email !== 'jeremy.estrella@gmail.com');
                break;

            case '3':
                // Allow selecting specific users
                console.log('\nEnter the numbers of users to DELETE (comma-separated, e.g., 1,3,4):');
                const selections = await askQuestion('User numbers: ');
                const indices = selections.split(',').map(s => parseInt(s.trim()) - 1);
                usersToDelete = indices.map(i => users[i]).filter(Boolean);
                break;

            case '4':
                console.log('❌ Cleanup cancelled');
                rl.close();
                return;

            default:
                console.log('❌ Invalid choice');
                rl.close();
                return;
        }

        if (usersToDelete.length === 0) {
            console.log('✅ No users selected for deletion');
            rl.close();
            return;
        }

        // Show what will be deleted
        console.log('\n⚠️  The following users will be DELETED:');
        usersToDelete.forEach(user => {
            console.log(`   - ${user.email}`);
        });

        const confirm = await askQuestion('\nAre you sure? Type "yes" to confirm: ');
        if (confirm.toLowerCase() !== 'yes') {
            console.log('❌ Cleanup cancelled');
            rl.close();
            return;
        }

        console.log('\n🗑️  Starting cleanup...\n');

        // Clean up related data for users being deleted
        const userIds = usersToDelete.map(u => u.id);

        // Clean assessment results
        const { count: assessmentCount } = await supabaseAdmin
            .from('ai_readiness_assessments')
            .delete()
            .in('user_id', userIds);
        console.log(`✅ Cleaned ${assessmentCount || 0} assessment records`);

        // Clean enterprise algorithm results
        const { count: algorithmCount } = await supabaseAdmin
            .from('enterprise_algorithm_results')
            .delete()
            .in('assessment_user_id', userIds);
        console.log(`✅ Cleaned ${algorithmCount || 0} algorithm result records`);

        // Clean institution memberships
        const { count: membershipCount } = await supabaseAdmin
            .from('institution_memberships')
            .delete()
            .in('user_id', userIds);
        console.log(`✅ Cleaned ${membershipCount || 0} membership records`);

        // Clean password setup tokens
        const { count: tokenCount } = await supabaseAdmin
            .from('auth_password_setup_tokens')
            .delete()
            .in('user_id', userIds);
        console.log(`✅ Cleaned ${tokenCount || 0} password setup tokens`);

        // Delete auth users
        console.log('\n🗑️  Deleting auth users...');
        let deletedCount = 0;

        for (const user of usersToDelete) {
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

        console.log('\n🎉 Cleanup complete!');
        console.log(`📊 Summary:`);
        console.log(`   • Deleted ${deletedCount}/${usersToDelete.length} users`);
        console.log(`   • Kept ${users.length - usersToDelete.length} users`);

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }

    rl.close();
}

// Run the cleanup
selectiveCleanup();