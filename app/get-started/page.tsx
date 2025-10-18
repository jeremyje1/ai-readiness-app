import { Metadata } from "next"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
    title: "Get Started | AI Blueprint",
    description: "Try our interactive demo to explore the AI Blueprint platform"
}

export default async function GetStartedPage() {
    const supabase = await createClient()
    const {
        data: { session }
    } = await supabase.auth.getSession()

    // If user has a session, send to dashboard
    if (session) {
        redirect("/dashboard/personalized")
    }

    // Otherwise, redirect to demo
    redirect("/demo")
}
