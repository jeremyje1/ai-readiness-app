'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/auth-service';
import { useState } from 'react';

export default function TestLoginNoTimeout() {
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

    const testLogin = async () => {
        setLogs([]);
        setStatus('Starting login test (NO TIMEOUT)...');
        addLog('🚀 Starting login test without any timeouts');
        addLog(`📧 Email: ${email}`);
        addLog(`🔑 Password length: ${password.length}`);

        try {
            addLog('🔐 Calling authService.signInWithPassword...');
            const startTime = Date.now();

            // Call login WITHOUT any timeout wrapper
            const result = await authService.signInWithPassword(email.trim(), password);

            const duration = Date.now() - startTime;
            addLog(`⏱️ Login completed in ${duration}ms`);

            if (result.error) {
                addLog(`❌ Error: ${result.error.message}`);
                setStatus(`Error: ${result.error.message}`);
            } else if (result.data) {
                addLog(`✅ Success! User ID: ${result.data.user?.id}`);
                addLog(`📊 Method: ${result.method}`);
                addLog(`🎫 Has session: ${!!result.data.session}`);
                setStatus('✅ Login successful!');
            } else {
                addLog('⚠️ Unknown result state');
                setStatus('Unknown result');
            }
        } catch (err: any) {
            const duration = Date.now() - Date.now();
            addLog(`❌ Exception: ${err.message}`);
            addLog(`📚 Stack: ${err.stack}`);
            setStatus(`Exception: ${err.message}`);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">Login Test (No Timeout)</h1>
                <p className="text-sm text-gray-600 mb-6">
                    This page tests login without any timeout wrappers to see if Supabase Auth is actually responding.
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
                    <Button onClick={testLogin} disabled={!email || !password}>
                        Test Login (No Timeout)
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
