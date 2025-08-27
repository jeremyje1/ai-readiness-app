'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase-enhanced';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

    // Test Supabase connection on load
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setDebugInfo(`⚠️ Auth connection issue: ${error.message}`);
        } else {
          setDebugInfo('✅ Supabase connection OK');
        }
      } catch (err: any) {
        setDebugInfo(`❌ Connection failed: ${err.message}`);
      }
    };
    testConnection();
  }, [searchParams]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('🔐 Form submission started');
    console.log('🔐 Email:', email);
    console.log('🔐 Loading state set to:', true);

    // Add timeout protection
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Login timeout - please try again');
        setLoading(false);
        console.error('🔐 Login timeout after 12s');
      }
    }, 12000);

    try {
      console.log('🔐 Attempting enhanced Supabase signInWithPassword...');

      // Use our enhanced auth service with automatic fallback
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      clearTimeout(timeoutId);

      console.log('🔐 Supabase response received');
      console.log('🔐 Data:', data ? 'Present' : 'Null');
      console.log('🔐 Error:', error ? error.message : 'None');

      if (error) {
        // Improved error messages
        let errorMsg = 'Login failed: ';
        if (error.message.includes('Invalid login credentials')) {
          errorMsg += 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMsg += 'Please confirm your email first';
        } else if (error.message.includes('timeout')) {
          errorMsg += 'Connection timeout - please try again';
        } else {
          errorMsg += error.message;
        }
        setError(errorMsg);
        console.error('🔐 Setting error state:', error.message);
      } else if (data?.session) {
        console.log('✅ Login successful, session established');
        setSuccessMessage('Login successful! Redirecting...');

        // Small delay to show success message
        setTimeout(() => {
          router.push('/ai-readiness/dashboard');
        }, 500);
      } else {
        setError('Login failed: No session returned');
        console.error('🔐 No session data returned');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const errorMsg = `Unexpected error: ${err.message}`;
      setError(errorMsg);
      console.error('🔐 Caught exception:', err);
    }

    console.log('🔐 Setting loading state to false');
    setLoading(false);
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

        <div>
          <label className='block text-sm mb-1'>Email</label>
          <Input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder='jeremy.estrella@gmail.com'
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
          onClick={(e) => {
            console.log('🔐 Button clicked!');
            console.log('🔐 Loading state:', loading);
            console.log('🔐 Button disabled:', loading);
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
