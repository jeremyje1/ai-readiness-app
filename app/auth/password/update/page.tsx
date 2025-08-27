'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/auth-service';
import { sessionManager } from '@/lib/session-manager';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function PasswordUpdatePage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verify session state and ensure user is authenticated for password update
    const checkSession = async () => {
      try {
        const sessionState = await sessionManager.getSessionState();
        
        if (sessionState.loading) {
          setStatus('Verifying session...');
          return;
        }
        
        if (sessionState.error) {
          setStatus(`Session error: ${sessionState.error}`);
          return;
        }
        
        if (!sessionState.session) {
          setStatus('No active session found. Please use the password reset link from your email.');
          return;
        }
        
        // Check if this is a password recovery session
        const user = sessionState.user;
        if (user) {
          console.log('🔐 Password update: session verified for user', user.id);
          setStatus(null); // Clear any status messages
        }
        
      } catch (error: any) {
        console.error('🔐 Session check failed:', error);
        setStatus('Session verification failed. Please try the reset link again.');
      }
    };
    
    checkSession();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirm) {
      setStatus('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setStatus('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setStatus('Updating password...');

    try {
      console.log('🔐 Enhanced auth: updating password...');
      
      // Verify we still have a valid session before attempting update
      const sessionState = await sessionManager.getSessionState();
      if (!sessionState.session) {
        setStatus('Session expired. Please use the password reset link again.');
        setLoading(false);
        return;
      }
      
      // Use enhanced auth service for password update
      const { error } = await authService.updatePassword(password);

      if (error) {
        console.error('🔐 Password update failed:', error.message);
        setStatus(`Password update failed: ${error.message}`);
        return;
      }

      console.log('🔐 Password updated successfully');
      setStatus('✅ Password updated successfully! Redirecting to login...');
      
      // Clear session and redirect to login
      await sessionManager.clearSession();
      setTimeout(() => {
        router.push('/auth/login?message=password-updated');
      }, 1500);

    } catch (error: any) {
      console.error('🔐 Unexpected error during password update:', error);
      setStatus(`Unexpected error: ${error.message || 'Please try again'}`);
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
            className={`text-sm rounded-md border px-3 py-2 ${status.toLowerCase().includes('missing') || status.toLowerCase().includes('error') || status.toLowerCase().includes('fail')
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
