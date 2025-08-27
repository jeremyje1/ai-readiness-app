'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase-enhanced';
import { authService } from '@/lib/auth-service';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
    const [status, setStatus] = useState('Checking...');
    const [config, setConfig] = useState<any>({});
    const [testEmail, setTestEmail] = useState('jeremy.estrella@gmail.com');
    const [testPassword, setTestPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authResult, setAuthResult] = useState<any>(null);

    useEffect(() => {
        // Check Supabase configuration
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        setConfig({
            url: supabaseUrl,
            keyExists: !!supabaseKey,
            keyLength: supabaseKey?.length || 0,
            isValidUrl: supabaseUrl?.includes('supabase.co') || false
        });

        // Test basic connection
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                setStatus(`❌ Auth Error: ${error.message}`);
            } else {
                setStatus('✅ Supabase connection working');
            }
        }).catch(err => {
            setStatus(`❌ Connection Error: ${err.message}`);
        });
    }, []);

    const testSignIn = async () => {
        setLoading(true);
        setAuthResult(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword
            });

            setAuthResult({
                success: !error,
                error: error?.message,
                data: data?.user ? {
                    id: data.user.id,
                    email: data.user.email,
                    confirmed: data.user.email_confirmed_at ? true : false
                } : null
            });
        } catch (err: any) {
            setAuthResult({
                success: false,
                error: err.message,
                data: null
            });
        }

        setLoading(false);
    };

    const testPasswordReset = async () => {
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
                redirectTo: window.location.origin + '/auth/password/update'
            });

            if (error) {
                setAuthResult({
                    success: false,
                    error: `Password reset error: ${error.message}`,
                    data: null
                });
            } else {
                setAuthResult({
                    success: true,
                    error: null,
                    data: 'Password reset email sent (if account exists)'
                });
            }
        } catch (err: any) {
            setAuthResult({
                success: false,
                error: `Password reset failed: ${err.message}`,
                data: null
            });
        }

        setLoading(false);
    };

    const testEnhancedAuth = async () => {
        setLoading(true);
        setAuthResult(null);

        try {
            console.log('🧪 Testing Enhanced Auth Service...');
            const result = await authService.signInWithPassword(testEmail, testPassword);
            
            setAuthResult({
                success: !result.error,
                error: result.error?.message || null,
                data: {
                    method: result.method,
                    timestamp: new Date(result.timestamp).toLocaleTimeString(),
                    user: result.data?.user ? {
                        id: result.data.user.id,
                        email: result.data.user.email,
                        confirmed: result.data.user.email_confirmed_at ? true : false
                    } : null
                }
            });

            console.log('🧪 Auth result:', {
                method: result.method,
                success: !result.error,
                error: result.error?.message
            });
        } catch (err: any) {
            setAuthResult({
                success: false,
                error: err.message,
                data: null
            });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Supabase Authentication Debug</h1>

                {/* Configuration Status */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>Connection Status:</strong> {status}</p>
                        <p><strong>URL:</strong> {config.url || 'Missing'}</p>
                        <p><strong>Anon Key:</strong> {config.keyExists ? `✅ Present (${config.keyLength} chars)` : '❌ Missing'}</p>
                        <p><strong>Valid URL:</strong> {config.isValidUrl ? '✅' : '❌'}</p>
                    </div>
                </div>

                {/* Authentication Test */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Test Email</label>
                            <Input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="Enter email to test"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Test Password</label>
                            <Input
                                type="password"
                                value={testPassword}
                                onChange={(e) => setTestPassword(e.target.value)}
                                placeholder="Enter password to test sign-in"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={testSignIn}
                                disabled={loading || !testEmail || !testPassword}
                            >
                                {loading ? 'Testing...' : 'Test Sign In'}
                            </Button>
                            <Button
                                onClick={testEnhancedAuth}
                                disabled={loading || !testEmail || !testPassword}
                                variant="default"
                            >
                                {loading ? 'Testing...' : 'Test Enhanced Auth'}
                            </Button>
                            <Button
                                onClick={testPasswordReset}
                                disabled={loading || !testEmail}
                                variant="outline"
                            >
                                {loading ? 'Testing...' : 'Test Password Reset'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {authResult && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                        <div className={`p-4 rounded ${authResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <p><strong>Status:</strong> {authResult.success ? '✅ Success' : '❌ Failed'}</p>
                            {authResult.error && <p><strong>Error:</strong> {authResult.error}</p>}
                            {authResult.data && (
                                <div className="mt-2">
                                    <strong>Data:</strong>
                                    <pre className="mt-1 text-xs bg-white p-2 rounded border">
                                        {JSON.stringify(authResult.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Fixes */}
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <h2 className="text-xl font-semibold mb-4 text-yellow-800">Common Issues & Fixes</h2>
                    <ul className="space-y-2 text-sm text-yellow-700">
                        <li>• <strong>Button goes gray and doesn't respond:</strong> Usually indicates a JavaScript error or network issue</li>
                        <li>• <strong>Invalid credentials:</strong> Check if the user account exists and password is correct</li>
                        <li>• <strong>Email not confirmed:</strong> User needs to click the confirmation link in their email</li>
                        <li>• <strong>Supabase config errors:</strong> Check environment variables are correct</li>
                        <li>• <strong>Network errors:</strong> Check if Supabase URL is accessible</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
