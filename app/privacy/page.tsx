export const dynamic = 'force-static';
export default function PrivacyPolicyPage() {
  return (
    <div className="prose max-w-3xl mx-auto py-12 px-6">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toISOString().split('T')[0]}</p>
      <p>This placeholder Privacy Policy page clarifies how we handle information collected through the AI Readiness platform. Replace with your legal text.</p>
      <h2>Information We Collect</h2>
      <p>Account registration details (name, organization, email) and assessment responses.</p>
      <h2>Use of Information</h2>
      <p>To provide assessments, analytics, reports and support communications.</p>
      <h2>Data Security</h2>
      <p>We implement safeguards aligned with industry best practices to protect data.</p>
      <h2>Contact</h2>
      <p>For privacy inquiries contact <a href="mailto:info@northpathstrategies.org">info@northpathstrategies.org</a>.</p>
    </div>
  );
}
