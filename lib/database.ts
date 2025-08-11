// Main database operations index
// Exports all Prisma-based database operations for the AI Readiness platform

export * from './db'
export * from './user-management-db'
export * from './institution-management-db'
export * from './phase-management-db'
export * from './document-management-db'
export * from './event-logging-db'

// Re-export Prisma client types for convenience
export type {
  User,
  Institution,
  ImplementationPhase,
  AutomatedTask,
  Deliverable,
  GeneratedDocument,
  PasswordResetToken,
  EventLog,
  UserRole,
  InstitutionSegment,
  SubscriptionTier,
  PhaseStatus,
  TaskStatus,
  DocumentType
} from '@prisma/client'
