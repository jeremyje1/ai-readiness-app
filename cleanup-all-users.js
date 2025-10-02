const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6InNlcnZpY2Vfa2V5IiwiaWF0IjoxNzUzMjMxMTc2LCJleHAiOjI2ODg4MDcxNzZ9.SWFmf85IiPb-JRRoJ8dJH_PlBvOUJJOZvNPBBBB3iuI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupAllUsers() {
    console.log('🧹 Starting complete user cleanup...\n');

    try {
        // First, list all users
        const { data: users, error: listError } = await supabase
            .from('auth.users')
            .select('id, email, created_at');

        if (listError) {
            console.log('Trying alternative method to list users...');

            // Try using the auth admin API instead
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

            if (authError) {
                console.error('❌ Error listing users:', authError);
                return;
            }

            console.log(`Found ${authUsers.users.length} users to delete:\n`);

            // Delete each user
            let deletedCount = 0;
            let errorCount = 0;

            for (const user of authUsers.users) {
                console.log(`Deleting user: ${user.email} (${user.id})`);

                try {
                    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

                    if (deleteError) {
                        console.error(`  ❌ Error deleting ${user.email}:`, deleteError.message);
                        errorCount++;
                    } else {
                        console.log(`  ✅ Deleted ${user.email}`);
                        deletedCount++;
                    }
                } catch (err) {
                    console.error(`  ❌ Unexpected error deleting ${user.email}:`, err.message);
                    errorCount++;
                }
            }

            console.log('\n📊 Cleanup Summary:');
            console.log(`  ✅ Successfully deleted: ${deletedCount} users`);
            console.log(`  ❌ Failed to delete: ${errorCount} users`);

        } else {
            console.log(`Found ${users.length} users in auth.users table`);
            // This path likely won't work due to RLS, but keeping for completeness
        }

        // Clean up related tables (these might fail due to cascade deletes or RLS)
        console.log('\n🧹 Cleaning up related tables...');

        const tablesToClean = [
            'user_profiles',
            'institution_memberships',
            'ai_assessments',
            'payments',
            'stripe_customers',
            'password_setup_tokens'
        ];

        for (const table of tablesToClean) {
            try {
                const { error } = await supabase
                    .from(table)
                    .delete()
                    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

                if (error) {
                    console.log(`  ⚠️  Could not clean ${table}: ${error.message}`);
                } else {
                    console.log(`  ✅ Cleaned ${table}`);
                }
            } catch (err) {
                console.log(`  ⚠️  Could not clean ${table}: ${err.message}`);
            }
        }

        console.log('\n✅ Cleanup complete!');
        console.log('\n💡 You can now test Chrome signup and login with fresh users.');
        console.log('   Test with emails like: test@example.com, chrome@test.com, etc.');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// Confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('⚠️  WARNING: This will delete ALL users from the database!');
console.log('⚠️  This action cannot be undone.\n');

rl.question('Are you sure you want to proceed? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
        cleanupAllUsers();
    } else {
        console.log('❌ Cleanup cancelled.');
    }
    rl.close();
});