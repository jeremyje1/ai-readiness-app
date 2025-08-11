'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then(async (session) => {
      if (session?.user?.email) {
        // Get user data from server to find their institution
        try {
          const userDataResponse = await fetch(`/api/user/get-by-email?email=${encodeURIComponent(session.user.email)}`)
          if (userDataResponse.ok) {
            const userData = await userDataResponse.json()
            
            if (userData.institution) {
              const institutionId = userData.institution.id
              const institutionType = userData.institution.type
              
              if (institutionType === 'highered') {
                router.push(`/highered-implementation?institutionId=${encodeURIComponent(institutionId)}`)
              } else if (institutionType === 'k12') {
                router.push(`/k12-implementation?institutionId=${encodeURIComponent(institutionId)}`)
              } else {
                router.push('/dashboard')
              }
            } else {
              // Fallback to localStorage check
              const savedHigherEdId = localStorage.getItem('higheredInstitutionId')
              const savedK12Id = localStorage.getItem('k12SchoolId')
              
              if (savedHigherEdId) {
                router.push('/highered-implementation')
              } else if (savedK12Id) {
                router.push('/k12-implementation')
              } else {
                router.push('/dashboard')
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback to localStorage check
          const savedHigherEdId = localStorage.getItem('higheredInstitutionId')
          const savedK12Id = localStorage.getItem('k12SchoolId')
          
          if (savedHigherEdId) {
            router.push('/highered-implementation')
          } else if (savedK12Id) {
            router.push('/k12-implementation')
          } else {
            router.push('/dashboard')
          }
        }
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        // Get user data from server to find their institution
        try {
          const userDataResponse = await fetch(`/api/user/get-by-email?email=${encodeURIComponent(email)}`)
          if (userDataResponse.ok) {
            const userData = await userDataResponse.json()
            
            if (userData.institution) {
              const institutionId = userData.institution.id
              const institutionType = userData.institution.type
              
              if (institutionType === 'highered') {
                router.push(`/highered-implementation?institutionId=${encodeURIComponent(institutionId)}`)
              } else if (institutionType === 'k12') {
                router.push(`/k12-implementation?institutionId=${encodeURIComponent(institutionId)}`)
              } else {
                router.push('/dashboard')
              }
            } else {
              // No institution found, redirect to generic dashboard
              router.push('/dashboard')
            }
          } else {
            // Fallback to localStorage check
            const savedHigherEdId = localStorage.getItem('higheredInstitutionId')
            const savedK12Id = localStorage.getItem('k12SchoolId')
            
            if (savedHigherEdId) {
              router.push('/highered-implementation')
            } else if (savedK12Id) {
              router.push('/k12-implementation')
            } else {
              router.push('/dashboard')
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback to localStorage check
          const savedHigherEdId = localStorage.getItem('higheredInstitutionId')
          const savedK12Id = localStorage.getItem('k12SchoolId')
          
          if (savedHigherEdId) {
            router.push('/highered-implementation')
          } else if (savedK12Id) {
            router.push('/k12-implementation')
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: resetEmail }) })
      if (res.ok) setResetStatus('sent')
      else setResetStatus('error')
    } catch {
      setResetStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your AI Blueprint implementation dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/highered-implementation" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Start Higher Ed Implementation
                </a>
                {' or '}
                <a href="/k12-implementation" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Start K12 Implementation
                </a>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button onClick={() => setShowForgot(s => !s)} className="text-sm text-blue-600">
                {showForgot ? 'Hide' : 'Forgot password?'}
              </button>
              {showForgot && (
                <form onSubmit={handleForgot} className="mt-4 space-y-2">
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="Your email"
                    className="border p-2 w-full"
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Send reset link
                  </button>
                  {resetStatus === 'sent' && <p className="text-green-600 text-sm">If an account exists, a reset link was sent.</p>}
                  {resetStatus === 'error' && <p className="text-red-600 text-sm">Error sending reset link.</p>}
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
