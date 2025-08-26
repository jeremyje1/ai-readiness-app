import { NextRequest, NextResponse } from 'next/server';
import { generateComprehensivePDFReport } from '../../../../lib/comprehensive-pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const { analysis } = await request.json();

    console.log('Generating PDF with comprehensive generator, analysis data:', {
      hasAssessmentData: !!analysis.assessmentData,
      hasResponses: !!analysis.responses,
      hasUploadedFiles: !!analysis.uploadedFiles,
      tier: analysis.tier,
      score: analysis.score
    });

    // Generate PDF using comprehensive PDF generator
    const pdfBuffer = await generateComprehensivePDFReport({
      data: {
        user_email: analysis.user_email || 'unknown@example.com',
        assessment_score: analysis.assessment_score || 0,
        recommendations: analysis.recommendations || 'No recommendations available',
        domains: analysis.domains || {},
        organization_type: analysis.assessmentData?.organization_type || 'Organization',
        submitted_at: analysis.assessmentData?.submitted_at || new Date().toISOString(),
        total_responses: Object.keys(analysis.responses || {}).length
      }
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="organizational-analysis-${analysis.assessmentId || 'report'}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
}
