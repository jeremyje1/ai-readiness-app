"use client"

import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState, useTransition } from "react"
import { z } from "zod"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const payloadSchema = z.object({
    mode: z.union([z.literal("signin"), z.literal("signup")]),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().optional(),
    name: z.string().optional(),
    organization: z.string().optional(),
    title: z.string().optional(),
    phone: z.string().optional(),
    institutionType: z.union([z.literal("K12"), z.literal("HigherEd")])
})

export function GetStartedForm() {
    const router = useRouter()
    const [mode, setMode] = useState<"signin" | "signup">("signup")
    const [institutionType, setInstitutionType] = useState<"K12" | "HigherEd">("K12")
    const [formState, setFormState] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        organization: "",
        title: "",
        phone: ""
    })
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const shouldShowProfileFields = mode === "signup"

    const buttonLabel = useMemo(() => {
        if (isPending) {
            return mode === "signup" ? "Creating account..." : "Signing in..."
        }
        return mode === "signup" ? "Start Trial" : "Sign In"
    }, [isPending, mode])

    const toggleMode = useCallback(() => {
        setMode((prev) => (prev === "signup" ? "signin" : "signup"))
        setError(null)
        setSuccessMessage(null)
    }, [])

    const updateField = useCallback((field: keyof typeof formState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }))
        setError(null)
    }, [])

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            setError(null)
            setSuccessMessage(null)

            const payload = {
                mode,
                email: formState.email.trim(),
                password: formState.password,
                confirmPassword: formState.confirmPassword,
                name: formState.name.trim(),
                organization: formState.organization.trim(),
                title: formState.title.trim(),
                phone: formState.phone.trim(),
                institutionType
            }

            const parsed = payloadSchema.safeParse(payload)
            if (!parsed.success) {
                setError("Please review the form and try again")
                return
            }

            if (mode === "signup" && payload.password !== payload.confirmPassword) {
                setError("Passwords do not match")
                return
            }

            startTransition(async () => {
                try {
                    const response = await fetch("/api/auth/get-started", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...parsed.data })
                    })

                    if (!response.ok) {
                        const body = await response.json().catch(() => ({ error: "Request failed" }))
                        setError(body.error ?? "Unable to complete the request")
                        return
                    }

                    const body = await response.json()
                    setSuccessMessage(body.message ?? "Success")

                    if (mode === "signup") {
                        router.push("/welcome")
                    } else {
                        router.push("/dashboard/personalized")
                    }
                } catch (err) {
                    console.error("Get started form error", err)
                    setError("Something went wrong. Please try again.")
                }
            })
        },
        [formState, institutionType, mode, router]
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white/80 border border-slate-200 rounded-xl px-4 py-3">
                <div className="text-sm text-slate-700">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        {mode === "signup" ? "Sign in" : "Start a free trial"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white/90 p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="space-y-1">
                    <Label className="text-sm font-medium text-slate-700">Institution Type</Label>
                    <RadioGroup
                        value={institutionType}
                        onValueChange={(value) => setInstitutionType(value as "K12" | "HigherEd")}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                        <label className={`flex items-center space-x-3 rounded-xl border p-4 transition-colors ${institutionType === "K12" ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}`}>
                            <RadioGroupItem value="K12" id="inst-k12" />
                            <div>
                                <p className="font-semibold text-slate-900">K-12 Education</p>
                                <p className="text-sm text-slate-600">District, school, or state agency</p>
                            </div>
                        </label>
                        <label className={`flex items-center space-x-3 rounded-xl border p-4 transition-colors ${institutionType === "HigherEd" ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}`}>
                            <RadioGroupItem value="HigherEd" id="inst-higher" />
                            <div>
                                <p className="font-semibold text-slate-900">Higher Education</p>
                                <p className="text-sm text-slate-600">University, college, or system</p>
                            </div>
                        </label>
                    </RadioGroup>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Label htmlFor="email">Work Email</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formState.email}
                            onChange={(event) => updateField("email", event.target.value)}
                        />
                    </div>

                    {shouldShowProfileFields && (
                        <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    autoComplete="name"
                                    required
                                    value={formState.name}
                                    onChange={(event) => updateField("name", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organization">Institution</Label>
                                <Input
                                    id="organization"
                                    autoComplete="organization"
                                    required
                                    value={formState.organization}
                                    onChange={(event) => updateField("organization", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Role / Title</Label>
                                <Input
                                    id="title"
                                    value={formState.title}
                                    onChange={(event) => updateField("title", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone (optional)</Label>
                                <Input
                                    id="phone"
                                    autoComplete="tel"
                                    value={formState.phone}
                                    onChange={(event) => updateField("phone", event.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete={mode === "signin" ? "current-password" : "new-password"}
                            required
                            value={formState.password}
                            onChange={(event) => updateField("password", event.target.value)}
                            minLength={8}
                        />
                    </div>

                    {mode === "signup" && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                value={formState.confirmPassword}
                                onChange={(event) => updateField("confirmPassword", event.target.value)}
                                minLength={8}
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {successMessage && (
                    <Alert>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                    {buttonLabel}
                </Button>
            </form>
        </div>
    )
}

export default GetStartedForm
