'use client';

import { supabase } from '@/lib/supabase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

    // Don't check on auth-related pages to avoid redirect loops
    const isAuthPage = pathname?.startsWith('/auth/') || pathname === '/login';
    const isPasswordSetupPage = pathname === '/auth/password/setup';

    useEffect(() => {
        if (isAuthPage) {
            setIsChecking(false);
            return;
        }

        checkPasswordSetupRequired();
    }, [pathname, isAuthPage]);

    const checkPasswordSetupRequired = async () => {
        try {
            // Get current session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                // No session, let normal auth flow handle this
                setIsChecking(false);
                return;
            }

            // Check if user needs password setup
            const response = await fetch('/api/auth/password/check-required', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

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

            setIsChecking(false);

        } catch (error) {
            console.error('🔐 Password setup check error:', error);
            setIsChecking(false);
        }
    };

    // Show loading state while checking
    if (isChecking && !isAuthPage) {
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