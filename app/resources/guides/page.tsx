import Link from 'next/link';

export default function ResourcesGuidesPage() {
  const guides = [
    {
      category: 'Getting Started',
      items: [
        { title: 'AI Readiness Assessment Guide', description: 'Complete walkthrough of the NIST AI RMF assessment process' },
        { title: 'Creating Your First Blueprint', description: 'Step-by-step guide to generating your implementation plan' },
        { title: 'Platform Quick Start', description: 'Get up and running in 15 minutes' },
      ],
    },
    {
      category: 'Implementation',
      items: [
        { title: 'Phased Implementation Strategy', description: 'Best practices for rolling out AI across departments' },
        { title: 'Change Management for AI', description: 'Leading institutional transformation' },
        { title: 'Budget Planning & ROI', description: 'Financial planning for AI initiatives' },
      ],
    },
    {
      category: 'Policy & Governance',
      items: [
        { title: 'AI Governance Frameworks', description: 'Establishing oversight and accountability' },
        { title: 'Ethical AI Guidelines', description: 'Principles for responsible AI use' },
        { title: 'Data Privacy & Security', description: 'Protecting institutional and student data' },
      ],
    },
    {
      category: 'Best Practices',
      items: [
        { title: 'Faculty AI Training', description: 'Preparing educators for AI integration' },
        { title: 'Student AI Literacy', description: 'Building AI competencies across curricula' },
        { title: 'Measuring AI Impact', description: 'KPIs and success metrics' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Guides & Best Practices
          </h1>
          <p className="text-xl text-gray-600">
            Expert resources to guide your AI implementation journey
          </p>
        </div>

        <div className="space-y-8">
          {guides.map((section) => (
            <div key={section.category} className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.items.map((guide) => (
                  <div key={guide.title} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{guide.description}</p>
                    <span className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">
                      Coming Soon →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your AI Journey?</h2>
          <p className="text-lg mb-6 opacity-90">
            Get access to all guides, templates, and resources with your subscription
          </p>
          <Link
            href="/get-started"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Free 14-Day Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
