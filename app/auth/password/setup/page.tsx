'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { navigateToDomainAwarePath } from '@/lib/domain-utils';

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
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setStatus('Password set! Logging you in...');
      // Attempt immediate password sign-in client-side (no service role exposure).
      if (json.email) {
        let attempt = 0;
        let signedIn = false;
        while (attempt < 3 && !signedIn) {
          const { error } = await supabase.auth.signInWithPassword({ email: json.email, password });
            if (!error) {
              signedIn = true;
              break;
            }
          // slight delay in case password propagation not immediate
          await new Promise(r => setTimeout(r, 400));
          attempt++;
        }
        if (!signedIn) {
          setStatus('Password set. Please log in manually with your new password.');
          return;
        }
      }
      setStatus('Logged in! Redirecting...');
      setTimeout(() => navigateToDomainAwarePath('/ai-readiness/dashboard?verified=true'), 800);
    } catch (err: any) {
      setStatus(err.message);
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
                <Input ref={emailInputRef} type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@company.com" />
              </div>
              <Button type="submit" disabled={requesting}>{requesting ? 'Requesting...' : 'Email Me a Password Setup Link'}</Button>
            </form>
            {status && !token && <p className={`text-xs ${status.includes('emailed') ? 'text-green-600':'text-red-600'}`}>{status}</p>}
            <hr className="my-4" />
            <p className="text-xs text-gray-500">If you just completed checkout, try returning to the success page; it will attempt to generate this token automatically.</p>
            {bootstrapping && <p className="text-xs text-blue-600 animate-pulse">Attempting automatic token generation...</p>}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <Input ref={pwInputRef} type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <Input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={8} />
        </div>
        {status && token && <p className={`text-sm ${status.includes('!') ? 'text-green-600':'text-red-600'}`}>{status}</p>}
        <Button type="submit" disabled={loading || !token}>{loading ? 'Saving...' : 'Create Password'}</Button>
      </form>
    </div>
  );
}
