'use client';

import { useState } from 'react';

export default function SimpleAuthTestPage() {
    const [log, setLog] = useState('');
    const [loading, setLoading] = useState(false);

    const addLog = (msg: string) => {
        const timestamp = new Date().toISOString();
        setLog(prev => prev + `\n[${timestamp}] ${msg}`);
        console.log(`[${timestamp}] ${msg}`);
    };

    const testAuth = async () => {
        setLoading(true);
        setLog('Starting auth test...');

        try {
            // Get env vars at runtime
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            addLog(`Supabase URL: ${url ? url.substring(0, 40) + '...' : 'NOT SET'}`);
            addLog(`Has Anon Key: ${!!key}`);

            if (!url || !key) {
                addLog('ERROR: Missing environment variables');
                return;
            }

            // Test 1: Basic connectivity
            addLog('Testing connectivity to Supabase...');
            const healthUrl = `${url}/auth/v1/health`;

            const healthResponse = await fetch(healthUrl, {
                headers: { 'apikey': key }
            });

            addLog(`Health check status: ${healthResponse.status}`);
            const healthText = await healthResponse.text();
            addLog(`Health response: ${healthText}`);

            // Test 2: Try authentication
            addLog('\\nTesting authentication...');
            const authUrl = `${url}/auth/v1/token?grant_type=password`;

            const authResponse = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': key
                },
                body: JSON.stringify({
                    email: 'test@aiblueprint.com',
                    password: 'TestPassword123!'
                })
            });

            addLog(`Auth response status: ${authResponse.status}`);
            const authData = await authResponse.json();

            if (authResponse.ok) {
                addLog('SUCCESS: Authentication worked!');
                addLog(`User ID: ${authData.user?.id}`);
            } else {
                addLog(`ERROR: ${authData.error || authData.msg || 'Unknown error'}`);
            }

        } catch (error: any) {
            addLog(`EXCEPTION: ${error.message}`);
            console.error(error);
        } finally {
            setLoading(false);
            addLog('\\nTest completed');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '1rem' }}>Simple Auth Test</h1>

            <button
                onClick={testAuth}
                disabled={loading}
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: loading ? '#ccc' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '1rem'
                }}
            >
                {loading ? 'Testing...' : 'Run Auth Test'}
            </button>

            <pre style={{
                backgroundColor: '#f3f4f6',
                padding: '1rem',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '14px'
            }}>
                {log || 'Click the button to start the test...'}
            </pre>
        </div>
    );
}