export const dynamic = 'force-static';

export default function ProfessionalDevelopmentServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 px-6">
      <div className="max-w-4xl mx-auto prose prose-indigo">
        <h1>Teacher Professional Development</h1>
        <p>
          Structured professional learning pathways aligned to AI literacy, instructional integration, ethical governance,
          and data stewardship. Cohort‑based and asynchronous modules tailored to district or campus maturity stage.
        </p>
        <h2>Program Components</h2>
        <ul>
          <li>Role‑based AI literacy foundations</li>
          <li>Curriculum integration design sprints</li>
          <li>Ethical & responsible AI policy adoption workshops</li>
          <li>Secure data handling & model usage guidelines</li>
          <li>Continuous improvement feedback loops & micro‑credentialing</li>
        </ul>
        <h2>Delivery Formats</h2>
        <p>Live virtual workshops, on‑site facilitation, LMS module bundles, blended coaching.</p>
        <h2>Get In Touch</h2>
        <p><a href="/contact" className="text-indigo-600 font-medium">Request a PD program overview →</a></p>
      </div>
    </div>
  );
}
