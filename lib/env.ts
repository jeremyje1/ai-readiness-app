import { z } from 'zod'

const envSchema = z.object({
  // Public environment variables (exposed to browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_SITE_URL: z.string().url().min(1, 'NEXT_PUBLIC_SITE_URL is required'),
  
  // Server-only environment variables
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, 'SUPABASE_SERVICE_ROLE_KEY is required').optional(),
  
  // Database (if using Prisma)
  DATABASE_URL: z.string().optional(),
  
  // Stripe (if using payments)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // NextAuth (if using)
  NEXTAUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  
  // Postmark Email
  POSTMARK_SERVER_TOKEN: z.string().optional(),
  POSTMARK_API_TOKEN: z.string().optional(), // Alias for POSTMARK_SERVER_TOKEN
  POSTMARK_FROM_EMAIL: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://aiblueprint.higheredaiblueprint.com',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      POSTMARK_SERVER_TOKEN: process.env.POSTMARK_SERVER_TOKEN,
      POSTMARK_API_TOKEN: process.env.POSTMARK_API_TOKEN || process.env.POSTMARK_SERVER_TOKEN,
      POSTMARK_FROM_EMAIL: process.env.POSTMARK_FROM_EMAIL || process.env.FROM_EMAIL,
      NODE_ENV: process.env.NODE_ENV as 'development' | 'test' | 'production',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ')
      const errorMessage = `Missing or invalid environment variables: ${missingVars}\n\n` +
        'Please check your .env.local file and Vercel environment settings.\n' +
        'Required variables:\n' +
        '  - NEXT_PUBLIC_SUPABASE_URL\n' +
        '  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
        '  - NEXT_PUBLIC_SITE_URL\n\n' +
        'See .env.local.example for reference.'
      
      // In development, throw error to fail fast
      if (process.env.NODE_ENV === 'development') {
        throw new Error(errorMessage)
      }
      
      // In production, log error but don't crash
      console.error('[ENV VALIDATION ERROR]', errorMessage)
      
      // Return minimal valid config to prevent crash
      return {
        NEXT_PUBLIC_SUPABASE_URL: '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
        NEXT_PUBLIC_SITE_URL: 'https://aiblueprint.higheredaiblueprint.com',
        NODE_ENV: 'production',
      } as Env
    }
    throw error
  }
}

export const env = validateEnv()

// Helper to check if environment is properly configured
export function isEnvConfigured(): boolean {
  return !!(
    env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Export typed process.env for convenience
export const typedEnv = env