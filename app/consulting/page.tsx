import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    title: "AI Readiness Assessment for Education | Try Free Demo - AI Blueprint",
    description: "Discover your institution's AI readiness in minutes with our free demo. NIST-aligned assessments, implementation roadmaps, and expert consulting for K-12 and higher education.",
}

/**
 * Redirect /consulting to the static lead generation page
 * The HTML file is served from /public/lead-generation-page.html
 */
export default function ConsultingPage() {
    redirect("/lead-generation-page.html")
}
