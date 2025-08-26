'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
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
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError(null);
    
    console.log('🔐 Attempting login for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      console.log('🔐 Login result:', { data: !!data, error: error?.message });
      
      if (error) {
        setError(`Login failed: ${error.message}`);
        console.error('🔐 Login error:', error);
      } else {
        console.log('✅ Login successful, redirecting...');
        router.push('/ai-readiness/dashboard');
      }
    } catch (err: any) {
      const errorMsg = `Unexpected error: ${err.message}`;
      setError(errorMsg);
      console.error('🔐 Login exception:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6'>
      <form onSubmit={submit} className='bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4'>
        <h1 className='text-xl font-semibold'>Login</h1>
        
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
            onChange={e=>setEmail(e.target.value)} 
            required 
            placeholder='jeremy.estrella@gmail.com'
          />
        </div>
        <div>
          <label className='block text-sm mb-1'>Password</label>
          <Input 
            type='password' 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
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
