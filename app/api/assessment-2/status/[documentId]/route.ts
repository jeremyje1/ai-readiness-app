/**
 * Assessment 2.0 Status API Route
 * Check processing status and download artifacts
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Get document and associated assessment
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        id,
        filename,
        file_type,
        file_size,
        upload_status,
        processing_summary,
        error_message,
        created_at,
        updated_at,
        assessments!assessments_document_id_fkey (
          id,
          status,
          overall_score,
          compliance_level,
          frameworks,
          processing_summary,
          created_at,
          completed_at,
          framework_scores (
            framework,
            score,
            compliance_level
          ),
          artifacts (
            id,
            type,
            format,
            filename,
            file_size,
            created_at
          )
        )
      `)
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ 
        error: 'Document not found' 
      }, { status: 404 })
    }

    // Get the latest assessment
    const assessment = document.assessments?.[0]

    // Calculate processing progress
    let progress = 0
    let stage = 'pending'

    if (document.upload_status === 'processing' || assessment?.status === 'processing') {
      progress = 25
      stage = 'processing'
    } else if (assessment?.status === 'completed') {
      progress = 100
      stage = 'completed'
    } else if (document.upload_status === 'failed' || assessment?.status === 'failed') {
      progress = 0
      stage = 'failed'
    }

    const response = {
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        fileType: document.file_type,
        fileSize: document.file_size,
        uploadStatus: document.upload_status,
        errorMessage: document.error_message,
        createdAt: document.created_at,
        updatedAt: document.updated_at
      },
      processing: {
        progress,
        stage,
        estimatedCompletionTime: progress < 100 ? 
          new Date(Date.now() + (100 - progress) * 1000).toISOString() : 
          null
      },
      assessment: assessment ? {
        id: assessment.id,
        status: assessment.status,
        overallScore: assessment.overall_score,
        complianceLevel: assessment.compliance_level,
        frameworks: assessment.frameworks,
        summary: assessment.processing_summary,
        createdAt: assessment.created_at,
        completedAt: assessment.completed_at,
        frameworkScores: assessment.framework_scores || [],
        artifacts: assessment.artifacts || []
      } : null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Download specific artifact
export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params
    const { artifactId, artifactType } = await request.json()

    if (!documentId || (!artifactId && !artifactType)) {
      return NextResponse.json({ 
        error: 'Document ID and artifact identifier required' 
      }, { status: 400 })
    }

    // Get artifact from database
    let query = supabase
      .from('artifacts')
      .select('*')
      .eq('assessment_id', documentId)

    if (artifactId) {
      query = query.eq('id', artifactId)
    } else if (artifactType) {
      query = query.eq('type', artifactType)
    }

    const { data: artifacts, error } = await query.limit(1)

    if (error || !artifacts || artifacts.length === 0) {
      return NextResponse.json({ 
        error: 'Artifact not found' 
      }, { status: 404 })
    }

    const artifact = artifacts[0]

    // In a real implementation, you would retrieve the file from storage
    // For now, we'll return the artifact metadata with a placeholder download URL
    return NextResponse.json({
      success: true,
      artifact: {
        id: artifact.id,
        type: artifact.type,
        format: artifact.format,
        filename: artifact.filename,
        fileSize: artifact.file_size,
        createdAt: artifact.created_at,
        downloadUrl: `/api/assessment-2/download/${artifact.id}`, // Placeholder
        metadata: artifact.metadata
      }
    })

  } catch (error) {
    console.error('Artifact download error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
