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

      setStatus('✅ Password set successfully! Starting your assessment...');
      console.log('Password set successfully, email:', json.email);

      // Redirect directly to streamlined assessment
      // The user is now ready to start their assessment
      setTimeout(() => {
        router.push('/assessment/streamlined');
      }, 1500);

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