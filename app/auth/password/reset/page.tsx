'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setStatus(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth/password/update' });
    setStatus(error ? error.message : 'If the email exists, a reset link was sent.');
    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6'>
      <form onSubmit={submit} className='bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4'>
        <h1 className='text-xl font-semibold'>Reset Password</h1>
        <p className='text-sm text-gray-600'>Enter your account email and we'll send a secure reset link.</p>
        <Input type='email' value={email} onChange={e=>setEmail(e.target.value)} required placeholder='you@domain.com' />
        {status && <p className='text-sm text-gray-700'>{status}</p>}
        <Button type='submit' disabled={loading}>{loading? 'Sending...' : 'Send Reset Link'}</Button>
      </form>
    </div>
  );
}
