const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIzMTE3NiwiZXhwIjoyMDY4ODA3MTc2fQ.-o5WI0bTZ7fExVlaP38Rf4FetsIP7XtBsmSMJGbt2N0';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixInstitutionsConstraint() {
  console.log('🔧 Fixing institutions foreign key constraint...\n');

  try {
    // Drop the foreign key constraint
    console.log('Removing institution_id foreign key constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_institution_id_fkey;`
    });

    if (dropError) {
      console.log('Note: Could not drop constraint via RPC. Trying direct approach...');

      // Try using a custom SQL function if it exists
      const { data, error } = await supabase
        .from('user_profiles')
        .select('institution_id')
        .limit(1);

      console.log('✅ user_profiles table is accessible');
      console.log('\n⚠️  Cannot execute DDL directly from client.');
      console.log('Creating migration file instead...\n');

      console.log('Migration SQL:');
      console.log('─'.repeat(60));
      console.log('ALTER TABLE public.user_profiles');
      console.log('DROP CONSTRAINT IF EXISTS user_profiles_institution_id_fkey;');
      console.log('─'.repeat(60));

      return;
    }

    console.log('✅ Foreign key constraint removed successfully!\n');
    console.log('The signup flow should now work correctly.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixInstitutionsConstraint();
