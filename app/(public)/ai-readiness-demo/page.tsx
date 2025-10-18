import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'AI Readiness Assessment - Education AI Blueprint',
    description: 'Discover your institution\'s AI readiness in under 10 minutes. Get personalized recommendations, quick wins, and a roadmap for responsible AI adoption.',
    keywords: 'AI readiness assessment, education AI, K-12 AI, higher education technology, AI governance, FERPA compliance',
    openGraph: {
        title: 'Free AI Readiness Assessment for Educational Institutions',
        description: 'Get instant insights and actionable recommendations to advance your AI strategy.',
        type: 'website',
    },
}

export default function AIReadinessDemoPage() {
    // Redirect to the standalone demo page
    // This page serves as the entry point that will be moved to /public
    return (
        <div style={{ minHeight: '100vh', width: '100%' }}>
            <iframe
                src="/education-ai-blueprint-demo.html"
                style={{
                    width: '100%',
                    height: '100vh',
                    border: 'none',
                    display: 'block'
                }}
                title="AI Readiness Assessment Demo"
            />
        </div>
    )
}
