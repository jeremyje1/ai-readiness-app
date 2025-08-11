import prisma from './db'
import { UserRole, SubscriptionTier } from '@prisma/client'
import { hashPassword, comparePassword, generateSecurePassword } from './password-utils'

export interface CreateUserData {
  email: string
  name?: string
  role?: UserRole
  stripeCustomerId?: string
}

export interface SubscriptionData {
  status: 'active' | 'trialing' | 'cancelled'
  plan: string
  trial_end?: number
}

export async function createUserAccount(
  userData: CreateUserData, 
  subscription?: SubscriptionData
): Promise<{ userId: string; temporaryPassword: string }> {
  try {
    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword()
    const passwordHash = await hashPassword(temporaryPassword)

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        passwordHash,
        role: userData.role || UserRole.USER,
        stripeCustomerId: userData.stripeCustomerId,
      }
    })

    console.log('Created user account:', userData.email)
    return { userId: user.id, temporaryPassword }
  } catch (error) {
    console.error('Error creating user account:', error)
    throw error
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        ownedInstitutions: {
          include: {
            phases: {
              include: {
                tasks: true,
                deliverables: true
              }
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

// Validate user credentials with password hashing
export async function validateUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('User not found:', email)
      return null
    }

    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      console.log('Invalid password for:', email)
      return null
    }

    console.log('User authenticated:', email)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error) {
    console.error('Error validating user:', error)
    return null
  }
}

export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(newPassword)
    
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    })
    
    return true
  } catch (error) {
    console.error('Error updating password:', error)
    return false
  }
}

// Get all users (for admin purposes)
export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        stripeCustomerId: true,
        ownedInstitutions: {
          select: {
            id: true,
            name: true,
            segment: true,
            subscriptionTier: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

// Create password reset token
export async function createPasswordResetToken(email: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return null

    const token = generateSecurePassword() + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    })

    return token
  } catch (error) {
    console.error('Error creating reset token:', error)
    return null
  }
}

// Validate and consume password reset token
export async function validatePasswordResetToken(token: string): Promise<string | null> {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken || resetToken.consumed || resetToken.expiresAt < new Date()) {
      return null
    }

    // Mark token as consumed
    await prisma.passwordResetToken.update({
      where: { token },
      data: { consumed: true }
    })

    return resetToken.user.email
  } catch (error) {
    console.error('Error validating reset token:', error)
    return null
  }
}

// Clear test data (for development/testing)
export async function clearAllTestData() {
  try {
    // Delete in correct order due to foreign key constraints
    await prisma.passwordResetToken.deleteMany()
    await prisma.eventLog.deleteMany()
    await prisma.generatedDocument.deleteMany()
    await prisma.deliverable.deleteMany()
    await prisma.automatedTask.deleteMany()
    await prisma.implementationPhase.deleteMany()
    await prisma.institution.deleteMany()
    await prisma.user.deleteMany()

    console.log('Cleared all test data from database')
    return { success: true, message: 'All test data cleared' }
  } catch (error) {
    console.error('Error clearing test data:', error)
    return { success: false, message: 'Failed to clear test data' }
  }
}
