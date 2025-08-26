/**
 * Readiness & Risk Dashboard API
 * Provides assessment scores, trends, and open risks
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { DashboardService } from '@/lib/services/dashboard'
import { DashboardFilters } from '@/lib/types/dashboard'

export async function GET(request: NextRequest) {
  try {
    const currentUserId = request.headers.get('x-user-id')
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters for filters
    const { searchParams } = new URL(request.url)
    const filters: DashboardFilters = {}
    
    if (searchParams.get('department')) {
      filters.department = searchParams.get('department')!
    }
    
    if (searchParams.get('startDate') && searchParams.get('endDate')) {
      filters.dateRange = {
        start: searchParams.get('startDate')!,
        end: searchParams.get('endDate')!
      }
    }
    
    if (searchParams.get('riskLevel')) {
      filters.riskLevel = searchParams.get('riskLevel')!
    }

    // Get readiness metrics
    const metrics = await DashboardService.getReadinessMetrics(filters)

    return NextResponse.json({
      success: true,
      data: metrics,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching readiness metrics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch readiness metrics' 
      },
      { status: 500 }
    )
  }
}
