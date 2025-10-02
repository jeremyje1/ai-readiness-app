const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIzMTE3NiwiZXhwIjoyMDY4ODA3MTc2fQ.-o5WI0bTZ7fExVlaP38Rf4FetsIP7XtBsmSMJGbt2N0';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUser() {
  console.log('🔍 Checking user estrellasandstars@outlook.com...\n');

  // Check if user exists in auth.users
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.log('❌ Error listing users:', error.message);
    return;
  }

  const user = users.find(u => u.email === 'estrellasandstars@outlook.com');

  if (!user) {
    console.log('❌ User not found in database');
    console.log('📝 This user needs to be created first');
    console.log('\nAttempting to create user...');

    // Create the user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'estrellasandstars@outlook.com',
      password: 'Thinmin11',
      email_confirm: true
    });

    if (createError) {
      console.log('❌ Error creating user:', createError.message);
      return;
    }

    console.log('✅ User created successfully!');
    console.log('User ID:', newUser.user.id);
    console.log('Email:', newUser.user.email);
    return;
  }

  console.log('✅ User found!');
  console.log('User ID:', user.id);
  console.log('Email:', user.email);
  console.log('Email confirmed:', user.email_confirmed_at ? '✅ Yes' : '❌ Not confirmed');
  console.log('Created at:', new Date(user.created_at).toLocaleString());
  console.log('Last sign in:', user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never');
  console.log('Banned:', user.banned ? 'Yes' : 'No');

  // Check user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', 'estrellasandstars@outlook.com')
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.log('\n⚠️  Profile check error:', profileError.message);
  } else if (profile) {
    console.log('\n👤 User Profile:');
    console.log('Full name:', profile.full_name || 'Not set');
    console.log('Institution:', profile.institution_name || 'Not set');
    console.log('Onboarding complete:', profile.onboarding_completed ? 'Yes' : 'No');
    console.log('Subscription status:', profile.subscription_status || 'None');
  } else {
    console.log('\n⚠️  No user profile found');
  }

  // Check payment/subscription data
  const { data: payments, error: paymentError } = await supabase
    .from('user_payments')
    .select('*')
    .eq('user_id', user.id);

  if (!paymentError && payments && payments.length > 0) {
    console.log('\n💳 Payment Records:', payments.length);
    payments.forEach((p, i) => {
      console.log(`  ${i + 1}. Status: ${p.payment_status}, Amount: $${p.amount}, Date: ${new Date(p.created_at).toLocaleDateString()}`);
    });
  } else {
    console.log('\n💳 No payment records found');
  }
}

checkUser().catch(console.error);
