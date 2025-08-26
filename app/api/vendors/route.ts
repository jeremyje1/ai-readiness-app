/**
 * API Route: Vendor Intake Management
 * POST /api/vendors - Create new vendor intake
 * GET /api/vendors - List vendor intakes
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { VendorService } from '@/lib/services/vendor'
import { CreateVendorRequest } from '@/lib/types/vendor'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user info from headers
    const userId = request.headers.get('x-user-id') || 'demo-user'
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.assessment?.basicInfo?.name) {
      return NextResponse.json({
        success: false,
        error: 'Vendor name is required'
      }, { status: 400 })
    }

    if (!body.assessment?.basicInfo?.url) {
      return NextResponse.json({
        success: false,
        error: 'Vendor URL is required'
      }, { status: 400 })
    }

    if (!body.assessment?.basicInfo?.businessJustification) {
      return NextResponse.json({
        success: false,
        error: 'Business justification is required'
      }, { status: 400 })
    }

    // Create vendor intake request
    const vendorRequest: CreateVendorRequest = {
      assessment: body.assessment,
      requestedBy: userId,
      urgency: body.urgency || 'medium',
      expectedLaunchDate: body.expectedLaunchDate,
      notes: body.notes
    }

    console.log(`Creating vendor intake for: ${body.assessment.basicInfo.name}`)

    const vendor = await VendorService.createVendor(vendorRequest, userId)

    return NextResponse.json({
      success: true,
      data: vendor,
      message: 'Vendor intake created successfully'
    })

  } catch (error) {
    console.error('Vendor creation error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user info from headers
    const userId = request.headers.get('x-user-id') || 'demo-user'
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any
    const riskLevel = searchParams.get('riskLevel')
    const createdBy = searchParams.get('createdBy')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log(`Fetching vendors for user: ${userId}`)

    const result = await VendorService.listVendors({
      status,
      riskLevel: riskLevel || undefined,
      createdBy: createdBy || undefined,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      data: result.vendors,
      total: result.total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < result.total
      }
    })

  } catch (error) {
    console.error('Vendor listing error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
