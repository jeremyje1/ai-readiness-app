import prisma from './db'
import { EventLog } from '@prisma/client'

export interface CreateEventData {
  type: string
  actorUserId?: string
  institutionId?: string
  data?: any
}

// Common event types
export const EVENT_TYPES = {
  // User events
  USER_CREATED: 'user_created',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  PASSWORD_RESET: 'password_reset',
  
  // Institution events
  INSTITUTION_CREATED: 'institution_created',
  INSTITUTION_UPDATED: 'institution_updated',
  
  // Phase events
  PHASE_STARTED: 'phase_started',
  PHASE_COMPLETED: 'phase_completed',
  TASK_COMPLETED: 'task_completed',
  
  // Document events
  DOCUMENT_GENERATED: 'document_generated',
  DOCUMENT_UPDATED: 'document_updated',
  DOCUMENT_DELETED: 'document_deleted',
  
  // Assessment events
  ASSESSMENT_COMPLETED: 'assessment_completed',
  ASSESSMENT_UPDATED: 'assessment_updated',
  
  // System events
  WEBHOOK_RECEIVED: 'webhook_received',
  ERROR_OCCURRED: 'error_occurred',
  
  // Admin events
  ADMIN_ACTION: 'admin_action',
  DATA_EXPORT: 'data_export'
} as const

// Log an event
export async function logEvent(data: CreateEventData): Promise<EventLog> {
  try {
    return await prisma.eventLog.create({
      data: {
        type: data.type,
        actorUserId: data.actorUserId,
        institutionId: data.institutionId,
        data: data.data || {}
      }
    })
  } catch (error) {
    console.error('Error logging event:', error)
    throw error
  }
}

// Get events for an institution
export async function getInstitutionEvents(
  institutionId: string, 
  limit: number = 50
): Promise<EventLog[]> {
  try {
    return await prisma.eventLog.findMany({
      where: { institutionId },
      include: {
        actorUser: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  } catch (error) {
    console.error('Error getting institution events:', error)
    return []
  }
}

// Get events by user
export async function getUserEvents(
  userId: string, 
  limit: number = 50
): Promise<EventLog[]> {
  try {
    return await prisma.eventLog.findMany({
      where: { actorUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  } catch (error) {
    console.error('Error getting user events:', error)
    return []
  }
}

// Get events by type
export async function getEventsByType(
  type: string, 
  limit: number = 100
): Promise<EventLog[]> {
  try {
    return await prisma.eventLog.findMany({
      where: { type },
      include: {
        actorUser: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  } catch (error) {
    console.error('Error getting events by type:', error)
    return []
  }
}

// Get recent events (for admin dashboard)
export async function getRecentEvents(limit: number = 25): Promise<EventLog[]> {
  try {
    return await prisma.eventLog.findMany({
      include: {
        actorUser: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  } catch (error) {
    console.error('Error getting recent events:', error)
    return []
  }
}

// Convenience functions for common events

export async function logUserLogin(userId: string, ipAddress?: string) {
  return logEvent({
    type: EVENT_TYPES.USER_LOGIN,
    actorUserId: userId,
    data: { ipAddress }
  })
}

export async function logUserLogout(userId: string) {
  return logEvent({
    type: EVENT_TYPES.USER_LOGOUT,
    actorUserId: userId
  })
}

export async function logInstitutionCreated(
  institutionId: string, 
  userId?: string, 
  institutionData?: any
) {
  return logEvent({
    type: EVENT_TYPES.INSTITUTION_CREATED,
    actorUserId: userId,
    institutionId,
    data: institutionData
  })
}

export async function logPhaseCompleted(
  institutionId: string, 
  userId: string, 
  phaseData: any
) {
  return logEvent({
    type: EVENT_TYPES.PHASE_COMPLETED,
    actorUserId: userId,
    institutionId,
    data: phaseData
  })
}

export async function logDocumentGenerated(
  institutionId: string, 
  userId: string, 
  documentData: any
) {
  return logEvent({
    type: EVENT_TYPES.DOCUMENT_GENERATED,
    actorUserId: userId,
    institutionId,
    data: documentData
  })
}

export async function logWebhookReceived(
  webhookType: string, 
  institutionId?: string, 
  payload?: any
) {
  return logEvent({
    type: EVENT_TYPES.WEBHOOK_RECEIVED,
    institutionId,
    data: { webhookType, payload }
  })
}

export async function logError(
  error: string, 
  userId?: string, 
  institutionId?: string, 
  context?: any
) {
  return logEvent({
    type: EVENT_TYPES.ERROR_OCCURRED,
    actorUserId: userId,
    institutionId,
    data: { error, context }
  })
}

export async function logAdminAction(
  userId: string, 
  action: string, 
  target?: string, 
  details?: any
) {
  return logEvent({
    type: EVENT_TYPES.ADMIN_ACTION,
    actorUserId: userId,
    data: { action, target, details }
  })
}
