'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DemoPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function initializeDemo() {
            try {
                setStatus('loading');

                // Call demo login endpoint
                const response = await fetch('/api/demo/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Failed to initialize demo');
                }

                setStatus('redirecting');

                // Redirect to dashboard with demo mode and tour enabled
                setTimeout(() => {
                    router.push(data.redirectUrl);
                }, 1000);

            } catch (error) {
                console.error('Demo initialization error:', error);
                setStatus('error');
                setErrorMessage(error instanceof Error ? error.message : 'Failed to start demo');
            }
        }

        initializeDemo();
    }, [router]);

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Demo Unavailable
                        </h1>
                        <p className="text-gray-600">
                            {errorMessage}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <a
                            href="/contact"
                            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4 animate-bounce">🚀</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {status === 'loading' ? 'Preparing Your Demo...' : 'Launching Dashboard...'}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {status === 'loading'
                            ? 'Setting up your 30-minute demo environment with sample data'
                            : 'Redirecting to your personalized dashboard'
                        }
                    </p>

                    {/* Loading spinner */}
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                </div>

                {/* Test Environment Warning */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-start">
                        <div className="text-yellow-400 text-xl mr-3">⚡</div>
                        <div className="text-sm">
                            <p className="font-semibold text-yellow-800 mb-1">Test Environment</p>
                            <ul className="text-yellow-700 space-y-1">
                                <li>• 30-minute session with pre-loaded data</li>
                                <li>• Full platform access (no credit card)</li>
                                <li>• Changes won't be saved</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-xs mt-4">
                    By using the demo, you agree to our{' '}
                    <a href="/terms" className="text-purple-600 hover:underline">Terms</a> and{' '}
                    <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}
