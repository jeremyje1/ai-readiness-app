'use client'

import { useEffect } from 'react'
import { Button } from '@/components/button'
import { AlertCircle } from 'lucide-react'
import { isEnvConfigured } from '@/lib/env'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Assessment error:', error)
  }, [error])

  const envConfigured = isEnvConfigured()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Assessment Error
        </h2>
        
        {!envConfigured && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Configuration Issue Detected:</strong> The application is not properly configured. 
              Please ensure all environment variables are set correctly.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-2 text-xs text-yellow-600">
                Check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
              </p>
            )}
          </div>
        )}
        
        <p className="mt-4 text-center text-gray-600">
          We encountered an error loading your assessment. This might be a temporary issue.
        </p>
        
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/ai-readiness/start'}
            variant="outline"
            className="w-full"
          >
            Start Over
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <p className="text-xs text-gray-600 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}