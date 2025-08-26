/**
 * API Route: Generate Policy Document
 * POST /api/policies/generate
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { ClauseSelector } from '@/lib/policy/clause-selector'
import { PolicyRenderer } from '@/lib/policy/policy-renderer'
import { ClauseSelectionInput, GeneratedPolicy, PolicyRenderOptions } from '@/lib/policy/types'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'

interface GeneratePolicyRequest {
  input: ClauseSelectionInput
  format?: 'docx' | 'html' | 'both'
  title?: string
  institution?: string
  userId?: string
  organizationId?: string
  options?: {
    includeMetadata?: boolean
    enableTracking?: boolean
    watermark?: string
  }
}

interface GeneratePolicyResponse {
  success: boolean
  data?: {
    policy: GeneratedPolicy
    downloadUrls?: {
      docx?: string
      html?: string
    }
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<GeneratePolicyResponse>> {
  try {
    const body: GeneratePolicyRequest = await request.json()
    
    // Validate request
    if (!body.input || !body.input.audience || !body.input.toolUseMode) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: audience and toolUseMode are required'
      }, { status: 400 })
    }

    console.log('Generating policy for:', {
      audience: body.input.audience,
      toolUseMode: body.input.toolUseMode,
      riskProfile: body.input.riskProfile,
      format: body.format || 'both'
    })

    // Initialize policy generation components
    const clauseSelector = new ClauseSelector()
    const policyRenderer = new PolicyRenderer()

    // Select appropriate clauses
    const selectedClauses = await clauseSelector.selectClauses(body.input)
    
    if (selectedClauses.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No clauses selected. Please check your input parameters.'
      }, { status: 400 })
    }

    // Generate policy document
    const policy: GeneratedPolicy = {
      id: uuidv4(),
      templateId: 'default_template',
      selectedClauses,
      document: {
        title: body.title || `AI Readiness Policy - ${body.input.audience === 'k12' ? 'K-12' : 'Higher Education'}`,
        content: '', // Will be populated by renderer
        wordCount: selectedClauses.reduce((acc, clause) => acc + clause.body.split(' ').length, 0),
        pageCount: Math.ceil(selectedClauses.reduce((acc, clause) => acc + clause.body.split(' ').length, 0) / 250)
      },
      trackedChanges: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        userId: body.userId || 'anonymous',
        organizationId: body.organizationId || body.institution || 'default',
        parameters: body.input
      }
    }

    // Generate documents based on requested format
    const downloadUrls: { docx?: string; html?: string } = {}
    const artifactsDir = path.join(process.cwd(), 'public', 'artifacts')
    
    // Ensure artifacts directory exists
    await fs.mkdir(artifactsDir, { recursive: true })

    try {
      if (body.format === 'docx' || body.format === 'both' || !body.format) {
        console.log('Generating DOCX document...')
        
        const renderOptions: PolicyRenderOptions = {
          templateId: policy.templateId,
          selectedClauses: selectedClauses.map(c => c.id),
          trackedChanges: body.options?.enableTracking || false,
          format: 'docx',
          headerFooter: {
            organizationName: body.institution || 'Educational Institution',
            effectiveDate: new Date().toLocaleDateString(),
            version: '1.0.0'
          }
        }
        
        const docxBuffer = await policyRenderer.renderPolicyDocx(renderOptions)
        const docxFilename = `policy_${policy.id}.docx`
        const docxPath = path.join(artifactsDir, docxFilename)
        
        await fs.writeFile(docxPath, new Uint8Array(docxBuffer))
        downloadUrls.docx = `/api/artifacts/${policy.id}/download?format=docx`
        
        console.log(`DOCX saved to: ${docxPath}`)
      }

      if (body.format === 'html' || body.format === 'both' || !body.format) {
        console.log('Generating HTML document...')
        
        const htmlContent = await policyRenderer.renderPolicyHtml(
          policy.templateId,
          selectedClauses.map(c => c.id),
          body.institution || 'Educational Institution'
        )
        const htmlFilename = `policy_${policy.id}.html`
        const htmlPath = path.join(artifactsDir, htmlFilename)
        
        await fs.writeFile(htmlPath, htmlContent, 'utf-8')
        downloadUrls.html = `/api/artifacts/${policy.id}/download?format=html`
        
        console.log(`HTML saved to: ${htmlPath}`)
        
        // Set document content for response
        policy.document.content = htmlContent
      }

      // Add download URLs to policy response (outside the document type structure)
      const policyWithUrls = {
        ...policy,
        downloadUrls
      }

    } catch (renderError) {
      console.error('Document generation error:', renderError)
      return NextResponse.json({
        success: false,
        error: `Document generation failed: ${renderError instanceof Error ? renderError.message : 'Unknown error'}`
      }, { status: 500 })
    }

    // Create policy response with download URLs
    const policyResponse = {
      ...policy,
      downloadUrls
    }

    // Save policy metadata for later retrieval
    const metadataPath = path.join(artifactsDir, `metadata_${policy.id}.json`)
    await fs.writeFile(metadataPath, JSON.stringify(policyResponse, null, 2))

    return NextResponse.json({
      success: true,
      data: {
        policy: policyResponse,
        downloadUrls
      }
    })

  } catch (error) {
    console.error('Policy generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const institution = searchParams.get('institution')
    const audience = searchParams.get('audience')
    const limit = parseInt(searchParams.get('limit') || '10')

    // List recent policies
    const artifactsDir = path.join(process.cwd(), 'public', 'artifacts')
    
    try {
      const files = await fs.readdir(artifactsDir)
      const metadataFiles = files.filter(f => f.startsWith('metadata_') && f.endsWith('.json'))
      
      const policies = []
      for (const file of metadataFiles.slice(0, limit)) {
        try {
          const content = await fs.readFile(path.join(artifactsDir, file), 'utf-8')
          const policy = JSON.parse(content)
          
          // Filter by institution or audience if specified
          if (institution && !policy.institution.toLowerCase().includes(institution.toLowerCase())) {
            continue
          }
          if (audience && policy.audience !== audience) {
            continue
          }
          
          policies.push({
            id: policy.id,
            title: policy.title,
            institution: policy.institution,
            audience: policy.audience,
            generatedAt: policy.generatedAt,
            version: policy.version,
            downloadUrls: policy.document?.downloadUrls || {}
          })
        } catch (parseError) {
          console.warn(`Failed to parse metadata file ${file}:`, parseError)
        }
      }

      // Sort by generation date (newest first)
      policies.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())

      return NextResponse.json({
        success: true,
        data: {
          policies,
          total: policies.length,
          hasMore: metadataFiles.length > limit
        }
      })

    } catch (dirError) {
      // Artifacts directory doesn't exist yet
      return NextResponse.json({
        success: true,
        data: {
          policies: [],
          total: 0,
          hasMore: false
        }
      })
    }

  } catch (error) {
    console.error('Policy listing error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
