'use client';

import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function PasswordSetupSimple() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setStatus('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setStatus('Setting up your password...');

    try {
      // Step 1: Set the password via API
      const res = await fetch('/api/auth/password/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to set password');
      }

      setStatus('Password set! Signing you in...');
      console.log('Password set successfully, email:', json.email);

      // Step 2: Sign in directly with Supabase (Chrome workaround for hanging issue)
      const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
      console.log('Is Chrome browser:', isChrome);

      if (isChrome) {
        // Chrome workaround: Use fetch API directly for Chrome browsers
        console.log('Using Chrome workaround with direct API call...');
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jocigzsthcpspxfdfxae.supabase.co';
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA';

          const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
          const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey
            },
            body: JSON.stringify({
              email: json.email,
              password: password,
              gotrue_meta_security: {}
            })
          });

          const data = await response.json();

          if (!response.ok) {
            console.error('Chrome auth failed:', data);
            throw new Error(data.error_description || 'Failed to sign in');
          }

          // Manually set session for Chrome (non-blocking)
          console.log('Setting session manually for Chrome...');

          // Don't await setSession in Chrome as it may hang
          // Just fire it and continue - the session will be set in the background
          supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token
          }).then(() => {
            console.log('Session set successfully in background');
          }).catch((err) => {
            console.warn('Session set warning (non-fatal):', err);
          });

          console.log('Chrome sign in successful');
          setStatus('Success! Redirecting...');

          // Redirect to personalized dashboard
          setTimeout(() => {
            window.location.href = '/dashboard/personalized';
          }, 1000);
        } catch (chromeError: any) {
          console.error('Chrome auth error:', chromeError);
          setStatus('Password set! Redirecting to login...');
          setTimeout(() => {
            router.push('/auth/login?message=password-set');
          }, 1500);
        }
      } else {
        // Standard flow for non-Chrome browsers
        const { data, error } = await supabase.auth.signInWithPassword({
          email: json.email,
          password: password
        });

        if (error) {
          console.error('Sign in error:', error);
          setStatus('Password set! Redirecting to login...');
          setTimeout(() => {
            router.push('/auth/login?message=password-set');
          }, 1500);
          return;
        }

        console.log('Sign in successful:', data.user?.email);
        setStatus('Success! Redirecting...');

        // Step 3: Redirect to personalized dashboard
        setTimeout(() => {
          window.location.href = '/dashboard/personalized';
        }, 1000);
      }

    } catch (error: any) {
      console.error('Setup error:', error);
      setStatus(error.message || 'An error occurred');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Invalid or missing token</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Set Your Password</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {status && (
            <div className={`p-3 rounded ${status.includes('error') || status.includes('do not match') || status.includes('must be')
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
              }`}>
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}