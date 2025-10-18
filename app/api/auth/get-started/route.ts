import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { setAuthCookies } from "@/lib/auth-middleware"
import { authService } from "@/lib/auth-service"
import { rateLimitAsync } from "@/lib/rate-limit"
import { supabaseAdmin } from "@/lib/supabase-admin"

const signInSchema = z.object({
    mode: z.literal("signin"),
    email: z.string().email(),
    password: z.string().min(8)
})

const signUpSchema = z.object({
    mode: z.literal("signup"),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    name: z.string().min(1),
    organization: z.string().min(1),
    title: z.string().optional(),
    phone: z.string().optional(),
    institutionType: z.union([z.literal("K12"), z.literal("HigherEd")])
})

type SignInPayload = z.infer<typeof signInSchema>
type SignUpPayload = z.infer<typeof signUpSchema>

function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

function getClientIp(request: NextRequest) {
    const forwarded = request.headers.get("x-forwarded-for")
    if (!forwarded) return "unknown"
    return forwarded.split(",")[0]?.trim() || "unknown"
}

export async function POST(request: NextRequest) {
    const ip = getClientIp(request)
    const rl = await rateLimitAsync(`get-started|${ip}`, 8, 60_000)
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 })
    }

    let payload: SignInPayload | SignUpPayload

    try {
        const body = await request.json()
        if (body?.mode === "signin") {
            payload = signInSchema.parse(body)
        } else {
            payload = signUpSchema.parse(body)
            if (payload.password !== payload.confirmPassword) {
                return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
            }
        }
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (payload.mode === "signin") {
        const result = await authService.signInWithPassword(payload.email, payload.password)
        if (result.error || !result.data?.session) {
            return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 })
        }

        const response = NextResponse.json({ success: true, message: "Signed in" })
        return setAuthCookies(response, result.data.session)
    }

    const signupPayload = payload
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: signupPayload.email,
        password: signupPayload.password,
        email_confirm: true,
        user_metadata: {
            name: signupPayload.name,
            organization: signupPayload.organization,
            title: signupPayload.title || null,
            phone: signupPayload.phone || null,
            institution_type: signupPayload.institutionType,
            subscription_status: "trial",
            subscription_tier: "trial",
            trial_ends_at: trialEndsAt.toISOString()
        }
    })

    if (createError || !created?.user) {
        const message = createError?.message ?? "Unable to create account"
        const status = message.includes("already registered") ? 409 : 400
        return NextResponse.json({ error: message }, { status })
    }

    const userId = created.user.id
    const organizationName = signupPayload.organization || signupPayload.email.split("@")[0]
    const baseSlug = slugify(organizationName) || slugify(signupPayload.email.split("@")[0]) || "institution"
    const institutionSlug = `${baseSlug}-${randomUUID().slice(0, 6)}`

    let institutionId: string | null = null

    try {
        const { data: institution, error: institutionError } = await supabaseAdmin
            .from("institutions")
            .insert({
                name: organizationName,
                slug: institutionSlug,
                headcount: 0,
                budget: 0,
                org_type: signupPayload.institutionType
            })
            .select("id")
            .single()

        if (institutionError) {
            console.error("Failed to create institution", institutionError)
        } else {
            institutionId = institution?.id ?? null
        }
    } catch (error) {
        console.error("Institution creation error", error)
    }

    if (institutionId) {
        try {
            await supabaseAdmin
                .from("institution_memberships")
                .insert({
                    user_id: userId,
                    institution_id: institutionId,
                    role: "admin",
                    active: true
                })
        } catch (error) {
            console.error("Membership creation error", error)
        }
    }

    try {
        await supabaseAdmin
            .from("user_profiles")
            .upsert({
                user_id: userId,
                email: signupPayload.email,
                full_name: signupPayload.name,
                institution_id: institutionId,
                institution_name: organizationName,
                institution_type: signupPayload.institutionType,
                job_title: signupPayload.title || null,
                phone: signupPayload.phone || null,
                subscription_tier: "trial",
                subscription_status: "trial",
                trial_ends_at: trialEndsAt.toISOString(),
                onboarding_completed: false
            }, { onConflict: "user_id" })
    } catch (error) {
        console.error("Profile creation error", error)
    }

    const signInResult = await authService.signInWithPassword(signupPayload.email, signupPayload.password)
    if (signInResult.error || !signInResult.data?.session) {
        return NextResponse.json({ error: "Account created, but automatic sign in failed. Please try logging in." }, { status: 500 })
    }

    const response = NextResponse.json({ success: true, message: "Account created" })
    return setAuthCookies(response, signInResult.data.session)
}
