const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIzMTE3NiwiZXhwIjoyMDY4ODA3MTc2fQ.-o5WI0bTZ7fExVlaP38Rf4FetsIP7XtBsmSMJGbt2N0';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetUser() {
  console.log('🔄 Resetting password for estrellasandstars@outlook.com...\n');

  // Update user password
  const { data, error } = await supabase.auth.admin.updateUserById(
    '6464fdb3-9483-4631-a216-e8951d5ddcaa',
    { password: 'Thinmin11' }
  );

  if (error) {
    console.log('❌ Error updating password:', error.message);
    return;
  }

  console.log('✅ Password reset successfully!');
  console.log('Email:', data.user.email);

  // Create user profile if it doesn't exist
  console.log('\n📝 Creating user profile...');

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: '6464fdb3-9483-4631-a216-e8951d5ddcaa',
      email: 'estrellasandstars@outlook.com',
      full_name: 'Test User',
      onboarding_completed: false,
      subscription_status: 'inactive'
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (profileError) {
    console.log('⚠️  Error creating profile:', profileError.message);
  } else {
    console.log('✅ User profile created/updated!');
  }

  // Now test login
  console.log('\n🔐 Testing login...');

  const anonClient = createClient(
    supabaseUrl,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA'
  );

  const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
    email: 'estrellasandstars@outlook.com',
    password: 'Thinmin11'
  });

  if (loginError) {
    console.log('❌ Login test failed:', loginError.message);
    return;
  }

  console.log('✅ Login test successful!');
  console.log('User can now log in with:');
  console.log('  Email: estrellasandstars@outlook.com');
  console.log('  Password: Thinmin11');
  console.log('\n🎯 Next step: Login redirects to /auth/success');
}

resetUser().catch(console.error);
