import { isEnvConfigured } from '@/lib/env'
import { AlertCircle } from 'lucide-react'

export default function Loading() {
  const envConfigured = isEnvConfigured()

  if (!envConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Configuration Missing
          </h2>
          
          <p className="mt-4 text-center text-gray-600">
            The application is not properly configured. Please contact your administrator.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Missing Environment Variables:</strong>
              </p>
              <ul className="mt-2 text-xs text-yellow-600 list-disc list-inside">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
              <p className="mt-2 text-xs text-yellow-600">
                Please check your .env.local file or Vercel environment settings.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading Assessment</h2>
        <p className="mt-2 text-gray-600">Preparing your AI readiness experience...</p>
      </div>
    </div>
  )
}