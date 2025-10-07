const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
    try {
        // Read and run premium features migration
        console.log('Running premium features migration...');
        const migrationSql = fs.readFileSync(
            path.join(__dirname, 'database/migrations/premium_features.sql'),
            'utf8'
        );

        const { error: migrationError } = await supabase.rpc('exec_sql', {
            sql: migrationSql
        });

        if (migrationError) {
            console.error('Migration error:', migrationError);
            // Try running directly
            const { data, error } = await supabase.from('_sql').select().single();
            console.log('Alternative approach needed');
        } else {
            console.log('Premium features migration completed successfully');
        }

        // Run seed data
        console.log('Running seed data...');
        const seedSql = fs.readFileSync(
            path.join(__dirname, 'database/seed-premium-data.sql'),
            'utf8'
        );

        const { error: seedError } = await supabase.rpc('exec_sql', {
            sql: seedSql
        });

        if (seedError) {
            console.error('Seed error:', seedError);
        } else {
            console.log('Seed data applied successfully');
        }

    } catch (error) {
        console.error('Error running migrations:', error);
    }
}

runMigrations();