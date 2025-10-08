'use client';

import { createClient } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface PasswordSetupGuardProps {
    children: React.ReactNode;
}

/**
 * Authentication guard that checks if users need to set up their password
 * and redirects them to the password setup page if needed.
 */
export function PasswordSetupGuard({ children }: PasswordSetupGuardProps) {
    const [isChecking, setIsChecking] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = useMemo(() => createClient(), []);

    // Don't check on auth-related pages and public pages to avoid redirect loops
    const publicPaths = ['/auth/', '/login', '/get-started', '/pricing', '/privacy', '/terms', '/contact', '/welcome'];
    const isPublicPage = publicPaths.some(path => pathname?.startsWith(path)) || pathname === '/';
    const isPasswordSetupPage = pathname === '/auth/password/setup';

    const checkPasswordSetupRequired = useCallback(async () => {
        try {
            // Get current session with increased timeout (15 seconds)
            const sessionPromise = supabase.auth.getSession();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Session check timeout')), 15000)
            );

            let session, sessionError;
            try {
                const result: any = await Promise.race([sessionPromise, timeoutPromise]);
                session = result.data?.session;
                sessionError = result.error;
            } catch (timeoutError) {
                console.warn('🔐 Session check timeout, skipping password check');
                setIsChecking(false);
                return;
            }

            if (sessionError || !session) {
                // No session, let normal auth flow handle this
                console.log('🔐 No session or session error, skipping password check');
                setIsChecking(false);
                return;
            }

            // Check if user needs password setup with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch('/api/auth/password/check-required', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();

                    if (data.needsPasswordSetup && !isPasswordSetupPage) {
                        console.log('🔐 User needs password setup, redirecting...');
                        setNeedsSetup(true);

                        // Redirect to password setup page, preserving the current URL for return
                        const returnUrl = encodeURIComponent(pathname || '/');
                        router.push(`/auth/password/setup?return_to=${returnUrl}`);
                        return;
                    }
                } else if (response.status === 401) {
                    // Session is invalid, let normal auth flow handle this
                    console.log('🔐 Invalid session during password check');
                } else {
                    console.warn('🔐 Password setup check failed:', response.status);
                }
            } catch (fetchError: any) {
                if (fetchError.name === 'AbortError') {
                    console.warn('🔐 Password check timed out, skipping');
                } else {
                    console.error('🔐 Password check fetch error:', fetchError);
                }
            }

            setIsChecking(false);

        } catch (error: any) {
            console.error('🔐 Password setup check error:', error.message);
            // On error, allow the page to load rather than blocking
            setIsChecking(false);
        }
    }, [isPasswordSetupPage, pathname, router, supabase]);

    useEffect(() => {
        if (isPublicPage) {
            setIsChecking(false);
            return;
        }

        checkPasswordSetupRequired();
    }, [pathname, isPublicPage, checkPasswordSetupRequired]);

    // Show loading state while checking
    if (isChecking && !isPublicPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="bg-white shadow rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication status...</p>
                </div>
            </div>
        );
    }

    // Show redirect message if user needs password setup
    if (needsSetup && !isPasswordSetupPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="bg-white shadow rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to password setup...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}