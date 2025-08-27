/**
 * @deprecated Use lib/auth-service.ts instead. This file re-exports for backward compatibility.
 * For admin operations, import directly from lib/supabase-admin.ts
 */

export { authService as default } from './auth-service'

// Export getUser function for backward compatibility with tests
export const getUser = async () => {
  const { authService } = await import('./auth-service')
  const result = await authService.getSession()
  return result.data?.user || null
}

// Admin client - import directly from supabase-admin.ts for server-side usage
export const createAdminClient = () => {
    throw new Error('Import createAdminClient directly from lib/supabase-admin.ts for server-side usage')
}

export const supabaseAdmin = createAdminClient()
