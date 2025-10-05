import Link from 'next/link';

export default function CaseStudiesPage() {
    const caseStudies = [
        {
            institution: 'Major State University',
            type: 'University',
            challenge: 'Needed comprehensive AI strategy across 15 departments',
            solution: 'Used AI Blueprint to create phased implementation plan',
            results: [
                'Completed assessment in 10 minutes',
                'Generated 3-year implementation roadmap',
                'Secured $2M in funding using ROI calculator',
                'Deployed AI literacy program to 500+ faculty',
            ],
            maturityGain: 'Level 1 → Level 3',
        },
        {
            institution: 'Urban School District',
            type: 'K-12',
            challenge: 'Limited resources and expertise for AI planning',
            solution: 'Leveraged policy templates and blueprint guidance',
            results: [
                'Created district-wide AI policy in 2 weeks',
                'Identified quick wins saving 100+ admin hours',
                'Launched pilot program in 5 schools',
                'Achieved board approval with funding justification',
            ],
            maturityGain: 'Level 0 → Level 2',
        },
        {
            institution: 'Private Liberal Arts College',
            type: 'College',
            challenge: 'Faculty resistance and unclear implementation path',
            solution: 'Used assessment data to build stakeholder buy-in',
            results: [
                'Gap analysis identified clear priorities',
                'Department-specific recommendations reduced resistance',
                'Collaborative blueprint shared with 50+ stakeholders',
                'Progress tracking kept initiative accountable',
            ],
            maturityGain: 'Level 1 → Level 2',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Success Stories
                    </h1>
                    <p className="text-xl text-gray-600">
                        See how institutions are transforming their AI strategy with AI Blueprint™
                    </p>
                </div>

                <div className="space-y-8">
                    {caseStudies.map((study, index) => (
                        <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{study.institution}</h2>
                                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                        {study.type}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-600">Maturity Level</div>
                                    <div className="text-lg font-bold text-green-600">{study.maturityGain}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Challenge</h3>
                                    <p className="text-gray-700">{study.challenge}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Solution</h3>
                                    <p className="text-gray-700">{study.solution}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Key Results</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {study.results.map((result, idx) => (
                                        <li key={idx} className="flex items-start text-gray-700">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>{result}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Join Leading Institutions</h2>
                    <p className="text-lg mb-6 opacity-90">
                        Start your AI transformation journey today with AI Blueprint™
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link
                            href="/get-started"
                            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Start Free Trial
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
