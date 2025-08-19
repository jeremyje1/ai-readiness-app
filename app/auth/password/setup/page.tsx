'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PasswordSetupPage() {
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setStatus('Password set! Redirecting...');
      setTimeout(()=> router.push('/ai-readiness/success?password=created'), 1500);
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
        {!token && <p className="text-red-600 text-sm">Missing token parameter.</p>}
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <Input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={8} />
        </div>
        {status && <p className="text-sm {status.includes('!') ? 'text-green-600':'text-red-600'}">{status}</p>}
        <Button type="submit" disabled={loading || !token}>{loading ? 'Saving...' : 'Create Password'}</Button>
      </form>
    </div>
  );
}
