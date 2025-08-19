import { NextRequest, NextResponse } from 'next/server';
import { generateAIReadinessPDFReport, type AIReadinessReportData } from '@/lib/ai-readiness-pdf-generator';
import type { AIReadinessResults } from '@/lib/aiReadinessEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { results, institutionInfo, tier = 'basic' } = body;

    // Validate input
    if (!results || !results.scores) {
      return NextResponse.json(
        { error: 'Invalid results data' },
        { status: 400 }
      );
    }

    console.log('🎯 Generating AI Readiness PDF report...');
    
    // Prepare report data for the AI readiness PDF generator
    const reportData: AIReadinessReportData = {
      results,
      institutionInfo: {
        name: institutionInfo?.name || results.institutionName || 'Your Institution',
        type: institutionInfo?.type || 'Higher Education Institution',
        size: institutionInfo?.size,
        location: institutionInfo?.location
      },
      tier: tier as 'basic' | 'custom',
      submissionDate: new Date().toISOString()
    };

    // Generate the PDF using the AI readiness PDF generator
    const pdf = await generateAIReadinessPDFReport(reportData);
    
    // Convert PDF to base64 for download
    const pdfBase64 = `data:application/pdf;base64,${pdf.toString('base64')}`;
    
    const responseData = {
      reportId: `ai-readiness-${Date.now()}`,
      institutionName: reportData.institutionInfo.name,
      generatedAt: reportData.submissionDate,
      tier: reportData.tier,
      pdfData: pdfBase64,
      summary: {
        overallScore: results.scores.overall,
        maturityLevel: results.maturityProfile.overall.name,
        topRecommendations: results.recommendations.slice(0, 3).map((rec: any) => rec.title)
      }
    };
    
    console.log('✅ AI Readiness PDF report generated successfully');
    
    return NextResponse.json({
      success: true,
      report: responseData
    });

  } catch (error) {
    console.error('❌ Error generating AI readiness report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI readiness report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Remove the mock download endpoint since we're returning PDF data directly
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'AI Readiness reports are generated via POST request',
    usage: 'Send assessment results to POST /api/ai-readiness/report'
  });
}
