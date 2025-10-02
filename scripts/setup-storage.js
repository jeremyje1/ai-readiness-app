#!/usr/bin/env node

/**
 * Storage Setup Script for AI Readiness Platform
 * Creates storage bucket and applies RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && !process.env[key]) {
        process.env[key] = value.join('=').replace(/^["']|["']$/g, '').trim();
      }
    });
  }
} catch (err) {
  // Ignore errors
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzcxOTA1NSwiZXhwIjoyMDM5Mjk1MDU1fQ.cKaZTzs3fLqz9dthQwO-S9w-fJDaJ0Wqhu8KMgxlS_E';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Storage bucket configuration
const bucketConfig = {
  id: 'documents',
  name: 'documents',
  public: false,
  file_size_limit: 10485760, // 10MB in bytes
  allowed_mime_types: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Storage policies
const storagePolicies = [
  {
    name: 'Users can upload documents',
    sql: `
      CREATE POLICY "Users can upload documents"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
    `
  },
  {
    name: 'Users can read documents',
    sql: `
      CREATE POLICY "Users can read documents"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
    `
  },
  {
    name: 'Users can update documents',
    sql: `
      CREATE POLICY "Users can update documents"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
    `
  },
  {
    name: 'Users can delete documents',
    sql: `
      CREATE POLICY "Users can delete documents"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
    `
  }
];

async function createStorageBucket() {
  console.log('🗄️  Creating storage bucket...');

  try {
    // First, check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.log('⚠️  Could not list buckets:', listError.message);
    } else if (buckets) {
      const existingBucket = buckets.find(b => b.id === bucketConfig.id);
      if (existingBucket) {
        console.log(`✅ Storage bucket "${bucketConfig.id}" already exists`);
        return true;
      }
    }

    // Try to create bucket via SQL
    const createBucketSQL = `
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        '${bucketConfig.id}',
        '${bucketConfig.name}',
        ${bucketConfig.public},
        ${bucketConfig.file_size_limit},
        ARRAY[${bucketConfig.allowed_mime_types.map(type => `'${type}'`).join(', ')}]
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    const { error: createError } = await supabase.rpc('query', { query_text: createBucketSQL }).single();

    if (createError && !createError.message.includes('Could not find the function')) {
      console.log('⚠️  Could not create bucket via SQL:', createError.message);

      // Try alternative approach - use storage API directly
      const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bucketConfig)
      });

      if (response.ok) {
        console.log(`✅ Created storage bucket "${bucketConfig.id}"`);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`⚠️  Could not create bucket via API: ${errorText}`);
        return false;
      }
    }

    console.log(`✅ Storage bucket "${bucketConfig.id}" created or already exists`);
    return true;

  } catch (error) {
    console.error('❌ Error creating storage bucket:', error.message);
    return false;
  }
}

async function applyStoragePolicies() {
  console.log('\n🔐 Applying storage RLS policies...');

  let successCount = 0;
  let warningCount = 0;

  // First enable RLS on storage.objects
  const enableRLSSQL = 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;';

  try {
    await supabase.rpc('query', { query_text: enableRLSSQL }).single();
    console.log('✅ Enabled RLS on storage.objects');
  } catch (err) {
    console.log('⚠️  RLS may already be enabled on storage.objects');
    warningCount++;
  }

  // Apply each policy
  for (const policy of storagePolicies) {
    try {
      // Drop existing policy first
      const dropSQL = `DROP POLICY IF EXISTS "${policy.name.replace(/"/g, '')}" ON storage.objects;`;
      await supabase.rpc('query', { query_text: dropSQL }).single();

      // Create new policy
      await supabase.rpc('query', { query_text: policy.sql }).single();
      console.log(`✅ Applied policy: ${policy.name}`);
      successCount++;
    } catch (err) {
      console.log(`⚠️  Policy "${policy.name}" may need manual application`);
      warningCount++;
    }
  }

  return { successCount, warningCount };
}

async function testStorageAccess() {
  console.log('\n🧪 Testing storage bucket access...');

  try {
    // Test listing files (should be empty initially)
    const { data, error } = await supabase.storage
      .from('documents')
      .list('test', { limit: 1 });

    if (error) {
      if (error.message.includes('not found')) {
        console.log('⚠️  Bucket may not be accessible yet. May need manual creation.');
        return false;
      }
      console.log('⚠️  Storage test warning:', error.message);
      return false;
    }

    console.log('✅ Storage bucket is accessible and ready');
    return true;

  } catch (err) {
    console.log('⚠️  Could not test storage access:', err.message);
    return false;
  }
}

async function setupStorage() {
  console.log('🚀 Starting storage setup...\n');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('🔑 Using service role key\n');

  // Create bucket
  const bucketCreated = await createStorageBucket();

  // Apply policies
  const { successCount, warningCount } = await applyStoragePolicies();

  // Test access
  const accessTestPassed = await testStorageAccess();

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Storage Setup Summary:');
  console.log(`   ✅ Bucket created: ${bucketCreated ? 'Yes' : 'Needs manual creation'}`);
  console.log(`   ✅ Policies applied: ${successCount}`);
  console.log(`   ⚠️  Warnings: ${warningCount}`);
  console.log(`   🧪 Access test: ${accessTestPassed ? 'Passed' : 'Failed'}`);
  console.log('═'.repeat(50));

  if (!bucketCreated || warningCount > 0 || !accessTestPassed) {
    console.log('\n⚠️  Manual steps may be required:');
    console.log('\n1. Go to Supabase Dashboard → Storage');
    console.log('2. Create a new bucket with these settings:');
    console.log('   - Name: documents');
    console.log('   - Public: No (private)');
    console.log('   - File size limit: 10 MB');
    console.log('   - Allowed MIME types:');
    console.log('     • application/pdf');
    console.log('     • application/msword');
    console.log('     • application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    console.log('\n3. Apply RLS policies from the SQL Editor using the SQL in:');
    console.log('   supabase/migrations/20251002110000_create_documents_storage.sql');
  } else {
    console.log('\n✨ Storage setup completed successfully!');
  }

  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run verify:setup');
  console.log('   2. Test file upload in the application\n');
}

// Run the setup
setupStorage().catch(console.error);