import { NextRequest, NextResponse } from 'next/server';
import { generateAIReadinessPDFReport, type AIReadinessReportData } from '@/lib/ai-readiness-pdf-generator';
import { aiReadinessDatabase } from '@/lib/aiReadinessDatabase';
import { StudentSuccessPlaybookGenerator } from '@/lib/studentSuccessPlaybookGenerator';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const assessmentId = url.searchParams.get('assessmentId');
    
    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    console.log('🎯 Generating AI Readiness PDF for assessment:', assessmentId);
    
    // Try to fetch assessment from database
    let assessmentData = null;
    if (aiReadinessDatabase.isAvailable()) {
      try {
        assessmentData = await aiReadinessDatabase.getAssessment(assessmentId);
        console.log('✅ Retrieved assessment from database');
      } catch (dbError) {
        console.warn('⚠️  Failed to retrieve from database:', dbError);
      }
    }

    if (!assessmentData) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Extract results and institution info with safe fallbacks
    const results = {
      scores: {
        overall: assessmentData.ai_readiness_score || 0,
        domains: assessmentData.domain_scores || {},
        teamAnalysis: assessmentData.team_analysis || null
      },
      recommendations: assessmentData.ai_analysis?.recommendations || [],
      policyRecommendations: assessmentData.policy_recommendations || [],
      maturityProfile: assessmentData.maturity_profile || { 
        overall: { name: 'Pending Analysis', level: 1, description: 'Assessment results pending analysis' },
        domains: {}
      },
      institutionName: assessmentData.institution_name,
      uploadedDocuments: assessmentData.ai_analysis?.uploaded_documents || [],
      proprietaryMetrics: assessmentData.ai_analysis?.proprietary_metrics || {},
      isTeamAssessment: assessmentData.is_team_assessment || false,
      teamMembers: assessmentData.team_members || [],
      openEndedResponses: assessmentData.open_ended_responses || {}
    };

    // If assessment results are empty, create a simpler PDF noting that analysis is pending
    const hasAnalyzedResults = assessmentData.ai_readiness_score !== null && 
                              Object.keys(assessmentData.domain_scores || {}).length > 0;

    if (!hasAnalyzedResults) {
      // Generate a simple PDF for unanalyzed assessments
      results.scores.overall = 0;
      results.scores.domains = {
        strategy: { score: 0, percentage: 0, maturityLevel: 'Pending', questions: 0 },
        governance: { score: 0, percentage: 0, maturityLevel: 'Pending', questions: 0 },
        pedagogy: { score: 0, percentage: 0, maturityLevel: 'Pending', questions: 0 },
        student_policy: { score: 0, percentage: 0, maturityLevel: 'Pending', questions: 0 },
        employee_policy: { score: 0, percentage: 0, maturityLevel: 'Pending', questions: 0 },
        technology: { score: 0, percentage: 0, maturityLevel: 'Pending', questions: 0 },
        culture: { score: 0, percentage: 0, maturityLevel: 'Pending', questions: 0 },
        alignment: { score: 0, percentage: 0, maturityLevel: 'Pending', questions: 0 }
      };
      results.recommendations = [{
        domain: 'analysis',
        priority: 'high',
        title: 'Complete Assessment Analysis',
        description: 'This assessment is pending full analysis. Please contact support to complete the scoring and recommendations.',
        actions: ['Submit assessment for analysis', 'Review completed results'],
        timeline: '1-2 business days',
        resources: ['Assessment Support Team']
      }];
    }

    // Ensure maturityProfile has the correct structure
    if (!results.maturityProfile.overall || !results.maturityProfile.overall.name) {
      results.maturityProfile.overall = { 
        name: hasAnalyzedResults ? 'Unknown' : 'Pending Analysis', 
        level: 1, 
        description: hasAnalyzedResults ? 'Unable to determine maturity level' : 'Assessment results pending analysis'
      };
    }

    // Ensure scores.domains has valid structure
    if (!results.scores.domains || typeof results.scores.domains !== 'object') {
      results.scores.domains = {};
    }

    const institutionInfo = {
      name: assessmentData.institution_name,
      type: assessmentData.institution_type,
      size: assessmentData.institution_size,
      email: assessmentData.contact_email,
      contactName: assessmentData.contact_name
    };

    // Generate student success playbook with error handling
    let playbook = null;
    try {
      const playbookGenerator = new StudentSuccessPlaybookGenerator();
      playbook = await playbookGenerator.generatePlaybook(results, institutionInfo);
    } catch (playbookError) {
      console.warn('⚠️  Failed to generate playbook, continuing without it:', playbookError);
      // Create a simple fallback playbook
      playbook = {
        executiveSummary: {
          readinessScore: results.scores.overall || 0,
          keyFindings: ['Assessment completed with enhanced document analysis'],
          criticalSuccessFactors: ['Document-based recommendations generated'],
          expectedOutcomes: [],
          investmentSummary: { totalCost: 0, roi: 0, timeline: '12 months' }
        }
      };
    }

    // Prepare report data for the AI readiness PDF generator
    const reportData: AIReadinessReportData = {
      results: {
        ...results,
        playbook: playbook
      } as any, // Temporarily cast to avoid type issues
      institutionInfo,
      tier: assessmentData.tier as 'basic' | 'custom',
      submissionDate: assessmentData.created_at,
      assessmentId: assessmentId,
      uploadedDocuments: results.uploadedDocuments
    };

    console.log('📋 Report data prepared:', {
      institutionName: reportData.institutionInfo.name,
      tier: reportData.tier,
      scoresPresent: !!reportData.results.scores,
      recommendationsCount: reportData.results.recommendations.length,
      documentsCount: reportData.uploadedDocuments?.length || 0,
      playbookPresent: !!playbook
    });

    // Generate the PDF using the AI readiness PDF generator
    console.log('🎯 Starting PDF generation...');
    const pdf = await generateAIReadinessPDFReport(reportData);
    
    if (!pdf) {
      throw new Error('PDF generation returned null');
    }
    
    console.log('✅ PDF generated successfully');
    
    // Convert PDF to base64 for download
    const pdfBase64 = `data:application/pdf;base64,${pdf.toString('base64')}`;
    
    const responseData = {
      success: true,
      reportId: assessmentId,
      institutionName: institutionInfo.name,
      generatedAt: new Date().toISOString(),
      tier: assessmentData.tier,
      pdfUrl: pdfBase64,
      summary: {
        overallScore: results.scores.overall || 0,
        maturityLevel: results.maturityProfile?.overall?.name || 'Unknown',
        topRecommendations: results.recommendations.slice(0, 3).map((rec: any) => 
          typeof rec === 'string' ? rec : rec.title || rec
        ),
        documentCount: results.uploadedDocuments?.length || 0,
        playbookGenerated: !!playbook
      }
    };
    
    console.log('✅ AI Readiness PDF report generated successfully');
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Error generating AI readiness PDF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI readiness PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'AI Readiness PDFs are generated via POST request',
    usage: 'Send POST /api/ai-readiness/pdf?assessmentId=your_id'
  });
}
