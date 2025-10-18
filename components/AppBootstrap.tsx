'use client'

import { initializeAuthValidation } from '@/lib/auth-utils'
import { ensureAuthFetchPatched } from '@/lib/auth/fetch-auth'
import { initializeCacheBust } from '@/lib/cache-bust-force'
import { useEffect } from 'react'

export function AppBootstrap() {
    useEffect(() => {
        initializeCacheBust()
        initializeAuthValidation()
        ensureAuthFetchPatched()
    }, [])

    return null
}
