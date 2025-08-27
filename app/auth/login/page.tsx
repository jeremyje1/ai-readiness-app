'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/auth-service';
import { sessionManager } from '@/lib/session-manager';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [isActivelyLoggingIn, setIsActivelyLoggingIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success messages from URL parameters
    const message = searchParams.get('message');
    const fromPasswordSetup = message === 'password-set' || message === 'password-updated';

    if (message === 'password-set') {
      setSuccessMessage('✅ Password set successfully! You can now log in.');
    } else if (message === 'password-updated') {
      setSuccessMessage('✅ Password updated successfully! You can now log in.');
    }

    // Test connection using enhanced auth service
    const testConnection = async () => {
      try {
        const connectionTest = await authService.testConnection();
        if (connectionTest.status === 'ok') {
          setDebugInfo(`✅ Auth service ready (${connectionTest.latency}ms)`);
        } else {
          setDebugInfo(`⚠️ Auth service issue: ${connectionTest.message}`);
        }
      } catch (err: any) {
        setDebugInfo(`❌ Connection test failed: ${err.message}`);
      }
    };
    testConnection();

    // Initialize session manager and check for existing session
    const checkExistingSession = async () => {
      // Check if coming from password setup - don't auto-redirect in this case
      const message = searchParams.get('message');
      const fromPasswordSetup = message === 'password-set' || message === 'password-updated';

      if (fromPasswordSetup) {
        console.log('🔐 Coming from password setup - allowing manual login instead of auto-redirect');
        return;
      }

      // Don't check for existing sessions if we're actively logging in
      if (isActivelyLoggingIn) {
        console.log('🔐 Skipping session check - login in progress');
        return;
      }

      try {
        const state = await sessionManager.getSessionState();

        // Enhanced validation: ensure we have a truly authenticated session
        const isValidAuthenticatedSession = state.session &&
          !state.error &&
          state.session.user &&
          state.session.access_token;

        if (isValidAuthenticatedSession && state.session) {
          // Additional validation: ensure session is truly stable
          // Wait a moment and check again to avoid race conditions
          await new Promise(resolve => setTimeout(resolve, 100));

          // Re-check if we're still not actively logging in
          if (!isActivelyLoggingIn) {
            // Verify session is not expired
            try {
              const sessionTime = state.session.expires_at ? new Date(state.session.expires_at * 1000) : new Date();
              const isValidSession = sessionTime.getTime() > Date.now();

              if (isValidSession) {
                console.log('🔐 Existing valid authenticated session found, redirecting...');
                setHasValidSession(true);
                router.push('/ai-readiness/dashboard');
              } else {
                console.log('🔐 Found expired session, staying on login page');
              }
            } catch (err) {
              console.log('🔐 Error validating existing session, staying on login page:', err);
            }
          } else {
            console.log('🔐 Session found but login started, skipping redirect');
          }
        } else {
          console.log('🔐 No valid authenticated session found');
        }
      } catch (err) {
        console.warn('🔐 Session check failed:', err);
        // Continue with login form if session check fails
      }
    };

    // Only check for existing session on initial load, not when actively logging in
    if (!isActivelyLoggingIn) {
      checkExistingSession();
    }
  }, [searchParams, router, isActivelyLoggingIn]);

  // Add session state change listener that respects login state
  useEffect(() => {
    const unsubscribe = sessionManager.onSessionChange((state) => {
      // Check if coming from password setup - don't auto-redirect in this case
      const message = searchParams.get('message');
      const fromPasswordSetup = message === 'password-set' || message === 'password-updated';

      if (fromPasswordSetup) {
        console.log('🔐 Ignoring session change - from password setup, allowing manual login');
        return;
      }

      // Ignore session changes during active login process
      if (isActivelyLoggingIn) {
        console.log('🔐 Ignoring session change during active login');
        return;
      }

      // Additional safety: check if we're in a loading state
      if (loading) {
        console.log('🔐 Ignoring session change during loading state');
        return;
      }

      // Enhanced validation: ensure we have a truly authenticated session
      // Check that session exists, has no error, user exists, and session is not expired
      const isValidAuthenticatedSession = state.session &&
        !state.error &&
        state.session.user &&
        state.session.access_token &&
        !hasValidSession;

      if (isValidAuthenticatedSession && state.session) {
        // Additional check: verify session is not from INITIAL_SESSION event
        // by checking if the session has a recent timestamp
        try {
          const sessionTime = state.session.expires_at ? new Date(state.session.expires_at * 1000) : new Date();
          const isRecentSession = (Date.now() - sessionTime.getTime()) < (1000 * 60 * 60); // Less than 1 hour

          if (isRecentSession) {
            console.log('🔐 Session state changed to valid authenticated session, redirecting...');
            setHasValidSession(true);

            // Small delay to ensure we're not in a race condition
            setTimeout(() => {
              // Check if coming from password setup - don't auto-redirect
              const currentMessage = searchParams.get('message');
              const fromPasswordSetup = currentMessage === 'password-set' || currentMessage === 'password-updated';

              if (fromPasswordSetup) {
                console.log('🔐 Skipping auto-redirect from session change - from password setup');
                return;
              }

              if (!isActivelyLoggingIn && !loading) {
                router.push('/ai-readiness/dashboard');
              }
            }, 100);
          } else {
            console.log('🔐 Ignoring expired session state');
          }
        } catch (err) {
          console.log('🔐 Error validating session timestamp, treating as valid:', err);
          // If we can't validate the timestamp, proceed with caution
          setHasValidSession(true);
          setTimeout(() => {
            // Check if coming from password setup - don't auto-redirect
            const currentMessage = searchParams.get('message');
            const fromPasswordSetup = currentMessage === 'password-set' || currentMessage === 'password-updated';

            if (fromPasswordSetup) {
              console.log('🔐 Skipping auto-redirect from catch block - from password setup');
              return;
            }

            if (!isActivelyLoggingIn && !loading) {
              router.push('/ai-readiness/dashboard');
            }
          }, 100);
        }
      }
    });

    return unsubscribe;
  }, [isActivelyLoggingIn, hasValidSession, loading, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent form submission if we already have a valid session
    if (hasValidSession) {
      console.log('🔐 Form submission blocked - valid session exists');
      return;
    }

    setLoading(true);
    setIsActivelyLoggingIn(true);
    setError(null);
    setFallbackUsed(false);

    console.log('🔐 Enhanced auth: form submission started');
    console.log('🔐 Email:', email);

    try {
      const result = await authService.signInWithPassword({
        email: email.trim(),
        password
      });

      if (result.error) {
        console.error('🔐 Authentication failed:', result.error.message);
        setError(result.error.message);
        setIsActivelyLoggingIn(false);
        setLoading(false);
        return;
      }

      if (result.fallbackUsed) {
        console.log('⚡ Fallback authentication path was used');
        setFallbackUsed(true);
      }

      console.log('✅ Authentication successful, redirecting...');

      // Longer delay to ensure session is properly established and avoid race conditions
      await new Promise(resolve => setTimeout(resolve, 750));

      // Final check before redirect to ensure we're still in the right state
      if (!hasValidSession) {
        router.push('/ai-readiness/dashboard');
      } else {
        console.log('🔐 Session already handled by listener, skipping redirect');
      }

    } catch (err: any) {
      console.error('🔐 Unexpected error during authentication:', err);
      setError(err.message || 'An unexpected error occurred during login');
    } finally {
      setLoading(false);
      setIsActivelyLoggingIn(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6'>
      <form onSubmit={submit} className='bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4'>
        <h1 className='text-xl font-semibold'>Login</h1>

        {/* Success message */}
        {successMessage && (
          <div className='text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200'>
            {successMessage}
          </div>
        )}

        {/* Session check indicator */}
        {hasValidSession && (
          <div className='text-sm text-blue-600 bg-blue-50 p-3 rounded border border-blue-200'>
            🔐 Valid session detected, redirecting...
          </div>
        )}

        {/* Active login indicator */}
        {isActivelyLoggingIn && (
          <div className='text-sm text-purple-600 bg-purple-50 p-3 rounded border border-purple-200'>
            🔄 Login in progress, please wait...
          </div>
        )}

        {/* Fallback usage indicator */}
        {fallbackUsed && (
          <div className='text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200'>
            ⚡ Fallback auth path used (please report this for optimization)
          </div>
        )}

        {/* Debug info */}
        {debugInfo && (
          <div className='text-xs text-gray-600 bg-gray-50 p-2 rounded'>
            {debugInfo}
          </div>
        )}

        <div>
          <label className='block text-sm mb-1'>Email</label>
          <Input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder='jeremy.estrella@gmail.com'
            disabled={hasValidSession || isActivelyLoggingIn}
          />
        </div>
        <div>
          <label className='block text-sm mb-1'>Password</label>
          <Input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder='Enter your password'
            disabled={hasValidSession || isActivelyLoggingIn}
          />
        </div>

        {error && (
          <div className='text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200'>
            {error}
          </div>
        )}

        <Button
          type='submit'
          disabled={loading || hasValidSession || isActivelyLoggingIn}
          className='w-full'
          onClick={(e: React.MouseEvent) => {
            console.log('🔐 Button clicked!');
            console.log('🔐 Loading state:', loading);
            console.log('🔐 Has valid session:', hasValidSession);
            console.log('🔐 Is actively logging in:', isActivelyLoggingIn);
            console.log('🔐 Button disabled:', loading || hasValidSession || isActivelyLoggingIn);
          }}
        >
          {hasValidSession ? 'Redirecting...' : (loading || isActivelyLoggingIn) ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className='text-xs text-gray-500 text-center'>
          <a href='/auth/password/reset' className='text-blue-600 underline'>
            Forgot password?
          </a>
          {' • '}
          <a href='/debug-auth' className='text-blue-600 underline'>
            Debug Auth
          </a>
        </div>
      </form>
    </div>
  );
}
