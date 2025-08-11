import prisma from './db'
import { GeneratedDocument, DocumentType } from '@prisma/client'

export interface CreateDocumentData {
  institutionId: string
  type: DocumentType
  content: any // JSON content
}

// Create a new generated document
export async function createGeneratedDocument(data: CreateDocumentData): Promise<GeneratedDocument> {
  try {
    return await prisma.generatedDocument.create({
      data: {
        institutionId: data.institutionId,
        type: data.type,
        content: data.content,
      }
    })
  } catch (error) {
    console.error('Error creating generated document:', error)
    throw error
  }
}

// Get documents for an institution
export async function getInstitutionDocuments(institutionId: string): Promise<GeneratedDocument[]> {
  try {
    return await prisma.generatedDocument.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error getting institution documents:', error)
    return []
  }
}

// Get document by ID
export async function getDocument(id: string): Promise<GeneratedDocument | null> {
  try {
    return await prisma.generatedDocument.findUnique({
      where: { id },
      include: {
        institution: {
          select: { id: true, name: true, segment: true }
        }
      }
    })
  } catch (error) {
    console.error('Error getting document:', error)
    return null
  }
}

// Get latest document of a specific type for an institution
export async function getLatestDocumentByType(
  institutionId: string, 
  type: DocumentType
): Promise<GeneratedDocument | null> {
  try {
    return await prisma.generatedDocument.findFirst({
      where: { 
        institutionId,
        type 
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error getting latest document by type:', error)
    return null
  }
}

// Update document content
export async function updateDocumentContent(
  id: string, 
  content: any
): Promise<GeneratedDocument | null> {
  try {
    return await prisma.generatedDocument.update({
      where: { id },
      data: { content }
    })
  } catch (error) {
    console.error('Error updating document content:', error)
    return null
  }
}

// Delete document
export async function deleteDocument(id: string): Promise<boolean> {
  try {
    await prisma.generatedDocument.delete({
      where: { id }
    })
    return true
  } catch (error) {
    console.error('Error deleting document:', error)
    return false
  }
}

// Helper functions for document content structure

export interface AssessmentDocumentContent {
  institutionName: string
  assessmentDate: string
  overallScore: number
  sections: {
    infrastructure: {
      score: number
      findings: string[]
      recommendations: string[]
    }
    policies: {
      score: number
      findings: string[]
      recommendations: string[]
    }
    readiness: {
      score: number
      findings: string[]
      recommendations: string[]
    }
  }
  summary: string
  nextSteps: string[]
}

export interface StrategyDocumentContent {
  institutionName: string
  segment: string
  executiveSummary: string
  objectives: string[]
  timeline: {
    phase: string
    duration: string
    milestones: string[]
  }[]
  resources: {
    budget: string
    personnel: string[]
    technology: string[]
  }
  riskAssessment: {
    risk: string
    mitigation: string
  }[]
}

export interface PolicyDocumentContent {
  institutionName: string
  policyType: string
  effectiveDate: string
  purpose: string
  scope: string
  definitions: { term: string; definition: string }[]
  guidelines: string[]
  procedures: string[]
  compliance: string[]
  enforcement: string
}

// Create assessment document
export async function createAssessmentDocument(
  institutionId: string,
  content: AssessmentDocumentContent
): Promise<GeneratedDocument> {
  return createGeneratedDocument({
    institutionId,
    type: DocumentType.INSTITUTIONAL_ASSESSMENT,
    content
  })
}

// Create strategy document  
export async function createStrategyDocument(
  institutionId: string,
  content: StrategyDocumentContent
): Promise<GeneratedDocument> {
  return createGeneratedDocument({
    institutionId,
    type: DocumentType.AI_STRATEGY,
    content
  })
}

// Create policy document
export async function createPolicyDocument(
  institutionId: string,
  content: PolicyDocumentContent
): Promise<GeneratedDocument> {
  return createGeneratedDocument({
    institutionId,
    type: DocumentType.AI_POLICIES,
    content
  })
}
