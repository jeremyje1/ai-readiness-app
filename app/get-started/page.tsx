import { DemoLeadForm } from "@/components/demo/demo-lead-form"
import { GetStartedForm } from "@/components/onboarding/get-started-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    title: "Get Started | AI Blueprint",
    description: "Launch your AI readiness trial, explore the interactive demo, or schedule a consultation with the AI Blueprint team.",
    openGraph: {
        title: "Get Started with AI Blueprint",
        description: "Experience the AI readiness platform for education leaders. Start a free trial, launch the sandbox demo, or schedule a working session.",
        url: "https://educationaiblueprint.com/get-started"
    }
}

type GetStartedPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const featureHighlights = [
    {
        title: "AI readiness baseline in minutes",
        description: "Capture governance, curriculum, data, and infrastructure maturity aligned to the NIST AI RMF."
    },
    {
        title: "30/60/90 day implementation roadmaps",
        description: "Auto-generate prioritized actions with owners, milestones, and investment guidance tailored to your institution."
    },
    {
        title: "Executive-grade reporting",
        description: "Share dashboards with leadership, board members, and community stakeholders with a single click."
    }
]

export default async function GetStartedPage({ searchParams }: GetStartedPageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : undefined
    const supabase = await createClient()
    const {
        data: { session }
    } = await supabase.auth.getSession()

    if (session) {
        redirect("/welcome")
    }

    const reasonParam = resolvedSearchParams?.reason
    const reason = Array.isArray(reasonParam) ? reasonParam[0] : reasonParam

    return (
        <main className="bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:py-16">
                {reason === "demo-expired" && (
                    <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                        <AlertDescription>
                            Your 30-minute demo session has ended. Start a free trial or launch a fresh demo below to continue exploring AI Blueprint.
                        </AlertDescription>
                    </Alert>
                )}

                <section className="grid gap-10 rounded-3xl border border-indigo-100 bg-white/90 p-8 shadow-sm backdrop-blur-sm lg:grid-cols-[1.1fr_1fr]">
                    <div className="space-y-6">
                        <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">AI Blueprint for Education Leaders</span>
                        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl lg:text-5xl">
                            Orchestrate responsible AI adoption across your institution
                        </h1>
                        <p className="text-lg text-slate-600">
                            Spin up a guided sandbox, invite your leadership team, and generate the strategic roadmap stakeholders expect. No credit card required for the trial experience.
                        </p>
                        <ul className="space-y-4">
                            {featureHighlights.map((item) => (
                                <li key={item.title} className="flex items-start gap-3">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">✓</span>
                                    <div>
                                        <p className="font-medium text-slate-900">{item.title}</p>
                                        <p className="text-sm text-slate-600">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/demo"
                                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 sm:w-auto"
                            >
                                Launch interactive demo
                            </Link>
                            <Link
                                href="/ai-readiness-demo"
                                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:w-auto"
                            >
                                Preview assessment experience
                            </Link>
                        </div>
                        <p className="text-xs text-slate-500">
                            By starting the demo or trial you acknowledge our <Link href="/terms" className="text-indigo-600 hover:underline">Terms</Link> and <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                        </p>
                    </div>
                    <div>
                        <GetStartedForm />
                    </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm">
                        <h2 className="text-2xl font-semibold text-slate-900">What happens when you start a trial?</h2>
                        <ol className="space-y-4 text-sm text-slate-700">
                            <li>
                                <span className="font-semibold text-slate-900">1. Guided onboarding.</span> Invite colleagues, align on priorities, and complete the NIST-aligned readiness snapshot in under 15 minutes.
                            </li>
                            <li>
                                <span className="font-semibold text-slate-900">2. Blueprint generation.</span> AI Blueprint maps quick wins, assigns ownership, and estimates impact across teaching, operations, and compliance.
                            </li>
                            <li>
                                <span className="font-semibold text-slate-900">3. Executive reporting.</span> Share progress dashboards, risk summaries, and budget guidance with cabinet leaders and board members.
                            </li>
                        </ol>
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 text-sm text-indigo-900">
                            <p className="font-semibold">Need investor or grant-ready materials?</p>
                            <p className="mt-1">We include ROI modeling, compliance artifacts, and fundraising narratives that mirror what our donorOS partners receive.</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <DemoLeadForm />
                        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm text-slate-600">
                            <p className="font-medium text-slate-900">Prefer a quick overview first?</p>
                            <p className="mt-1">
                                Explore the <Link href="/education-ai-blueprint-demo.html" className="text-indigo-600 hover:underline">interactive sandbox</Link> or email <a className="text-indigo-600 hover:underline" href="mailto:hello@educationaiblueprint.com">hello@educationaiblueprint.com</a> to coordinate with our team.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
