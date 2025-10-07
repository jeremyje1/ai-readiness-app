#!/usr/bin/env node

/**
 * Seeds the AI policy template library in the production Supabase instance.
 *
 * Usage:
 *   SUPABASE_DB_URL=postgresql://user:password@host:port/db node scripts/seed-policy-templates.js
 *
 * The script is idempotent; the underlying SQL only inserts policies that do not already exist.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ROOT_DIR = path.resolve(__dirname, '..');
const SEED_FILE = path.join(ROOT_DIR, 'supabase', 'seeds', 'seed-policy-templates.sql');

function buildConnectionString() {
    const rawCandidates = [
        process.env.SUPABASE_DB_URL,
        process.env.SUPABASE_MIGRATIONS_DB_URL,
        process.env.DATABASE_URL,
        process.env.POSTGRES_PRISMA_URL,
        process.env.POSTGRES_URL,
        process.env.POSTGRES_URL_NON_POOLING
    ].filter(Boolean);

    for (const candidate of rawCandidates) {
        const trimmed = candidate.trim();
        if (trimmed.length > 0) {
            return trimmed;
        }
    }

    const host = process.env.POSTGRES_HOST || process.env.DB_HOST;
    const user = process.env.POSTGRES_USER || process.env.DB_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD;
    const database = process.env.POSTGRES_DATABASE || process.env.DB_NAME || 'postgres';
    const port = process.env.POSTGRES_PORT || process.env.DB_PORT || '5432';

    if (host && password) {
        return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    }

    return null;
}

async function run() {
    const connectionString = buildConnectionString();

    if (!connectionString) {
        console.error('❌ Unable to determine database connection string.');
        console.error('   Please set SUPABASE_DB_URL or provide POSTGRES_* environment variables.');
        process.exit(1);
    }

    if (!fs.existsSync(SEED_FILE)) {
        console.error(`❌ Seed file not found at ${SEED_FILE}`);
        process.exit(1);
    }

    console.log('📚 Seeding AI policy templates on Supabase...');

    const sql = fs.readFileSync(SEED_FILE, 'utf8');

    const useSSL = (() => {
        if (process.env.PGSSLMODE === 'disable') {
            return false;
        }
        if (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) {
            return false;
        }
        return { rejectUnauthorized: false };
    })();

    const client = new Client({
        connectionString,
        ssl: useSSL
    });

    try {
        await client.connect();
        await client.query('SET statement_timeout TO 60000;');

        console.log('⚙️  Executing seed script...');
        await client.query(sql);

        const { rows } = await client.query('SELECT COUNT(*)::int AS count FROM public.ai_policy_templates;');
        const count = rows?.[0]?.count ?? 0;

        console.log(`✅ Policy template seed complete. Total templates: ${count}`);
    } catch (error) {
        console.error('❌ Failed to seed policy templates.');
        console.error(error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
