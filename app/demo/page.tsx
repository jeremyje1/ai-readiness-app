export default function DemoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        See AI Blueprint™ in Action
                    </h1>
                    <p className="text-xl text-gray-600">
                        Watch how our platform helps educational institutions assess AI readiness and create implementation plans
                    </p>
                </div>

                <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-6">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎬</div>
                            <div className="text-2xl font-semibold text-gray-700">Demo Video Coming Soon</div>
                            <p className="text-gray-600 mt-2">We're preparing a comprehensive video walkthrough</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Assessment Process</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>• 5-minute NIST framework evaluation</li>
                            <li>• Comprehensive readiness scoring</li>
                            <li>• Detailed gap analysis</li>
                            <li>• Personalized recommendations</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Blueprint Generation</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>• AI-powered plan creation</li>
                            <li>• Phased implementation strategy</li>
                            <li>• Department-specific recommendations</li>
                            <li>• Real-time progress tracking</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-lg mb-6 opacity-90">
                        Experience AI Blueprint™ firsthand with our free 14-day trial
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <a
                            href="/get-started"
                            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Start Free Trial
                        </a>
                        <a
                            href="/contact"
                            className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                        >
                            Schedule a Call
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
