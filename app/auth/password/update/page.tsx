'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PasswordUpdatePage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(()=>{
    // Ensure user is authenticated after clicking reset link
    supabase.auth.getSession().then(({ data })=>{
      if (!data.session) setStatus('Session missing. Use the reset link again.');
    });
  },[]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setStatus('Passwords do not match');
    if (password.length < 8) return setStatus('Password must be at least 8 characters');
    
    console.log('🔐 Password update starting...');
    setLoading(true);
    setStatus('Saving...');
    
    try {
      console.log('🔐 Updating password with Supabase...');
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('🔐 Password update error:', error);
        setStatus(error.message);
        return;
      }
      
      console.log('🔐 Password updated successfully, redirecting...');
      setStatus('Password updated. Redirecting...');
      setTimeout(() => router.push('/auth/login?message=password-updated'), 1500);
    } catch (err: any) {
      console.error('🔐 Unexpected error during password update:', err);
      setStatus(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6'>
      <form onSubmit={submit} className='bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4'>
        <h1 className='text-xl font-semibold'>Choose New Password</h1>
        <Input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='New password' required />
        <Input type='password' value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder='Confirm password' required />
        {status && <p className='text-sm text-gray-700'>{status}</p>}
        <Button type='submit' disabled={loading}>{loading? 'Saving...' : 'Update Password'}</Button>
      </form>
    </div>
  );
}
