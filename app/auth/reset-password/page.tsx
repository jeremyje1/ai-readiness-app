'use client'
import React, { useState, useEffect } from 'react'

export default function ResetPasswordPage() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const emailParam = params?.get('email') || ''
  const tokenParam = params?.get('token') || ''

  const [email, setEmail] = useState(emailParam)
  const [token, setToken] = useState(tokenParam)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, token, newPassword: password }) })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="border p-2 w-full" placeholder="Token" value={token} onChange={e => setToken(e.target.value)} required />
        <input className="border p-2 w-full" placeholder="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Update Password</button>
        {status === 'success' && <p className="text-green-600 text-sm">Password updated. You can now sign in.</p>}
        {status === 'error' && <p className="text-red-600 text-sm">Error resetting password.</p>}
      </form>
    </div>
  )
}
