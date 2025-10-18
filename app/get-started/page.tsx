import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Get Started | AI Blueprint",
    description: "Try our interactive demo to explore the AI Blueprint platform"
}

/**
 * Simple redirect page to /demo
 * This is a static redirect that happens instantly on the client side
 * to avoid any server-side session checking that could cause loops
 */
export default function GetStartedPage() {
    // Client-side redirect using meta refresh as fallback
    return (
        <>
            <meta httpEquiv="refresh" content="0; url=/demo" />
            <script dangerouslySetInnerHTML={{ __html: `window.location.replace('/demo');` }} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4 animate-bounce">🚀</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Redirecting to Demo...
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Taking you to the demo experience
                    </p>
                    <div className="flex justify-center">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        If you're not redirected, <a href="/demo" className="text-purple-600 hover:text-purple-700 underline">click here</a>
                    </p>
                </div>
            </div>
        </>
    )
}
