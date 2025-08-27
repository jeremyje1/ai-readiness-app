#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function verifyPasswordFlow() {
    console.log('🔐 Password Verification Test\n');

    // Get test credentials
    const email = process.argv[2] || process.env.TEST_EMAIL || 'jeremy.estrella@gmail.com';
    const password = process.argv[3] || process.env.TEST_PASSWORD;

    if (!password) {
        console.log('❌ Please provide a password as an argument or set TEST_PASSWORD environment variable');
        console.log('Usage: node verify-password-enhanced.js <email> <password>');
        process.exit(1);
    }

    // Environment setup
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
        console.log('❌ Missing Supabase environment variables');
        process.exit(1);
    }

    console.log(`Testing authentication for: ${email}\n`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, anonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });

    // Test 1: SDK Authentication with timeout
    console.log('📋 Test 1: SDK Authentication (with 8s timeout)');
    try {
        const start = performance.now();
        const loginPromise = supabase.auth.signInWithPassword({
            email: email.trim(),
            password
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('SDK timeout after 8s')), 8000);
        });

        const result = await Promise.race([loginPromise, timeoutPromise]);
        const elapsed = Math.round(performance.now() - start);

        if (result.error) {
            console.log(`❌ SDK auth failed: ${result.error.message} (${elapsed}ms)`);
        } else {
            console.log(`✅ SDK auth successful (${elapsed}ms)`);
            console.log(`   User ID: ${result.data.user?.id}`);
            console.log(`   Email verified: ${result.data.user?.email_confirmed_at ? 'Yes' : 'No'}`);

            // Sign out for clean state
            await supabase.auth.signOut();
        }
    } catch (error) {
        console.log(`❌ SDK auth timeout: ${error.message}`);
    }

    console.log('');

    // Test 2: Manual REST API Authentication (fallback method)
    console.log('📋 Test 2: Manual REST API Authentication (fallback)');
    try {
        const grantUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
        const start = performance.now();

        const response = await fetch(grantUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': anonKey,
                'x-client-info': 'auth-test/1.0.0'
            },
            body: JSON.stringify({
                email: email.trim(),
                password,
                gotrue_meta_security: {}
            })
        });

        const elapsed = Math.round(performance.now() - start);
        const responseText = await response.text();

        console.log(`   Response: ${response.status} ${response.statusText} (${elapsed}ms)`);

        if (response.ok) {
            const tokens = JSON.parse(responseText);
            console.log(`✅ Manual auth successful`);
            console.log(`   Access token: ***${tokens.access_token?.slice(-8)}`);
            console.log(`   Refresh token: ***${tokens.refresh_token?.slice(-8)}`);
            console.log(`   Token type: ${tokens.token_type}`);
            console.log(`   Expires in: ${tokens.expires_in}s`);

            // Test 3: Validate token by setting session
            console.log('\n📋 Test 3: Token validation via setSession');
            try {
                const sessionResult = await supabase.auth.setSession({
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token
                });

                if (sessionResult.error) {
                    console.log(`❌ Session validation failed: ${sessionResult.error.message}`);
                } else {
                    console.log(`✅ Session validation successful`);
                    console.log(`   User ID: ${sessionResult.data.user?.id}`);
                    console.log(`   Session expires: ${new Date(sessionResult.data.session?.expires_at * 1000).toISOString()}`);

                    // Clean up
                    await supabase.auth.signOut();
                }
            } catch (sessionError) {
                console.log(`❌ Session validation error: ${sessionError.message}`);
            }

        } else {
            console.log(`❌ Manual auth failed`);
            try {
                const errorData = JSON.parse(responseText);
                console.log(`   Error: ${errorData.error_description || errorData.message || 'Unknown error'}`);
            } catch {
                console.log(`   Raw response: ${responseText.slice(0, 200)}`);
            }
        }
    } catch (error) {
        console.log(`❌ Manual auth error: ${error.message}`);
    }

    console.log('');

    // Test 4: User lookup (if we have service key)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
        console.log('📋 Test 4: User account verification (admin)');
        try {
            const adminClient = createClient(supabaseUrl, serviceKey, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            });

            const { data: users, error } = await adminClient.auth.admin.listUsers();

            if (error) {
                console.log(`❌ Admin user lookup failed: ${error.message}`);
            } else {
                const user = users.users.find(u => u.email === email);
                if (user) {
                    console.log(`✅ User account found`);
                    console.log(`   ID: ${user.id}`);
                    console.log(`   Email verified: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
                    console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`);
                    console.log(`   Created: ${user.created_at}`);

                    // Check for identities
                    if (user.identities && user.identities.length > 0) {
                        console.log(`   Identities: ${user.identities.map(i => i.provider).join(', ')}`);
                    }
                } else {
                    console.log(`❌ User account not found for email: ${email}`);
                }
            }
        } catch (error) {
            console.log(`❌ Admin lookup error: ${error.message}`);
        }
    } else {
        console.log('📋 Test 4: Skipped (no service role key)');
    }

    console.log('\n🎯 Summary:');
    console.log('   - If SDK auth times out but manual auth works: Use fallback system');
    console.log('   - If both fail with same error: Check credentials or user account');
    console.log('   - If manual auth fails with different error: Network/config issue');
    console.log('   - If user not found: Account may not exist or email mismatch');
    console.log('');
}

// Run if called directly
if (require.main === module) {
    verifyPasswordFlow().catch(console.error);
}

module.exports = { verifyPasswordFlow };
