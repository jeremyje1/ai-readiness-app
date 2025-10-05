export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete AI Readiness Platform
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to assess, plan, and implement AI across your institution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="📊"
            title="NIST Framework Assessment"
            description="Comprehensive 5-step assessment based on the NIST AI Risk Management Framework (Govern, Map, Measure, Manage)."
          />
          <FeatureCard
            icon="🎯"
            title="Personalized Dashboard"
            description="AI readiness score, maturity level, framework breakdown, priority actions, and quick wins - all on one dashboard."
          />
          <FeatureCard
            icon="📈"
            title="Gap Analysis"
            description="Detailed analysis of gaps, strengths, and recommendations for each NIST framework function."
          />
          <FeatureCard
            icon="🔒"
            title="Enterprise Security"
            description="Row-level security, encrypted data, Supabase authentication, and full compliance with educational data protection."
          />
          <FeatureCard
            icon="📄"
            title="Document Analysis"
            description="Upload institutional documents for AI-powered analysis to enhance your assessment accuracy."
          />
          <FeatureCard
            icon="📑"
            title="Policy Templates"
            description="Access 50+ AI policy templates covering governance, ethics, data privacy, faculty guidelines, and student use."
          />
          <FeatureCard
            icon="🚀"
            title="AI Implementation Blueprint"
            description="GPT-4 powered personalized roadmap generation with phased approach and department strategies."
          />
          <FeatureCard
            icon="📊"
            title="Progress Tracking"
            description="Real-time dashboard tracks task completion, budget spent, timeline adherence, and identifies blockers automatically."
          />
          <FeatureCard
            icon="👥"
            title="Team Collaboration"
            description="Share blueprints publicly or privately, invite team members via email, and collaborate on implementation together."
          />
        </div>

        <div className="mt-12 text-center">
          <a
            href="/get-started"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Free 14-Day Trial
          </a>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
