#!/usr/bin/env node

// Script to force cleanup the test@aiblueprint.com user
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

async function forceCleanupTestUser() {
    console.log('🧹 Force cleaning test@aiblueprint.com...\n');

    const testUserId = '4db60f00-0562-4bdf-94ef-f47776c98708';

    try {
        // List of all possible tables that might have user references
        const tables = [
            { name: 'user_payments', column: 'user_id' },
            { name: 'ai_readiness_assessments', column: 'user_id' },
            { name: 'enterprise_algorithm_results', column: 'assessment_user_id' },
            { name: 'institution_memberships', column: 'user_id' },
            { name: 'auth_password_setup_tokens', column: 'user_id' },
            { name: 'user_sessions', column: 'user_id' },
            { name: 'user_activities', column: 'user_id' },
            { name: 'payments', column: 'user_id' },
            { name: 'subscriptions', column: 'user_id' },
            { name: 'audit_logs', column: 'user_id' },
            { name: 'profiles', column: 'id' },
            { name: 'password_reset_tokens', column: 'user_id' },
            { name: 'user_roles', column: 'user_id' },
            { name: 'user_preferences', column: 'user_id' }
        ];

        console.log('🗑️  Cleaning all related data for test user...');

        for (const table of tables) {
            try {
                const { count, error } = await supabaseAdmin
                    .from(table.name)
                    .delete()
                    .eq(table.column, testUserId);

                if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
                    console.log(`⚠️  ${table.name}: ${error.message}`);
                } else if (count && count > 0) {
                    console.log(`✅ Cleaned ${count} records from ${table.name}`);
                }
            } catch (err) {
                // Table might not exist, that's okay
            }
        }

        // Also try to clean up any institutions owned by this user
        console.log('\n🏢 Checking for institutions owned by test user...');
        const { data: institutions, error: instError } = await supabaseAdmin
            .from('institutions')
            .select('id')
            .eq('created_by', testUserId);

        if (institutions && institutions.length > 0) {
            console.log(`Found ${institutions.length} institutions to clean`);

            // First clean memberships for these institutions
            for (const inst of institutions) {
                await supabaseAdmin
                    .from('institution_memberships')
                    .delete()
                    .eq('institution_id', inst.id);
            }

            // Then delete the institutions
            const { count } = await supabaseAdmin
                .from('institutions')
                .delete()
                .eq('created_by', testUserId);

            console.log(`✅ Deleted ${count || 0} institutions`);
        }

        // Now try to delete the user again
        console.log('\n🗑️  Attempting to delete test@aiblueprint.com user...');
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(testUserId);

        if (deleteError) {
            console.log('❌ Still cannot delete user:', deleteError.message);
            console.log('\n💡 Trying alternative approach...');

            // Try using raw SQL through Supabase
            const { error: sqlError } = await supabaseAdmin.rpc('delete_user_cascade', {
                user_id: testUserId
            }).catch(() => ({ error: 'Function not available' }));

            if (sqlError) {
                console.log('❌ Alternative approach failed:', sqlError);
                console.log('\n⚠️  The user might have data in auth.users table that requires manual deletion in Supabase dashboard.');
            }
        } else {
            console.log('✅ Successfully deleted test@aiblueprint.com!');
        }

        // Final check
        console.log('\n📋 Final check...');
        const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
        const remainingUsers = userData?.users || [];

        console.log(`\n📊 Remaining users: ${remainingUsers.length}`);
        if (remainingUsers.length > 0) {
            remainingUsers.forEach(u => console.log(`   - ${u.email}`));
        } else {
            console.log('✅ Database is completely clean!');
        }

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

// Run the cleanup
forceCleanupTestUser();