#!/usr/bin/env node

// Script to force cleanup database tables that might have foreign key constraints
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

async function forceCleanup() {
    console.log('🧹 Force cleaning all database tables...\n');

    const userId = '2a6d64cd-3b3c-4ccc-842c-3132c4bf0734'; // The stuck user

    try {
        // List all tables and try to delete any records that might reference users
        const tables = [
            'ai_readiness_assessments',
            'enterprise_algorithm_results', 
            'institution_memberships',
            'institutions',
            'auth_password_setup_tokens',
            'user_sessions',
            'user_activities',
            'payments',
            'subscriptions',
            'audit_logs'
        ];

        for (const table of tables) {
            try {
                console.log(`🗑️  Checking table: ${table}`);
                
                // First try to count records
                const { count, error: countError } = await supabaseAdmin
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (countError) {
                    console.log(`   ⚠️  Table doesn't exist or no access: ${table}`);
                    continue;
                }

                console.log(`   📊 Found ${count || 0} records`);

                if (count > 0) {
                    // Try to delete all records
                    const { error: deleteError } = await supabaseAdmin
                        .rpc('delete_all_from_table', { table_name: table })
                        .single();

                    if (deleteError) {
                        // If RPC doesn't work, try direct delete
                        console.log(`   🔄 Trying direct delete...`);
                        const { error: directError } = await supabaseAdmin
                            .from(table)
                            .delete()
                            .not('id', 'is', null);

                        if (directError) {
                            console.log(`   ❌ Could not clean ${table}: ${directError.message}`);
                        } else {
                            console.log(`   ✅ Cleaned ${table}`);
                        }
                    } else {
                        console.log(`   ✅ Cleaned ${table} via RPC`);
                    }
                } else {
                    console.log(`   ✅ ${table} is already empty`);
                }
            } catch (err) {
                console.log(`   ❌ Error with ${table}: ${err.message}`);
            }
        }

        console.log('\n🗑️  Now trying to delete the stuck user...');
        
        // Try to delete the user again
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) {
            console.log(`❌ Still can't delete user: ${error.message}`);
            
            // Try to get more details about what's blocking the deletion
            console.log('\n🔍 Investigating what might be blocking deletion...');
            
            // Check auth.users table directly if possible
            try {
                const { data: userDetails, error: detailError } = await supabaseAdmin
                    .from('auth.users')
                    .select('*')
                    .eq('id', userId);
                
                if (!detailError && userDetails) {
                    console.log('   📋 User details:', userDetails);
                }
            } catch (err) {
                console.log('   ⚠️  Cannot access auth.users table directly');
            }

        } else {
            console.log(`✅ Successfully deleted the stuck user!`);
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }
}

forceCleanup().then(() => process.exit(0)).catch(err => {
    console.log('❌ Script failed:', err.message);
    process.exit(1);
});
