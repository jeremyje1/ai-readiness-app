"use client";
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface TokenRow {
    id: string;
    email: string;
    created_at: string;
    used_at: string | null;
    expires_at: string;
}

export default function AuthTokensAdminPage() {
    const [sessionInfo, setSessionInfo] = useState<any>(null);
    const [tokens, setTokens] = useState<TokenRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) setError(error.message); else setSessionInfo(data.session);
        });
    }, []);

    const loadTokens = async () => {
        setLoading(true); setError(null);
        try {
            // Call a lightweight API route or directly query via RPC? We only have client anon key here, so expose a server route.
            const res = await fetch('/api/debug/list-password-tokens');
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || 'Failed');
            setTokens(j.tokens || []);
        } catch (e: any) {
            setError(e.message);
        } finally { setLoading(false); }
    };

    return (
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold">Auth Tokens & Session Debug</h1>
            <section className="bg-white shadow rounded p-4 space-y-2">
                <h2 className="font-medium">Current Session</h2>
                {sessionInfo ? (
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64">{JSON.stringify({
                        user: { id: sessionInfo.user.id, email: sessionInfo.user.email, email_confirmed_at: sessionInfo.user.email_confirmed_at },
                        expires_at: sessionInfo.expires_at,
                    }, null, 2)}</pre>
                ) : <p className="text-sm text-gray-600">No active session.</p>}
            </section>
            <section className="bg-white shadow rounded p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-medium">Recent Password Setup Tokens</h2>
                    <Button onClick={loadTokens} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</Button>
                </div>
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!tokens.length && !loading && <p className="text-sm text-gray-600">No tokens loaded yet.</p>}
                {!!tokens.length && (
                    <table className="w-full text-sm border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-2 border">Email</th>
                                <th className="text-left p-2 border">Created</th>
                                <th className="text-left p-2 border">Expires</th>
                                <th className="text-left p-2 border">Used?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokens.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="p-2 border font-mono text-xs">{t.email}</td>
                                    <td className="p-2 border text-xs">{new Date(t.created_at).toLocaleString()}</td>
                                    <td className="p-2 border text-xs">{new Date(t.expires_at).toLocaleString()}</td>
                                    <td className="p-2 border text-xs">{t.used_at ? `✅ ${new Date(t.used_at).toLocaleString()}` : '❌ Not yet'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
            <p className="text-xs text-gray-500">This page is for internal debugging; protect or remove in production if unnecessary.</p>
        </div>
    );
}
