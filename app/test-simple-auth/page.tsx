'use client';

import { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';
import { useState } from 'react';

export default function TestSimpleAuth() {
    const [status, setStatus] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const testAuth = async () => {
        setStatus('Testing direct Supabase auth...');

        try {
            console.log('Starting auth test at:', new Date().toISOString());

            // Direct Supabase call with no wrapper
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            console.log('Auth response received at:', new Date().toISOString());

            if (error) {
                setStatus(`Error: ${error.message}`);
                console.error('Auth error:', error);
            } else {
                setStatus(`Success! User: ${data.user?.email}`);
                console.log('Auth success:', data);
            }
        } catch (err) {
            setStatus(`Caught error: ${err}`);
            console.error('Caught error:', err);
        }
    };

    const testHealth = async () => {
        setStatus('Testing Supabase connectivity...');

        try {
            // Test basic connectivity
            const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY
                }
            });

            const health = await response.json();
            setStatus(`Health check: ${JSON.stringify(health)}`);
        } catch (err) {
            setStatus(`Health check error: ${err}`);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Simple Auth Test</h1>

            <div className="space-y-4">
                <button
                    onClick={testHealth}
                    className="w-full p-2 bg-green-500 text-white rounded"
                >
                    Test Supabase Connectivity
                </button>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                />

                <button
                    onClick={testAuth}
                    disabled={!email || !password}
                    className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Test Authentication
                </button>

                <div className="p-4 bg-gray-100 rounded">
                    <p className="font-mono text-sm">{status}</p>
                </div>
            </div>
        </div>
    );
}