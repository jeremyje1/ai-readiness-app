'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function TestAuthPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Show environment info
    const envInfo = {
        url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
        hasAnonKey: !!supabaseAnonKey,
        keyLength: supabaseAnonKey?.length || 0
    };

    const addLog = (message: string) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const testDirectAuth = async () => {
        setLoading(true);
        setLogs([]);

        try {
            addLog('Creating Supabase client...');
            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    persistSession: false,
                    detectSessionInUrl: false,
                    autoRefreshToken: false,
                    flowType: 'pkce'
                }
            });

            addLog('Supabase client created');
            addLog(`URL: ${supabaseUrl}`);

            const email = 'test@aiblueprint.com';
            const password = 'Test1234!@#$2025';

            addLog(`Attempting login for: ${email}`);

            // Set a manual timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Manual timeout after 10s')), 10000);
            });

            const authPromise = supabase.auth.signInWithPassword({
                email,
                password
            });

            addLog('Auth call initiated...');

            const result = await Promise.race([authPromise, timeoutPromise]) as any;

            addLog('Auth call completed');

            if (result && 'error' in result && result.error) {
                addLog(`Error: ${result.error.message}`);
            } else if (result && 'data' in result && result.data) {
                addLog('Success! Session received');
                addLog(`User ID: ${result.data.user?.id}`);
                addLog(`Email: ${result.data.user?.email}`);
            }

        } catch (error: any) {
            addLog(`Exception: ${error.message}`);
            addLog(`Stack: ${error.stack}`);
        } finally {
            setLoading(false);
            addLog('Test completed');
        }
    };

    const testFetch = async () => {
        setLoading(true);
        setLogs([]);

        try {
            addLog('Testing direct fetch to Supabase...');
            const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
                method: 'GET',
                headers: {
                    'apikey': supabaseAnonKey,
                }
            });

            addLog(`Response status: ${response.status}`);
            const text = await response.text();
            addLog(`Response: ${text}`);

        } catch (error: any) {
            addLog(`Fetch error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testViaAPI = async () => {
        setLoading(true);
        setLogs([]);

        try {
            addLog('Testing auth via server API...');

            const response = await fetch('/api/debug-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test@aiblueprint.com',
                    password: 'Test1234!@#$2025'
                })
            });

            addLog(`API response status: ${response.status}`);
            const data = await response.json();
            addLog(`API response: ${JSON.stringify(data, null, 2)}`);

            if (data.success) {
                addLog('✅ Server-side auth successful!');
            } else {
                addLog(`❌ Server-side auth failed: ${data.error}`);
            }

        } catch (error: any) {
            addLog(`API error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>

            <div className="bg-blue-50 p-4 rounded mb-6">
                <h2 className="font-semibold mb-2">Environment Info:</h2>
                <div className="text-sm">
                    <p>Supabase URL: {envInfo.url}</p>
                    <p>Has Anon Key: {envInfo.hasAnonKey ? 'Yes' : 'No'}</p>
                    <p>Key Length: {envInfo.keyLength} chars</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <button
                    onClick={testDirectAuth}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Direct Auth'}
                </button>

                <button
                    onClick={testFetch}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 ml-4"
                >
                    {loading ? 'Testing...' : 'Test Supabase Connection'}
                </button>

                <button
                    onClick={testViaAPI}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50 ml-4"
                >
                    {loading ? 'Testing...' : 'Test Auth via API'}
                </button>

                <button
                    onClick={async () => {
                        setLoading(true);
                        setLogs([]);
                        try {
                            addLog('Testing Supabase connectivity...');
                            const response = await fetch('/api/test-supabase');
                            addLog(`Response status: ${response.status}`);
                            const data = await response.json();
                            addLog(`Response: ${JSON.stringify(data, null, 2)}`);
                        } catch (error: any) {
                            addLog(`Connectivity test error: ${error.message}`);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50 ml-4"
                >
                    {loading ? 'Testing...' : 'Test Connectivity'}
                </button>
            </div>

            <div className="bg-gray-100 p-4 rounded">
                <h2 className="font-semibold mb-2">Logs:</h2>
                <div className="space-y-1 text-sm font-mono">
                    {logs.map((log, index) => (
                        <div key={index} className="text-gray-700">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}