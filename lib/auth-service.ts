import { supabase } from './supabase'
import { AuthError, Session, User } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
  fallbackUsed?: boolean
}

export interface AuthService {
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<AuthResponse>
  signOut: () => Promise<{ error: AuthError | null }>
  getSession: () => Promise<{ data: { session: Session | null }; error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  setSession: (tokens: { access_token: string; refresh_token: string }) => Promise<{ error: AuthError | null }>
}

// Exponential backoff retry utility
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      console.warn(`🔄 Retry attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms:`, lastError.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// Manual password grant fallback using direct REST API
async function manualPasswordGrant(email: string, password: string): Promise<AuthResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase configuration for fallback auth')
  }
  
  const grantUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=password`
  
  console.log('🌐 Executing manual password grant fallback...')
  const response = await fetch(grantUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'x-client-info': 'ai-readiness-app-fallback/1.0.0'
    },
    body: JSON.stringify({ 
      email: email.trim(), 
      password,
      gotrue_meta_security: {} // Additional security context
    })
  })
  
  const responseText = await response.text()
  console.log(`🌐 Fallback response: ${response.status} ${response.statusText}`)
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`
    try {
      const errorData = JSON.parse(responseText)
      errorMessage = errorData.error_description || errorData.message || errorMessage
    } catch {
      // Use status text if JSON parsing fails
      errorMessage = response.statusText || errorMessage
    }
    throw new AuthError(errorMessage)
  }
  
  let tokens: any
  try {
    tokens = JSON.parse(responseText)
  } catch {
    throw new AuthError('Invalid response format from auth server')
  }
  
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new AuthError('Missing authentication tokens in response')
  }
  
  // Set session using the obtained tokens
  const sessionResult = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  })
  
  if (sessionResult.error) {
    throw sessionResult.error
  }
  
  return {
    user: sessionResult.data.user,
    session: sessionResult.data.session,
    error: null,
    fallbackUsed: true
  }
}

// Enhanced auth service with automatic fallback
class EnhancedAuthService implements AuthService {
  private fallbackCount = 0
  
  async signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const { email, password } = credentials
    const startTime = performance.now()
    
    console.log('🔐 Enhanced auth: starting signInWithPassword flow')
    
    try {
      // First attempt: standard Supabase SDK
      const timeoutMs = 8000 // 8 second timeout
      const loginPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`SDK timeout after ${timeoutMs}ms`))
        }, timeoutMs)
      })
      
      const result = await Promise.race([loginPromise, timeoutPromise])
      const elapsed = performance.now() - startTime
      
      console.log(`✅ SDK auth succeeded in ${Math.round(elapsed)}ms`)
      
      return {
        user: result.data.user,
        session: result.data.session,
        error: result.error,
        fallbackUsed: false
      }
      
    } catch (error: any) {
      const elapsed = performance.now() - startTime
      console.warn(`⚠️ SDK auth failed after ${Math.round(elapsed)}ms:`, error.message)
      
      // Check if this is a timeout or network issue that warrants fallback
      const isTimeoutOrNetwork = /timeout|network|fetch|connection/i.test(error.message || '')
      
      if (isTimeoutOrNetwork) {
        console.log('🔄 Attempting manual password grant fallback...')
        
        try {
          // Update telemetry
          this.fallbackCount++
          try {
            const currentCount = parseInt(localStorage.getItem('auth_fallback_count') || '0', 10)
            localStorage.setItem('auth_fallback_count', String(currentCount + 1))
          } catch {
            // Ignore localStorage errors
          }
          
          const fallbackResult = await withRetry(() => 
            manualPasswordGrant(email, password), 2, 500
          )
          
          const totalElapsed = performance.now() - startTime
          console.log(`✅ Fallback auth succeeded in ${Math.round(totalElapsed)}ms total`)
          
          return fallbackResult
          
        } catch (fallbackError: any) {
          console.error('❌ Fallback auth also failed:', fallbackError.message)
          
          // Return the more descriptive error
          const finalError = fallbackError instanceof AuthError 
            ? fallbackError 
            : new AuthError(`Auth failed: ${fallbackError.message}`)
            
          return {
            user: null,
            session: null,
            error: finalError,
            fallbackUsed: false
          }
        }
      } else {
        // Non-network error, return as-is
        return {
          user: null,
          session: null,
          error: error instanceof AuthError ? error : new AuthError(error.message || 'Authentication failed'),
          fallbackUsed: false
        }
      }
    }
  }
  
  async signOut() {
    console.log('🔐 Enhanced auth: signing out')
    
    // Clear any stored fallback telemetry on signout
    try {
      localStorage.removeItem('auth_fallback_count')
    } catch {
      // Ignore localStorage errors
    }
    
    return await supabase.auth.signOut()
  }
  
  async getSession() {
    return await supabase.auth.getSession()
  }
  
  async updatePassword(password: string) {
    console.log('🔐 Enhanced auth: updating password')
    return await supabase.auth.updateUser({ password })
  }
  
  async resetPassword(email: string) {
    console.log('🔐 Enhanced auth: sending password reset')
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/password/update`
    })
  }
  
  async setSession(tokens: { access_token: string; refresh_token: string }) {
    return await supabase.auth.setSession(tokens)
  }
  
  // Diagnostic methods
  getFallbackCount(): number {
    return this.fallbackCount
  }
  
  async testConnection(): Promise<{ status: 'ok' | 'error'; message: string; latency?: number }> {
    try {
      const start = performance.now()
      const { error } = await supabase.auth.getSession()
      const latency = Math.round(performance.now() - start)
      
      if (error) {
        return { status: 'error', message: error.message, latency }
      }
      
      return { status: 'ok', message: 'Connection healthy', latency }
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Connection test failed' }
    }
  }
}

// Export singleton instance
export const authService = new EnhancedAuthService()
