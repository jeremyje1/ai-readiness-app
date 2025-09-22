#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying password token cleanup function migration...\n');

  const migrationSQL = `
    -- Drop existing function if it exists
    drop function if exists public.delete_expired_password_tokens();

    -- Create the function that returns the count of deleted rows
    create or replace function public.delete_expired_password_tokens()
    returns integer
    language sql
    security definer
    set search_path = public
    as $$
      with deleted as (
        delete from auth_password_setup_tokens
        where used_at is not null
           or expires_at < now()
        returning 1
      )
      select coalesce(count(*)::integer, 0) from deleted;
    $$;

    -- Add documentation
    comment on function public.delete_expired_password_tokens() is 'Deletes used or expired password setup tokens and returns the number of rows deleted';

    -- Grant execute permissions
    grant execute on function public.delete_expired_password_tokens() to authenticated;
    grant execute on function public.delete_expired_password_tokens() to service_role;
  `;

  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('query', { 
      query_text: migrationSQL 
    }).single();

    if (error) {
      // If the query RPC doesn't exist, try using the SQL editor approach
      console.log('⚠️  Direct RPC not available, trying alternative method...');
      
      // Split the migration into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        
        // We'll need to use the Supabase dashboard for this
        console.log('Statement to run:', statement + ';');
      }

      console.log('\n📋 Migration SQL has been prepared.');
      console.log('Please run the following SQL in your Supabase Dashboard:');
      console.log('1. Go to: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/sql/new');
      console.log('2. Copy and paste the SQL below:');
      console.log('─'.repeat(60));
      console.log(migrationSQL);
      console.log('─'.repeat(60));
      console.log('3. Click "Run" to execute the migration\n');
      
      return;
    }

    console.log('✅ Migration applied successfully!');
    
    // Test the function
    console.log('\n🧪 Testing the function...');
    const { data: testData, error: testError } = await supabase.rpc('delete_expired_password_tokens');
    
    if (testError) {
      console.error('❌ Function test failed:', testError.message);
    } else {
      console.log(`✅ Function works! Deleted ${testData || 0} expired tokens.`);
    }

  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
    console.log('\n📋 Please apply the migration manually via Supabase Dashboard');
    console.log('SQL Editor URL: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/sql/new');
  }
}

applyMigration();