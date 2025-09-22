const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

async function testDirectAuth() {
    console.log('🔐 Testing direct authentication...');
    console.log('URL:', supabaseUrl);

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const email = 'test@aiblueprint.com';
    const password = 'Test1234!@#$2025';

    try {
        console.log('\n1. Testing direct signInWithPassword...');
        const start = Date.now();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        const duration = Date.now() - start;
        console.log(`Response received in ${duration}ms`);

        if (error) {
            console.error('❌ Auth Error:', error.message);
            console.error('Error details:', error);
        } else if (data?.session) {
            console.log('✅ Authentication successful!');
            console.log('User ID:', data.user.id);
            console.log('Email:', data.user.email);
            console.log('Session:', data.session ? 'Present' : 'Missing');

            // Test getting session
            console.log('\n2. Testing getSession...');
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error('Session error:', sessionError);
            } else {
                console.log('Session retrieved:', sessionData.session ? 'Present' : 'Missing');
            }

            // Sign out
            console.log('\n3. Signing out...');
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
                console.error('Sign out error:', signOutError);
            } else {
                console.log('✅ Sign out successful');
            }
        } else {
            console.log('⚠️ No error but also no session data');
            console.log('Data:', data);
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }

    // Test network connectivity
    console.log('\n4. Testing Supabase connectivity...');
    try {
        const { data: health } = await supabase.from('institutions').select('count').limit(1);
        console.log('✅ Database connection successful');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
}

testDirectAuth().catch(console.error);