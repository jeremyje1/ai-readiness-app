'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message); else router.push('/ai-readiness/dashboard');
    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6'>
      <form onSubmit={submit} className='bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4'>
        <h1 className='text-xl font-semibold'>Login</h1>
        <div>
          <label className='block text-sm mb-1'>Email</label>
          <Input type='email' value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className='block text-sm mb-1'>Password</label>
          <Input type='password' value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {error && <p className='text-sm text-red-600'>{error}</p>}
        <Button type='submit' disabled={loading}>{loading? 'Signing in...' : 'Sign In'}</Button>
        <div className='text-xs text-gray-500'>
          <a href='/auth/password/reset' className='text-blue-600 underline'>Forgot password?</a>
        </div>
      </form>
    </div>
  );
}
