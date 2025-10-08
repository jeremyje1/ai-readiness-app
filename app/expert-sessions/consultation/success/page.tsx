'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const calendlyUrl = 'https://calendly.com/jeremyestrella/30min?hide_gdpr_banner=1&primary_color=4f46e5';

interface CheckoutSuccessPayload {
    success: boolean;
    status: string;
    amount_total?: number | null;
    currency?: string | null;
    customer_email?: string | null;
    customer_name?: string | null;
    created?: number;
}

export default function ConsultationSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams?.get('session_id') || searchParams?.get('sessionId');

    const [loading, setLoading] = useState(true);
    const [payload, setPayload] = useState<CheckoutSuccessPayload | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError('Missing checkout session. Please start checkout again.');
            setLoading(false);
            return;
        }

        const id = sessionId;
        let cancelled = false;

        async function verifySession() {
            try {
                const response = await fetch(`/api/stripe/consultation-session?session_id=${encodeURIComponent(id)}`);
                const data = await response.json();

                if (cancelled) return;

                if (!response.ok || !data?.success) {
                    setError(data?.message || 'We could not confirm the payment.');
                    setPayload(data);
                } else {
                    setPayload(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Unexpected error verifying payment.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        verifySession();

        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    const amountPaid = useMemo(() => {
        if (!payload?.amount_total) return null;
        const amount = payload.amount_total / 100;
        const symbol = payload.currency?.toUpperCase() === 'USD' ? '$' : `${payload.currency?.toUpperCase() || ''} `;
        return `${symbol}${amount.toFixed(2)}`;
    }, [payload]);

    return (
        <div className="min-h-screen bg-slate-50 py-16">
            <div className="container mx-auto px-6 lg:px-10 max-w-5xl space-y-10">
                <div className="text-center space-y-4">
                    <Badge className="bg-emerald-100 text-emerald-700">Consultation Reserved</Badge>
                    <h1 className="text-4xl font-bold text-slate-900">You're booked with Jeremy Estrella</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Your payment has been received. Choose your meeting time below and come prepared with your highest-priority AI questions so we can move fast.
                    </p>
                </div>

                {loading && (
                    <Card className="border-indigo-100 bg-white/90">
                        <CardContent className="py-12 flex flex-col items-center gap-4 text-slate-600">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <p>Verifying payment…</p>
                        </CardContent>
                    </Card>
                )}

                {!loading && error && (
                    <Alert variant="destructive">
                        <AlertTitle>We couldn&rsquo;t confirm your payment</AlertTitle>
                        <AlertDescription>
                            {error}{' '}
                            <Button variant="link" className="px-1" onClick={() => router.push('/expert-sessions/schedule')}>
                                Return to checkout
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {!loading && payload?.success && (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
                        <Card className="bg-white/95 border-slate-200">
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900">Confirm your timeslot</h2>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Select a time that works best for you. Jeremy will receive the booking instantly and follow up with prep materials before the meeting.
                                    </p>
                                </div>

                                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                    <iframe
                                        title="Schedule your consultation"
                                        src={`${calendlyUrl}&session=${encodeURIComponent(sessionId || '')}`}
                                        className="w-full min-h-[680px] bg-white"
                                        allowTransparency
                                    />
                                </div>

                                <Alert className="border-emerald-200 bg-emerald-50">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <AlertDescription className="text-sm text-emerald-800">
                                        You&rsquo;ll receive a calendar invite and receipt at{' '}
                                        <strong>{payload.customer_email || 'your email'}</strong> after booking a slot.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        <aside className="space-y-6">
                            <Card className="bg-indigo-600 text-white border-none">
                                <CardContent className="p-6 space-y-3">
                                    <h3 className="text-xl font-semibold">Session recap</h3>
                                    <p className="text-sm text-indigo-100">
                                        Payment status: <span className="font-semibold text-white">{payload.status}</span>
                                    </p>
                                    {amountPaid && (
                                        <p className="text-sm text-indigo-100">
                                            Amount paid: <span className="font-semibold text-white">{amountPaid}</span>
                                        </p>
                                    )}
                                    <p className="text-sm text-indigo-100">
                                        Confirmation email: <span className="font-semibold text-white">{payload.customer_email || 'Pending'}</span>
                                    </p>
                                    <Button asChild variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white">
                                        <a href="mailto:jeremy@northpathstrategies.org?subject=Consultation%20Prep&body=Hi%20Jeremy,%20here%20is%20what%20we%E2%80%99d%20like%20to%20focus%20on...">
                                            Send Jeremy your focus areas
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/95 border-slate-200">
                                <CardContent className="p-6 space-y-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                        <Sparkles className="h-5 w-5 text-indigo-500" />
                                        Make the most of your consultation
                                    </div>
                                    <ul className="space-y-2">
                                        <li>• Share your current AI initiatives or pain points in the Calendly notes.</li>
                                        <li>• Bring recent student outcome data or program metrics to review live.</li>
                                        <li>• Invite decision makers so next steps can be approved quickly.</li>
                                    </ul>
                                    <Button asChild variant="outline" className="w-full">
                                        <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                                            Open Calendly in a new tab
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}
