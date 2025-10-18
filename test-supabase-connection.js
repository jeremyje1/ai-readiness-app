#!/usr/bin/env node

/**
 * Test Supabase Database Connection
 * 
 * This script tests your SUPABASE_DB_URL to verify the password is correct.
 * Run: node test-supabase-connection.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
let connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/SUPABASE_DB_URL=["']?([^"'\n]+)["']?/);
        if (match) {
            connectionString = match[1];
        }
    }
}

if (!connectionString) {
    console.error('❌ SUPABASE_DB_URL not found in .env.local');
    console.error('');
    console.error('Add to .env.local:');
    console.error('SUPABASE_DB_URL="postgresql://postgres.jocigzsthcpspxfdfxae:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"');
    console.error('');
    console.error('Replace [PASSWORD] with your actual database password.');
    process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log('');

// Parse connection string to show details (without password)
const urlMatch = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (urlMatch) {
    const [, user, password, host, port, database] = urlMatch;
    console.log('Connection details:');
    console.log(`  Host: ${host}`);
    console.log(`  Port: ${port}`);
    console.log(`  Database: ${database}`);
    console.log(`  User: ${user}`);
    console.log(`  Password: ${'*'.repeat(password.length)} (${password.length} characters)`);
    console.log('');

    // Check for common issues
    if (port === '6543') {
        console.warn('⚠️  WARNING: You\'re using port 6543 (Transaction pooler)');
        console.warn('   For seeding/migrations, use port 5432 (Direct connection)');
        console.warn('');
    }

    // Check for unencoded special characters
    const specialChars = ['@', '#', '&', '!', '$', '%', '^', '*'];
    const hasSpecialChars = specialChars.some(char => password.includes(char) && !password.includes('%'));
    if (hasSpecialChars) {
        console.warn('⚠️  WARNING: Your password may contain unencoded special characters');
        console.warn('   Special characters must be URL-encoded:');
        console.warn('   @ → %40   # → %23   & → %26   ! → %21');
        console.warn('');
    }
}

const client = new Client({
    connectionString: connectionString.trim(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
});

console.log('Connecting to database...');

client.connect()
    .then(async () => {
        console.log('✅ Connection successful!');
        console.log('');

        // Test a simple query
        console.log('Testing query...');
        const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Query successful!');
        console.log('');
        console.log('Database info:');
        console.log(`  Current time: ${result.rows[0].current_time}`);
        console.log(`  PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
        console.log('');

        // Check if ai_policy_templates table exists
        console.log('Checking for ai_policy_templates table...');
        const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_policy_templates'
      ) as table_exists
    `);

        if (tableCheck.rows[0].table_exists) {
            console.log('✅ ai_policy_templates table exists');

            // Get count
            const countResult = await client.query('SELECT COUNT(*)::int as count FROM public.ai_policy_templates');
            console.log(`  Current template count: ${countResult.rows[0].count}`);
        } else {
            console.log('⚠️  ai_policy_templates table does not exist');
            console.log('   Run migrations first: npm run db:migrate');
        }

        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SUCCESS! Your connection string is correct.');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('Next steps:');
        console.log('1. Copy this exact connection string to GitHub Secrets');
        console.log('2. Go to: https://github.com/jeremyje1/ai-readiness-app/settings/secrets/actions');
        console.log('3. Update SUPABASE_DB_URL with this connection string');
        console.log('4. The workflow should pass on next run!');
        console.log('');

        await client.end();
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection failed!');
        console.error('');
        console.error('Error details:');
        console.error(`  Code: ${err.code}`);
        console.error(`  Message: ${err.message}`);
        console.error('');

        // Provide specific troubleshooting based on error
        if (err.code === 'ENOTFOUND') {
            console.error('💡 Troubleshooting:');
            console.error('  • Check that the host name is correct');
            console.error('  • Verify your internet connection');
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
            console.error('💡 Troubleshooting:');
            console.error('  • Check that you\'re using the correct port (5432 or 6543)');
            console.error('  • Verify your Supabase project is not paused');
            console.error('  • Check your network/firewall settings');
        } else if (err.message.includes('password authentication failed')) {
            console.error('💡 Troubleshooting:');
            console.error('  • Your password is incorrect');
            console.error('  • Get correct password from: https://app.supabase.com/project/jocigzsthcpspxfdfxae/settings/database');
            console.error('  • If password has special characters, URL-encode them:');
            console.error('    @ → %40   # → %23   & → %26   ! → %21');
        } else if (err.message.includes('no pg_hba.conf entry')) {
            console.error('💡 Troubleshooting:');
            console.error('  • SSL connection issue');
            console.error('  • Verify you\'re using the correct connection string from Supabase');
        } else {
            console.error('💡 Troubleshooting:');
            console.error('  • Verify connection string format is correct');
            console.error('  • Check that all special characters in password are URL-encoded');
            console.error('  • Try resetting your database password in Supabase dashboard');
        }

        console.error('');
        console.error('Need to reset password?');
        console.error('  1. Go to: https://app.supabase.com/project/jocigzsthcpspxfdfxae/settings/database');
        console.error('  2. Click "Reset database password"');
        console.error('  3. Copy the new password');
        console.error('  4. Update SUPABASE_DB_URL in .env.local');
        console.error('  5. Run this test again');
        console.error('');

        process.exit(1);
    });
