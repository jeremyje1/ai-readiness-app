/**
 * API Route: Download Policy Artifacts
 * GET /api/artifacts/[id]/download
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface DownloadParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: DownloadParams
): Promise<NextResponse> {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'html'
    
    console.log(`Download request for policy ${id} in ${format} format`)

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Policy ID is required'
      }, { status: 400 })
    }

    const artifactsDir = path.join(process.cwd(), 'public', 'artifacts')
    
    // Check if policy exists
    const metadataPath = path.join(artifactsDir, `metadata_${id}.json`)
    try {
      await fs.access(metadataPath)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Policy not found'
      }, { status: 404 })
    }

    // Read policy metadata
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    const policy = JSON.parse(metadataContent)

    let filePath: string
    let contentType: string
    let filename: string

    // Determine file based on format
    switch (format.toLowerCase()) {
      case 'docx':
        filePath = path.join(artifactsDir, `policy_${id}.docx`)
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        filename = `${policy.document?.title || 'Policy'}_${id}.docx`
        break

      case 'html':
        filePath = path.join(artifactsDir, `policy_${id}.html`)
        contentType = 'text/html'
        filename = `${policy.document?.title || 'Policy'}_${id}.html`
        break

      case 'json':
        // Return policy metadata as JSON
        return NextResponse.json(policy, {
          headers: {
            'Content-Disposition': `attachment; filename="${policy.document?.title || 'Policy'}_${id}.json"`
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Unsupported format. Use docx, html, or json'
        }, { status: 400 })
    }

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: `${format.toUpperCase()} file not found for this policy`
      }, { status: 404 })
    }

    // Read and return file
    const fileBuffer = await fs.readFile(filePath)
    
    // Clean filename for download
    const cleanFilename = filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${cleanFilename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Download error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: DownloadParams
): Promise<NextResponse> {
  try {
    const { id } = params
    
    console.log(`Delete request for policy ${id}`)

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Policy ID is required'
      }, { status: 400 })
    }

    const artifactsDir = path.join(process.cwd(), 'public', 'artifacts')
    
    // Files to delete
    const filesToDelete = [
      `metadata_${id}.json`,
      `policy_${id}.docx`,
      `policy_${id}.html`
    ]

    let deletedFiles = 0
    const deletionResults = []

    for (const filename of filesToDelete) {
      const filePath = path.join(artifactsDir, filename)
      try {
        await fs.unlink(filePath)
        deletedFiles++
        deletionResults.push({ file: filename, status: 'deleted' })
        console.log(`Deleted: ${filename}`)
      } catch (error) {
        deletionResults.push({ 
          file: filename, 
          status: 'not_found',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    if (deletedFiles === 0) {
      return NextResponse.json({
        success: false,
        error: 'Policy not found or already deleted'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Deleted ${deletedFiles} files for policy ${id}`,
        deletedFiles,
        results: deletionResults
      }
    })

  } catch (error) {
    console.error('Deletion error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
