/**
 * Enhanced Supabase Client with Auth Service Integration
 * Drop-in replacement for the standard Supabase client with automatic fallback
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js'
import { AuthService, authService } from './auth-service'

// Re-export the existing supabase configuration
export { supabaseAdmin } from './supabase'

// Enhanced Supabase client that uses our auth service
class EnhancedSupabaseClient {
  private authService: AuthService
  private client: ReturnType<typeof createClient>

  constructor() {
    this.authService = authService
    this.client = authService.getClient() as ReturnType<typeof createClient>
  }

  // Proxy most operations to the underlying client
  get from() {
    return this.client.from.bind(this.client)
  }

  get storage() {
    return this.client.storage
  }

  get functions() {
    return this.client.functions
  }

  get realtime() {
    return this.client.realtime
  }

  // Override auth with our enhanced auth service
  get auth() {
    const service = this.authService

    return {
      // Enhanced sign in with automatic fallback
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const result = await service.signInWithPassword(email, password)
        
        // Log the method used for debugging
        if (result.method === 'fallback') {
          console.log('[Supabase Enhanced] Used REST API fallback for authentication')
        }

        return {
          data: result.data,
          error: result.error
        }
      },

      // Other auth methods with enhanced handling
      signOut: async () => {
        const result = await service.signOut()
        return { error: result.error }
      },

      getSession: async () => {
        const result = await service.getSession()
        return {
          data: result.data ? { session: result.data } : { session: null },
          error: result.error
        }
      },

      refreshSession: async ({ refresh_token }: { refresh_token: string }) => {
        const result = await service.refreshSession(refresh_token)
        return {
          data: result.data ? { session: result.data } : null,
          error: result.error
        }
      },

      setSession: async ({ access_token, refresh_token }: { access_token: string; refresh_token: string }) => {
        return this.client.auth.setSession({ access_token, refresh_token })
      },

      resetPasswordForEmail: async (email: string, options?: { redirectTo?: string }) => {
        const result = await service.resetPasswordForEmail(email, options?.redirectTo)
        return { data: {}, error: result.error }
      },

      updateUser: async (attributes: any) => {
        return this.client.auth.updateUser(attributes)
      },

      onAuthStateChange: (callback: any) => {
        return this.client.auth.onAuthStateChange(callback)
      },

      signInWithOtp: async (credentials: { email: string; options?: any }) => {
        return this.client.auth.signInWithOtp(credentials)
      },

      verifyOtp: async (params: any) => {
        return this.client.auth.verifyOtp(params)
      },

      getUser: async (jwt?: string) => {
        return this.client.auth.getUser(jwt)
      },

      // Admin methods (if available)
      admin: this.client.auth.admin
    }
  }
}

// Export enhanced Supabase client as default
export const supabase = new EnhancedSupabaseClient()

// Helper function to create a new enhanced client with custom config
export const createEnhancedClient = (url?: string, key?: string) => {
  return new EnhancedSupabaseClient()
}
