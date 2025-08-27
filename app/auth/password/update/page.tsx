'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function PasswordUpdatePage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Ensure user is authenticated after clicking reset link
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) setStatus('Session missing. Use the reset link again.');
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setStatus('Passwords do not match');
    if (password.length < 8) return setStatus('Password must be at least 8 characters');

    console.log('🔐 Password update starting...');
    // Ensure we actually have a reset session; without it Supabase will reject silently sometimes.
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        console.warn('🔐 getSession error before update attempt:', sessionErr.message);
      }
      if (!sessionData?.session) {
        console.warn('🔐 No active auth session present on password update page. User likely opened link in a fresh context.');
        setStatus('Missing secure reset session. Please click the password reset link in your email again.');
        return;
      } else {
        console.log('🔐 Active reset session detected with user id:', sessionData.session.user.id);
      }
    } catch (sessEx: any) {
      console.error('🔐 Unexpected error during pre-update session check:', sessEx);
    }
    setLoading(true);
    setStatus('Saving...');

    try {
      console.log('🔐 Updating password with Supabase...');
      const { error } = await supabase.auth.updateUser({ password });
      console.log('🔐 updateUser call finished');

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
        <Input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='New password' required />
        <Input type='password' value={confirm} onChange={e => setConfirm(e.target.value)} placeholder='Confirm password' required />
        {status && (
          <div
            className={`text-sm rounded-md border px-3 py-2 ${
              status.toLowerCase().includes('missing') || status.toLowerCase().includes('error') || status.toLowerCase().includes('fail')
                ? 'bg-red-50 text-red-700 border-red-200'
                : status.toLowerCase().includes('redirecting') || status.toLowerCase().includes('updated')
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >{status}</div>
        )}
        <Button type='submit' disabled={loading}>{loading ? 'Saving...' : 'Update Password'}</Button>
      </form>
    </div>
  );
}
