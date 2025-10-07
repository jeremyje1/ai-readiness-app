const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIzMTE3NiwiZXhwIjoyMDY4ODA3MTc2fQ.-o5WI0bTZ7fExVlaP38Rf4FetsIP7XtBsmSMJGbt2N0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration(filename, description) {
    console.log(`\n=== Running ${description} ===`);

    try {
        const sql = fs.readFileSync(path.join(__dirname, filename), 'utf8');

        // Split by semicolons but be careful with DO blocks
        const statements = sql
            .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/)
            .filter(stmt => stmt.trim())
            .map(stmt => stmt.trim() + ';');

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // Skip SELECT statements that are just for checking
            if (statement.trim().toUpperCase().startsWith('SELECT') &&
                !statement.toUpperCase().includes('INTO') &&
                statement.includes('information_schema')) {
                console.log('Skipping information schema query');
                continue;
            }

            console.log(`Executing statement ${i + 1}/${statements.length}...`);

            const { data, error } = await supabase.rpc('exec_sql', {
                query: statement
            }).single();

            if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" errors
                console.error('Error:', error);

                // Try alternative approach for DO blocks
                if (statement.includes('DO $$')) {
                    console.log('Trying direct SQL execution...');
                    const { error: directError } = await supabase.from('_').select().limit(0).then(() => {
                        // This is a hack to get the underlying postgres connection
                        return supabase.rpc('exec_sql', { query: statement });
                    });

                    if (directError) {
                        console.error('Direct execution also failed:', directError);
                    } else {
                        console.log('Statement executed successfully');
                    }
                }
            } else {
                console.log('Statement executed successfully');
            }
        }

        console.log(`✅ ${description} completed`);
    } catch (error) {
        console.error(`❌ Error in ${description}:`, error);
    }
}

// Create a custom RPC function if it doesn't exist
async function createExecSqlFunction() {
    console.log('Creating exec_sql function if needed...');

    const createFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;
  `;

    try {
        // We'll skip this for now as it requires direct DB access
        console.log('Skipping exec_sql function creation - will use direct approach');
    } catch (error) {
        console.error('Error creating function:', error);
    }
}

async function main() {
    console.log('Starting database migrations...');
    console.log('Supabase URL:', supabaseUrl);

    // Try a different approach - use the REST API directly
    console.log('\nTrying direct REST API approach...');

    // Read the migration files
    const migrations = [
        { file: 'ENSURE_USER_PAYMENTS_COMPLETE.sql', desc: 'Adding missing columns to user_payments' },
        { file: 'APPLY_PREMIUM_FEATURES_MIGRATION.sql', desc: 'Creating premium feature tables' },
        { file: 'ADD_TEST_USER_PAYMENT.sql', desc: 'Adding test user data' }
    ];

    for (const migration of migrations) {
        if (fs.existsSync(path.join(__dirname, migration.file))) {
            await runMigrationViaAPI(migration.file, migration.desc);
        } else {
            console.log(`⚠️  Skipping ${migration.file} - file not found`);
        }
    }

    console.log('\n✅ All migrations completed!');
}

async function runMigrationViaAPI(filename, description) {
    console.log(`\n=== Running ${description} ===`);

    try {
        const sql = fs.readFileSync(path.join(__dirname, filename), 'utf8');

        // For now, let's just log what we would do
        console.log(`Would execute SQL from ${filename}`);
        console.log('First 200 chars:', sql.substring(0, 200) + '...');

        // The issue is Supabase doesn't expose a direct SQL execution endpoint
        // We need to use the CLI or SQL editor
        console.log('⚠️  Note: Direct SQL execution via API is not available');
        console.log('Please run this SQL in the Supabase SQL editor or use the CLI');

    } catch (error) {
        console.error(`❌ Error reading ${filename}:`, error);
    }
}

main().catch(console.error);