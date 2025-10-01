'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function TestDirectAPILogin() {
    const [email, setEmail] = useState('jeremy.estrella@gmail.com');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const log = `[${timestamp}] ${msg}`;
        setLogs(prev => [...prev, log]);
        console.log(log);
    };

    const testDirectAPI = async () => {
        setLogs([]);
        setStatus('Testing direct API call...');
        addLog('🚀 Starting DIRECT API TEST (bypassing Supabase SDK)');
        addLog(`📧 Email: ${email}`);

        const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA';

        try {
            addLog('📡 Making direct fetch() to Supabase Auth API...');
            addLog(`🌐 URL: ${supabaseUrl}/auth/v1/token?grant_type=password`);

            const startTime = Date.now();

            const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': anonKey,
                    'x-client-info': 'direct-test/1.0.0'
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            });

            const duration = Date.now() - startTime;
            addLog(`⏱️ Response received in ${duration}ms`);
            addLog(`📊 Status: ${response.status} ${response.statusText}`);

            const data = await response.json();
            addLog(`📦 Response data keys: ${Object.keys(data).join(', ')}`);

            if (!response.ok) {
                addLog(`❌ Error: ${data.error || data.msg || 'Unknown error'}`);
                setStatus(`Error: ${data.error || data.msg}`);
            } else {
                addLog(`✅ Success! User ID: ${data.user?.id}`);
                addLog(`🎫 Access token length: ${data.access_token?.length || 0}`);
                addLog(`🔄 Refresh token length: ${data.refresh_token?.length || 0}`);
                addLog(`⏰ Expires in: ${data.expires_in} seconds`);
                setStatus('✅ Direct API login successful!');
            }
        } catch (err: any) {
            addLog(`❌ Exception: ${err.message}`);
            addLog(`📚 Stack: ${err.stack}`);
            setStatus(`Exception: ${err.message}`);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">🔬 Direct API Login Test</h1>
                <p className="text-sm text-gray-600 mb-6">
                    This bypasses the Supabase SDK entirely and makes a raw fetch() call to the Auth API.
                    If this works but the SDK doesn't, it indicates a client SDK issue.
                </p>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </div>
                    <Button onClick={testDirectAPI} disabled={!email || !password}>
                        🚀 Test Direct API Call
                    </Button>
                </div>

                {status && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-medium">{status}</p>
                    </div>
                )}

                {logs.length > 0 && (
                    <div className="bg-black text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96">
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
