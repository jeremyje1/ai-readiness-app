'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  ArrowRight,
  Star,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Headphones,
  Brain,
  Zap,
  Target,
  BarChart3,
  Clock,
  Phone
} from 'lucide-react';
import { AI_SERVICE_COMPLETE } from '@/lib/unified-pricing-config';
import { NEW_PRICING_TIERS, getStripePriceId, type NewPricingTier } from '../../lib/new-pricing-structure';
import { useAnalytics } from '@/components/analytics-tracker';
import Link from 'next/link';

export default function UnifiedPricingPage() {
  const analytics = useAnalytics();
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [dynamicPrices, setDynamicPrices] = useState<Record<string, number>>({});
  const [dynamicPriceIds, setDynamicPriceIds] = useState<Record<string, string>>({});

  useEffect(() => {
    analytics.trackPricingPageView('multi-tier');
  }, [analytics]);

  // Load dynamic prices from unified API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/pricing/unified');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const centsToDollars = (v?: number | null) => (typeof v === 'number' ? v / 100 : undefined);

        const prices: Record<string, number> = {};
        const ids: Record<string, string> = {};

        // Map unified API -> our tiers
        if (data?.selfServeAssessment?.unit_amount) {
          prices['self_serve_assessment'] = centsToDollars(data.selfServeAssessment.unit_amount)!;
          if (data.selfServeAssessment.id) ids['self_serve_assessment'] = data.selfServeAssessment.id;
        }
        const monthly = data?.team?.monthly || data?.monthly;
        if (monthly?.unit_amount) {
          prices['team_monthly'] = centsToDollars(monthly.unit_amount)!;
          if (monthly.id) ids['team_monthly'] = monthly.id;
        }
        const yearly = data?.team?.yearly || data?.yearly;
        if (yearly?.unit_amount) {
          prices['team_yearly'] = centsToDollars(yearly.unit_amount)!;
          if (yearly.id) ids['team_yearly'] = yearly.id;
        }
        if (data?.boardReadyPro?.unit_amount) {
          prices['board_ready'] = centsToDollars(data.boardReadyPro.unit_amount)!;
          if (data.boardReadyPro.id) ids['board_ready'] = data.boardReadyPro.id;
        }
        if (data?.enterpriseReadinessProgram?.unit_amount) {
          prices['enterprise_program'] = centsToDollars(data.enterpriseReadinessProgram.unit_amount)!;
          if (data.enterpriseReadinessProgram.id) ids['enterprise_program'] = data.enterpriseReadinessProgram.id;
        }

        setDynamicPrices(prices);
        setDynamicPriceIds(ids);
      } catch (e) {
        // swallow; fallback to static
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleTierCheckout = async (tierId: string) => {
    setProcessingTier(tierId);
    try {
      // Use unified checkout endpoint; map tiers to product/billing
      let url = '/api/stripe/unified-checkout';
      const usp = new URLSearchParams();
      if (tierId === 'team_monthly') {
        usp.set('product', 'team');
        usp.set('billing', 'monthly');
        usp.set('trial_days', '7');
      } else if (tierId === 'team_yearly') {
        usp.set('product', 'team');
        usp.set('billing', 'yearly');
        usp.set('trial_days', '7');
      } else if (tierId === 'self_serve_assessment') {
        usp.set('product', 'self-serve');
      } else if (tierId === 'board_ready') {
        usp.set('product', 'board-ready');
      } else if (tierId === 'enterprise_program') {
        usp.set('product', 'enterprise');
      } else {
        // Fallback legacy
        const priceId = getStripePriceId(tierId as any) || '';
        const params = new URLSearchParams({ tier: tierId, price_id: priceId });
        window.location.href = `/api/ai-blueprint/stripe/create-checkout?${params.toString()}`;
        return;
      }
      window.location.href = `${url}?${usp.toString()}`;
    } catch (e) {
      console.error(e);
      setProcessingTier(null);
    }
  };

  const handleConsultationRequest = (serviceName: string) => {
    analytics.trackConsultationRequested(serviceName);
    
    // Find the service details
    const service = AI_SERVICE_COMPLETE.consultationServices.services.find(
      s => s.name === serviceName
    );
    
    if (service) {
      // Create a URL with service details for consultation checkout
      const serviceType = serviceName.toLowerCase().replace(/\s+/g, '_');
      const checkoutUrl = `/consultation-checkout?service=${serviceType}&name=${encodeURIComponent(serviceName)}&price=${service.price}&type=${service.type}`;
      window.location.href = checkoutUrl;
    } else {
      // Fallback to email
      window.open('mailto:info@northpathstrategies.org?subject=Consultation Request: ' + serviceName, '_blank');
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('assessment') || feature.includes('analysis')) return <BarChart3 className="h-4 w-4" />;
    if (feature.includes('support') || feature.includes('office hours') || feature.includes('Slack')) return <Headphones className="h-4 w-4" />;
    if (feature.includes('report') || feature.includes('blueprint') || feature.includes('policy')) return <FileText className="h-4 w-4" />;
    if (feature.includes('tracking') || feature.includes('benchmarking') || feature.includes('ROI')) return <TrendingUp className="h-4 w-4" />;
    if (feature.includes('strategy') || feature.includes('coaching') || feature.includes('implementation')) return <Brain className="h-4 w-4" />;
    if (feature.includes('partnership') || feature.includes('team')) return <Users className="h-4 w-4" />;
    if (feature.includes('algorithm') || feature.includes('AI-enhanced')) return <Zap className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              NorthPath Strategies
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/pricing" className="text-indigo-600 font-medium">Pricing</Link>
              <Link href="/ai-blueprint" className="text-gray-600 hover:text-gray-900">AI Blueprint</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-95" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div className="text-center text-white" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">AI Readiness & Transformation Pricing</h1>
            <p className="text-xl text-indigo-100 mb-6 max-w-4xl mx-auto">Choose the engagement level that matches where you are: from a rapid self‑serve baseline to a facilitated enterprise program.</p>
            <p className="text-sm uppercase tracking-wider text-indigo-200">Survey → AI Narrative PDF → (Optional) Roadmap & Facilitation</p>
          </motion.div>
        </div>
      </section>

      {/* Multi-Tier Pricing Grid */}
      <section className="container mx-auto px-4 py-16 -mt-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {NEW_PRICING_TIERS.map((tier: NewPricingTier) => {
            const priceId = dynamicPriceIds[tier.id] || getStripePriceId(tier.id);
            const displayPrice = dynamicPrices[tier.id] ?? tier.price;
            return (
              <motion.div key={tier.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className={`relative h-full flex flex-col rounded-xl border shadow-sm bg-white ${tier.badge ? 'border-indigo-500' : 'border-gray-200'}`}>
                  {tier.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">{tier.badge}</div>}
                  <div className="p-6 pb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{tier.name}</h3>
                    {tier.tagline && <p className="text-sm text-gray-600 mb-3">{tier.tagline}</p>}
                    <div className="flex items-baseline space-x-1 mb-4">
                      <span className="text-3xl font-bold text-indigo-600">${'{'}displayPrice.toLocaleString(){'}'}</span>
                      {tier.type === 'subscription' && <span className="text-xs text-gray-500">/ {tier.period}</span>}
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700 mb-4">
                      {tier.highlights.map((h: string) => <li key={h} className="flex items-start"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />{h}</li>)}
                    </ul>
                    <button disabled={processingTier === tier.id} onClick={() => handleTierCheckout(tier.id)} className={`w-full rounded-md font-semibold text-sm py-2 transition-colors ${tier.badge ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white'} disabled:opacity-60`}>{processingTier === tier.id ? 'Redirecting...' : tier.cta}</button>
                    <p className="mt-2 text-[11px] text-gray-400">Stripe ID: {priceId}</p>
                  </div>
                  <div className="px-6 pb-6 mt-auto">
                    <details className="group">
                      <summary className="cursor-pointer text-xs font-medium text-indigo-600 group-open:mb-2">View Deliverables</summary>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {tier.deliverables.map((d: string) => <li key={d} className="flex"><span className="mr-1">•</span>{d}</li>)}
                      </ul>
                    </details>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

  {/* Single-package card removed in favor of grid */}

  {/* Platform Capabilities Section */}
      <section className="container mx-auto px-4 py-16 bg-white rounded-lg shadow-lg mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Capabilities (Across Tiers)</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">All tiers leverage the same autonomous assessment & narrative engine. Higher tiers layer depth, facilitation, benchmarking, and strategic enablement.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Complete Assessment Suite</h3>
            <p className="text-gray-600 text-sm">
              Access to all assessment levels from quick pulse checks to comprehensive enterprise evaluations. Unlimited assessments with our proprietary algorithms.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Implementation Support</h3>
            <p className="text-gray-600 text-sm">
              Strategic coaching, faculty enablement programs, policy generation, and hands-on implementation guidance to ensure successful AI adoption.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ongoing Partnership</h3>
            <p className="text-gray-600 text-sm">
              Monthly office hours, dedicated Slack support, quarterly re-assessments, and strategic partnership access for continuous improvement.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in the service?</h3>
              <p className="text-gray-600">
                Everything! You get access to all assessment tiers, unlimited evaluations, comprehensive reports up to 85 pages, all proprietary algorithms, implementation coaching, strategic support, and ongoing partnership access.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the 7-day free trial work?</h3>
              <p className="text-gray-600">
                Start your trial immediately with no credit card required. You'll have full access to all features for 7 days. If you decide to continue, billing begins after the trial period.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I switch between monthly and yearly billing?</h3>
              <p className="text-gray-600">
                Yes, you can change your billing period at any time. Yearly subscribers save over $200 annually compared to monthly billing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What if I need to cancel?</h3>
              <p className="text-gray-600">
                You can cancel anytime with no long-term commitments. Your access continues until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Autonomous Service Note */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Brain className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Fully Autonomous Implementation</h3>
                <p className="text-blue-800 mb-3">
                  {AI_SERVICE_COMPLETE.autonomousNote}
                </p>
                <p className="text-sm text-blue-700">
                  Our AI system handles everything from analysis to implementation planning, requiring no human intervention for the core service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Optional Consultation Services */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Optional Consultation Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Need human expertise? Add optional consultation services for personalized guidance and implementation support.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              * {AI_SERVICE_COMPLETE.consultationServices.note}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {AI_SERVICE_COMPLETE.consultationServices.services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-gray-200 hover:border-indigo-300 transition-colors">
                  <CardHeader className="text-center pb-4">
                    <div className="bg-gray-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-gray-600" />
                    </div>
                    <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ${service.price}
                    </div>
                    <p className="text-sm text-gray-500">{service.duration}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-center mb-6">
                      {service.description}
                    </p>
                    <Button 
                      onClick={() => handleConsultationRequest(service.name)}
                      className="w-full bg-gray-600 hover:bg-gray-700"
                    >
                      Request Consultation
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

  {/* CTA Section (legacy free trial messaging removed) */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing a Tier?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">Start with Self‑Serve for a baseline or jump directly to Board‑Ready / Enterprise if you need executive deliverables and facilitation.</p>
          <Link href="#top" className="inline-flex items-center bg-white text-indigo-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-md">View Tiers Again <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </div>
      </section>
    </div>
  );
}
