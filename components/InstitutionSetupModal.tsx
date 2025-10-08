'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserContext } from '@/components/UserProvider'
import useInstitutionSetup, { InstitutionSetupData } from '@/lib/hooks/useInstitutionSetup'
import { Building, GraduationCap, Users } from 'lucide-react'
import { useState } from 'react'

interface InstitutionSetupModalProps {
    isOpen: boolean
    onComplete: () => void
}

export default function InstitutionSetupModal({ isOpen, onComplete }: InstitutionSetupModalProps) {
    const { user } = useUserContext()
    const { createInstitution, loading, error } = useInstitutionSetup()
    const [formData, setFormData] = useState<InstitutionSetupData>({
        name: '',
        org_type: 'K12'
    })

    if (!isOpen || !user) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            return
        }

        const institution = await createInstitution(formData, user.id)
        if (institution) {
            onComplete()
        }
    }

    const orgTypes = [
        {
            value: 'K12' as const,
            label: 'K-12 School District',
            icon: GraduationCap,
            description: 'Elementary, middle, or high schools'
        },
        {
            value: 'higher_ed' as const,
            label: 'Higher Education',
            icon: Building,
            description: 'Colleges, universities, community colleges'
        },
        {
            value: 'other' as const,
            label: 'Other Educational',
            icon: Users,
            description: 'Training centers, educational nonprofits'
        }
    ]

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-6 w-6" />
                        Welcome! Tell us about your institution
                    </CardTitle>
                    <p className="text-muted-foreground">
                        We’ll personalize your AI readiness experience based on your institution’s context
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Institution Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Central Valley School District"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Institution Type *</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {orgTypes.map((type) => {
                                    const Icon = type.icon
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, org_type: type.value }))}
                                            className={`p-4 border rounded-lg text-left transition-colors ${formData.org_type === type.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <Icon className="h-6 w-6 mb-2 text-blue-600" />
                                            <div className="font-medium">{type.label}</div>
                                            <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Student/Participant Count (optional)</label>
                                <input
                                    type="number"
                                    value={formData.headcount || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        headcount: e.target.value ? parseInt(e.target.value) : undefined
                                    }))}
                                    placeholder="e.g., 2500"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Annual Budget (optional)</label>
                                <input
                                    type="number"
                                    value={formData.budget || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        budget: e.target.value ? parseInt(e.target.value) : undefined
                                    }))}
                                    placeholder="e.g., 15000000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                type="submit"
                                disabled={loading || !formData.name.trim()}
                                className="min-w-32"
                            >
                                {loading ? 'Creating...' : 'Continue'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
