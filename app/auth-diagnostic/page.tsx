'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function AuthDiagnosticPage() {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        const diagnostics: any = {
            timestamp: new Date().toISOString(),
            tests: []
        };

        // Test 1: Environment Variables
        diagnostics.env = {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
            supabaseKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
            baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'not set'
        };

        // Test 2: Supabase Client
        diagnostics.tests.push({
            name: 'Supabase Client Initialization',
            status: supabase ? 'PASS' : 'FAIL',
            details: typeof supabase
        });

        // Test 3: Network Connectivity
        try {
            const startTime = Date.now();
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
                method: 'HEAD',
                headers: {
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                }
            });
            const endTime = Date.now();

            diagnostics.tests.push({
                name: 'Supabase Network Connectivity',
                status: response.ok ? 'PASS' : 'FAIL',
                details: {
                    status: response.status,
                    statusText: response.statusText,
                    latency: `${endTime - startTime}ms`
                }
            });
        } catch (err: any) {
            diagnostics.tests.push({
                name: 'Supabase Network Connectivity',
                status: 'FAIL',
                error: err.message
            });
        }

        // Test 4: Auth Endpoint
        try {
            const startTime = Date.now();
            const { data, error } = await supabase.auth.getSession();
            const endTime = Date.now();

            diagnostics.tests.push({
                name: 'Auth Session Check',
                status: error ? 'FAIL' : 'PASS',
                details: {
                    hasSession: !!data.session,
                    error: error?.message,
                    latency: `${endTime - startTime}ms`
                }
            });
        } catch (err: any) {
            diagnostics.tests.push({
                name: 'Auth Session Check',
                status: 'FAIL',
                error: err.message
            });
        }

        // Test 5: Simple Auth Test
        try {
            const startTime = Date.now();
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'test@invalid-email-for-testing.com',
                password: 'invalid-password-12345'
            });
            const endTime = Date.now();

            diagnostics.tests.push({
                name: 'Auth Sign In Test (Should Fail with Invalid Credentials)',
                status: error && error.message.includes('Invalid') ? 'PASS' : 'UNEXPECTED',
                details: {
                    error: error?.message,
                    hasData: !!data,
                    latency: `${endTime - startTime}ms`
                }
            });
        } catch (err: any) {
            diagnostics.tests.push({
                name: 'Auth Sign In Test',
                status: 'ERROR',
                error: err.message
            });
        }

        setResults(diagnostics);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Authentication Diagnostic Tool
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Tests Supabase connection, environment configuration, and auth functionality
                    </p>

                    <button
                        onClick={runDiagnostics}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
                    </button>

                    {results && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnostic Results</h2>

                            {/* Environment */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-gray-700 mb-2">Environment Variables</h3>
                                <pre className="text-sm text-gray-600 overflow-x-auto">
                                    {JSON.stringify(results.env, null, 2)}
                                </pre>
                            </div>

                            {/* Tests */}
                            <div className="space-y-4">
                                {results.tests.map((test: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-lg border-2 ${test.status === 'PASS'
                                                ? 'bg-green-50 border-green-300'
                                                : test.status === 'FAIL'
                                                    ? 'bg-red-50 border-red-300'
                                                    : 'bg-yellow-50 border-yellow-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-gray-900">{test.name}</h4>
                                            <span
                                                className={`px-3 py-1 rounded text-sm font-bold ${test.status === 'PASS'
                                                        ? 'bg-green-200 text-green-800'
                                                        : test.status === 'FAIL'
                                                            ? 'bg-red-200 text-red-800'
                                                            : 'bg-yellow-200 text-yellow-800'
                                                    }`}
                                            >
                                                {test.status}
                                            </span>
                                        </div>
                                        {test.details && (
                                            <pre className="text-sm text-gray-600 mt-2 overflow-x-auto">
                                                {JSON.stringify(test.details, null, 2)}
                                            </pre>
                                        )}
                                        {test.error && (
                                            <div className="mt-2 text-sm text-red-600">
                                                <strong>Error:</strong> {test.error}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Raw Results */}
                            <details className="mt-6">
                                <summary className="cursor-pointer font-bold text-gray-700 hover:text-gray-900">
                                    View Raw Results (JSON)
                                </summary>
                                <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs">
                                    {JSON.stringify(results, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-2">🔍 Common Issues & Solutions</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>
                            <strong>Network Connectivity FAIL:</strong> Check if Supabase URL is correct and accessible
                        </li>
                        <li>
                            <strong>Auth Session Check FAIL:</strong> Verify SUPABASE_ANON_KEY is set correctly
                        </li>
                        <li>
                            <strong>Sign In Test ERROR:</strong> May indicate CORS issues or API configuration problems
                        </li>
                        <li>
                            <strong>All tests timing out:</strong> Check network firewall or DNS resolution
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
