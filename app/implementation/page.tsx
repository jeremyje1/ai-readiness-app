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
    <div className="container mx-auto max-w-6xl px-4 py-12 space-y-16">
      {/* Hero / Intro */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">AI Blueprint Implementation</h1>
        <p className="text-lg text-muted-foreground">
          Ready to transform your school or university with AI? Choose your path below
          to begin an autonomous implementation tailored to your needs.
        </p>
      </section>

      {/* K‑12 and Higher‑Ed cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

      {/* Pricing section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-semibold text-center">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pulse Check</CardTitle>
              <CardDescription className="text-2xl font-bold">$2,000</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                A quick assessment with 8–10 page report. Ideal for institutions seeking
                a snapshot of AI readiness.
              </p>
              <Button asChild>
                <Link href="/highered-implementation?tier=pulse">Start Now</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive</CardTitle>
              <CardDescription className="text-2xl font-bold">$4,995</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                105‑question assessment with a 25‑page report and next‑step
                recommendations.
              </p>
              <Button asChild>
                <Link href="/highered-implementation?tier=comprehensive">Start Now</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Transformation</CardTitle>
              <CardDescription className="text-2xl font-bold">$24,500</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Full implementation blueprint with policy templates, training materials
                and hands‑on support.
              </p>
              <Button asChild>
                <Link href="/highered-implementation?tier=transformation">Start Now</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription className="text-2xl font-bold">$75,000</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Customised partnership with unlimited users, analytics dashboard and
                ongoing advisory. Book a call to discuss.
              </p>
              <Button asChild>
                <Link href="https://calendly.com/northpathstrategies/enterprise-consultation">
                  Book Consultation
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resources section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-center">Resources Included</h2>
        <p className="text-center text-muted-foreground max-w-3xl mx-auto">
          Each AI Blueprint package comes with personalised recommendations, policy
          templates, training modules and benchmarking tools. Our patent‑pending
          algorithms evaluate your current infrastructure and staff readiness to ensure
          responsible AI adoption.
        </p>
      </section>
    </div>
  );
}
