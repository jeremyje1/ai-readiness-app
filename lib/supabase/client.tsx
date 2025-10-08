'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createContext, useContext, useMemo } from 'react'
import { createClient as createSupabaseClient } from './browser-client'

type SupabaseContext = {
  supabase: SupabaseClient
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseClient(), [])

  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>
}

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context.supabase
}

export function createClient() {
  return createSupabaseClient()
}