export const dynamic = 'force-static';
export default function TermsOfServicePage() {
  return (
    <div className="prose max-w-3xl mx-auto py-12 px-6">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toISOString().split('T')[0]}</p>
      <p>These placeholder Terms govern use of the AI Readiness assessment platform. Replace with your official legal content.</p>
      <h2>Use of Service</h2>
      <p>You agree to use the platform for lawful educational and organizational assessment purposes.</p>
      <h2>Accounts</h2>
      <p>You must provide accurate information. We may suspend accounts violating these terms.</p>
      <h2>Intellectual Property</h2>
      <p>All proprietary algorithms, scoring methodologies and reports remain the property of NorthPath Strategies.</p>
      <h2>Limitation of Liability</h2>
      <p>Platform provided "as is" without warranties; liability limited to the extent permitted by law.</p>
    </div>
  );
}
