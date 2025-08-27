/**
 * @deprecated Use lib/auth-service.ts instead. This file re-exports for backward compatibility.
 */

export { authService as default, createAdminClient } from './auth-service'

import { createAdminClient } from './auth-service'
export const supabaseAdmin = createAdminClient()
