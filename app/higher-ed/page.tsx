import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Higher Ed AI Blueprint – AI Solutions for Universities',
  description: 'Higher Ed AI Blueprint offers AI readiness assessments, implementation blueprints, and professional development specifically designed for universities and colleges.',
  openGraph: {
    title: 'Higher Ed AI Blueprint – AI Solutions for Universities',
    description: 'AI readiness, implementation blueprints, and professional development specifically designed for higher education institutions.',
    url: 'https://aiblueprint.k12aiblueprint.com/higher-ed',
    type: 'website',
    images: ['/wp-content/uploads/2025/07/hero-og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Higher Ed AI Blueprint – AI Solutions for Universities',
    description: 'AI readiness, implementation blueprints, and professional development specifically designed for higher education institutions.',
    images: ['/wp-content/uploads/2025/07/hero-og.jpg'],
  },
  alternates: {
    canonical: 'https://aiblueprint.k12aiblueprint.com/higher-ed',
  },
};

export default function HigherEdPage() {
  return (
    <>
      <style jsx>{`
        :root {
          --primary: #00adef;
          --primary-600: #0083ba;
          --accent: #ff6f61;
          --bg-900: #0b1d2c;
          --bg-800: #102235;
          --bg-700: #162b45;
          --text: #e0e7ff;
          --muted: #c7d2fe;
          --focus: #fbbf24;
          --maxw: 1200px;
          --radius: 10px;
          --text-high-contrast: #f1f5f9;
          --muted-high-contrast: #d4d4d8;
          --primary-accessible: #1e90ff;
        }
        
        .hero-bg {
          background: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url('/wp-content/uploads/2025/07/—Pngtree—intriguingly-dark-geometric-backdrop-perfect_11036843.jpg') center/cover no-repeat;
        }
        
        .btn-he {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: 0;
          transition: 0.2s ease;
        }
        
        .btn-primary-he {
          background: var(--primary-accessible);
          color: #fff;
        }
        
        .btn-primary-he:hover {
          background: var(--primary-600);
        }
        
        .btn-outline-he {
          background: transparent;
          color: #fff;
          border: 2px solid #fff;
        }
        
        .btn-outline-he:hover {
          background: rgba(255,255,255,0.12);
        }
        
        .tag-he {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
        }
        
        .card-he {
          background: var(--bg-700);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius);
          padding: 1.25rem;
          box-shadow: 0 4px 18px rgba(0,0,0,0.25);
        }
        
        .learn-more {
          display: inline-flex;
          margin-top: 0.5rem;
          font-size: 0.8rem;
          letter-spacing: 0.25px;
          color: var(--primary);
          text-decoration: none;
        }
        
        .learn-more:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .grid-2-he {
            grid-template-columns: 1fr !important;
          }
          .grid-3-he {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', background: 'var(--bg-900)', color: 'var(--text-high-contrast)' }}>
        {/* Hero Section */}
        <header className="hero-bg relative">
          <div className="container mx-auto max-w-6xl px-4 text-center py-20">
            <span className="tag-he" aria-hidden="true">Higher Education • Universities • Colleges • AI Innovation</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6 max-w-4xl mx-auto">
              Empowering Higher Education with Responsible AI
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
              From readiness assessments to implementation roadmaps, Higher Ed AI Blueprint helps universities and colleges deploy AI safely and effectively using our patent-pending algorithm suite: AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, and AIBS™.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              <Link className="btn-he btn-primary-he" href="/start?billing=monthly" data-cta="start-monthly">
                Start Monthly Plan - $995/month
              </Link>
              <Link className="btn-he btn-outline-he" href="/start?billing=yearly" data-cta="start-yearly">
                Save 17% - Annual Plan
              </Link>
            </div>
            <p className="text-sm opacity-75">✨ 7-day free trial included • Cancel anytime • All 6 patent-pending algorithms</p>
          </div>
        </header>

        {/* Higher Education AI Solutions */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--primary)' }}>
              Higher Education AI Solutions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 grid-2-he">
              <article className="card-he">
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--primary)' }}>Institutional Implementation</h3>
                <p className="mb-6 opacity-75">University-wide policies, faculty governance frameworks, research use guidance, and strategic roadmaps aligned to institutional review processes.</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Link className="btn-he btn-primary-he" href="/start?billing=monthly" data-cta="institutional-start">
                    Start Monthly Plan
                  </Link>
                  <Link className="btn-he btn-outline-he" href="/start?billing=yearly" data-cta="institutional-pricing">
                    Annual Plan (Save 17%)
                  </Link>
                </div>
                <p className="text-sm opacity-75">Monthly $995 subscription includes all services and features. 7‑day free trial, cancel anytime.</p>
              </article>

              <article className="card-he">
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--primary)' }}>Academic Excellence Tools</h3>
                <p className="mb-6 opacity-75">Faculty development modules, pedagogical AI integration guides, student learning analytics, and research collaboration frameworks.</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Link className="btn-he btn-primary-he" href="/start?billing=monthly" data-cta="academic-start">
                    Start Monthly Plan
                  </Link>
                  <Link className="btn-he btn-outline-he" href="/start?billing=yearly" data-cta="academic-pricing">
                    Annual Plan (Save 17%)
                  </Link>
                </div>
                <p className="text-sm opacity-75">Monthly $995 subscription includes all services and features. Enterprise partnerships available.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Patent-Pending Algorithm Suite */}
        <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--primary)' }}>
              Patent-Pending Algorithm Suite
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-3-he">
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>AIRIX™ - AI Readiness Index</h3>
                <p className="opacity-75">Core institutional AI readiness across 8 strategic domains including governance, infrastructure, culture, and resources.</p>
              </article>
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>AIRS™ - AI Readiness Scoring</h3>
                <p className="opacity-75">Domain-specific maturity assessment measuring strategic readiness, infrastructure security, and cultural preparedness.</p>
              </article>
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>AICS™ - AI Implementation Capacity</h3>
                <p className="opacity-75">Resource capability analysis evaluating financial, human, and technological capacity for AI implementation.</p>
              </article>
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>AIMS™ - AI Implementation Maturity</h3>
                <p className="opacity-75">Current state assessment of existing AI initiatives, pilot programs, and institutional AI adoption levels.</p>
              </article>
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>AIPS™ - AI Implementation Priority</h3>
                <p className="opacity-75">Action prioritization engine that ranks initiatives by impact, feasibility, and strategic alignment.</p>
              </article>
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>AIBS™ - AI Benchmarking Scoring</h3>
                <p className="opacity-75">Peer institution comparison analysis using anonymized data from similar higher education organizations.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Our Services */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--primary)' }}>
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-3-he">
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>Higher Ed AI Readiness Assessments</h3>
                <p className="opacity-75 mb-4">Pinpoint strengths and gaps across institutional governance, research data systems, academic integration, and campus technology infrastructure.</p>
                <p>
                  <Link className="learn-more" href="/services/ai-readiness-assessment" aria-label="Learn more about Higher Ed AI Readiness Assessments">
                    Learn more →
                  </Link>
                </p>
              </article>
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>University Implementation Blueprints</h3>
                <p className="opacity-75 mb-4">Policy templates, faculty training plans, and change‑management playbooks specifically designed for higher education environments.</p>
                <p>
                  <Link className="learn-more" href="/services/university-implementation-blueprints" aria-label="Learn more about University Implementation Blueprints">
                    Learn more →
                  </Link>
                </p>
              </article>
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>Faculty Professional Development</h3>
                <p className="opacity-75 mb-4">On‑site workshops and self‑paced modules for provosts, deans, department chairs, and faculty members.</p>
                <p>
                  <Link className="learn-more" href="/services/professional-development" aria-label="Learn more about Faculty Professional Development">
                    Learn more →
                  </Link>
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--primary)' }}>
              How We Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-3-he">
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>Assess</h3>
                <p className="opacity-75">Data‑driven readiness surveys tailored for higher education contexts and academic environments.</p>
              </article>
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>Plan</h3>
                <p className="opacity-75">Prioritized roadmap based on institutional priorities, faculty readiness, and student success impact.</p>
              </article>
              <article className="card-he">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary)' }}>Implement</h3>
                <p className="opacity-75">Templates, faculty development, and expert support for sustainable higher education AI adoption.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--primary)' }}>
              Ready to Transform Your Institution?
            </h2>
            <p className="text-lg mb-8 opacity-75 max-w-3xl mx-auto">
              Start your higher education AI journey with AI Blueprint. Get instant access with your 7-day free trial, then continue with full access at $995/month—no sales call required.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link className="btn-he btn-primary-he" href="/start?billing=monthly" data-cta="impl-main">
                Start Free Trial
              </Link>
              <Link className="btn-he btn-outline-he" href="/contact" data-cta="contact-footer">
                Contact
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 text-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="container mx-auto max-w-6xl">
            <p className="mb-2">© 2025 Higher Ed AI Blueprint. All rights reserved.</p>
            <p className="opacity-75">
              <Link href="/privacy" className="hover:opacity-100">Privacy</Link> •{' '}
              <Link href="/contact" className="hover:opacity-100">Contact</Link>
            </p>
          </div>
        </footer>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Higher Ed AI Blueprint",
            "url": "https://aiblueprint.k12aiblueprint.com/higher-ed",
            "logo": "https://aiblueprint.k12aiblueprint.com/wp-content/uploads/2025/07/Screenshot-2025-07-15-at-4.12.36-PM.png",
            "contactPoint": [{
              "@type": "ContactPoint",
              "contactType": "customer support",
              "email": "info@k12aiblueprint.com",
              "areaServed": "US"
            }]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Higher Ed AI Blueprint",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "995.00",
              "priceCurrency": "USD",
              "description": "Team subscription (monthly) with 7-day free trial"
            }
          })
        }}
      />
    </>
  );
}
