import React from 'react';
import Link from 'next/link';

// Consolidated Higher Ed landing content placeholder.
// If a richer marketing experience is required, port over selected blocks from highered-marketing-page.html
// ensuring images are hosted under the consolidated domain.

export const metadata = {
  title: 'Higher Ed AI Blueprint – Responsible AI for Universities',
  description: 'Readiness assessments, implementation blueprints, and professional development for higher education institutions – now part of the unified AI Blueprint platform.'
};

export default function HigherEdPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 prose prose-invert">
      <h1>Higher Ed AI Blueprint</h1>
      <p>
        Our higher education focused readiness assessments, implementation frameworks, and faculty development resources
        have been consolidated into the unified AI Blueprint platform. You still get the same patent‑pending algorithm suite
        and actionable blueprints—now with a single canonical domain for improved security and consistency.
      </p>
      <ul>
        <li>AI readiness & capacity diagnostics (AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, AIBS™)</li>
        <li>Institutional governance & policy accelerators</li>
        <li>Faculty professional development modules</li>
        <li>Research & academic integrity guidance</li>
      </ul>
      <p>
        Ready to begin? Start a free 7‑day trial—no sales call required.
      </p>
      <p>
        <Link className="inline-flex items-center rounded bg-sky-600 hover:bg-sky-500 px-4 py-2 text-white font-medium" href="/start?billing=monthly&return_to=dashboard&utm_source=higher_ed_page&utm_medium=cta&utm_campaign=consolidation">
          Start Free Trial
        </Link>
      </p>
      <p className="text-sm opacity-70">Need district (K‑12) solutions instead? <Link href="/">Visit the main landing page</Link>.</p>
    </main>
  );
}
