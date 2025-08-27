'use client'

import { UserInstitution } from '@/lib/hooks/useUserContext'
import { supabase } from '@/lib/supabase'
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

            // Create base slug from name
            const baseSlug = data.name.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()

            // Check for existing slugs and generate unique one if needed
            let slug = baseSlug
            let counter = 1

            while (true) {
                const { data: existing } = await supabase
                    .from('institutions')
                    .select('id')
                    .eq('slug', slug)
                    .limit(1)

                if (!existing || existing.length === 0) {
                    // Slug is unique, use it
                    break
                } else {
                    // Slug exists, try with counter
                    slug = `${baseSlug}-${counter}`
                    counter++
                }

                // Safety check to prevent infinite loop
                if (counter > 100) {
                    slug = `${baseSlug}-${Date.now()}`
                    break
                }
            }

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
                // Provide user-friendly error messages
                if (institutionError.message?.includes('institutions_slug_key')) {
                    throw new Error('An institution with this name already exists. Please try a different name.')
                } else if (institutionError.message?.includes('duplicate key')) {
                    throw new Error('This institution name is already in use. Please choose a different name.')
                } else {
                    throw new Error(`Failed to create institution: ${institutionError.message}`)
                }
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
                // Handle membership creation errors with user-friendly messages
                if (membershipError.message?.includes('duplicate key')) {
                    throw new Error('You already have access to this institution.')
                } else {
                    throw new Error(`Failed to grant institution access: ${membershipError.message}`)
                }
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
            console.error('Institution creation error:', err)
            let message = 'Failed to create institution'

            if (err instanceof Error) {
                if (err.message.includes('institutions_slug_key') || err.message.includes('duplicate key')) {
                    message = 'An institution with this name already exists. Please try a different name.'
                } else if (err.message.includes('unique constraint')) {
                    message = 'This institution information conflicts with existing data. Please verify your details.'
                } else {
                    message = err.message
                }
            }

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
