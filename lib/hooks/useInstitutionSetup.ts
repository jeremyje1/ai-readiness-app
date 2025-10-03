'use client'

import { UserInstitution } from '@/lib/hooks/useUserContext'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export interface InstitutionSetupData {
    name: string
    org_type: 'K12' | 'higher_ed' | 'other'
    headcount?: number
    budget?: number
}

export const useInstitutionSetup = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createInstitution = async (data: InstitutionSetupData, userId: string): Promise<UserInstitution | null> => {
        try {
            setLoading(true)
            setError(null)

            const supabase = createClient()

            // Create slug from name
            const slug = data.name.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()

            // Insert institution
            const { data: institution, error: institutionError } = await supabase
                .from('institutions')
                .insert({
                    name: data.name,
                    slug: slug,
                    org_type: data.org_type,
                    headcount: data.headcount,
                    budget: data.budget,
                    owner_user_id: userId
                })
                .select()
                .single()

            if (institutionError) {
                throw new Error(institutionError.message)
            }

            // Create membership for the user
            const { error: membershipError } = await supabase
                .from('institution_memberships')
                .insert({
                    institution_id: institution.id,
                    user_id: userId,
                    role: 'admin'
                })

            if (membershipError) {
                throw new Error(membershipError.message)
            }

            return {
                id: institution.id,
                name: institution.name,
                slug: institution.slug,
                headcount: institution.headcount,
                budget: institution.budget,
                org_type: institution.org_type,
                role: 'admin'
            }

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create institution'
            setError(message)
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        createInstitution,
        loading,
        error
    }
}

export default useInstitutionSetup
