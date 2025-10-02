const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testAuth() {
    const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA';

    console.log('Testing direct auth to Supabase...');
    console.log('URL:', supabaseUrl);

    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey
            },
            body: JSON.stringify({
                email: 'jeremy.estrella@gmail.com',
                password: 'password123', // Replace with your actual password
                gotrue_meta_security: {}
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            console.log('✅ Authentication successful!');
            console.log('User:', data.user?.email);
            console.log('Access token:', data.access_token?.substring(0, 50) + '...');
        } else {
            console.log('❌ Authentication failed:', data);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAuth();