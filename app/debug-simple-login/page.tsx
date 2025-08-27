'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Direct Supabase client without our enhanced wrapper
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const directSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function DebugSimpleLoginPage() {
  const [email, setEmail] = useState('jeremy.estrella@gmail.com');
  const [password, setPassword] = useState('TempPassword123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const testDirectAuth = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    
    addLog('🚀 Starting direct Supabase authentication test');
    addLog(`📧 Email: ${email}`);
    
    try {
      addLog('🔐 Calling supabase.auth.signInWithPassword...');
      
      const { data, error } = await directSupabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      addLog('📡 Response received from Supabase');
      
      if (error) {
        addLog(`❌ Error: ${error.message}`);
        setError(`Authentication failed: ${error.message}`);
      } else if (data?.session) {
        addLog('✅ Success! Session created');
        addLog(`👤 User ID: ${data.user?.id}`);
        addLog(`📧 User Email: ${data.user?.email}`);
        addLog('🔄 Redirecting to dashboard...');
        
        setTimeout(() => {
          router.push('/ai-readiness/dashboard');
        }, 1000);
      } else {
        addLog('❌ No session data returned');
        setError('Login failed: No session returned');
      }
    } catch (err: any) {
      addLog(`💥 Exception caught: ${err.message}`);
      setError(`Unexpected error: ${err.message}`);
    }

    setLoading(false);
  };

  const testRestAPI = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    
    addLog('🌐 Starting direct REST API test');
    
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      addLog(`📡 REST response status: ${response.status}`);
      
      const data = await response.json();

      if (response.ok && data.access_token) {
        addLog('✅ REST API authentication successful!');
        addLog(`👤 User ID: ${data.user?.id}`);
        addLog(`📧 Email: ${data.user?.email}`);
      } else {
        addLog(`❌ REST API failed: ${data.error || data.msg || 'Unknown error'}`);
        setError(`REST API failed: ${data.error || data.msg || 'Unknown error'}`);
      }
    } catch (err: any) {
      addLog(`💥 REST API exception: ${err.message}`);
      setError(`REST API error: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6'>
      <div className='bg-white shadow rounded-lg p-6 w-full max-w-2xl space-y-4'>
        <h1 className='text-xl font-semibold'>Debug Simple Login Test</h1>
        <p className='text-sm text-gray-600'>
          This page tests authentication without the enhanced auth service wrapper
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm mb-1'>Email</label>
            <Input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='block text-sm mb-1'>Password</label>
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className='text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200'>
            {error}
          </div>
        )}

        <div className='flex gap-2'>
          <Button
            onClick={testDirectAuth}
            disabled={loading}
            className='flex-1'
          >
            {loading ? 'Testing...' : 'Test Direct Supabase SDK'}
          </Button>
          <Button
            onClick={testRestAPI}
            disabled={loading}
            variant='outline'
            className='flex-1'
          >
            {loading ? 'Testing...' : 'Test REST API'}
          </Button>
        </div>

        {/* Logs display */}
        {logs.length > 0 && (
          <div className='mt-6'>
            <h3 className='text-sm font-medium mb-2'>Debug Logs:</h3>
            <div className='bg-gray-50 p-3 rounded text-xs font-mono max-h-60 overflow-y-auto'>
              {logs.map((log, index) => (
                <div key={index} className='mb-1'>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}