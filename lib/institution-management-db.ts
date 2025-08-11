import prisma from './db'
import { Institution, InstitutionSegment, SubscriptionTier } from '@prisma/client'

export interface CreateInstitutionData {
  externalId?: string // provisional ID from Stripe
  name: string
  segment: InstitutionSegment
  type?: string
  size?: string
  studentCount?: number
  facultyCount?: number
  subscriptionTier?: SubscriptionTier
  ownerId?: string
}

export interface UpdateInstitutionData {
  name?: string
  type?: string
  size?: string
  studentCount?: number
  facultyCount?: number
  subscriptionTier?: SubscriptionTier
}

// Create institution (blank or with data)
export async function createInstitution(data: CreateInstitutionData): Promise<Institution> {
  try {
    return await prisma.institution.create({
      data: {
        externalId: data.externalId,
        name: data.name,
        segment: data.segment,
        type: data.type,
        size: data.size,
        studentCount: data.studentCount || 0,
        facultyCount: data.facultyCount || 0,
        subscriptionTier: data.subscriptionTier || SubscriptionTier.PROFESSIONAL,
        ownerId: data.ownerId,
      }
    })
  } catch (error) {
    console.error('Error creating institution:', error)
    throw error
  }
}

// Create blank institution (for deep link initialization)
export async function createBlankInstitution(
  externalId: string, 
  segment: InstitutionSegment,
  ownerId?: string
): Promise<Institution> {
  try {
    // Check if institution already exists
    const existing = await prisma.institution.findUnique({
      where: { externalId }
    })
    
    if (existing) {
      return existing
    }

    return await prisma.institution.create({
      data: {
        externalId,
        name: '', // Blank until user fills onboarding
        segment,
        subscriptionTier: SubscriptionTier.PROFESSIONAL,
        ownerId,
      }
    })
  } catch (error) {
    console.error('Error creating blank institution:', error)
    throw error
  }
}

// Get institution by ID (external or internal)
export async function getInstitution(id: string) {
  try {
    // Try external ID first, then internal ID
    let institution = await prisma.institution.findUnique({
      where: { externalId: id },
      include: {
        phases: {
          include: {
            tasks: true,
            deliverables: true
          },
          orderBy: { phaseNumber: 'asc' }
        },
        documents: true,
        owner: {
          select: { id: true, email: true, name: true }
        }
      }
    })

    if (!institution) {
      institution = await prisma.institution.findUnique({
        where: { id },
        include: {
          phases: {
            include: {
              tasks: true,
              deliverables: true
            },
            orderBy: { phaseNumber: 'asc' }
          },
          documents: true,
          owner: {
            select: { id: true, email: true, name: true }
          }
        }
      })
    }

    return institution
  } catch (error) {
    console.error('Error getting institution:', error)
    return null
  }
}

// Update institution profile
export async function updateInstitution(id: string, data: UpdateInstitutionData): Promise<Institution | null> {
  try {
    return await prisma.institution.update({
      where: { externalId: id },
      data
    })
  } catch (error) {
    console.error('Error updating institution:', error)
    return null
  }
}

// Get institutions by owner
export async function getInstitutionsByOwner(ownerId: string) {
  try {
    return await prisma.institution.findMany({
      where: { ownerId },
      include: {
        phases: {
          select: {
            phaseNumber: true,
            name: true,
            status: true,
            progress: true
          },
          orderBy: { phaseNumber: 'asc' }
        }
      }
    })
  } catch (error) {
    console.error('Error getting institutions by owner:', error)
    return []
  }
}

// Get all institutions (for admin)
export async function getAllInstitutions() {
  try {
    return await prisma.institution.findMany({
      include: {
        owner: {
          select: { id: true, email: true, name: true }
        },
        phases: {
          select: {
            phaseNumber: true,
            status: true,
            progress: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error getting all institutions:', error)
    return []
  }
}

// Check if institution is blank (needs onboarding)
export function isBlankInstitution(institution: Institution): boolean {
  return !institution.name || institution.name.trim() === ''
}

// Create placeholder institution (legacy compatibility)
export async function createPlaceholderHigherEdInstitution(contactEmail: string) {
  const externalId = `highered_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return await createBlankInstitution(
    externalId,
    InstitutionSegment.HIGHER_ED
  )
}

// Create placeholder K12 school (legacy compatibility)
export async function createPlaceholderK12School(contactEmail: string) {
  const externalId = `school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return await createBlankInstitution(
    externalId,
    InstitutionSegment.K12
  )
}
