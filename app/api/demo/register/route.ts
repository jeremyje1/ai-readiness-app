import { NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

interface QuickAssessment {
    governance: number
    training: number
    funding: number
}

interface RegisterLeadRequest {
    firstName: string
    lastName: string
    email: string
    institutionName: string
    institutionType: string
    role: string
    phone?: string
    interestAreas?: string[]
    goals?: string
    quickAssessment?: QuickAssessment
    utm?: Record<string, string | undefined>
    referrer?: string
}

const REQUIRED_FIELDS: Array<keyof RegisterLeadRequest> = [
    "firstName",
    "lastName",
    "email",
    "institutionName",
    "institutionType",
    "role"
]

const INTEREST_LIBRARY: Record<string, { title: string; description: string }> = {
    policy: {
        title: "Launch AI Governance Toolkit",
        description: "Activate policy templates and monthly redlines so your board can approve an AI policy in the next 30 days."
    },
    funding: {
        title: "Unlock Grant Funding Pipeline",
        description: "Auto-generate evidence-based justifications mapped to ESSER, Title IV, and state-level AI modernization grants."
    },
    training: {
        title: "Stand Up PD & Certification",
        description: "Deploy role-specific professional learning pathways aligned to your AI adoption stages."
    },
    compliance: {
        title: "Tighten Privacy & Compliance",
        description: "Enable live vendor monitoring with FERPA/COPPA guardrails and breach-ready documentation."
    },
    analytics: {
        title: "Brief Leadership with ROI Dashboards",
        description: "Surface executive-level metrics that summarize readiness, adoption velocity, and funding impact in real time."
    }
}

function calculateOverallScore(assessment?: QuickAssessment) {
    if (!assessment) return { overallScore: null, readinessLevel: null }
    const values = [assessment.governance, assessment.training, assessment.funding].filter(Boolean)
    if (values.length === 0) return { overallScore: null, readinessLevel: null }

    const average = values.reduce((sum, value) => sum + value, 0) / values.length
    const overallScore = Math.round(average * 20) // scale 1-5 to 0-100

    let readinessLevel: string
    if (overallScore >= 80) {
        readinessLevel = "Maturing"
    } else if (overallScore >= 60) {
        readinessLevel = "Developing"
    } else {
        readinessLevel = "Emerging"
    }

    return { overallScore, readinessLevel }
}

function deriveLeadQualification(averageScore: number | null, interestAreas: string[]) {
    if (averageScore === null) {
        return interestAreas.length >= 3 ? "WARM" : "COLD"
    }

    if (averageScore >= 4.2 || interestAreas.includes("funding")) {
        return "HOT"
    }

    if (averageScore >= 3.2) {
        return "WARM"
    }

    return "COLD"
}

function buildAssessmentResponses(quickAssessment?: QuickAssessment | null) {
    if (!quickAssessment) return null

    const normalize = (value: number | undefined) => {
        if (typeof value !== "number" || Number.isNaN(value)) return 2
        const clamped = Math.max(1, Math.min(5, Math.round(value)))
        return clamped - 1
    }

    const governance = normalize(quickAssessment.governance)
    const training = normalize(quickAssessment.training)
    const funding = normalize(quickAssessment.funding)

    return {
        1: governance,
        2: governance,
        3: governance,
        4: governance,
        5: training,
        6: training,
        7: funding,
        8: funding,
        9: governance,
        10: governance,
        11: training,
        12: funding
    }
}

async function triggerAssessmentSubmit(
    request: Request,
    leadId: string,
    quickAssessment?: QuickAssessment | null
) {
    console.log('🎯 triggerAssessmentSubmit called', { leadId, hasQuickAssessment: !!quickAssessment })

    const responses = buildAssessmentResponses(quickAssessment)
    if (!responses) {
        console.log('⚠️  No responses built from quick assessment - email will not be sent')
        return
    }

    try {
        const submitUrl = new URL("/api/demo/assessment/submit", request.url)
        console.log('📧 Calling assessment submit endpoint:', submitUrl.toString())
        console.log('📋 Payload:', { leadId, responses, isDemoQuickAssessment: true })

        const response = await fetch(submitUrl.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                leadId,
                responses,
                isDemoQuickAssessment: true,
                quickAssessment
            })
        })

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "")
            console.error("❌ Failed to trigger assessment submit", {
                status: response.status,
                statusText: response.statusText,
                errorBody
            })
        } else {
            const successBody = await response.json().catch(() => null)
            console.log('✅ Assessment submit succeeded', successBody)
        }
    } catch (error) {
        console.error("💥 Error triggering assessment submit", error)
    }
}

export async function POST(request: Request) {
    try {
        const payload: RegisterLeadRequest = await request.json()
        const missingFields = REQUIRED_FIELDS.filter((field) => {
            const value = payload[field]
            if (typeof value === "string") {
                return value.trim().length === 0
            }
            return value === undefined || value === null
        })

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields",
                    missingFields
                },
                { status: 400 }
            )
        }

        const email = payload.email.trim().toLowerCase()
        const interestAreas = Array.isArray(payload.interestAreas) ? payload.interestAreas : []
        const quickAssessment = payload.quickAssessment
        const averageScore = quickAssessment
            ? (quickAssessment.governance + quickAssessment.training + quickAssessment.funding) / 3
            : null
        const { overallScore, readinessLevel } = calculateOverallScore(quickAssessment)
        const leadQualification = deriveLeadQualification(averageScore, interestAreas)

        const categoryScores = quickAssessment
            ? {
                governance: Math.round(quickAssessment.governance * 20),
                training: Math.round(quickAssessment.training * 20),
                funding: Math.round(quickAssessment.funding * 20)
            }
            : null

        const quickWins = interestAreas
            .map((interest) => INTEREST_LIBRARY[interest])
            .filter(Boolean)

        const responses = {
            quickAssessment,
            interestAreas,
            goals: payload.goals ?? null
        }

        const baseLeadPayload = {
            first_name: payload.firstName.trim(),
            last_name: payload.lastName.trim(),
            email,
            institution_name: payload.institutionName.trim(),
            institution_type: payload.institutionType.trim(),
            role: payload.role.trim(),
            phone: payload.phone?.trim() || null,
            notes: payload.goals?.trim() || null,
            responses,
            quick_wins: quickWins.length > 0 ? quickWins : null,
            category_scores: categoryScores,
            overall_score: overallScore,
            readiness_level: readinessLevel,
            lead_qualification: leadQualification,
            utm_source: payload.utm?.utm_source ?? null,
            utm_medium: payload.utm?.utm_medium ?? null,
            utm_campaign: payload.utm?.utm_campaign ?? null,
            utm_term: payload.utm?.utm_term ?? null,
            utm_content: payload.utm?.utm_content ?? null,
            referrer: payload.referrer || null
        }

        let leadId: string | null = null

        const { data: existingLead, error: readError } = await supabaseAdmin
            .from("demo_leads")
            .select("id, completed_at")
            .eq("email", email)
            .maybeSingle()

        if (readError) {
            console.warn("Unable to read existing demo lead", readError)
        }

        if (existingLead?.id) {
            const { data: updatedLead, error: updateError } = await supabaseAdmin
                .from("demo_leads")
                .update({
                    ...baseLeadPayload,
                    updated_at: new Date().toISOString()
                })
                .eq("id", existingLead.id)
                .select("id")
                .maybeSingle()

            if (updateError) {
                console.error("Failed to update existing demo lead", updateError)
                return NextResponse.json(
                    {
                        success: false,
                        error: "Failed to refresh lead information"
                    },
                    { status: 500 }
                )
            }

            leadId = updatedLead?.id ?? existingLead.id
        } else {
            const { data: insertedLead, error: insertError } = await supabaseAdmin
                .from("demo_leads")
                .insert({
                    ...baseLeadPayload,
                    started_at: new Date().toISOString()
                })
                .select("id")
                .maybeSingle()

            if (insertError) {
                console.error("Failed to create demo lead", insertError)
                return NextResponse.json(
                    {
                        success: false,
                        error: "Failed to capture lead information"
                    },
                    { status: 500 }
                )
            }

            leadId = insertedLead?.id ?? null
        }

        if (!leadId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unable to capture demo lead"
                },
                { status: 500 }
            )
        }

        await triggerAssessmentSubmit(request, leadId, quickAssessment)

        const response = NextResponse.json({
            success: true,
            leadId,
            readinessLevel,
            overallScore,
            leadQualification
        })

        response.cookies.set("demo-lead-id", leadId, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
            path: "/"
        })

        return response
    } catch (error) {
        console.error("Demo lead registration error", error)
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error"
            },
            { status: 500 }
        )
    }
}
