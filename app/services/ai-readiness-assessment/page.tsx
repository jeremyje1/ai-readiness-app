export const dynamic = 'force-static';

export default function AIReadinessAssessmentServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 px-6">
      <div className="max-w-4xl mx-auto prose prose-indigo">
        <h1>AI Readiness Assessments</h1>
        <p>
          The AI Blueprint™ Readiness Assessment provides a structured, evidence‑based evaluation across governance,
          infrastructure, pedagogy, risk & compliance, culture, benchmarking and mission alignment. It leverages our
          patent‑pending algorithmic suite (AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, AIBS™) to translate qualitative & quantitative
          inputs into actionable strategic positioning.
        </p>
        <h2>Key Outcomes</h2>
        <ul>
          <li>Multi-domain maturity scoring with weighted composite index</li>
          <li>Prioritized recommendations with impact & feasibility scoring</li>
          <li>Benchmark comparisons against peer institutional profiles</li>
          <li>Risk & compliance posture insights with mitigation guidance</li>
          <li>Mission alignment narrative tying AI initiatives to student success & institutional goals</li>
        </ul>
        <h2>Who It’s For</h2>
        <p>Superintendents, CIOs, CAOs, provost offices, innovation leaders, and academic technology strategists.</p>
        <h2>Next Step</h2>
        <p><a href="/start?billing=monthly" className="text-indigo-600 font-medium">Begin your assessment →</a></p>
      </div>
    </div>
  );
}
