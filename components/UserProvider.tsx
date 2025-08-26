'use client'

import InstitutionSetupModal from '@/components/InstitutionSetupModal'
import { UserContextData, useUser } from '@/lib/hooks/useUserContext'
import { createContext, ReactNode, useContext, useState } from 'react'

const UserContext = createContext<UserContextData | undefined>(undefined)

export const useUserContext = () => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider')
    }
    return context
}

interface UserProviderProps {
    children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
    const userContextData = useUser()
    const [showInstitutionSetup, setShowInstitutionSetup] = useState(false)

    // Show institution setup if user is logged in but has no institution
    const shouldShowSetup = userContextData.user &&
        !userContextData.loading &&
        !userContextData.institution &&
        !showInstitutionSetup

    return (
        <UserContext.Provider value={userContextData}>
            {children}
            <InstitutionSetupModal
                isOpen={shouldShowSetup || showInstitutionSetup}
                onComplete={() => {
                    setShowInstitutionSetup(false)
                    // Trigger a refresh of user context
                    window.location.reload()
                }}
            />
        </UserContext.Provider>
    )
}

export default UserProvider
