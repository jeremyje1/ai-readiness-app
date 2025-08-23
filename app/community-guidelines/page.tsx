import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              AI Readiness Community Guidelines
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Building a supportive environment for AI transformation success
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                  🎯 Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The AI Readiness Community is designed to accelerate your organization's AI transformation 
                  through shared knowledge, peer support, and expert guidance. We're here to help you move 
                  from assessment to implementation with confidence.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                  ✅ Community Standards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Be Helpful & Constructive</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Share insights, resources, and experiences that help others succeed. Focus on solutions and practical advice.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Respect Privacy & Confidentiality</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Don't share sensitive organizational information. Use general examples when discussing implementations.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Stay On Topic</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Keep discussions focused on AI readiness, implementation strategies, and organizational transformation.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Professional Communication</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Maintain a professional tone. We're all here to learn and grow together.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-purple-600 dark:text-purple-400">
                  🚀 How to Get the Most Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ask Great Questions</h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• Be specific about your context</li>
                      <li>• Share what you've already tried</li>
                      <li>• Explain your organizational constraints</li>
                      <li>• Ask for concrete next steps</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Share Your Wins</h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• Document successful implementations</li>
                      <li>• Share lessons learned</li>
                      <li>• Highlight unexpected benefits</li>
                      <li>• Celebrate team achievements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-orange-600 dark:text-orange-400">
                  🎁 Monthly Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Expert Office Hours</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Live Q&A sessions with AI implementation specialists
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Success Story Spotlights</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Deep dives into member transformation journeys
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Template Library Updates</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      New resources based on community feedback
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                  🚫 What's Not Allowed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• Self-promotion or sales pitches</li>
                      <li>• Sharing competitor strategies</li>
                      <li>• Off-topic discussions</li>
                      <li>• Harassment or discrimination</li>
                    </ul>
                  </div>
                  <div>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• Sharing proprietary information</li>
                      <li>• Political or religious debates</li>
                      <li>• Spam or repetitive posting</li>
                      <li>• Disrespectful behavior</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="text-center py-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Join the Community?</h3>
                <p className="text-lg mb-6">
                  Connect with fellow AI transformation leaders and accelerate your journey
                </p>
                <div className="space-x-4">
                  <button 
                    onClick={() => window.open('https://join.slack.com/t/aireadiness/shared_invite/zt-ai-readiness-community', '_blank')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Join Slack Community
                  </button>
                  <button 
                    onClick={() => window.history.back()}
                    className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Back to Resources
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
