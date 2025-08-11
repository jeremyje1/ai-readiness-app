import prisma from './db'
import { ImplementationPhase, PhaseStatus, InstitutionSegment, AutomatedTask, Deliverable } from '@prisma/client'

export interface CreatePhaseData {
  institutionId: string
  phaseNumber: number
  name: string
  description?: string
  durationDays?: number
}

export interface CreateTaskData {
  code: string
  title: string
  description?: string
  order?: number
}

export interface CreateDeliverableData {
  title: string
  description?: string
}

// Initialize standard phases for an institution
export async function initializeImplementationPhases(
  institutionId: string,
  segment: InstitutionSegment
): Promise<ImplementationPhase[]> {
  try {
    const phases = segment === InstitutionSegment.HIGHER_ED 
      ? getHigherEdPhases(institutionId)
      : getK12Phases(institutionId)

    const createdPhases = []
    for (const phase of phases) {
      const created = await prisma.implementationPhase.create({
        data: {
          institutionId: phase.institutionId,
          phaseNumber: phase.phaseNumber,
          name: phase.name,
          status: PhaseStatus.PENDING,
          progress: 0,
          durationDays: phase.durationDays,
        },
        include: {
          tasks: true,
          deliverables: true
        }
      })
      createdPhases.push(created)
    }

    return createdPhases
  } catch (error) {
    console.error('Error initializing implementation phases:', error)
    throw error
  }
}

// Add tasks to a phase
export async function addTasksToPhase(phaseId: string, tasks: CreateTaskData[]): Promise<AutomatedTask[]> {
  try {
    const createdTasks = []
    for (const task of tasks) {
      const created = await prisma.automatedTask.create({
        data: {
          phaseId,
          code: task.code,
          title: task.title,
          description: task.description,
          order: task.order || 0
        }
      })
      createdTasks.push(created)
    }
    return createdTasks
  } catch (error) {
    console.error('Error adding tasks to phase:', error)
    throw error
  }
}

// Add deliverables to a phase
export async function addDeliverabelsToPhase(phaseId: string, deliverables: CreateDeliverableData[]): Promise<Deliverable[]> {
  try {
    const createdDeliverables = []
    for (const deliverable of deliverables) {
      const created = await prisma.deliverable.create({
        data: {
          phaseId,
          title: deliverable.title,
          description: deliverable.description,
        }
      })
      createdDeliverables.push(created)
    }
    return createdDeliverables
  } catch (error) {
    console.error('Error adding deliverables to phase:', error)
    throw error
  }
}

// Get implementation phases for institution
export async function getImplementationPhases(institutionId: string) {
  try {
    return await prisma.implementationPhase.findMany({
      where: { institutionId },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        },
        deliverables: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { phaseNumber: 'asc' }
    })
  } catch (error) {
    console.error('Error getting implementation phases:', error)
    return []
  }
}

// Update phase status and progress
export async function updatePhaseProgress(
  phaseId: string,
  status: PhaseStatus,
  progress: number
): Promise<ImplementationPhase | null> {
  try {
    return await prisma.implementationPhase.update({
      where: { id: phaseId },
      data: { status, progress }
    })
  } catch (error) {
    console.error('Error updating phase progress:', error)
    return null
  }
}

// Update task status
export async function updateTaskStatus(
  taskId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
): Promise<AutomatedTask | null> {
  try {
    return await prisma.automatedTask.update({
      where: { id: taskId },
      data: { status }
    })
  } catch (error) {
    console.error('Error updating task status:', error)
    return null
  }
}

// Calculate phase progress based on tasks
export async function calculatePhaseProgress(phaseId: string): Promise<number> {
  try {
    const phase = await prisma.implementationPhase.findUnique({
      where: { id: phaseId },
      include: {
        tasks: true,
        deliverables: true
      }
    })

    if (!phase) return 0

    const totalItems = phase.tasks.length + phase.deliverables.length
    if (totalItems === 0) return 0

    const completedTasks = phase.tasks.filter(task => task.status === 'COMPLETED').length
    const completedItems = completedTasks + phase.deliverables.length // Deliverables don't have status in current schema

    return Math.round((completedItems / totalItems) * 100)
  } catch (error) {
    console.error('Error calculating phase progress:', error)
    return 0
  }
}

// Higher Education phases template
function getHigherEdPhases(institutionId: string): CreatePhaseData[] {
  return [
    {
      institutionId,
      phaseNumber: 1,
      name: "AI Readiness Assessment",
      description: "Comprehensive evaluation of current AI capabilities and readiness",
      durationDays: 14
    },
    {
      institutionId,
      phaseNumber: 2,
      name: "Strategic Planning",
      description: "Development of AI integration strategy and roadmap",
      durationDays: 21
    },
    {
      institutionId,
      phaseNumber: 3,
      name: "Implementation",
      description: "Execution of AI integration plan",
      durationDays: 60
    }
  ]
}

// K-12 phases template
function getK12Phases(institutionId: string): CreatePhaseData[] {
  return [
    {
      institutionId,
      phaseNumber: 1,
      name: "District Assessment",
      description: "Evaluate district-wide AI readiness and needs",
      durationDays: 10
    },
    {
      institutionId,
      phaseNumber: 2,
      name: "Curriculum Integration",
      description: "Integrate AI concepts into curriculum",
      durationDays: 30
    },
    {
      institutionId,
      phaseNumber: 3,
      name: "Teacher Training",
      description: "Prepare educators for AI integration",
      durationDays: 45
    }
  ]
}

// Standard tasks for Higher Ed Assessment phase
export const HIGHER_ED_ASSESSMENT_TASKS: CreateTaskData[] = [
  {
    code: "infrastructure_audit",
    title: "Infrastructure Assessment",
    description: "Evaluate current IT infrastructure for AI readiness",
    order: 1
  },
  {
    code: "policy_review",
    title: "Policy Review",
    description: "Review existing academic and technology policies",
    order: 2
  },
  {
    code: "stakeholder_survey",
    title: "Stakeholder Survey",
    description: "Survey faculty, staff, and students on AI readiness",
    order: 3
  }
]

// Standard deliverables for Higher Ed Assessment phase
export const HIGHER_ED_ASSESSMENT_DELIVERABLES: CreateDeliverableData[] = [
  {
    title: "AI Readiness Report",
    description: "Comprehensive assessment of institutional AI readiness"
  },
  {
    title: "Infrastructure Analysis",
    description: "Detailed analysis of current technology infrastructure"
  }
]
