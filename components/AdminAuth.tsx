'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminAuthProps {
  children: React.ReactNode
}

export function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simple authentication check - in production, this should check with your auth system
    const checkAuth = async () => {
      try {
        // For now, we'll allow access - replace with actual auth logic
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be authenticated to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Default export for compatibility
export default AdminAuth
