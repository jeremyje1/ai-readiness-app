'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { authService } from '@/lib/auth-service'; // Bypassed due to hanging issues
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill email from URL parameter if provided
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for success messages from URL parameters
    const message = searchParams.get('message');
    const urlEmail = searchParams.get('email');

    if (message === 'password-set' && urlEmail) {
      setSuccessMessage(`✅ Password set successfully for ${urlEmail}! Please log in with this email.`);
    } else if (message === 'password-set') {
      setSuccessMessage('✅ Password set successfully! You can now log in.');
    } else if (message === 'password-updated') {
      setSuccessMessage('✅ Password updated successfully! You can now log in.');
    }

    // Update email if URL parameter changes
    if (urlEmail) {
      setEmail(urlEmail);
    }

    // Test Supabase connection on load
    const testConnection = async () => {
      try {
        // Create a timeout wrapper for getSession to prevent hanging in Chrome incognito
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Session check timeout - this is normal in private browsing mode'));
          });
        });

        try {
          const { error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
          clearTimeout(timeoutId);

          if (error) {
            setDebugInfo(`⚠️ Auth connection issue: ${error.message}`);
          } else {
            setDebugInfo('✅ Supabase connection OK');
          }
        } catch (timeoutErr: any) {
          clearTimeout(timeoutId);
          // Check if actually in private mode or just Chrome issue
          const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
          if (isChrome) {
            setDebugInfo('ℹ️ Chrome detected - using compatibility mode');
          } else {
            setDebugInfo('ℹ️ Running in private browsing mode');
          }
        }
      } catch (err: any) {
        setDebugInfo(`❌ Connection failed: ${err.message}`);
      }
    };
    testConnection();
  }, [searchParams]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔐 Starting form submission');
    console.log('🔐 Email:', email.trim());
    console.log('🔐 Supabase client available:', typeof supabase);
    console.log('🔐 Password length:', password.length);

    // Set loading state
    setLoading(true);
    setError(null);
    console.log('🔐 Loading state set to:', true);

    try {
      console.log('🔐 About to call authService.signInWithPassword...');

      // Add a small delay to ensure the UI updates
      await new Promise(resolve => setTimeout(resolve, 10));

      console.log('🔐 Using direct Supabase auth (bypassing auth service)...');

      // Wrap entire login process in a timeout
      const loginProcess = async () => {
        // Use direct Supabase auth to avoid hanging issues
        console.log('🔐 Calling supabase.auth.signInWithPassword...');

        // Chrome workaround: Use fetch API directly for Chrome browsers
        const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
        console.log('🔐 Is Chrome browser:', isChrome);

        if (isChrome) {
          console.log('🔐 Using Chrome workaround with direct API call...');
          try {
            // Use hardcoded URL as fallback since env vars might not be available in browser
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jocigzsthcpspxfdfxae.supabase.co';
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA';

            console.log('🔐 Using Supabase URL:', supabaseUrl);

            const requestBody = JSON.stringify({
              email: email.trim(),
              password,
              gotrue_meta_security: {}
            });

            const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
            console.log('🔐 Making request to:', authUrl);
            console.log('🔐 Request body:', requestBody);
            console.log('🔐 Request headers:', { 'Content-Type': 'application/json', 'apikey': supabaseKey.substring(0, 20) + '...' });

            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            try {
              const response = await fetch(authUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': supabaseKey
                },
                body: requestBody,
                signal: controller.signal
              });

              clearTimeout(timeoutId);

              console.log('🔐 Response received:', response);
              console.log('🔐 Response status:', response.status);
              console.log('🔐 Response ok:', response.ok);

              const data = await response.json();
              console.log('🔐 Response data:', data);

              if (!response.ok) {
                console.error('🔐 Chrome auth failed with status:', response.status, data);

                // Specific handling for invalid credentials
                if (data.error_code === 'invalid_credentials' || data.msg === 'Invalid login credentials') {
                  return {
                    data: null,
                    error: { message: 'Invalid email or password. Please check your credentials and try again.' },
                    method: 'chrome-api',
                    timestamp: Date.now()
                  };
                }

                return {
                  data: null,
                  error: { message: data.error_description || data.msg || 'Authentication failed' },
                  method: 'chrome-api',
                  timestamp: Date.now()
                };
              }

              // Set the session manually (non-blocking for Chrome)
              console.log('🔐 Setting session manually for Chrome...');

              // Don't await setSession in Chrome as it may hang
              // Just fire it and continue - the session will be set in the background
              supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token
              }).then(() => {
                console.log('🔐 Session set successfully in background');
              }).catch((err) => {
                console.warn('🔐 Session set warning (non-fatal):', err);
              });

              console.log('🔐 Returning successful Chrome auth result');
              return {
                data: { session: data, user: data.user },
                error: null,
                method: 'chrome-api',
                timestamp: Date.now()
              };
            } catch (fetchError: any) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                console.error('🔐 Chrome auth request timed out after 10 seconds');
                return {
                  data: null,
                  error: { message: 'Request timed out - please try again' },
                  method: 'chrome-api-timeout',
                  timestamp: Date.now()
                };
              }
              console.error('🔐 Chrome auth fetch error:', fetchError);
              return {
                data: null,
                error: { message: fetchError.message || 'Network error occurred' },
                method: 'chrome-api-error',
                timestamp: Date.now()
              };
            }
          } catch (err: any) {
            console.error('🔐 Chrome API error:', err);
            return {
              data: null,
              error: { message: err.message },
              method: 'chrome-api',
              timestamp: Date.now()
            };
          }
        }

        // Standard approach for other browsers
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        return {
          data,
          error,
          method: 'direct',
          timestamp: Date.now()
        };
      };

      // Add 15-second timeout to entire login process
      let timeoutId: NodeJS.Timeout;
      let isResolved = false;

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          if (!isResolved) {
            console.error('🔐 Login timeout after 15 seconds');
            reject(new Error('Login timeout - server not responding. Please try again.'));
          }
        }, 15000);
      });

      const loginWithCleanup = async () => {
        try {
          const result = await loginProcess();
          isResolved = true;
          clearTimeout(timeoutId);
          console.log('🔐 Login completed successfully, timeout cleared');
          return result;
        } catch (error) {
          isResolved = true;
          clearTimeout(timeoutId);
          throw error;
        }
      };

      console.log('🔐 Starting login with 15s timeout...');

      let result;
      try {
        result = await Promise.race([loginWithCleanup(), timeoutPromise]) as any;
        console.log('🔐 Login process completed');
      } catch (timeoutError: any) {
        console.error('🔐 Login failed:', timeoutError.message);
        setError(timeoutError.message);
        setLoading(false);
        return;
      }

      console.log('🔐 AuthService response received');
      console.log('🔐 Full result:', JSON.stringify(result, null, 2));
      console.log('🔐 Method:', result.method);
      console.log('🔐 Data:', result.data ? 'Present' : 'Null');
      console.log('🔐 Error:', result.error ? result.error.message : 'None');

      if (result.error) {
        console.log('🔐 Processing error result...');

        // Improved error messages
        let errorMsg = 'Login failed: ';
        const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);

        if (result.error.message.includes('Invalid login credentials') || result.error.message.includes('Invalid email or password')) {
          errorMsg += 'Invalid email or password. Please check your credentials.';
        } else if (result.error.message.includes('Email not confirmed')) {
          errorMsg += 'Please confirm your email first';
        } else if (result.error.message.includes('timeout')) {
          if (isChrome) {
            errorMsg = 'Chrome is having connection issues. Please try using Safari, Firefox, or Edge instead.';
          } else {
            errorMsg += 'Connection timeout - please try again';
          }
        } else if (result.method === 'chrome-api-error' || result.method === 'chrome-api-timeout') {
          errorMsg = 'Chrome authentication issue detected. Please use Safari, Firefox, or Edge for a better experience.';
        } else {
          errorMsg += result.error.message;
        }
        setError(errorMsg);
        console.error('🔐 Setting error state:', result.error.message);
        console.error('🔐 Auth method was:', result.method);
        setLoading(false);
        console.log('🔐 Loading state set to false after error');
      } else if (result.data?.session) {
        console.log('✅ Login successful, session established');
        console.log('✅ Session user:', result.data.session.user?.email);
        console.log('✅ Access token exists:', !!result.data.session.access_token);
        setSuccessMessage('Login successful! Redirecting...');

        // Use window.location instead of router.push to force full page reload
        // This ensures Supabase client picks up the new session from cookies
        setTimeout(() => {
          console.log('🔐 Redirecting to success page with full page reload...');
          // Changed to redirect to /auth/success instead of dashboard which requires payment
          window.location.href = '/auth/success';
        }, 500);
        // Don't set loading to false here - let redirect happen
      } else {
        console.log('🔐 No session in successful result');
        setError('Login failed: No session returned');
        console.error('🔐 No session data returned');
        setLoading(false);
        console.log('🔐 Loading state set to false after no session');
      }
    } catch (err: any) {
      console.error('🔐 Exception caught in submit:', err);
      console.error('🔐 Exception stack:', err.stack);

      const errorMsg = `Unexpected error: ${err.message || 'Unknown error'}`;
      setError(errorMsg);
      console.error('🔐 Setting error state for exception:', err.message);
      setLoading(false);
      console.log('🔐 Loading state set to false after exception');
    }

    console.log('🔐 Submit function completed');
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

        {/* Debug info */}
        {debugInfo && (
          <div className='text-xs text-gray-600 bg-gray-50 p-2 rounded'>
            {debugInfo}
          </div>
        )}

        {/* Chrome notice */}
        {(debugInfo === 'ℹ️ Running in private browsing mode' || debugInfo === 'ℹ️ Chrome detected - using compatibility mode') && (
          <div className='text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2'>
            <strong>Note:</strong> {debugInfo === 'ℹ️ Chrome detected - using compatibility mode'
              ? 'Chrome browser detected. Using compatibility mode for best performance.'
              : "You're using private browsing mode. Some features may be limited, but login should still work."}
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
            className={searchParams.get('message') === 'password-set' ? 'border-green-500 bg-green-50' : ''}
          />
          {searchParams.get('message') === 'password-set' && email && (
            <p className='text-xs text-green-600 mt-1'>
              ✓ Use this email address to log in
            </p>
          )}
        </div>
        <div>
          <label className='block text-sm mb-1'>Password</label>
          <Input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder='Enter your password'
          />
        </div>

        {error && (
          <div className='text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200'>
            {error}
          </div>
        )}

        <Button
          type='submit'
          disabled={loading}
          className='w-full'
          onClick={() => {
            console.log('🔐 Button clicked!');
            console.log('🔐 Loading state:', loading);
            console.log('🔐 Button disabled:', loading);
            console.log('🔐 Email filled:', !!email.trim());
            console.log('🔐 Password filled:', !!password);
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
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
