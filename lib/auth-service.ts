/**
 * Enhanced Authentication Service with Fallback Support
 * Provides robust authentication with automatic fallback to REST API when SDK fails
 * @version 1.0.0
 */

import { createClient, SupabaseClient, AuthError, Session } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Types
export interface AuthResult<T = any> {
  data: T | null
  error: AuthError | Error | null
  method: 'sdk' | 'fallback' | 'cached'
  timestamp: number
}

export interface AuthServiceConfig {
  maxRetries?: number
  timeoutMs?: number
  enableDebugLogging?: boolean
  persistSession?: boolean
}

// Environment validation
const validateEnvironment = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !anonKey) {
    throw new Error('Missing required Supabase environment variables')
  }

  // Validate URL format
  try {
    const urlObj = new URL(url)
    const projectRef = urlObj.host.split('.supabase.co')[0]
    if (!/^[a-z0-9]{20}$/.test(projectRef)) {
      console.warn(`[Auth Service] Invalid Supabase project reference: ${projectRef}`)
    }
  } catch (e) {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL format: ${url}`)
  }

  return { url, anonKey, serviceKey }
}

// Get validated environment
const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY, serviceKey: SUPABASE_SERVICE_KEY } = validateEnvironment()

/**
 * Enhanced Authentication Service
 * Provides automatic fallback from SDK to REST API when needed
 */
export class AuthService {
  private client: SupabaseClient
  private config: Required<AuthServiceConfig>
  private debugLog: (message: string, data?: any) => void

  constructor(config: AuthServiceConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      timeoutMs: config.timeoutMs ?? 5000,
      enableDebugLogging: config.enableDebugLogging ?? true,
      persistSession: config.persistSession ?? true
    }

    // Initialize debug logger
    this.debugLog = this.config.enableDebugLogging
      ? (message: string, data?: any) => {
          console.log(`[Auth Service] ${message}`, data || '')
        }
      : () => {}

    // Create enhanced Supabase client
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: this.config.persistSession,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        flowType: 'pkce',
        debug: this.config.enableDebugLogging,
      },
      global: {
        headers: {
          'x-client-info': 'auth-service/1.0.0'
        }
      }
    })

    this.debugLog('Auth service initialized', { url: SUPABASE_URL })
  }

  /**
   * Sign in with automatic fallback
   */
  async signInWithPassword(email: string, password: string): Promise<AuthResult<{ user: any; session: Session }>> {
    const startTime = Date.now()
    this.debugLog(`Starting sign in for: ${email}`)

    try {
      // Try SDK first with timeout
      const sdkResult = await this.withTimeout(
        this.client.auth.signInWithPassword({ email, password }),
        this.config.timeoutMs,
        'SDK sign in'
      )

      if (sdkResult.error) throw sdkResult.error

      this.debugLog('SDK sign in successful', {
        userId: sdkResult.data?.user?.id,
        duration: Date.now() - startTime
      })

      return {
        data: sdkResult.data,
        error: null,
        method: 'sdk',
        timestamp: Date.now()
      }
    } catch (sdkError: any) {
      this.debugLog('SDK sign in failed, attempting fallback', {
        error: sdkError.message,
        duration: Date.now() - startTime
      })

      // Fallback to REST API
      return this.signInWithRestApi(email, password)
    }
  }

  /**
   * Fallback authentication using direct REST API
   */
  private async signInWithRestApi(email: string, password: string): Promise<AuthResult<{ user: any; session: Session }>> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'x-client-info': 'auth-service-fallback/1.0.0'
        },
        body: JSON.stringify({ email, password })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || responseData.msg || `Authentication failed: ${response.status}`)
      }

      // Manually construct session object
      const session: Session = {
        access_token: responseData.access_token,
        refresh_token: responseData.refresh_token,
        expires_in: responseData.expires_in,
        expires_at: Math.floor(Date.now() / 1000) + responseData.expires_in,
        token_type: responseData.token_type || 'bearer',
        user: responseData.user
      }

      // Set session in client for consistency
      await this.client.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })

      this.debugLog('REST API sign in successful', {
        userId: responseData.user?.id,
        duration: Date.now() - startTime
      })

      return {
        data: { user: responseData.user, session },
        error: null,
        method: 'fallback',
        timestamp: Date.now()
      }
    } catch (error: any) {
      this.debugLog('REST API sign in failed', {
        error: error.message,
        duration: Date.now() - startTime
      })

      return {
        data: null,
        error: error,
        method: 'fallback',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Sign out with cleanup
   */
  async signOut(): Promise<AuthResult<void>> {
    try {
      const { error } = await this.client.auth.signOut()
      
      // Clear any server-side cookies
      if (typeof window === 'undefined') {
        const cookieStore = cookies()
        cookieStore.delete('sb-access-token')
        cookieStore.delete('sb-refresh-token')
      }

      return {
        data: undefined,
        error,
        method: 'sdk',
        timestamp: Date.now()
      }
    } catch (error: any) {
      return {
        data: undefined,
        error,
        method: 'sdk',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Get current session with validation
   */
  async getSession(): Promise<AuthResult<Session | null>> {
    try {
      const { data, error } = await this.client.auth.getSession()
      
      // Validate session is not expired
      if (data?.session) {
        const expiresAt = data.session.expires_at
        if (expiresAt && expiresAt * 1000 < Date.now()) {
          // Session expired, try to refresh
          const refreshResult = await this.refreshSession(data.session.refresh_token)
          return refreshResult
        }
      }

      return {
        data: data?.session,
        error,
        method: 'sdk',
        timestamp: Date.now()
      }
    } catch (error: any) {
      return {
        data: null,
        error,
        method: 'sdk',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Refresh session with fallback
   */
  async refreshSession(refreshToken: string): Promise<AuthResult<Session | null>> {
    try {
      // Try SDK refresh
      const { data, error } = await this.withTimeout(
        this.client.auth.refreshSession({ refresh_token: refreshToken }),
        this.config.timeoutMs,
        'SDK refresh'
      )

      if (error) throw error

      return {
        data: data?.session,
        error: null,
        method: 'sdk',
        timestamp: Date.now()
      }
    } catch (sdkError: any) {
      // Fallback to REST API refresh
      return this.refreshWithRestApi(refreshToken)
    }
  }

  /**
   * Fallback session refresh using REST API
   */
  private async refreshWithRestApi(refreshToken: string): Promise<AuthResult<Session | null>> {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Refresh failed')
      }

      const session: Session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        token_type: data.token_type || 'bearer',
        user: data.user
      }

      // Update client session
      await this.client.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })

      return {
        data: session,
        error: null,
        method: 'fallback',
        timestamp: Date.now()
      }
    } catch (error: any) {
      return {
        data: null,
        error,
        method: 'fallback',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Reset password with enhanced error handling
   */
  async resetPasswordForEmail(email: string, redirectTo?: string): Promise<AuthResult<void>> {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/password/update`
      })

      return {
        data: undefined,
        error,
        method: 'sdk',
        timestamp: Date.now()
      }
    } catch (error: any) {
      return {
        data: undefined,
        error,
        method: 'sdk',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<AuthResult<boolean>> {
    try {
      // First check our custom password setup tokens
      const response = await fetch('/api/auth/password/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()
      
      return {
        data: response.ok && data.valid,
        error: response.ok ? null : new Error(data.error || 'Invalid token'),
        method: 'fallback',
        timestamp: Date.now()
      }
    } catch (error: any) {
      return {
        data: false,
        error,
        method: 'fallback',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Get underlying Supabase client (for advanced usage)
   */
  getClient(): SupabaseClient {
    return this.client
  }

  /**
   * Utility: Add timeout to promise
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs)
    })

    return Promise.race([promise, timeoutPromise])
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.config.maxRetries,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        
        const delay = baseDelay * Math.pow(2, i)
        this.debugLog(`Retry ${i + 1}/${maxRetries} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    throw new Error('Max retries exceeded')
  }
}

// Default singleton instance
export const authService = new AuthService()

// Server-side admin client
export const createAdminClient = () => {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
