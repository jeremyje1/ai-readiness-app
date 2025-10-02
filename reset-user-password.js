const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6InNlcnZpY2Vfa2V5IiwiaWF0IjoxNzUzMjMxMTc2LCJleHAiOjI2ODg4MDcxNzZ9.SWFmf85IiPb-JRRoJ8dJH_PlBvOUJJOZvNPBBBB3iuI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword(email, newPassword) {
    console.log(`🔐 Resetting password for: ${email}`);

    try {
        // First, find the user
        const { data: users, error: searchError } = await supabase.auth.admin.listUsers({
            filter: `email.eq.${email}`
        });

        if (searchError) {
            console.error('❌ Error searching for user:', searchError);
            return;
        }

        if (!users || users.users.length === 0) {
            console.error('❌ User not found with email:', email);
            return;
        }

        const user = users.users[0];
        console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

        // Update the user's password
        const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            {
                password: newPassword,
                email_confirm: true // Ensure email is confirmed
            }
        );

        if (updateError) {
            console.error('❌ Error updating password:', updateError);
            return;
        }

        console.log('✅ Password successfully updated!');
        console.log('📧 Email:', updatedUser.user.email);
        console.log('🔑 New password:', newPassword);
        console.log('\n🎉 You can now login with your new password!');

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
    console.log('Usage: node reset-user-password.js <email> <new-password>');
    console.log('Example: node reset-user-password.js jeremy.estrella@gmail.com newpassword123');
    process.exit(1);
}

const [email, newPassword] = args;

// Validate password length
if (newPassword.length < 6) {
    console.error('❌ Password must be at least 6 characters long');
    process.exit(1);
}

resetPassword(email, newPassword);