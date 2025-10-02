const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function prepareForChromeTesting() {
    console.log('🔧 Preparing environment for Chrome testing...\n');

    // Test emails we'll use
    const testEmails = [
        'chrome.test@example.com',
        'safari.test@example.com',
        'firefox.test@example.com'
    ];

    console.log('📧 Test accounts to use:');
    testEmails.forEach(email => {
        console.log(`  - ${email} (password: test123)`);
    });

    console.log('\n🔍 Checking if any test accounts already exist...');

    for (const email of testEmails) {
        try {
            // Try to sign in to see if account exists
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: 'test123'
            });

            if (!error) {
                console.log(`  ✅ ${email} exists and can login`);
                await supabase.auth.signOut();
            } else if (error.message.includes('Invalid login credentials')) {
                console.log(`  ⚠️  ${email} might exist with different password`);
            } else {
                console.log(`  ❌ ${email} does not exist`);
            }
        } catch (err) {
            console.log(`  ❌ Error checking ${email}:`, err.message);
        }
    }

    console.log('\n📋 Chrome Testing Checklist:');
    console.log('1. Open Chrome browser (not Incognito)');
    console.log('2. Clear all cookies and cache for the site');
    console.log('3. Open Developer Tools → Network tab');
    console.log('4. Try to sign up with chrome.test@example.com');
    console.log('5. If signup works, try to login');
    console.log('6. Watch for any timeout errors or hanging requests');
    console.log('\n💡 Also test in Safari/Firefox to compare behavior');

    console.log('\n🌐 Test URLs:');
    console.log('  Local: http://localhost:3000/auth/login');
    console.log('  Production: https://aiblueprint.k12aiblueprint.com/auth/login');

    console.log('\n🔍 Things to watch for in Chrome:');
    console.log('  - Does the login request timeout after 15 seconds?');
    console.log('  - Are there any CORS errors in the console?');
    console.log('  - Does the request reach the server (check Network tab)?');
    console.log('  - Any errors about third-party cookies?');

    console.log('\n✅ Environment ready for Chrome testing!');
}

prepareForChromeTesting();