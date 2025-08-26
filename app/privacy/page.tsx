export const dynamic = 'force-static';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toISOString().split('T')[0]}</p>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Your Privacy Matters</h2>
          <p className="text-blue-800">
            NorthPath Strategies is committed to protecting your privacy and ensuring the security of your personal information.
            This policy explains how we collect, use, and safeguard your data when you use our AI Blueprint™ assessment platform.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Personal Information</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Account Information:</strong> Name, email address, job title, organization name, and institutional affiliation</li>
          <li><strong>Contact Information:</strong> Phone number, mailing address, and communication preferences</li>
          <li><strong>Professional Details:</strong> Role within your organization, department, and institutional context</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Assessment Data</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Assessment Responses:</strong> Your answers to AI readiness questions and evaluations</li>
          <li><strong>Uploaded Documents:</strong> Policy documents, strategic plans, and related materials you choose to share</li>
          <li><strong>Progress Data:</strong> Assessment completion status, scores, and improvement tracking</li>
          <li><strong>Usage Analytics:</strong> How you interact with our platform to improve user experience</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Technical Information</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
          <li><strong>Usage Data:</strong> Pages visited, time spent, and navigation patterns</li>
          <li><strong>Log Data:</strong> IP addresses, access times, and error reports for security and troubleshooting</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Assessment Services</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Provide personalized AI readiness assessments and recommendations</li>
          <li>Generate custom reports, dashboards, and strategic guidance</li>
          <li>Track your institution's progress over time</li>
          <li>Deliver tier-appropriate content and features</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Communication</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Send assessment results and progress notifications</li>
          <li>Provide customer support and technical assistance</li>
          <li>Share relevant updates about AI in education</li>
          <li>Deliver premium content for subscribers</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Platform Improvement</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Analyze usage patterns to enhance user experience</li>
          <li>Develop new features and assessment methodologies</li>
          <li>Conduct research on AI adoption in educational institutions</li>
          <li>Maintain security and prevent fraud</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security & Protection</h2>

        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Enterprise-Grade Security</h3>
          <p className="text-green-800">
            We implement industry-leading security measures including encryption, secure data centers,
            regular security audits, and compliance with educational data protection standards.
          </p>
        </div>

        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using AES-256 encryption</li>
          <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
          <li><strong>Data Centers:</strong> SOC 2 Type II compliant hosting infrastructure</li>
          <li><strong>Regular Audits:</strong> Third-party security assessments and vulnerability testing</li>
          <li><strong>Staff Training:</strong> Regular security awareness training for all team members</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Sharing & Disclosure</h2>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">We Do NOT Sell Your Data</h3>
        <p className="text-gray-700 mb-4">
          NorthPath Strategies does not sell, rent, or trade your personal information to third parties for marketing purposes.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Limited Sharing Scenarios</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Service Providers:</strong> Trusted partners who help us operate our platform (hosting, analytics, support)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
          <li><strong>Aggregate Data:</strong> De-identified, aggregated insights about AI adoption trends (no personal information)</li>
          <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (with continued privacy protection)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Privacy Rights</h2>

        <div className="grid md:grid-cols-2 gap-6 my-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Access & Portability</h3>
            <p className="text-blue-800 text-sm">Request a copy of your personal data in a portable format</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Correction & Updates</h3>
            <p className="text-green-800 text-sm">Update or correct your personal information anytime</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Data Deletion</h3>
            <p className="text-yellow-800 text-sm">Request deletion of your account and associated data</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Processing Limits</h3>
            <p className="text-purple-800 text-sm">Object to or restrict certain data processing activities</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Educational Data Protection</h2>
        <p className="text-gray-700 mb-4">
          We understand the unique privacy requirements of educational institutions and comply with applicable laws including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>FERPA (Family Educational Rights and Privacy Act)</strong> - Student privacy protection</li>
          <li><strong>COPPA (Children's Online Privacy Protection Act)</strong> - Protection for users under 13</li>
          <li><strong>State Privacy Laws</strong> - Including California's CCPA and other regional requirements</li>
          <li><strong>International Standards</strong> - GDPR compliance for global institutions</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Cookie Policy</h2>
        <p className="text-gray-700 mb-4">
          We use cookies and similar technologies to enhance your experience:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Essential Cookies:</strong> Required for platform functionality and security</li>
          <li><strong>Analytics Cookies:</strong> Help us understand usage patterns and improve our service</li>
          <li><strong>Preference Cookies:</strong> Remember your settings and personalization choices</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Retention</h2>
        <p className="text-gray-700 mb-4">
          We retain your information only as long as necessary to provide our services and comply with legal obligations:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
          <li><strong>Inactive Accounts:</strong> Data anonymized or deleted after 3 years of inactivity</li>
          <li><strong>Assessment Data:</strong> Retained to track institutional progress and benchmark performance</li>
          <li><strong>Legal Requirements:</strong> Some data may be retained longer for compliance purposes</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Children's Privacy</h2>
        <p className="text-gray-700 mb-4">
          Our platform is designed for institutional use by adults. We do not knowingly collect personal information
          from children under 13 without proper consent and oversight from educational institutions.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">International Data Transfers</h2>
        <p className="text-gray-700 mb-4">
          Your data may be processed in the United States and other countries where we operate. We ensure appropriate
          safeguards are in place for international transfers, including standard contractual clauses and adequacy decisions.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Updates to This Policy</h2>
        <p className="text-gray-700 mb-4">
          We may update this privacy policy to reflect changes in our practices or legal requirements.
          We will notify you of significant changes via email or platform notifications.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">
            If you have questions about this privacy policy or want to exercise your privacy rights, please contact us:
          </p>
          <div className="space-y-2 text-gray-700">
            <p><strong>Email:</strong> privacy@northpathstrategies.com</p>
            <p><strong>Secure Contact Form:</strong> <a href="/contact" className="text-blue-600 hover:underline">/contact</a></p>
            <p><strong>Expert Support:</strong> <a href="https://calendly.com/jeremyestrella/30min" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Schedule a consultation</a></p>
            <p><strong>Response Time:</strong> We will respond to privacy requests within 30 days</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-900 text-sm">
            <strong>Questions about AI governance?</strong> Join our community at{' '}
            <a href="https://northpath-strategies.slack.com/archives/C09CZFF6URE" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
              our Slack community
            </a>{' '}
            for expert guidance and peer discussions.
          </p>
        </div>
      </div>
    </div>
  );
}
