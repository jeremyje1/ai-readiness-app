'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    ArrowRight,
    CalendarCheck,
    CheckCircle2,
    ShieldCheck,
    Sparkles,
    Timer,
    TrendingUp
} from 'lucide-react';

const CONSULTATION_PRICE = 349;
const HEADSHOT_URL = process.env.NEXT_PUBLIC_JEREMY_HEADSHOT_URL ||
    'https://northpathstrategies.org/wp-content/uploads/2023/08/Jeremy-Estrella-Profile.jpg';

const calendlyUrl = 'https://calendly.com/jeremyestrella/30min?hide_gdpr_banner=1&primary_color=4f46e5';

export default function ExpertSessionsSchedule() {
    const params = useSearchParams();
    const cancelled = params?.get('checkout') === 'cancelled';

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const priceDisplay = useMemo(() => `$${CONSULTATION_PRICE}`, []);

    const handleCheckout = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/stripe/consultation-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email || undefined })
            });

            const data = await response.json();

            if (!response.ok || !data?.url) {
                throw new Error(data?.details || 'Unable to start checkout.');
            }

            window.location.href = data.url as string;
        } catch (err) {
            console.error('Consultation checkout failure:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 py-16">
            <div className="container mx-auto px-6 lg:px-10">
                <div className="grid xl:grid-cols-[minmax(0,1fr)_380px] gap-12 items-start">
                    <div>
                        <Badge className="bg-indigo-600/10 text-indigo-700 mb-4 uppercase tracking-wide" variant="secondary">
                            Founder Consultation
                        </Badge>
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                            Work 1:1 with Jeremy Estrella on your AI Blueprint
                        </h1>
                        <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
                            Jeremy Estrella, founder of AI Blueprint and NorthPath Strategies, helps district and
                            campus leaders operationalize responsible AI so student outcomes improve faster. Drawing on
                            years of leading instructional innovation, Jeremy now coaches teams on trustworthy AI adoption,
                            data governance, and measurable impact for learners.
                        </p>
                        <p className="mt-3 text-lg text-slate-600 leading-relaxed max-w-2xl">
                            This 45-minute strategy intensive is designed for education executives who want a clear, actionable
                            roadmap that blends policy, change management, and AI-enabled teaching and learning.
                        </p>

                        <div className="mt-8 flex items-center gap-6">
                            <div>
                                <div className="text-sm uppercase tracking-wide text-slate-500">Investment</div>
                                <div className="text-4xl font-bold text-slate-900">{priceDisplay}</div>
                                <div className="text-sm text-slate-500">One-time consultation • 45 minutes</div>
                            </div>
                            <div className="hidden sm:block h-16 w-px bg-slate-200" aria-hidden="true" />
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    Bespoke AI roadmap for your team
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    Governance, privacy & implementation guidance
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                                    Action items focused on student outcomes
                                </div>
                            </div>
                        </div>

                        <Card className="mt-10 shadow-sm border-indigo-100/60 bg-white/80 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-4">
                                    <span>Reserve your consultation</span>
                                    <Timer className="h-5 w-5 text-indigo-500" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-slate-600">
                                    Complete checkout to secure the session. You&rsquo;ll be redirected back here with instant access to Jeremy&rsquo;s Calendly to lock in your time.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Input
                                        type="email"
                                        inputMode="email"
                                        placeholder="Work email (optional)"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="sm:max-w-xs"
                                        aria-label="Contact email"
                                    />
                                    <Button
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {loading ? 'Redirecting…' : `Reserve for ${priceDisplay}`}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                                            Preview availability
                                        </a>
                                    </Button>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Checkout error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {cancelled && !error && (
                                    <Alert className="border-amber-200 bg-amber-50">
                                        <AlertTitle>Checkout cancelled</AlertTitle>
                                        <AlertDescription>
                                            Your session isn&rsquo;t reserved yet. You can restart the checkout anytime.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        <section className="mt-12 grid gap-6 md:grid-cols-3">
                            {[{
                                title: 'Step 1 — Reserve',
                                description: 'Complete the secure Stripe checkout to confirm your consultation slot and receive a receipt instantly.',
                                icon: CheckCircle2
                            }, {
                                title: 'Step 2 — Schedule',
                                description: 'After payment you will land on our scheduling page with Jeremy’s live Calendly to pick a time that works.',
                                icon: CalendarCheck
                            }, {
                                title: 'Step 3 — Accelerate',
                                description: 'Bring your AI goals, current blockers, and any data you want to review. You will leave with next steps and templates.',
                                icon: Sparkles
                            }].map(({ title, description, icon: Icon }) => (
                                <Card key={title} className="bg-white/80 border-slate-200">
                                    <CardContent className="pt-6 space-y-3">
                                        <Icon className="h-6 w-6 text-indigo-500" />
                                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </section>

                        <section className="mt-12">
                            <Card className="bg-slate-900 text-slate-100 border-slate-800 overflow-hidden">
                                <CardContent className="p-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_260px] items-center">
                                    <div>
                                        <h2 className="text-2xl font-semibold mb-4">What leaders gain from this session</h2>
                                        <ul className="space-y-3 text-sm leading-relaxed">
                                            <li>• Rapid assessment of your current AI readiness gaps</li>
                                            <li>• Prioritized roadmap that aligns AI projects to student outcome metrics</li>
                                            <li>• Policy, privacy, and change management guidance tailored to your context</li>
                                            <li>• Follow-up resources from the AI Blueprint implementation library</li>
                                        </ul>
                                    </div>
                                    <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-slate-700">
                                        <Image
                                            src={HEADSHOT_URL}
                                            alt="Jeremy Estrella, founder of AI Blueprint"
                                            fill
                                            priority
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 260px"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    <aside>
                        <Card className="sticky top-24 bg-white/90 border-slate-200 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-semibold text-slate-900">
                                    About Jeremy Estrella
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-slate-600">
                                <p>
                                    Jeremy leads AI Blueprint and NorthPath Strategies, partnering with superintendents,
                                    provosts, and innovation teams to build AI governance that is ethical, transparent, and centered on learners.
                                </p>
                                <p>
                                    He has guided districts through responsible AI pilots, helped higher education systems modernize policy, and
                                    trains faculty on AI-enabled instructional design that keeps humans firmly in the loop.
                                </p>
                                <p>
                                    Every session distills the latest AI research, procurement requirements, and change leadership insights into a
                                    concrete action plan for your organization.
                                </p>
                                <div className="pt-2">
                                    <Button variant="outline" asChild className="w-full">
                                        <a href="https://northpathstrategies.org/" target="_blank" rel="noopener noreferrer">
                                            Learn more at NorthPath Strategies
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}