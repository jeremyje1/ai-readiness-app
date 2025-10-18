"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { z } from "zod"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const leadSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    institutionName: z.string().min(1),
    institutionType: z.string().min(1),
    role: z.string().min(1)
})

const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
    { value: "Superintendent/President/Chancellor", label: "Superintendent / President / Chancellor" },
    { value: "Provost/Chief Academic Officer", label: "Provost / Chief Academic Officer" },
    { value: "CIO/CTO/Technology Director", label: "CIO / CTO / Technology Director" },
    { value: "Dean/Department Chair", label: "Dean / Department Chair" },
    { value: "Instructional Designer", label: "Instructional Designer" },
    { value: "Innovation Lead", label: "Innovation Lead / Strategic Initiatives" },
    { value: "Other", label: "Other" }
]

const INSTITUTION_TYPES: Array<{ value: string; label: string }> = [
    { value: "K-12 District", label: "K-12 District" },
    { value: "Higher Education", label: "Higher Education" },
    { value: "Charter/Private", label: "Charter or Private Institution" },
    { value: "State Agency", label: "State Agency" }
]

type LeadFormState = z.infer<typeof leadSchema>

const DEFAULT_STATE: LeadFormState = {
    firstName: "",
    lastName: "",
    email: "",
    institutionName: "",
    institutionType: INSTITUTION_TYPES[0]?.value ?? "K-12 District",
    role: ROLE_OPTIONS[0]?.value ?? "Superintendent/President/Chancellor"
}

export function DemoLeadForm() {
    const [formState, setFormState] = useState<LeadFormState>(DEFAULT_STATE)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [leadId, setLeadId] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window === "undefined") return

        try {
            const stored = window.localStorage.getItem("demo-lead-form")
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<LeadFormState>
                setFormState((prev) => ({ ...prev, ...parsed }))
            }

            const existingLeadId = window.localStorage.getItem("demo-lead-id") || null
            if (existingLeadId) {
                setLeadId(existingLeadId)
                setSuccessMessage("You're already on our demo waitlist. Feel free to launch the interactive experience below.")
            }
        } catch (err) {
            console.warn("Unable to restore demo lead form state", err)
        }
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return
        window.localStorage.setItem("demo-lead-form", JSON.stringify(formState))
    }, [formState])

    const handleInputChange = useCallback((field: keyof LeadFormState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }))
        setError(null)
        setSuccessMessage(null)
    }, [])

    const canSubmit = useMemo(() => {
        const parsed = leadSchema.safeParse(formState)
        return parsed.success && !isSubmitting
    }, [formState, isSubmitting])

    const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        setSuccessMessage(null)

        const parsed = leadSchema.safeParse(formState)
        if (!parsed.success) {
            setError("Please complete all required fields before submitting.")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch("/api/demo/leads/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed.data)
            })

            const body = await response.json().catch(() => ({ success: false }))

            if (!response.ok || !body?.success) {
                const message = body?.error ?? "We couldn't capture your interest right now. Please try again."
                setError(message)
                return
            }

            if (typeof window !== "undefined") {
                const id = body.leadId as string | undefined
                if (id) {
                    window.localStorage.setItem("demo-lead-id", id)
                    document.cookie = `demo-lead-id=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
                    setLeadId(id)
                }
            }

            setSuccessMessage(body.message ?? "Thanks! We'll follow up with a tailored walkthrough.")
        } catch (err) {
            console.error("Demo lead submission failed", err)
            setError("Something went wrong while saving your information. Please try again in a moment.")
        } finally {
            setIsSubmitting(false)
        }
    }, [formState])

    return (
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="mb-6 space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Talk with our team</h3>
                <p className="text-sm text-slate-600">
                    Share your details and we&apos;ll schedule a working session tailored to your institution&apos;s AI goals.
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="demo-first-name">First Name</Label>
                        <Input
                            id="demo-first-name"
                            autoComplete="given-name"
                            value={formState.firstName}
                            onChange={(event) => handleInputChange("firstName", event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="demo-last-name">Last Name</Label>
                        <Input
                            id="demo-last-name"
                            autoComplete="family-name"
                            value={formState.lastName}
                            onChange={(event) => handleInputChange("lastName", event.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="demo-email">Work Email</Label>
                    <Input
                        id="demo-email"
                        type="email"
                        autoComplete="email"
                        value={formState.email}
                        onChange={(event) => handleInputChange("email", event.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="demo-institution">Institution</Label>
                    <Input
                        id="demo-institution"
                        value={formState.institutionName}
                        onChange={(event) => handleInputChange("institutionName", event.target.value)}
                        required
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Institution Type</Label>
                        <Select
                            value={formState.institutionType}
                            onValueChange={(value) => handleInputChange("institutionType", value)}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select institution type" />
                            </SelectTrigger>
                            <SelectContent>
                                {INSTITUTION_TYPES.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                            value={formState.role}
                            onValueChange={(value) => handleInputChange("role", value)}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {successMessage && (
                    <Alert>
                        <AlertDescription>
                            {successMessage}
                            {leadId ? ` (Lead ID: ${leadId})` : null}
                        </AlertDescription>
                    </Alert>
                )}

                <Button type="submit" className="w-full" disabled={!canSubmit}>
                    {isSubmitting ? "Saving..." : "Schedule a Strategy Call"}
                </Button>
            </form>
        </div>
    )
}

export default DemoLeadForm
