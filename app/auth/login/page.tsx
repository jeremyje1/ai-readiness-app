'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth-service';
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
        const { error } = await supabase.auth.getSession();
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
    
    console.log('🔐 Form submission started');
    console.log('🔐 Email:', email);
    console.log('🔐 Password length:', password.length);
    console.log('🔐 AuthService available:', typeof authService);
    
    // Set loading state
    setLoading(true);
    setError(null);
    console.log('🔐 Loading state set to:', true);

    try {
      console.log('🔐 About to call authService.signInWithPassword...');
      
      // Add a small delay to ensure the UI updates
      await new Promise(resolve => setTimeout(resolve, 10));
      
      console.log('🔐 Calling authService.signInWithPassword now...');
      
      // Use AuthService with built-in timeout and fallback
      let result;
      try {
        result = await authService.signInWithPassword(email.trim(), password);
      } catch (authServiceError: any) {
        console.error('🔐 AuthService threw an error, falling back to direct Supabase:', authServiceError);
        
        // Fallback to direct Supabase client if AuthService fails
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });
          
          result = {
            data,
            error,
            method: 'direct-fallback',
            timestamp: Date.now()
          };
        } catch (directError: any) {
          console.error('🔐 Direct Supabase also failed:', directError);
          throw new Error(`Both AuthService and direct Supabase failed: ${authServiceError.message} | ${directError.message}`);
        }
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
        if (result.error.message.includes('Invalid login credentials')) {
          errorMsg += 'Invalid email or password';
        } else if (result.error.message.includes('Email not confirmed')) {
          errorMsg += 'Please confirm your email first';
        } else if (result.error.message.includes('timeout')) {
          errorMsg += 'Connection timeout - please try again';
        } else {
          errorMsg += result.error.message;
        }
        setError(errorMsg);
        console.error('🔐 Setting error state:', result.error.message);
        setLoading(false);
        console.log('🔐 Loading state set to false after error');
      } else if (result.data?.session) {
        console.log('✅ Login successful, session established');
        setSuccessMessage('Login successful! Redirecting...');

        // Small delay to show success message, then redirect
        setTimeout(() => {
          console.log('🔐 Redirecting to dashboard...');
          router.push('/ai-readiness/dashboard');
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
          onClick={() => {
            console.log('🔐 Button clicked!');
            console.log('🔐 Loading state:', loading);
            console.log('🔐 Button disabled:', loading);
            console.log('🔐 AuthService available:', !!authService);
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
