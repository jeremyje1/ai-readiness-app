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
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success messages from URL parameters
    const message = searchParams.get('message');
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
      try {
        const state = await sessionManager.getSessionState();
        if (state.session && !state.error) {
          console.log('🔐 Existing valid session found, redirecting...');
          setHasValidSession(true);
          router.push('/ai-readiness/dashboard');
        }
      } catch (err) {
        console.warn('🔐 Session check failed:', err);
        // Continue with login form if session check fails
      }
    };
    checkExistingSession();
  }, [searchParams, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent form submission if we already have a valid session
    if (hasValidSession) {
      console.log('🔐 Form submission blocked - valid session exists');
      return;
    }
    
    setLoading(true);
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
        return;
      }

      if (result.fallbackUsed) {
        console.log('⚡ Fallback authentication path was used');
        setFallbackUsed(true);
      }

      console.log('✅ Authentication successful, redirecting...');
      router.push('/ai-readiness/dashboard');

    } catch (err: any) {
      console.error('🔐 Unexpected error during authentication:', err);
      setError(err.message || 'An unexpected error occurred during login');
    } finally {
      setLoading(false);
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
            disabled={hasValidSession}
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
            disabled={hasValidSession}
          />
        </div>

        {error && (
          <div className='text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200'>
            {error}
          </div>
        )}

        <Button
          type='submit'
          disabled={loading || hasValidSession}
          className='w-full'
          onClick={(e: React.MouseEvent) => {
            console.log('🔐 Button clicked!');
            console.log('🔐 Loading state:', loading);
            console.log('🔐 Has valid session:', hasValidSession);
            console.log('🔐 Button disabled:', loading || hasValidSession);
          }}
        >
          {hasValidSession ? 'Redirecting...' : loading ? 'Signing in...' : 'Sign In'}
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
