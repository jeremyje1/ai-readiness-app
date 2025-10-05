export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        About AI Blueprint™
                    </h1>
                    <p className="text-xl text-gray-600">
                        Empowering educational institutions to harness AI responsibly and effectively
                    </p>
                </div>

                <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                    <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                        AI Blueprint™ is the first comprehensive platform designed specifically for educational
                        institutions navigating the complex landscape of AI implementation. We believe that every
                        school, college, and university deserves access to world-class AI planning tools and expertise.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Built on the NIST AI Risk Management Framework and powered by advanced AI technology, our
                        platform transforms complex AI readiness assessments into actionable, personalized
                        implementation blueprints that institutions can follow step-by-step.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard number="100+" label="Educational Institutions" />
                    <StatCard number="500+" label="Blueprints Generated" />
                    <StatCard number="50+" label="Policy Templates" />
                </div>

                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Why Educational Institutions Choose Us</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Benefit
                            title="Education-Focused"
                            description="Built specifically for K-12 and higher education"
                        />
                        <Benefit
                            title="NIST Aligned"
                            description="Based on industry-standard AI RMF framework"
                        />
                        <Benefit
                            title="AI-Powered"
                            description="GPT-4 generates personalized plans"
                        />
                        <Benefit
                            title="Proven Results"
                            description="Trusted by leading institutions nationwide"
                        />
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <a
                        href="/get-started"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Start Your AI Journey
                    </a>
                </div>
            </div>
        </div>
    );
}

function StatCard({ number, label }: { number: string; label: string }) {
    return (
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">{number}</div>
            <div className="text-gray-600">{label}</div>
        </div>
    );
}

function Benefit({ title, description }: { title: string; description: string }) {
    return (
        <div>
            <div className="font-semibold text-blue-600 mb-1">✓ {title}</div>
            <div className="text-gray-700 text-sm">{description}</div>
        </div>
    );
}
