'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * ImplementationPage acts as a unified landing page for both K‑12 and Higher‑Ed
 * implementations. It introduces the services, summarizes key resources, lists
 * pricing tiers and provides links to start the appropriate assessment.
 */
export default function ImplementationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
      {/* Hero / Intro */}
      <section className="px-4 py-14 border-b bg-white/70 backdrop-blur">
        <div className="container mx-auto max-w-6xl text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">AI Blueprint Implementation</h1>
          <p className="text-lg text-gray-600">
            Ready to transform your school or university with AI? Choose your path below
            to begin an autonomous implementation tailored to your needs.
          </p>
        </div>
      </section>

      {/* K‑12 and Higher‑Ed cards */}
  <section className="container mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* K‑12 Card */}
        <Card>
          <CardHeader>
            <CardTitle>K‑12 AI Blueprint</CardTitle>
            <CardDescription>
              Designed for elementary and secondary institutions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>Readiness Assessment:</strong> Evaluates technology, staff
                readiness, data privacy frameworks and administrative processes.
              </li>
              <li>
                <strong>Training Programs:</strong> Covers AI fundamentals, ethical
                guidelines, COPPA/FERPA compliance, predictive analytics and hybrid
                learning.
              </li>
              <li>
                <strong>Actionable Deliverables:</strong> 8–10 page Pulse‑Check report
                and 25‑page Comprehensive report with clear recommendations.
              </li>
            </ul>
            <Button asChild>
              <Link href="/k12-implementation">Start K‑12 Implementation</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Higher‑Ed Card */}
        <Card>
          <CardHeader>
            <CardTitle>Higher‑Ed AI Blueprint</CardTitle>
            <CardDescription>
              Tailored for universities and colleges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>Pulse Check:</strong> 50‑question survey with an 8–10 page
                readiness report.
              </li>
              <li>
                <strong>Comprehensive:</strong> 105‑question assessment delivering a
                25‑page report and a full implementation plan.
              </li>
              <li>
                <strong>Transformation & Enterprise:</strong> Provide step‑by‑step
                implementation roadmaps, including policy templates, training
                resources and ongoing support.
              </li>
            </ul>
            <Button asChild>
              <Link href="/highered-implementation">
                Start Higher‑Ed Implementation
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Pricing section (canonical) */}
      <section className="container mx-auto max-w-6xl px-4 py-12 space-y-8">
        <h2 className="text-3xl font-semibold text-center text-gray-900">Pricing</h2>
        <p className="text-center text-gray-600">These prices are the source of truth and are reflected across K‑12 and Higher‑Ed pages.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[{ name: 'Pulse Check', price: 2000, href: '/highered-implementation' }, { name: 'Comprehensive', price: 4995, href: '/highered-implementation' }, { name: 'Transformation', price: 24500, href: '/highered-implementation' }, { name: 'Enterprise', price: 75000, href: '/highered-implementation' }].map(p => (
            <Card key={p.name} className="border-indigo-100 hover:border-indigo-300 transition-colors">
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription className="text-2xl font-bold">${'{'}p.price.toLocaleString(){'}'}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={p.href}>Start Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Resources section */}
      <section className="container mx-auto max-w-6xl px-4 py-12 space-y-6">
        <h2 className="text-3xl font-semibold text-center text-gray-900">Resources Included</h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto">
          Each AI Blueprint package includes personalised recommendations, policy templates, training modules and benchmarking tools. Our AI evaluates your infrastructure and staff readiness to ensure responsible adoption.
        </p>
      </section>
    </div>
  );
}
