/**
 * Assessment 2.0 API Route
 * Document upload and processing endpoint
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AssessmentPipeline } from '@/lib/processing/assessment-pipeline'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const organizationId = formData.get('organizationId') as string
    const userId = formData.get('userId') as string
    const settings = formData.get('settings') ? JSON.parse(formData.get('settings') as string) : {}

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!organizationId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'image/png',
      'image/jpeg',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Unsupported file type. Please upload PDF, DOCX, PPTX, images, or text files.' 
      }, { status: 400 })
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Create document record first
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { error: docError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        organization_id: organizationId,
        user_id: userId,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        upload_status: 'processing',
        created_at: new Date().toISOString()
      })

    if (docError) {
      console.error('Document creation error:', docError)
      return NextResponse.json({ 
        error: 'Failed to create document record' 
      }, { status: 500 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Start processing pipeline
    const pipeline = new AssessmentPipeline()
    
    // Process asynchronously and return immediately
    const processingPromise = pipeline.processAssessment({
      documentId,
      file: {
        buffer,
        originalName: file.name,
        mimeType: file.type,
        size: file.size
      },
      organizationId,
      userId,
      settings: {
        enablePIIRedaction: settings.enablePIIRedaction ?? true,
        frameworks: settings.frameworks ?? ['AIRIX', 'AIRS', 'AICS', 'AIMS', 'AIPS', 'AIBS'],
        artifactTypes: settings.artifactTypes ?? ['gap-report', 'policy-redline', 'board-deck'],
        strictMode: settings.strictMode ?? false
      }
    })

    // Don't await - process in background
    processingPromise.then(async (result) => {
      // Update document status based on result
      await supabase
        .from('documents')
        .update({
          upload_status: result.success ? 'completed' : 'failed',
          processing_summary: result.summary,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
    }).catch(async (error) => {
      console.error('Processing pipeline error:', error)
      await supabase
        .from('documents')
        .update({
          upload_status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
    })

    return NextResponse.json({
      success: true,
      documentId,
      message: 'Document uploaded successfully. Processing has started.',
      statusUrl: `/api/assessment-2/status/${documentId}`
    }, { status: 202 }) // 202 Accepted - processing started

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during upload' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const userId = searchParams.get('userId')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 })
    }

    // Get recent assessments
    let query = supabase
      .from('assessments')
      .select(`
        id,
        status,
        overall_score,
        compliance_level,
        frameworks,
        created_at,
        completed_at,
        processing_summary,
        documents!assessments_document_id_fkey (
          id,
          filename,
          file_type
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: assessments, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch assessments' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assessments: assessments || []
    })

  } catch (error) {
    console.error('Get assessments error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
