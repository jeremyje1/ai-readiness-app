#!/usr/bin/env node

/**
 * Apply phone column migration using Supabase Management API
 * Run: node run-phone-migration.js
 */

const https = require('https');

const SUPABASE_ACCESS_TOKEN = 'sbp_b9fcfc408d748a1076382707e60a8bbf5a39fd48';
const SUPABASE_PROJECT_REF = 'jocigzsthcpspxfdfxae';

const SQL_MIGRATION = `
-- Add phone column to demo_leads table
ALTER TABLE demo_leads ADD COLUMN IF NOT EXISTS phone TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'demo_leads'
  AND column_name = 'phone';
`.trim();

async function runMigration() {
    console.log('🚀 Running phone column migration...\n');
    console.log('Project:', SUPABASE_PROJECT_REF);
    console.log('\nSQL to execute:');
    console.log('─'.repeat(50));
    console.log(SQL_MIGRATION);
    console.log('─'.repeat(50));
    console.log('\n📡 Sending request to Supabase...\n');

    const postData = JSON.stringify({
        query: SQL_MIGRATION
    });

    const options = {
        hostname: 'api.supabase.com',
        port: 443,
        path: `/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('Response Status:', res.statusCode);
                console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
                console.log('\nResponse Body:');
                console.log(data);

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('\n✅ Migration completed successfully!');

                    try {
                        const result = JSON.parse(data);
                        if (result.result) {
                            console.log('\n📊 Migration result:');
                            console.log(JSON.stringify(result.result, null, 2));
                        }
                    } catch (e) {
                        console.log('Response:', data);
                    }

                    resolve();
                } else {
                    console.error('\n❌ Migration failed!');
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('\n❌ Request failed:', error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Run the migration
runMigration()
    .then(() => {
        console.log('\n🎉 All done! The phone column has been added to demo_leads.');
        console.log('\n📋 Next steps:');
        console.log('  1. Test the demo form at: https://aiblueprint.educationaiblueprint.com/demo');
        console.log('  2. Submit a test registration');
        console.log('  3. Verify no 500 errors occur');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('  - Verify access token is valid');
        console.log('  - Check project ref is correct');
        console.log('  - Try running SQL manually in Supabase Dashboard');
        process.exit(1);
    });
