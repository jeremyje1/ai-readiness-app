'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export default function PasswordSetupPage() {
  const params = useSearchParams();
  const token = params.get('token');
  const sessionId = params.get('session_id');
  const emailFromQuery = params.get('email') || '';
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [email, setEmail] = useState(emailFromQuery);
  const [bootstrapTried, setBootstrapTried] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const pwInputRef = useRef<HTMLInputElement | null>(null);

  // If we have a session_id but no token, attempt server-side bootstrap (same as success page flow)
  const attemptBootstrap = useCallback(async () => {
    if (token || !sessionId || bootstrapTried) return;
    setBootstrapTried(true);
    try {
      setBootstrapping(true);
      const res = await fetch('/api/stripe/post-checkout/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.passwordSetupUrl) {
          // Preserve possible auto flag
          const auto = params.get('auto');
          const url = new URL(json.passwordSetupUrl, window.location.origin);
          if (auto) url.searchParams.set('auto', auto);
          // Pass email for prefill in case user reloads without token later
          if (email) url.searchParams.set('email', email);
          router.replace(url.toString());
          return;
        }
      }
    } catch (e) {
      // silent
    } finally {
      setBootstrapping(false);
    }
  }, [token, sessionId, bootstrapTried, params, router, email]);
  // Focus logic
  useEffect(() => {
    if (!token) {
      emailInputRef.current?.focus();
    } else {
      pwInputRef.current?.focus();
    }
  }, [token]);


  useEffect(() => { attemptBootstrap(); }, [attemptBootstrap]);

  const requestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setStatus('Email required'); return; }
    setRequesting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/password/setup/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || 'Request failed');
      }
      setStatus('Password setup link emailed (valid 1 hour). Check your inbox.');
    } catch (e: any) {
      setStatus(e.message || 'Request failed');
    } finally {
      setRequesting(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setStatus('Missing token');
    if (password.length < 8) return setStatus('Password too short');
    if (password !== confirm) return setStatus('Passwords do not match');

    console.log('🔐 Password setup starting...');
    console.log('🔐 Token:', token ? 'Present' : 'Missing');
    console.log('🔐 Password length:', password.length);

    setLoading(true);
    setStatus('Saving...');

    try {
      console.log('🔐 Making API call to /api/auth/password/setup');

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch('/api/auth/password/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('🔐 API response status:', res.status);
      console.log('🔐 API response ok:', res.ok);

      let json: any = null;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.warn('🔐 Failed to parse JSON response for password setup:', parseErr);
      }
      console.log('🔐 API response data:', json);

      if (!res.ok) {
        throw new Error((json && json.error) || `Setup failed (status ${res.status})`);
      }

      setStatus('Password set! Redirecting to login...');
      console.log('🔐 Password set successfully, redirecting to login page...');

      // Clear loading immediately 
      setLoading(false);

      // Skip auto-login attempts for now and just redirect to login
      // This is more reliable and prevents hanging
      setTimeout(() => {
        router.push('/auth/login?message=password-set');
      }, 1500);
      return;
    } catch (err: any) {
      console.error('🔐 Password setup error:', err);
      if (err.name === 'AbortError') {
        setStatus('Request timed out. Please try again.');
      } else {
        setStatus(err.message || 'Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <form onSubmit={submit} className="bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Set Your Password</h1>
        {!token && (
          <div className="space-y-3">
            <p className="text-red-600 text-sm">Missing token parameter.</p>
            <p className="text-sm text-gray-600">You likely followed a link without the secure token. You can request a fresh password setup email below{sessionId ? ' (we detected your purchase session)' : ''}.</p>
            <form onSubmit={requestToken} className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <Input ref={emailInputRef} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" />
              </div>
              <Button type="submit" disabled={requesting}>{requesting ? 'Requesting...' : 'Email Me a Password Setup Link'}</Button>
            </form>
            {status && !token && <p className={`text-xs ${status.includes('emailed') ? 'text-green-600' : 'text-red-600'}`}>{status}</p>}
            <hr className="my-4" />
            <p className="text-xs text-gray-500">If you just completed checkout, try returning to the success page; it will attempt to generate this token automatically.</p>
            {bootstrapping && <p className="text-xs text-blue-600 animate-pulse">Attempting automatic token generation...</p>}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <Input ref={pwInputRef} type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} />
        </div>
        {status && token && (
          <div
            className={`text-sm rounded-md border px-3 py-2 ${status.toLowerCase().includes('error') || status.toLowerCase().includes('fail') || status.toLowerCase().includes('missing') || status.toLowerCase().includes('expired')
                ? 'bg-red-50 text-red-700 border-red-200'
                : status.includes('!') || status.toLowerCase().includes('password set')
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
          >
            {status}
          </div>
        )}
        <Button type="submit" disabled={loading || !token}>{loading ? 'Saving...' : 'Create Password'}</Button>
      </form>
    </div>
  );
}
