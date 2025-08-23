'use client';

import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function K12Page() {
  const heroStyle = {
    background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url(/wp-content/uploads/2025/07/—Pngtree—intriguingly-dark-geometric-backdrop-perfect_11036843.jpg) center/cover no-repeat'
  };

  const cssVariables = {
    '--primary': '#00adef',
    '--primary-600': '#0083ba',
    '--accent': '#ff6f61',
    '--bg-900': '#0b1d2c',
    '--bg-800': '#102235',
    '--bg-700': '#162b45',
    '--text': '#e0e7ff',
    '--muted': '#c7d2fe',
    '--focus': '#fbbf24',
    '--maxw': '1200px',
    '--radius': '10px',
  } as React.CSSProperties;

  return (
    <>
      <Head>
        <title>K-12 AI Blueprint – AI Solutions for School Districts</title>
        <meta name="description" content="K-12 AI Blueprint offers AI readiness assessments, implementation blueprints, and professional development specifically designed for school districts." />
        <link rel="canonical" href="https://aiblueprint.k12aiblueprint.com/" />
        <meta property="og:title" content="K-12 AI Blueprint – AI Solutions for School Districts" />
        <meta property="og:description" content="AI readiness, implementation blueprints, and professional development specifically designed for K-12 school districts." />
        <meta property="og:url" content="https://aiblueprint.k12aiblueprint.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/wp-content/uploads/2025/07/hero-og.jpg" />
      </Head>

      <div 
        className="min-h-screen" 
        style={{ 
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif', 
          background: 'var(--bg-900)', 
          color: 'var(--text)',
          ...cssVariables
        }}
      >
        {/* Hero Section */}
        <header className="relative" style={heroStyle}>
          <div className="container mx-auto max-w-6xl px-4 text-center py-20">
            <span 
              className="inline-block px-2 py-1 rounded-full text-xs"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
            >
              K-12 Education • School Districts • AI Implementation
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6 max-w-4xl mx-auto">
              Empowering K-12 Education with Responsible AI
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
              From readiness assessments to implementation roadmaps, K-12 AI Blueprint helps school districts deploy AI safely and effectively using our patent-pending algorithm suite: AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, and AIBS™.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              <Link 
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white border-0 transition-all duration-200"
                style={{ background: 'var(--primary)' }}
                href="/start?billing=monthly"
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-600)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary)'}
              >
                Start Monthly Plan - $995/month
              </Link>
              <Link 
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white border-2 border-white bg-transparent transition-all duration-200"
                href="/start?billing=yearly"
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Save 17% - Annual Plan
              </Link>
            </div>
            <p className="text-sm opacity-75">✨ 7-day free trial included • Cancel anytime • All 6 patent-pending algorithms</p>
          </div>
        </header>

        {/* K-12 AI Implementation Solutions */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-12" 
              style={{ color: 'var(--primary)' }}
            >
              K-12 AI Implementation Solutions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article 
                className="p-6 rounded-lg"
                style={{
                  background: 'var(--bg-700)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.25)'
                }}
              >
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--primary)' }}>
                  District-Wide Implementation
                </h3>
                <p className="mb-6 opacity-75">
                  Comprehensive district policies, teacher professional development modules, student data protections, and roadmaps aligned to COPPA/FERPA requirements.
                </p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Link 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white"
                    style={{ background: 'var(--primary)' }}
                    href="/start?billing=monthly"
                  >
                    Start Monthly Plan
                  </Link>
                  <Link 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white border-2 border-white bg-transparent"
                    href="/start?billing=yearly"
                  >
                    Annual Plan (Save 17%)
                  </Link>
                </div>
                <p className="text-sm opacity-75">Monthly $995 subscription includes all services and features. 7‑day free trial, cancel anytime.</p>
              </article>

              <article 
                className="p-6 rounded-lg"
                style={{
                  background: 'var(--bg-700)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.25)'
                }}
              >
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--primary)' }}>
                  Classroom-Ready Tools
                </h3>
                <p className="mb-6 opacity-75">
                  Teacher training modules, classroom AI integration guides, student digital citizenship curriculum, and age-appropriate AI literacy resources.
                </p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Link 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white"
                    style={{ background: 'var(--primary)' }}
                    href="/start?billing=monthly"
                  >
                    Start Monthly Plan
                  </Link>
                  <Link 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white border-2 border-white bg-transparent"
                    href="/start?billing=yearly"
                  >
                    Annual Plan (Save 17%)
                  </Link>
                </div>
                <p className="text-sm opacity-75">Monthly $995 subscription includes all services and features. Multi-district partnerships available.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Patent-Pending Algorithm Suite */}
        <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
          <div className="container mx-auto max-w-6xl">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-12" 
              style={{ color: 'var(--primary)' }}
            >
              Patent-Pending Algorithm Suite
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'AIRIX™ - AI Readiness Index', desc: 'Core institutional AI readiness across 8 strategic domains including governance, infrastructure, culture, and resources.' },
                { title: 'AIRS™ - AI Readiness Scoring', desc: 'Domain-specific maturity assessment measuring strategic readiness, infrastructure security, and cultural preparedness.' },
                { title: 'AICS™ - AI Implementation Capacity', desc: 'Resource capability analysis evaluating financial, human, and technological capacity for AI implementation.' },
                { title: 'AIMS™ - AI Implementation Maturity', desc: 'Current state assessment of existing AI initiatives, pilot programs, and institutional AI adoption levels.' },
                { title: 'AIPS™ - AI Implementation Priority', desc: 'Action prioritization engine that ranks initiatives by impact, feasibility, and strategic alignment.' },
                { title: 'AIBS™ - AI Benchmarking Scoring', desc: 'Peer institution comparison analysis using anonymized data from similar higher education organizations.' }
              ].map((algo, index) => (
                <article 
                  key={index}
                  className="p-6 rounded-lg"
                  style={{
                    background: 'var(--bg-700)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.25)'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                    {algo.title}
                  </h3>
                  <p className="opacity-75">{algo.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Our Services */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-12" 
              style={{ color: 'var(--primary)' }}
            >
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  title: 'K-12 AI Readiness Assessments', 
                  desc: 'Pinpoint strengths and gaps across district governance, student data systems, curriculum integration, and classroom technology infrastructure.',
                  link: '/services/ai-readiness-assessment'
                },
                { 
                  title: 'District Implementation Blueprints', 
                  desc: 'Policy templates, teacher training plans, and change‑management playbooks specifically designed for K-12 environments.',
                  link: '/services/implementation-blueprints'
                },
                { 
                  title: 'Teacher Professional Development', 
                  desc: 'On‑site workshops and self‑paced modules for district leaders, principals, and classroom teachers.',
                  link: '/services/professional-development'
                }
              ].map((service, index) => (
                <article 
                  key={index}
                  className="p-6 rounded-lg"
                  style={{
                    background: 'var(--bg-700)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.25)'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                    {service.title}
                  </h3>
                  <p className="opacity-75 mb-4">{service.desc}</p>
                  <p>
                    <Link 
                      className="text-sm hover:underline"
                      style={{ color: 'var(--primary)' }}
                      href={service.link}
                    >
                      Learn more →
                    </Link>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
          <div className="container mx-auto max-w-6xl">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-12" 
              style={{ color: 'var(--primary)' }}
            >
              How We Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Assess', desc: 'Data‑driven readiness surveys tailored for K-12 district contexts and classroom environments.' },
                { title: 'Plan', desc: 'Prioritized roadmap based on district needs, teacher readiness, and student safety impact.' },
                { title: 'Implement', desc: 'Templates, teacher PD, and expert support for sustainable K-12 AI adoption.' }
              ].map((step, index) => (
                <article 
                  key={index}
                  className="p-6 rounded-lg"
                  style={{
                    background: 'var(--bg-700)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.25)'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>
                    {step.title}
                  </h3>
                  <p className="opacity-75">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6" 
              style={{ color: 'var(--primary)' }}
            >
              Ready to Transform Your District?
            </h2>
            <p className="text-lg mb-8 opacity-75 max-w-3xl mx-auto">
              Start your K-12 AI journey with AI Blueprint. Get instant access with your 7-day free trial, then continue with full access at $995/month—no sales call required.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link 
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white"
                style={{ background: 'var(--primary)' }}
                href="/start?billing=monthly"
              >
                Start Free Trial
              </Link>
              <Link 
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white border-2 border-white bg-transparent"
                href="/contact"
              >
                Contact
              </Link>
            </div>
          </div>
        </section>

        {/* Sticky Mobile CTA */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-3"
          style={{ 
            background: 'rgba(16,34,53,0.92)', 
            borderTop: '1px solid rgba(255,255,255,0.08)' 
          }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <span className="font-semibold">Try K-12 AI Blueprint</span>
            <div className="flex gap-2">
              <Link 
                className="inline-flex items-center justify-center px-3 py-2 rounded font-semibold text-white text-sm"
                style={{ background: 'var(--primary)' }}
                href="/start?billing=monthly"
              >
                Start Trial
              </Link>
              <Link 
                className="inline-flex items-center justify-center px-3 py-2 rounded font-semibold text-white border border-white bg-transparent text-sm"
                href="/start?billing=yearly"
              >
                Save 17%
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 px-4 text-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="container mx-auto max-w-6xl">
            <p className="mb-2">© 2025 K-12 AI Blueprint. All rights reserved.</p>
            <p className="opacity-75">
              <Link href="/privacy" className="hover:opacity-100">Privacy</Link> •{' '}
              <Link href="/contact" className="hover:opacity-100">Contact</Link>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
