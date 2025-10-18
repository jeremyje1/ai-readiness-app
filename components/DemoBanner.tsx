'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function DemoBanner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isDemo, setIsDemo] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [showTourPrompt, setShowTourPrompt] = useState(false);

    useEffect(() => {
        // Check if in demo mode
        const demoMode = document.cookie.includes('demo-mode=true');
        setIsDemo(demoMode);

        if (!demoMode) return;

        // Check if tour should be shown
        const tourParam = searchParams.get('tour');
        if (tourParam === 'start') {
            setShowTourPrompt(true);
        }

        // Handler for session expiry
        const handleExpiry = () => {
            // Clear demo cookies
            document.cookie = 'demo-mode=; max-age=0; path=/';
            document.cookie = 'demo-expiry=; max-age=0; path=/';

            // Redirect to signup
            router.push('/get-started?reason=demo-expired');
        };

        // Get expiry time from cookie
        const cookies = document.cookie.split(';');
        const expiryCookie = cookies.find(c => c.trim().startsWith('demo-expiry='));

        if (expiryCookie) {
            const expiryTime = parseInt(expiryCookie.split('=')[1]);

            // Update countdown every second
            const interval = setInterval(() => {
                const remaining = expiryTime - Date.now();

                if (remaining <= 0) {
                    // Session expired
                    clearInterval(interval);
                    handleExpiry();
                } else {
                    setTimeRemaining(remaining);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [searchParams, router]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const startTour = () => {
        setShowTourPrompt(false);
        // Trigger tour via custom event
        window.dispatchEvent(new CustomEvent('start-demo-tour'));
    };

    if (!isDemo) return null;

    return (
        <>
            {/* Main Demo Banner */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 border-b-2 border-yellow-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl animate-pulse">⚡</span>
                            <div>
                                <p className="font-bold text-gray-900 text-sm sm:text-base">
                                    Demo Mode Active
                                </p>
                                <p className="text-xs text-gray-800">
                                    Exploring with sample data • Changes won't be saved
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {timeRemaining !== null && (
                                <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg shadow-sm">
                                    <p className="text-xs font-medium text-gray-600">Time Remaining</p>
                                    <p className="text-lg font-bold text-gray-900 tabular-nums">
                                        {formatTime(timeRemaining)}
                                    </p>
                                </div>
                            )}

                            {showTourPrompt && (
                                <button
                                    onClick={startTour}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span>🎯</span>
                                    <span className="hidden sm:inline">Start Tour</span>
                                </button>
                            )}

                            <a
                                href="/get-started?source=demo"
                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
                            >
                                <span>✨</span>
                                <span className="hidden sm:inline">Create Real Account</span>
                                <span className="sm:hidden">Sign Up</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tour Prompt Modal */}
            {showTourPrompt && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">👋</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Welcome to AI Blueprint!
                            </h2>
                            <p className="text-gray-600">
                                Would you like a quick tour of the platform's key features?
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={startTour}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Yes, Show Me Around
                            </button>
                            <button
                                onClick={() => setShowTourPrompt(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Skip for Now
                            </button>
                        </div>

                        <p className="text-center text-gray-500 text-xs mt-4">
                            You can start the tour anytime from the banner above
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
