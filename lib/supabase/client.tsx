'use client'

import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'
import { createContext, useContext, useMemo } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

type SupabaseContext = {
  supabase: SupabaseClient
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL || '',
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      ),
    []
  )

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context.supabase
}

// Singleton client for use outside of React components
let browserClient: SupabaseClient | undefined

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL || '',
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  }
  return browserClient
}