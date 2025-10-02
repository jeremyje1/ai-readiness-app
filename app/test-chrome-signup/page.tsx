'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function TestChromeSignup() {
    const [email, setEmail] = useState('chrome.test@example.com');
    const [password, setPassword] = useState('test123');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const supabase = createClient();

    const addLog = (message: string) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
        console.log(`[Chrome Test] ${message}`);
    };

    const testSignup = async () => {
        setLoading(true);
        setLogs([]);

        try {
            addLog('🚀 Starting signup test...');
            addLog(`Browser: ${navigator.userAgent}`);

            const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
            addLog(`Is Chrome: ${isChrome}`);

            addLog('📝 Attempting signup...');
            const startTime = Date.now();

            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/success`
                }
            });

            const duration = Date.now() - startTime;
            addLog(`⏱️ Signup took ${duration}ms`);

            if (error) {
                addLog(`❌ Signup error: ${error.message}`);
                if (error.message.includes('already registered')) {
                    addLog('💡 User already exists, trying login instead...');
                    await testLogin();
                }
            } else if (data.user) {
                addLog(`✅ Signup successful!`);
                addLog(`User ID: ${data.user.id}`);
                addLog(`Email: ${data.user.email}`);
                addLog(`Confirmation required: ${!data.user.confirmed_at}`);
            } else {
                addLog('⚠️ Signup returned no error but also no user data');
            }
        } catch (err: any) {
            addLog(`💥 Unexpected error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testLogin = async () => {
        setLoading(true);

        try {
            addLog('🔐 Starting login test...');
            const startTime = Date.now();

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            });

            const duration = Date.now() - startTime;
            addLog(`⏱️ Login took ${duration}ms`);

            if (error) {
                addLog(`❌ Login error: ${error.message}`);
            } else if (data.session) {
                addLog(`✅ Login successful!`);
                addLog(`Session: ${data.session.access_token.substring(0, 20)}...`);
                addLog(`User: ${data.session.user.email}`);
            } else {
                addLog('⚠️ Login returned no error but also no session');
            }
        } catch (err: any) {
            addLog(`💥 Unexpected error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testSignout = async () => {
        try {
            addLog('👋 Signing out...');
            await supabase.auth.signOut();
            addLog('✅ Signed out successfully');
        } catch (err: any) {
            addLog(`❌ Signout error: ${err.message}`);
        }
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Chrome Authentication Test</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="test@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="password123"
                                />
                            </div>

                            <div className="space-y-2">
                                <Button
                                    onClick={testSignup}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? 'Testing...' : 'Test Signup'}
                                </Button>

                                <Button
                                    onClick={testLogin}
                                    disabled={loading}
                                    variant="outline"
                                    className="w-full"
                                >
                                    {loading ? 'Testing...' : 'Test Login'}
                                </Button>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={testSignout}
                                        variant="ghost"
                                        className="flex-1"
                                    >
                                        Sign Out
                                    </Button>

                                    <Button
                                        onClick={clearLogs}
                                        variant="ghost"
                                        className="flex-1"
                                    >
                                        Clear Logs
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Test Logs</h2>

                        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
                            {logs.length === 0 ? (
                                <div className="text-gray-500">No logs yet. Click a test button to start.</div>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="mb-1">
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h3>
                    <ol className="list-decimal list-inside text-blue-800 space-y-1">
                        <li>Open Chrome Developer Tools (F12) → Network tab</li>
                        <li>Clear all site data (Application → Storage → Clear site data)</li>
                        <li>Try signup first with the test email</li>
                        <li>If user exists, try login instead</li>
                        <li>Watch for any hanging requests or timeouts</li>
                        <li>Check console for any CORS or cookie errors</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}