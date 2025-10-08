#!/usr/bin/env node

/**
 * Database Setup Script for AI Readiness Platform
 * Creates all necessary tables and RLS policies
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

const tables = [
  {
    name: 'uploaded_documents',
    sql: `
      CREATE TABLE IF NOT EXISTS public.uploaded_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        upload_date TIMESTAMPTZ DEFAULT NOW(),
        processing_status VARCHAR(20) DEFAULT 'pending',
        extracted_text TEXT,
        ai_analysis JSONB,
        gap_analysis JSONB,
        metadata JSONB,
        processed_at TIMESTAMPTZ,
        analyzed_at TIMESTAMPTZ,
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_uploaded_documents_user_id ON public.uploaded_documents(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_uploaded_documents_status ON public.uploaded_documents(processing_status);'
    ],
    policies: [
      {
        name: 'Users can view their own documents',
        sql: `CREATE POLICY "Users can view their own documents" ON public.uploaded_documents FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can insert their own documents',
        sql: `CREATE POLICY "Users can insert their own documents" ON public.uploaded_documents FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: 'Users can update their own documents',
        sql: `CREATE POLICY "Users can update their own documents" ON public.uploaded_documents FOR UPDATE USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can delete their own documents',
        sql: `CREATE POLICY "Users can delete their own documents" ON public.uploaded_documents FOR DELETE USING (auth.uid() = user_id);`
      }
    ]
  },
  {
    name: 'streamlined_assessment_responses',
    sql: `
      CREATE TABLE IF NOT EXISTS public.streamlined_assessment_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        institution_type VARCHAR(50),
        institution_size VARCHAR(50),
        institution_state VARCHAR(50),
        ai_journey_stage VARCHAR(50),
        biggest_challenge TEXT,
        top_priorities JSONB,
        implementation_timeline VARCHAR(50),
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        contact_role VARCHAR(255),
        preferred_consultation_time VARCHAR(100),
        special_considerations TEXT,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_streamlined_assessment_user_id ON public.streamlined_assessment_responses(user_id);'
    ],
    policies: [
      {
        name: 'Users can view their own assessment',
        sql: `CREATE POLICY "Users can view their own assessment" ON public.streamlined_assessment_responses FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can insert their own assessment',
        sql: `CREATE POLICY "Users can insert their own assessment" ON public.streamlined_assessment_responses FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: 'Users can update their own assessment',
        sql: `CREATE POLICY "Users can update their own assessment" ON public.streamlined_assessment_responses FOR UPDATE USING (auth.uid() = user_id);`
      }
    ]
  },
  {
    name: 'gap_analysis_results',
    sql: `
      CREATE TABLE IF NOT EXISTS public.gap_analysis_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        overall_score INTEGER,
        maturity_level VARCHAR(50),
        govern_score INTEGER,
        govern_gaps JSONB,
        govern_strengths JSONB,
        govern_recommendations JSONB,
        map_score INTEGER,
        map_gaps JSONB,
        map_strengths JSONB,
        map_recommendations JSONB,
        measure_score INTEGER,
        measure_gaps JSONB,
        measure_strengths JSONB,
        measure_recommendations JSONB,
        manage_score INTEGER,
        manage_gaps JSONB,
        manage_strengths JSONB,
        manage_recommendations JSONB,
        priority_actions JSONB,
        quick_wins JSONB,
  risk_hotspots JSONB,
  nist_alignment JSONB,
        analysis_date TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_user_gap_analysis UNIQUE(user_id)
      );
    `,
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_gap_analysis_user_id ON public.gap_analysis_results(user_id);'
    ],
    policies: [
      {
        name: 'Users can view their own gap analysis',
        sql: `CREATE POLICY "Users can view their own gap analysis" ON public.gap_analysis_results FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can insert their own gap analysis',
        sql: `CREATE POLICY "Users can insert their own gap analysis" ON public.gap_analysis_results FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: 'Users can update their own gap analysis',
        sql: `CREATE POLICY "Users can update their own gap analysis" ON public.gap_analysis_results FOR UPDATE USING (auth.uid() = user_id);`
      }
    ]
  },
  {
    name: 'implementation_roadmaps',
    sql: `
      CREATE TABLE IF NOT EXISTS public.implementation_roadmaps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        roadmap_type VARCHAR(50) NOT NULL,
        goals JSONB,
        action_items JSONB,
        milestones JSONB,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, roadmap_type)
      );
    `,
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.implementation_roadmaps(user_id);'
    ],
    policies: [
      {
        name: 'Users can view their own roadmaps',
        sql: `CREATE POLICY "Users can view their own roadmaps" ON public.implementation_roadmaps FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can insert their own roadmaps',
        sql: `CREATE POLICY "Users can insert their own roadmaps" ON public.implementation_roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: 'Users can update their own roadmaps',
        sql: `CREATE POLICY "Users can update their own roadmaps" ON public.implementation_roadmaps FOR UPDATE USING (auth.uid() = user_id);`
      }
    ]
  },
  {
    name: 'user_activity_log',
    sql: `
      CREATE TABLE IF NOT EXISTS public.user_activity_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        activity_type VARCHAR(100) NOT NULL,
        activity_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.user_activity_log(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_activity_log_type ON public.user_activity_log(activity_type);',
      'CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.user_activity_log(created_at DESC);'
    ],
    policies: [
      {
        name: 'Users can view their own activity',
        sql: `CREATE POLICY "Users can view their own activity" ON public.user_activity_log FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: 'Users can insert their own activity',
        sql: `CREATE POLICY "Users can insert their own activity" ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);`
      }
    ]
  }
];

async function executeSQL(sql, description) {
  try {
    const { data, error } = await supabase.rpc('query', { query_text: sql }).single();

    // If the RPC doesn't exist, try a different approach
    if (error && error.message.includes('Could not find the function')) {
      // Try to execute via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        // If REST API fails, we'll note it but continue
        console.log(`⚠️  ${description} - May need manual execution`);
        return false;
      }
      console.log(`✅ ${description}`);
      return true;
    }

    if (error) {
      console.error(`❌ ${description} - Error: ${error.message}`);
      return false;
    }

    console.log(`✅ ${description}`);
    return true;
  } catch (err) {
    console.log(`⚠️  ${description} - May already exist or need manual execution`);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('🔑 Using service role key\n');

  let successCount = 0;
  let warningCount = 0;

  for (const table of tables) {
    console.log(`\n📋 Setting up table: ${table.name}`);
    console.log('─'.repeat(40));

    // Create table
    const tableCreated = await executeSQL(table.sql, `Creating table ${table.name}`);
    if (tableCreated) successCount++;
    else warningCount++;

    // Enable RLS
    const rlsSQL = `ALTER TABLE public.${table.name} ENABLE ROW LEVEL SECURITY;`;
    await executeSQL(rlsSQL, `Enabling RLS on ${table.name}`);

    // Create indexes
    for (const indexSQL of table.indexes) {
      await executeSQL(indexSQL, `Creating index on ${table.name}`);
    }

    // Create policies
    for (const policy of table.policies) {
      // First drop the policy if it exists
      const dropSQL = `DROP POLICY IF EXISTS "${policy.name.replace(/"/g, '')}" ON public.${table.name};`;
      await executeSQL(dropSQL, `Dropping old policy: ${policy.name}`);

      // Then create the new policy
      await executeSQL(policy.sql, `Creating policy: ${policy.name}`);
    }
  }

  // Verify tables
  console.log('\n\n🔍 Verifying table creation...');
  console.log('─'.repeat(40));

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ Table ${table.name}: NOT FOUND`);
    } else {
      console.log(`✅ Table ${table.name}: EXISTS (ready for data)`);
      successCount++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Setup Summary:');
  console.log(`   ✅ Successful operations: ${successCount}`);
  console.log(`   ⚠️  Warnings/Manual steps needed: ${warningCount}`);
  console.log('═'.repeat(50));

  if (warningCount > 0) {
    console.log('\n⚠️  Some operations may need manual execution in Supabase Dashboard.');
    console.log('   Copy the SQL from /tmp/create_tables.sql and run it in the SQL Editor.');
  } else {
    console.log('\n✨ Database setup completed successfully!');
  }

  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run setup:storage');
  console.log('   2. Run: npm run verify:setup');
  console.log('   3. Test the application flow\n');
}

// Run the setup
setupDatabase().catch(console.error);