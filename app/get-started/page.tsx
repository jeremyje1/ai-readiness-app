import { Metadata } from "next"
import { redirect } from "next/navigation"

import { GetStartedForm } from "@/components/onboarding/get-started-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
    title: "Get Started | AI Blueprint",
    description: "Create your AI Blueprint account or sign in to continue your trial"
}

const pillarHighlights = [
    {
        title: "AI Governance",
        description: "Establish responsible use policies aligned to state and federal guidance"
    },
    {
        title: "Curriculum Integration",
        description: "Map high-impact use cases for instructors, administrators, and support teams"
    },
    {
        title: "Measurement & Safety",
        description: "Monitor AI adoption, security posture, and equity outcomes across your institution"
    }
]

export default async function GetStartedPage() {
    const supabase = await createClient()
    const {
        data: { session }
    } = await supabase.auth.getSession()

    if (session) {
        redirect("/dashboard/personalized")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16">
                <header className="space-y-4 text-center">
                    <p className="text-sm uppercase tracking-wide text-indigo-600">AI Blueprint for Education</p>
                    <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                        Launch Your AI Readiness Blueprint
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600">
                        Start a 7-day trial to complete your readiness assessment, generate implementation roadmaps, and activate a trusted AI governance framework.
                    </p>
                </header>

                <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
                    <div>
                        <GetStartedForm />
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-2xl border border-indigo-100 bg-white/90 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">Trial includes</h2>
                            <ul className="mt-4 space-y-3 text-sm text-slate-600">
                                <li>• Full access to streamlined AI readiness assessment</li>
                                <li>• Automated gap analysis and implementation roadmap</li>
                                <li>• Blueprint templates aligned to NIST and Department of Education guidance</li>
                                <li>• Invite teammates to collaborate on policy development</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">What we deliver</h3>
                            <div className="mt-4 space-y-4">
                                {pillarHighlights.map((item) => (
                                    <div key={item.title} className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    )
}
