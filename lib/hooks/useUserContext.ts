'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

export interface UserInstitution {
    id: string
    name: string
    slug: string
    headcount?: number
    budget?: number
    org_type?: string
    role: string // user's role in the institution
}

export interface UserContextData {
    user: User | null
    institution: UserInstitution | null
    loading: boolean
    error: string | null
}

const UserContext = createContext<UserContextData>({
    user: null,
    institution: null,
    loading: true,
    error: null
})

export const useUserContext = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider')
    }
    return context
}

export const fetchUserInstitution = async (userId: string): Promise<UserInstitution | null> => {
    try {
        const supabase = createClient()

        // First, get the user's institution membership
        const { data: membership, error: membershipError } = await supabase
            .from('institution_memberships')
            .select(`
        role,
        institutions (
          id,
          name,
          slug,
          headcount,
          budget,
          org_type
        )
      `)
            .eq('user_id', userId)
            .eq('active', true)
            .maybeSingle() // Use maybeSingle to avoid 406 errors

        if (membershipError || !membership) {
            console.log('ℹ️ No institution membership found for user (this is OK for new users):', userId)
            return null
        }

        const institution = membership.institutions as any
        return {
            id: institution.id,
            name: institution.name,
            slug: institution.slug,
            headcount: institution.headcount,
            budget: institution.budget,
            org_type: institution.org_type,
            role: membership.role
        }
    } catch (error) {
        console.error('Error fetching user institution:', error)
        return null
    }
}

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null)
    const [institution, setInstitution] = useState<UserInstitution | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const supabase = createClient()

        const loadUserData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Get current session
                const { data: { session } } = await supabase.auth.getSession()
                const currentUser = session?.user || null

                setUser(currentUser)

                if (currentUser) {
                    // Fetch institution data
                    const institutionData = await fetchUserInstitution(currentUser.id)
                    setInstitution(institutionData)
                } else {
                    setInstitution(null)
                }
            } catch (err) {
                console.error('Error loading user data:', err)
                setError(err instanceof Error ? err.message : 'Failed to load user data')
            } finally {
                setLoading(false)
            }
        }

        loadUserData()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            const currentUser = session?.user || null
            setUser(currentUser)

            if (currentUser) {
                const institutionData = await fetchUserInstitution(currentUser.id)
                setInstitution(institutionData)
            } else {
                setInstitution(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    return { user, institution, loading, error }
}

export default UserContext
