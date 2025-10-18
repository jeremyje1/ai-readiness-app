import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { env } from "@/lib/env"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const DEMO_EMAIL = process.env.DEMO_EMAIL?.trim() || "demo@educationaiblueprint.com"
const DEMO_PASSWORD = process.env.DEMO_PASSWORD?.trim() || "demo123456789"
const DEMO_INSTITUTION_NAME = "Demo Education District"
const DEMO_INSTITUTION_SLUG = "ai-blueprint-demo-district"

async function ensureDemoProfile(userId: string) {
    let institutionId: string | null = null

    try {
        const { data: existingInstitution, error: institutionSelectError } = await supabaseAdmin
            .from("institutions")
            .select("id")
            .eq("slug", DEMO_INSTITUTION_SLUG)
            .maybeSingle()

        if (institutionSelectError) {
            console.warn("Failed to read demo institution", institutionSelectError)
        }

        if (existingInstitution?.id) {
            institutionId = existingInstitution.id
        } else {
            const { data: createdInstitution, error: institutionInsertError } = await supabaseAdmin
                .from("institutions")
                .upsert(
                    {
                        name: DEMO_INSTITUTION_NAME,
                        slug: DEMO_INSTITUTION_SLUG,
                        headcount: 2500,
                        budget: 12000000,
                        org_type: "K12"
                    },
                    { onConflict: "slug" }
                )
                .select("id")
                .single()

            if (institutionInsertError) {
                console.warn("Failed to upsert demo institution", institutionInsertError)
            } else {
                institutionId = createdInstitution?.id ?? null
            }
        }
    } catch (error) {
        console.warn("Unexpected institution setup error", error)
    }

    if (institutionId) {
        try {
            await supabaseAdmin
                .from("institution_memberships")
                .upsert(
                    {
                        user_id: userId,
                        institution_id: institutionId,
                        role: "admin",
                        active: true
                    },
                    { onConflict: "user_id,institution_id" }
                )
        } catch (error) {
            console.warn("Failed to ensure demo membership", error)
        }
    }

    try {
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await supabaseAdmin
            .from("user_profiles")
            .upsert(
                {
                    user_id: userId,
                    email: DEMO_EMAIL,
                    full_name: "Demo User",
                    institution_id: institutionId,
                    institution_name: DEMO_INSTITUTION_NAME,
                    institution_type: "K12",
                    job_title: "Superintendent",
                    subscription_tier: "demo",
                    subscription_status: "demo",
                    trial_ends_at: trialEndsAt,
                    onboarding_completed: true
                },
                { onConflict: "user_id" }
            )
    } catch (error) {
        console.warn("Failed to upsert demo profile", error)
    }
}

export async function POST() {
    try {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options })
                    }
                }
            }
        )

        let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD
        })

        let session = signInData?.session ?? null
        let userId = signInData?.user?.id ?? null

        if (signInError || !session || !userId) {
            const { error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: DEMO_EMAIL,
                password: DEMO_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    name: "Demo User",
                    institution: DEMO_INSTITUTION_NAME,
                    subscription_tier: "demo"
                }
            })

            if (createError && !createError.message?.toLowerCase().includes("already registered")) {
                console.error("Demo user creation failed", createError.message)
                return NextResponse.json(
                    {
                        success: false,
                        error: "Unable to prepare demo environment. Please contact support."
                    },
                    { status: 500 }
                )
            }

            const retry = await supabase.auth.signInWithPassword({
                email: DEMO_EMAIL,
                password: DEMO_PASSWORD
            })

            signInData = retry.data
            session = retry.data?.session ?? null
            userId = retry.data?.user?.id ?? userId

            if (retry.error || !session || !userId) {
                console.error("Demo sign in failed after creation", retry.error?.message)
                return NextResponse.json(
                    {
                        success: false,
                        error: "Demo login failed. Please try again shortly."
                    },
                    { status: 500 }
                )
            }
        }

        await ensureDemoProfile(userId)

        const expiryTime = Date.now() + 30 * 60 * 1000

        const response = NextResponse.json({
            success: true,
            userId,
            redirectUrl: "/dashboard/personalized?demo=true&tour=start"
        })

        response.cookies.set("demo-mode", "true", {
            httpOnly: false,
            secure: env.NODE_ENV === "production",
            maxAge: 30 * 60,
            path: "/",
            sameSite: "lax"
        })

        response.cookies.set("demo-expiry", expiryTime.toString(), {
            httpOnly: false,
            secure: env.NODE_ENV === "production",
            maxAge: 30 * 60,
            path: "/",
            sameSite: "lax"
        })

        return response
    } catch (error) {
        console.error("Demo login error", error)
        return NextResponse.json(
            { error: "Internal server error during demo login" },
            { status: 500 }
        )
    }
}
