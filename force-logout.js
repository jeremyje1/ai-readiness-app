#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to read environment variables from .env.local
let supabaseUrl, supabaseKey;

try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');

        for (const line of lines) {
            if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
                supabaseUrl = line.split('=')[1].trim().replace(/["']/g, '');
            }
            if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
                supabaseKey = line.split('=')[1].trim().replace(/["']/g, '');
            }
        }
    }
} catch (err) {
    console.log('Could not read .env.local file');
}

// Fallback to process.env if available
supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
supabaseKey = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Present' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceLogout() {
    try {
        console.log('🔐 Attempting to clear all sessions...');

        // Sign out from all sessions
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('❌ Logout error:', error.message);
        } else {
            console.log('✅ Successfully logged out of all sessions');
        }

        // Also try to get current session to verify
        const { data: session, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.log('⚠️  Session check error (this is expected after logout):', sessionError.message);
        } else if (session.session) {
            console.log('⚠️  Warning: Session still exists after logout');
            console.log('Session details:', {
                user: session.session.user?.email,
                expires: new Date(session.session.expires_at * 1000).toISOString()
            });
        } else {
            console.log('✅ Confirmed: No active session found');
        }

    } catch (err) {
        console.error('❌ Script error:', err.message);
    }
}

console.log('🚀 Force Logout Script');
console.log('This will clear all Supabase sessions for the current configuration');
forceLogout();
