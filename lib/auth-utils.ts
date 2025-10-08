/**
 * Authentication utility functions to handle session management
 * and prevent caching issues
 */

import { createClient } from '@/lib/supabase/browser-client';

/**
 * Clear all authentication-related data from the browser
 */
export function clearAuthCache() {
    if (typeof window === 'undefined') return;

    try {
        // Clear local storage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('auth'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear session storage
        const sessionKeysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('auth'))) {
                sessionKeysToRemove.push(key);
            }
        }
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

        // Clear auth-related cookies
        document.cookie.split(";").forEach((c) => {
            const cookie = c.trim();
            if (cookie.includes('sb-') || cookie.includes('auth')) {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
            }
        });
    } catch (error) {
        console.error('Error clearing auth cache:', error);
    }
}

/**
 * Force refresh the current session
 */
export async function refreshSession() {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
            console.error('Session refresh error:', error);
            // If refresh fails, clear cache and redirect to login
            clearAuthCache();
            window.location.href = '/auth/login';
            return null;
        }

        return data.session;
    } catch (error) {
        console.error('Session refresh error:', error);
        clearAuthCache();
        window.location.href = '/auth/login';
        return null;
    }
}

/**
 * Check if the current session is valid and refresh if needed
 */
export async function validateSession() {
    try {
        const supabase = createClient();

        // First try to get the session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            clearAuthCache();
            return null;
        }

        // Check if session is expired or about to expire (within 5 minutes)
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (expiresAt && (now > expiresAt || now > expiresAt - fiveMinutes)) {
            // Session is expired or about to expire, refresh it
            return await refreshSession();
        }

        return session;
    } catch (error) {
        console.error('Session validation error:', error);
        clearAuthCache();
        return null;
    }
}

/**
 * Initialize session validation on app load
 */
export function initializeAuthValidation() {
    if (typeof window === 'undefined') return;

    // Validate session on page load
    validateSession();

    // Set up periodic session validation (every 5 minutes)
    setInterval(() => {
        validateSession();
    }, 5 * 60 * 1000);

    // Validate session when window regains focus
    window.addEventListener('focus', () => {
        validateSession();
    });

    // Clear cache on certain errors
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.message &&
            (event.reason.message.includes('refresh_token_not_found') ||
                event.reason.message.includes('invalid_grant') ||
                event.reason.message.includes('Auth session missing'))) {
            clearAuthCache();
            window.location.href = '/auth/login';
        }
    });
}