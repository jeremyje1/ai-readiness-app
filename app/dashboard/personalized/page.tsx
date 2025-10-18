import { Metadata } from "next"
import { redirect } from "next/navigation"

import PersonalizedDashboardClient from "@/components/dashboard/personalized-dashboard-client"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Personalized Dashboard | AI Blueprint",
  description: "Your AI readiness insights, roadmap, and next actions"
}

export default async function PersonalizedDashboard() {
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/get-started")
  }

  const userId = session.user.id

  // Fetch all dashboard data in parallel on the server
  const [
    gapAnalysisResult,
    assessmentResult,
    roadmapsResult,
    documentsResult,
    blueprintsResult
  ] = await Promise.all([
    supabase
      .from("gap_analysis_results")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("streamlined_assessment_responses")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("implementation_roadmaps")
      .select("*")
      .eq("user_id", userId)
      .order("roadmap_type"),
    supabase
      .from("uploaded_documents")
      .select("*")
      .eq("user_id", userId)
      .order("upload_date", { ascending: false }),
    supabase
      .from("blueprints")
      .select(`
                id,
                title,
                status,
                maturity_level,
                generated_at,
                blueprint_progress (
                    overall_progress,
                    is_on_track
                )
            `)
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(3)
  ])

  const gapAnalysis = gapAnalysisResult.data
  const assessment = assessmentResult.data
  const roadmaps = roadmapsResult.data ?? []
  const documents = documentsResult.data ?? []
  const blueprints = blueprintsResult.data ?? []

  // Pass server data to client component
  return (
    <PersonalizedDashboardClient
      userId={userId}
      gapAnalysis={gapAnalysis}
      assessment={assessment}
      roadmaps={roadmaps}
      documents={documents}
      blueprints={blueprints}
    />
  )
}
