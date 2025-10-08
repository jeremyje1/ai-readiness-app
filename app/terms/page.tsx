export const dynamic = 'force-static';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toISOString().split('T')[0]}</p>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Welcome to AI Blueprint™</h2>
          <p className="text-blue-800">
            These Terms of Service govern your use of the AI Blueprint™ assessment platform provided by NorthPath Strategies.
            By accessing or using our services, you agree to be bound by these terms.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          By creating an account, accessing our platform, or using any of our services, you acknowledge that you have read,
          understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms,
          please do not use our services.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Services</h2>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">AI Blueprint™ Platform</h3>
        <p className="text-gray-700 mb-4">
          NorthPath Strategies provides a comprehensive AI readiness assessment platform designed specifically for educational institutions, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>AI Readiness Assessments:</strong> Comprehensive evaluations of institutional AI preparedness</li>
          <li><strong>Custom Reports & Analytics:</strong> Detailed insights and recommendations based on assessment results</li>
          <li><strong>Policy Development Tools:</strong> Templates and guidance for AI governance policies</li>
          <li><strong>Executive Dashboards:</strong> Leadership-focused metrics and progress tracking</li>
          <li><strong>Community Resources:</strong> Access to best practices, templates, and peer insights</li>
          <li><strong>Expert Consultation:</strong> Professional guidance and strategic support</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Service Tiers</h3>
        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Higher Ed AI Pulse Check</h4>
            <p className="text-gray-700 text-sm">Quick assessment with basic recommendations and scoring</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">AI Readiness Comprehensive</h4>
            <p className="text-blue-800 text-sm">Detailed evaluation with custom reports and policy templates</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">AI Transformation Blueprint</h4>
            <p className="text-green-800 text-sm">Strategic planning with implementation roadmaps and expert guidance</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">AI Enterprise Partnership</h4>
            <p className="text-purple-800 text-sm">Ongoing partnership with continuous support and optimization</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts and Responsibilities</h2>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Account Creation</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>You must provide accurate, current, and complete information during registration</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You must be at least 18 years old or have appropriate institutional authorization</li>
          <li>One account per individual; institutional accounts may have multiple authorized users</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Acceptable Use</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Use our services only for lawful educational and organizational assessment purposes</li>
          <li>Provide truthful and accurate information in assessments and communications</li>
          <li>Respect the intellectual property rights of NorthPath Strategies and other users</li>
          <li>Do not attempt to reverse engineer, hack, or circumvent our security measures</li>
          <li>Do not share login credentials or allow unauthorized access to your account</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Prohibited Activities</h3>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800 font-medium mb-2">The following activities are strictly prohibited:</p>
          <ul className="list-disc pl-6 space-y-1 text-red-700 text-sm">
            <li>Submitting false or misleading assessment data</li>
            <li>Attempting to gain unauthorized access to other accounts or systems</li>
            <li>Using automated tools to interact with our platform without permission</li>
            <li>Violating any applicable laws or regulations</li>
            <li>Harassing, threatening, or abusing other users or our staff</li>
            <li>Distributing malware, viruses, or other harmful content</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Intellectual Property Rights</h2>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Our Intellectual Property</h3>
        <p className="text-gray-700 mb-4">
          All content, features, and functionality of the AI Blueprint™ platform are owned by NorthPath Strategies and protected by copyright, trademark, and other intellectual property laws, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Proprietary assessment algorithms and scoring methodologies</li>
          <li>Custom reports, templates, and analytical frameworks</li>
          <li>Software code, user interfaces, and platform architecture</li>
          <li>Educational content, best practices, and research insights</li>
          <li>Trademarks including &ldquo;AI Blueprint™&rdquo; and &ldquo;NorthPath Strategies&rdquo;</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Your Content</h3>
        <p className="text-gray-700 mb-4">
          You retain ownership of any content you submit to our platform (assessment responses, uploaded documents, etc.).
          By submitting content, you grant us a limited license to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Process and analyze your content to provide assessment services</li>
          <li>Generate reports and recommendations based on your submissions</li>
          <li>Use aggregated, de-identified data for research and service improvement</li>
          <li>Store and backup your content for service continuity</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Payment Terms and Billing</h2>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Subscription Plans</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Payment Processing:</strong> Payments processed securely through Stripe</li>
          <li><strong>Billing Cycles:</strong> Monthly or annual billing as selected during signup</li>
          <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled</li>
          <li><strong>Price Changes:</strong> 30-day notice for any subscription price changes</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Refund Policy</h3>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 mb-2">
            <strong>30-Day Satisfaction Guarantee:</strong> If you’re not satisfied with our service,
            contact us within 30 days of your initial purchase for a full refund.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-green-700 text-sm">
            <li>Refunds processed within 5-10 business days</li>
            <li>Partial refunds available for annual subscriptions</li>
            <li>Custom enterprise services subject to separate agreement terms</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Protection and Privacy</h2>
        <p className="text-gray-700 mb-4">
          Your privacy and data security are paramount to us. Our data handling practices are detailed in our
          <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>, which includes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>FERPA and COPPA compliance for educational institutions</li>
          <li>SOC 2 Type II security standards</li>
          <li>Encryption of all data in transit and at rest</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Incident response procedures and notification protocols</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Service Availability and Support</h2>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Service Level Commitments</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Uptime:</strong> 99.5% availability target with scheduled maintenance windows</li>
          <li><strong>Support Response:</strong> 24-48 hour response time for support requests</li>
          <li><strong>Data Backup:</strong> Daily automated backups with 30-day retention</li>
          <li><strong>Security Monitoring:</strong> 24/7 monitoring and threat detection</li>
        </ul>

        <h3 className="text-xl font-semibent text-gray-800 mt-6 mb-3">Expert Support</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 mb-2">Need personalized assistance? Our experts are here to help:</p>
          <ul className="space-y-2 text-blue-700">
            <li><strong>Schedule a Consultation:</strong> <a href="https://calendly.com/jeremyestrella/30min" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Book a 30-minute session</a></li>
            <li><strong>Join Our Community:</strong> <a href="https://northpath-strategies.slack.com/archives/C09CZFF6URE" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AI Governance Slack Channel</a></li>
            <li><strong>Email Support:</strong> support@northpathstrategies.com</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <p className="text-yellow-900 mb-4">
            <strong>Important Legal Notice:</strong> Please read this section carefully as it limits our liability to you.
          </p>
          <p className="text-yellow-800 text-sm mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, NORTHPATH STRATEGIES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL,
            OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OUR SERVICES.
          </p>
          <p className="text-yellow-800 text-sm">
            Our total liability to you for any claims arising out of or relating to these terms or our services shall not
            exceed the amount you paid to us in the twelve (12) months preceding the claim.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Indemnification</h2>
        <p className="text-gray-700 mb-4">
          You agree to indemnify, defend, and hold harmless NorthPath Strategies and its officers, directors, employees,
          and agents from any claims, damages, losses, or expenses (including attorney fees) arising from:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Your use of our services in violation of these terms</li>
          <li>Your violation of any third-party rights</li>
          <li>Content you submit that infringes on intellectual property rights</li>
          <li>Your negligent or unlawful conduct</li>
        </ul>

        <h2 className="text-2xl font-semibent text-gray-900 mt-8 mb-4">10. Termination</h2>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Termination by You</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>You may cancel your subscription at any time through your account settings</li>
          <li>Cancellation takes effect at the end of your current billing period</li>
          <li>You will continue to have access to paid features until cancellation is effective</li>
          <li>Account data will be retained for 90 days after cancellation</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Termination by Us</h3>
        <p className="text-gray-700 mb-4">
          We may suspend or terminate your account immediately if you:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Violate these Terms of Service or our acceptable use policy</li>
          <li>Fail to pay subscription fees or associated charges</li>
          <li>Engage in fraudulent or illegal activities</li>
          <li>Pose a security risk to our platform or other users</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Governing Law and Dispute Resolution</h2>
        <p className="text-gray-700 mb-4">
          These Terms of Service are governed by the laws of the State of California, without regard to conflict of law principles.
          Any disputes arising from these terms or your use of our services will be resolved through:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li><strong>Good Faith Negotiation:</strong> Direct discussion between parties for 30 days</li>
          <li><strong>Mediation:</strong> Non-binding mediation if negotiation fails</li>
          <li><strong>Arbitration:</strong> Binding arbitration under American Arbitration Association rules</li>
        </ol>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Changes to Terms</h2>
        <p className="text-gray-700 mb-4">
          We may modify these Terms of Service from time to time to reflect changes in our services, legal requirements,
          or business practices. We will provide notice of significant changes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Email notification to registered users at least 30 days before changes take effect</li>
          <li>Prominent notice on our platform and website</li>
          <li>Updated &ldquo;Last modified&rdquo; date at the top of these terms</li>
          <li>Continued use of our services constitutes acceptance of modified terms</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Severability and Entire Agreement</h2>
        <p className="text-gray-700 mb-4">
          If any provision of these terms is found to be unenforceable or invalid, the remaining provisions will continue
          in full force and effect. These Terms of Service, together with our Privacy Policy, constitute the entire agreement
          between you and NorthPath Strategies regarding your use of our services.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Contact Information</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">
            If you have questions about these Terms of Service or need assistance with our platform:
          </p>
          <div className="space-y-2 text-gray-700">
            <p><strong>General Support:</strong> support@northpathstrategies.com</p>
            <p><strong>Legal Questions:</strong> legal@northpathstrategies.com</p>
            <p><strong>Secure Contact Form:</strong> <a href="/contact" className="text-blue-600 hover:underline">/contact</a></p>
            <p><strong>Expert Consultation:</strong> <a href="https://calendly.com/jeremyestrella/30min" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Schedule a meeting</a></p>
            <p><strong>Community Support:</strong> <a href="https://northpath-strategies.slack.com/archives/C09CZFF6URE" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Join our Slack community</a></p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>Thank you for choosing AI Blueprint™ by NorthPath Strategies</p>
          <p className="text-sm mt-2">Empowering educational institutions with responsible AI adoption</p>
        </div>
      </div>
    </div>
  );
}
