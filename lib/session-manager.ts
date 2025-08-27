import { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface SessionState {
    session: Session | null
    user: User | null
    loading: boolean
    error: string | null
}

export interface SessionManager {
    getSessionState: () => Promise<SessionState>
    validateSession: () => Promise<boolean>
    refreshSession: () => Promise<boolean>
    clearSession: () => Promise<void>
    onSessionChange: (callback: (state: SessionState) => void) => () => void
}

class ClientSessionManager implements SessionManager {
    private state: SessionState = {
        session: null,
        user: null,
        loading: true,
        error: null
    }

    private listeners: Set<(state: SessionState) => void> = new Set()
    private refreshPromise: Promise<boolean> | null = null

    constructor() {
        this.initializeSession()
        this.setupAuthListener()
    }

    private async initializeSession() {
        try {
            console.log('🔐 SessionManager: initializing...')
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.error('🔐 SessionManager: initialization error:', error.message)
                this.updateState({
                    session: null,
                    user: null,
                    loading: false,
                    error: error.message
                })
                return
            }

            const isValid = data.session ? await this.validateSessionInternal(data.session) : true

            this.updateState({
                session: isValid ? data.session : null,
                user: isValid && data.session ? data.session.user : null,
                loading: false,
                error: isValid ? null : 'Session validation failed'
            })

            console.log('🔐 SessionManager: initialized', {
                hasSession: !!data.session,
                userId: data.session?.user?.id,
                isValid
            })

        } catch (error: any) {
            console.error('🔐 SessionManager: initialization failed:', error)
            this.updateState({
                session: null,
                user: null,
                loading: false,
                error: error.message || 'Session initialization failed'
            })
        }
    }

    private setupAuthListener() {
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔐 SessionManager: auth state change:', event, {
                hasSession: !!session,
                userId: session?.user?.id
            })

            switch (event) {
                case 'INITIAL_SESSION':
                    // Handle initial session - only update if we have a valid authenticated session
                    if (session && session.user && session.access_token) {
                        const isValid = await this.validateSessionInternal(session)
                        this.updateState({
                            session: isValid ? session : null,
                            user: isValid && session ? session.user : null,
                            loading: false,
                            error: isValid ? null : 'Initial session validation failed'
                        })
                    } else {
                        // No valid session on initial load
                        this.updateState({
                            session: null,
                            user: null,
                            loading: false,
                            error: null
                        })
                    }
                    break

                case 'SIGNED_IN':
                case 'TOKEN_REFRESHED':
                    const isValid = session ? await this.validateSessionInternal(session) : false
                    this.updateState({
                        session: isValid ? session : null,
                        user: isValid && session ? session.user : null,
                        loading: false,
                        error: isValid ? null : 'Session validation failed after sign in'
                    })
                    break

                case 'SIGNED_OUT':
                    this.updateState({
                        session: null,
                        user: null,
                        loading: false,
                        error: null
                    })
                    // Clear any persisted data
                    this.clearPersistedData()
                    break

                case 'PASSWORD_RECOVERY':
                    console.log('🔐 SessionManager: password recovery detected')
                    // Session should be available for password update
                    this.updateState({
                        session,
                        user: session?.user || null,
                        loading: false,
                        error: null
                    })
                    break

                default:
                    console.log('🔐 SessionManager: unhandled auth event:', event)
            }
        })
    }

    private updateState(newState: Partial<SessionState>) {
        this.state = { ...this.state, ...newState }
        this.notifyListeners()
    }

    private notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.state)
            } catch (error) {
                console.error('🔐 SessionManager: listener error:', error)
            }
        })
    }

    private async validateSessionInternal(session: Session): Promise<boolean> {
        try {
            // Check if token is expired
            const now = Math.floor(Date.now() / 1000)
            if (session.expires_at && session.expires_at < now) {
                console.warn('🔐 SessionManager: session token expired')
                return false
            }

            // For fresh sessions (like after password setup), be more lenient
            // Check if this is a very recent session (within last 30 seconds)
            const sessionAge = now - (session.expires_at ? session.expires_at - 3600 : now) // assuming 1 hour token
            const isRecentSession = sessionAge < 30

            // Verify token with a lightweight API call, but handle 403 gracefully for new sessions
            try {
                const { error } = await supabase.auth.getUser(session.access_token)
                if (error) {
                    // If this is a recent session and we get 403, it might just need a moment
                    if (isRecentSession && (error.status === 403 || error.message?.includes('403'))) {
                        console.log('🔐 SessionManager: new session validation delayed, accepting for now')
                        return true
                    }
                    console.warn('🔐 SessionManager: session validation failed:', error.message)
                    return false
                }
                return true
            } catch (apiError) {
                // If API call fails but we have valid session tokens, accept it for recent sessions
                if (isRecentSession && session.access_token && session.refresh_token) {
                    console.log('🔐 SessionManager: API validation failed for recent session, but tokens present')
                    return true
                }
                throw apiError
            }

        } catch (error) {
            console.error('🔐 SessionManager: validation error:', error)
            return false
        }
    }

    private clearPersistedData() {
        try {
            // Clear any auth-related localStorage items
            const keysToRemove = [
                'auth_fallback_count',
                'supabase.auth.token',
                'sb-' // Supabase storage prefix
            ]

            for (const key of keysToRemove) {
                if (key.endsWith('-')) {
                    // Remove keys with prefix
                    for (let i = localStorage.length - 1; i >= 0; i--) {
                        const storageKey = localStorage.key(i)
                        if (storageKey?.startsWith(key)) {
                            localStorage.removeItem(storageKey)
                        }
                    }
                } else {
                    localStorage.removeItem(key)
                }
            }
        } catch (error) {
            console.warn('🔐 SessionManager: failed to clear persisted data:', error)
        }
    }

    async getSessionState(): Promise<SessionState> {
        if (this.state.loading) {
            // Wait for initialization to complete
            await new Promise(resolve => {
                const unsubscribe = this.onSessionChange(state => {
                    if (!state.loading) {
                        unsubscribe()
                        resolve(void 0)
                    }
                })
            })
        }

        return this.state
    }

    async validateSession(): Promise<boolean> {
        if (!this.state.session) {
            return false
        }

        return await this.validateSessionInternal(this.state.session)
    }

    async refreshSession(): Promise<boolean> {
        // Prevent multiple concurrent refresh attempts
        if (this.refreshPromise) {
            return await this.refreshPromise
        }

        this.refreshPromise = this.performRefresh()

        try {
            return await this.refreshPromise
        } finally {
            this.refreshPromise = null
        }
    }

    private async performRefresh(): Promise<boolean> {
        try {
            console.log('🔐 SessionManager: refreshing session...')
            this.updateState({ loading: true, error: null })

            const { data, error } = await supabase.auth.refreshSession()

            if (error || !data.session) {
                console.error('🔐 SessionManager: refresh failed:', error?.message)
                this.updateState({
                    session: null,
                    user: null,
                    loading: false,
                    error: error?.message || 'Session refresh failed'
                })
                return false
            }

            const isValid = await this.validateSessionInternal(data.session)

            this.updateState({
                session: isValid ? data.session : null,
                user: isValid ? data.session.user : null,
                loading: false,
                error: isValid ? null : 'Refreshed session validation failed'
            })

            console.log('🔐 SessionManager: refresh successful')
            return isValid

        } catch (error: any) {
            console.error('🔐 SessionManager: refresh error:', error)
            this.updateState({
                session: null,
                user: null,
                loading: false,
                error: error.message || 'Session refresh failed'
            })
            return false
        }
    }

    async clearSession(): Promise<void> {
        try {
            console.log('🔐 SessionManager: clearing session...')
            await supabase.auth.signOut()
            // State will be updated by the auth listener
        } catch (error) {
            console.error('🔐 SessionManager: clear session error:', error)
            // Force state update even if signOut fails
            this.updateState({
                session: null,
                user: null,
                loading: false,
                error: null
            })
        }
    }

    onSessionChange(callback: (state: SessionState) => void): () => void {
        this.listeners.add(callback)

        // Immediately call with current state
        callback(this.state)

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback)
        }
    }
}

// Export singleton instance
export const sessionManager = new ClientSessionManager()

// Hook for React components  
import React from 'react'

export function useSession() {
    const [state, setState] = React.useState<SessionState>({
        session: null,
        user: null,
        loading: true,
        error: null
    })

    React.useEffect(() => {
        return sessionManager.onSessionChange(setState)
    }, [])

    const refresh = React.useCallback(() => {
        return sessionManager.refreshSession()
    }, [])

    const signOut = React.useCallback(() => {
        return sessionManager.clearSession()
    }, [])

    return {
        ...state,
        refresh,
        signOut,
        isAuthenticated: !!state.session && !state.error
    }
}

// Export singleton instance as default
export { sessionManager as default }
