/**
 * @deprecated Use lib/auth-service.ts instead. This file re-exports for backward compatibility.
 * For admin operations, import directly from lib/supabase-admin.ts
 */

export { authService as default } from './auth-service'

// Admin client - import directly from supabase-admin.ts for server-side usage
export const createAdminClient = () => {
    throw new Error('Import createAdminClient directly from lib/supabase-admin.ts for server-side usage')
}

export const supabaseAdmin = createAdminClient()
