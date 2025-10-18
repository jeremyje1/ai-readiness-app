import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { ArrowRight, BarChart3, CheckCircle2, FileText, Sparkles } from "lucide-react"

export const metadata: Metadata = {
    title: "Welcome | AI Blueprint",
    description: "Complete onboarding to unlock your personalized AI readiness plan"
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

function safeDaysRemaining(trialEndsAt?: string | null) {
    if (!trialEndsAt) return null
    const remaining = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / MS_PER_DAY)
    return Number.isFinite(remaining) ? Math.max(remaining, 0) : null
}

export default async function WelcomePage() {
    const supabase = await createClient()
    const {
        data: { session }
    } = await supabase.auth.getSession()

    // No session - redirect to demo for new users
    if (!session) {
        redirect("/demo")
    }

    const userId = session.user.id

    const [profileResult, assessmentsResult, roadmapResult, documentsResult] = await Promise.all([
        supabase
            .from("user_profiles")
            .select("full_name, institution_name, trial_ends_at, onboarding_completed")
            .eq("user_id", userId)
            .maybeSingle(),
        supabase
            .from("streamlined_assessment_responses")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
        supabase
            .from("implementation_roadmaps")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
        supabase
            .from("uploaded_documents")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
    ])

    const profile = profileResult.data ?? null
    const daysRemaining = safeDaysRemaining(profile?.trial_ends_at)
    const assessmentsCompleted = (assessmentsResult.count ?? 0) > 0
    const roadmapsCreated = (roadmapResult.count ?? 0) > 0
    const documentsUploaded = (documentsResult.count ?? 0) > 0

    const steps = [
        {
            title: "Complete your AI readiness assessment",
            description: "Answer 18 streamlined prompts to capture governance, curriculum, and measurement maturity.",
            href: "/assessment",
            icon: <FileText className="h-5 w-5" />,
            completed: assessmentsCompleted
        },
        {
            title: "Review your personalized roadmap",
            description: "Turn assessment results into 30/60/90 day priorities aligned to NIST and Department of Education guidance.",
            href: "/dashboard/personalized",
            icon: <BarChart3 className="h-5 w-5" />,
            completed: roadmapsCreated
        },
        {
            title: "Upload your critical policies and plans",
            description: "Let the AI analyst highlight policy gaps, risk hotspots, and recommended updates for leadership review.",
            href: "/documents",
            icon: <Sparkles className="h-5 w-5" />,
            completed: documentsUploaded
        }
    ]

    const nextStep = steps.find((step) => !step.completed)
    const greetingName = profile?.full_name?.split(" ")[0] ?? session.user.email?.split("@")[0] ?? "there"

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
            <div className="mx-auto w-full max-w-5xl px-4 py-16">
                <header className="mb-10 space-y-3 text-center">
                    <p className="text-sm uppercase tracking-wide text-indigo-600">Welcome to AI Blueprint</p>
                    <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">Hi {greetingName}, let's launch your AI program</h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600">
                        Follow the guided onboarding below to capture your baseline, generate a roadmap, and activate AI governance across your institution.
                    </p>
                </header>

                <section className="mb-10 grid gap-6 rounded-2xl border border-indigo-100 bg-white/90 p-6 shadow-sm sm:grid-cols-2">
                    <div>
                        <p className="text-sm font-medium text-slate-600">Trial status</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">Active trial</p>
                        {daysRemaining !== null ? (
                            <p className="mt-1 text-sm text-slate-600">{daysRemaining} day{daysRemaining === 1 ? "" : "s"} remaining</p>
                        ) : (
                            <p className="mt-1 text-sm text-slate-600">We'll remind you before your trial ends.</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-600">Institution</p>
                        <p className="mt-2 text-base text-slate-900">{profile?.institution_name ?? "Your organization"}</p>
                        <p className="mt-1 text-sm text-slate-600">Invite colleagues from this organization once onboarding is complete.</p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900">Your onboarding checklist</h2>
                    <div className="space-y-3">
                        {steps.map((step) => (
                            <div
                                key={step.title}
                                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:border-indigo-200 hover:shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <span
                                        className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full border ${step.completed
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                            : "border-indigo-200 bg-indigo-50 text-indigo-600"
                                            }`}
                                    >
                                        {step.completed ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-base font-semibold text-slate-900">{step.title}</p>
                                        <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
                                    <span className={step.completed ? "text-emerald-600" : "text-indigo-600"}>
                                        {step.completed ? "Completed" : "Ready when you are"}
                                    </span>
                                    <Link
                                        href={step.href}
                                        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700"
                                    >
                                        {step.completed ? "Review" : "Start now"}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {nextStep && (
                    <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-50">
                        <h3 className="text-lg font-semibold">Next best action</h3>
                        <p className="mt-2 text-sm text-slate-200">Jump back in where you left off to keep momentum.</p>
                        <div className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-800/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-base font-medium">{nextStep.title}</p>
                                <p className="text-sm text-slate-300">{nextStep.description}</p>
                            </div>
                            <Link
                                href={nextStep.href}
                                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
                            >
                                Resume <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </section>
                )}

                <section className="mt-12 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Need a hand?</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        We're here to help with policy reviews, roadmap planning, and stakeholder workshops. Email
                        {" "}
                        <a href="mailto:hello@educationaiblueprint.com" className="text-indigo-600 hover:text-indigo-500">
                            hello@educationaiblueprint.com
                        </a>
                        {" "}or book a working session from your dashboard once onboarding is complete.
                    </p>
                </section>
            </div>
        </div>
    )
}
