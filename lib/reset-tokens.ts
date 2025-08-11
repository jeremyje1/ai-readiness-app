import crypto from 'crypto'

// In-memory reset token store (replace with DB in production)
const resetTokens = new Map<string, { token: string; expires: number }>()

export function validateResetToken(email: string, token: string) {
  const entry = resetTokens.get(email)
  if (!entry) return false
  if (entry.expires < Date.now()) {
    resetTokens.delete(email)
    return false
  }
  return entry.token === token
}

export function consumeResetToken(email: string) {
  resetTokens.delete(email)
}

export function createResetToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + 1000 * 60 * 60 // 1 hour
  resetTokens.set(email, { token, expires })
  return token
}
