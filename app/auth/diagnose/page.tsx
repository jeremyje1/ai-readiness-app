'use client';

import { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function DiagnosePage() {
    const [results, setResults] = useState<any>({});
    const [running, setRunning] = useState(false);

    const runDiagnostics = async () => {
        setRunning(true);
        const diagnostics: any = {};

        // Helper to run tests with timeout
        const runTest = async (name: string, testFn: () => Promise<any>) => {
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Test timeout after 5s')), 5000);
                });
                const result = await Promise.race([testFn(), timeoutPromise]);
                return result;
            } catch (error: any) {
                return {
                    test: name,
                    result: 'TIMEOUT',
                    details: { error: error.message }
                };
            }
        };

        // 1. Check if Supabase client is initialized
        diagnostics.clientInitialized = {
            test: 'Supabase Client',
            result: typeof supabase !== 'undefined' ? 'PASS' : 'FAIL',
            details: {
                hasClient: typeof supabase !== 'undefined',
                clientType: typeof supabase
            }
        };

        // 2. Check environment variables
        diagnostics.environment = {
            test: 'Environment Variables',
            result: (SUPABASE_URL && SUPABASE_ANON_KEY) ? 'PASS' : 'FAIL',
            details: {
                hasUrl: !!SUPABASE_URL,
                urlLength: SUPABASE_URL?.length,
                urlPreview: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'missing',
                hasAnonKey: !!SUPABASE_ANON_KEY,
                keyLength: SUPABASE_ANON_KEY?.length
            }
        };

        // 3. Test basic fetch to Supabase
        diagnostics.healthCheck = await runTest('Supabase Health Check', async () => {
            const start = Date.now();

            // Create abort controller with fallback for older browsers
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
                    headers: { 'apikey': SUPABASE_ANON_KEY },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const elapsed = Date.now() - start;
                const data = await response.json();

                return {
                    test: 'Supabase Health Check',
                    result: response.ok ? 'PASS' : 'FAIL',
                    details: {
                        status: response.status,
                        responseTime: `${elapsed}ms`,
                        data
                    }
                };
            } catch (error: any) {
                clearTimeout(timeoutId);
                throw error;
            }
        });

        // 4. Test auth.getSession
        diagnostics.getSession = await runTest('Get Session', async () => {
            const start = Date.now();
            const { data, error } = await supabase.auth.getSession();
            const elapsed = Date.now() - start;

            return {
                test: 'Get Session',
                result: error ? 'FAIL' : 'PASS',
                details: {
                    responseTime: `${elapsed}ms`,
                    hasSession: !!data?.session,
                    error: error?.message
                }
            };
        });

        // 5. Check localStorage access
        try {
            localStorage.setItem('test', 'value');
            const value = localStorage.getItem('test');
            localStorage.removeItem('test');

            diagnostics.localStorage = {
                test: 'LocalStorage Access',
                result: value === 'value' ? 'PASS' : 'FAIL',
                details: {
                    canWrite: true,
                    canRead: value === 'value'
                }
            };
        } catch (error: any) {
            diagnostics.localStorage = {
                test: 'LocalStorage Access',
                result: 'FAIL',
                details: {
                    error: error.message,
                    blocked: true
                }
            };
        }

        // 6. Check cookies enabled
        diagnostics.cookies = {
            test: 'Cookies Enabled',
            result: navigator.cookieEnabled ? 'PASS' : 'WARN',
            details: {
                enabled: navigator.cookieEnabled
            }
        };

        // 7. Network timing test
        diagnostics.networkTiming = await runTest('Network Performance', async () => {
            const timings = [];
            for (let i = 0; i < 3; i++) {
                const start = Date.now();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);

                try {
                    await fetch(`${SUPABASE_URL}/auth/v1/health`, {
                        headers: { 'apikey': SUPABASE_ANON_KEY },
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);
                    timings.push(Date.now() - start);
                } catch (error) {
                    clearTimeout(timeoutId);
                    timings.push(-1); // Mark failed requests
                }
            }

            const validTimings = timings.filter(t => t > 0);

            return {
                test: 'Network Performance',
                result: validTimings.length === 0 ? 'FAIL' : (Math.max(...validTimings) < 1000 ? 'PASS' : 'WARN'),
                details: {
                    timings,
                    successfulRequests: validTimings.length,
                    average: validTimings.length > 0 ? Math.round(validTimings.reduce((a, b) => a + b) / validTimings.length) : 'N/A',
                    max: validTimings.length > 0 ? Math.max(...validTimings) : 'N/A'
                }
            };
        });

        // 8. Test simple fetch (non-Supabase)
        diagnostics.simpleFetch = await runTest('Basic Network Test', async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const start = Date.now();
                // Test with a simple, reliable endpoint
                const response = await fetch('https://api.github.com/zen', {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const elapsed = Date.now() - start;
                const text = await response.text();

                return {
                    test: 'Basic Network Test',
                    result: response.ok ? 'PASS' : 'FAIL',
                    details: {
                        status: response.status,
                        responseTime: `${elapsed}ms`,
                        responsePreview: text.substring(0, 50)
                    }
                };
            } catch (error: any) {
                clearTimeout(timeoutId);
                return {
                    test: 'Basic Network Test',
                    result: 'FAIL',
                    details: { error: error.message }
                };
            }
        });

        // 9. Browser info
        diagnostics.browser = {
            test: 'Browser Info',
            result: 'INFO',
            details: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                onLine: navigator.onLine,
                doNotTrack: navigator.doNotTrack
            }
        };

        setResults(diagnostics);
        setRunning(false);
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    const getResultColor = (result: string) => {
        switch (result) {
            case 'PASS': return 'text-green-600';
            case 'FAIL': return 'text-red-600';
            case 'WARN': return 'text-yellow-600';
            case 'TIMEOUT': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Supabase Connection Diagnostics</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <button
                        onClick={runDiagnostics}
                        disabled={running}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {running ? 'Running...' : 'Run Diagnostics'}
                    </button>
                </div>

                <div className="space-y-4">
                    {Object.entries(results).map(([key, diagnostic]: [string, any]) => (
                        <div key={key} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-semibold">{diagnostic.test}</h3>
                                <span className={`font-bold ${getResultColor(diagnostic.result)}`}>
                                    {diagnostic.result}
                                </span>
                            </div>

                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                                {JSON.stringify(diagnostic.details, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">Troubleshooting Tips</h3>
                    <ul className="space-y-2 text-sm">
                        <li>• If LocalStorage fails: Check if third-party cookies are blocked in Chrome settings</li>
                        <li>• If Health Check fails: Check network/firewall settings or try a different network</li>
                        <li>• If cookies are disabled: Enable cookies in browser settings</li>
                        <li>• For Chrome Incognito: Settings → Privacy → Allow third-party cookies</li>
                        <li>• Try disabling browser extensions that might block requests</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}