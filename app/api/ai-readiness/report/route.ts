import { NextRequest, NextResponse } from 'next/server';
import { generateAIReadinessPDFReport, type AIReadinessReportData } from '@/lib/ai-readiness-pdf-generator';
import type { AIReadinessResults } from '@/lib/aiReadinessEngine';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { results, institutionInfo, tier = 'basic', userId } = body;

    // Validate input
    if (!results || !results.scores) {
      return NextResponse.json(
        { error: 'Invalid results data' },
        { status: 400 }
      );
    }

    console.log('🎯 Generating AI Readiness PDF report...');

    // Fetch user profile data from database for personalized report
    const supabase = createClient();
    let userProfile = null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const actualUserId = user?.id || userId;

      if (actualUserId) {
        const { data: profile } = await supabase
          .from('user_profile_with_institution')
          .select('*')
          .eq('user_id', actualUserId)
          .single();

        if (profile) {
          userProfile = profile;
          console.log('✅ Retrieved user profile for report:', profile.institution_name);
        }
      }
    } catch (profileError) {
      console.warn('⚠️  Could not fetch user profile, using provided data:', profileError);
    }

    // Prepare report data with user profile data (NO MOCK DATA)
    const reportData: AIReadinessReportData = {
      results,
      institutionInfo: {
        // Use real user data from database, or prompt for missing data
        name: userProfile?.institution_name || institutionInfo?.name || results.institutionName || '[Institution Name - Please complete your profile]',
        type: userProfile?.institution_type || institutionInfo?.type || '[Institution Type - Please complete your profile]',
        size: userProfile?.institution_size || institutionInfo?.size || '[Size - Please complete your profile]',
        location: userProfile?.city && userProfile?.state
          ? `${userProfile.city}, ${userProfile.state}`
          : institutionInfo?.location || '[Location - Please complete your profile]',
        // Additional real user data
        contactName: userProfile?.full_name || '[Contact Name - Please complete your profile]',
        contactEmail: userProfile?.email || '[Email - Please complete your profile]',
        contactTitle: userProfile?.job_title || '[Title - Please complete your profile]',
        department: userProfile?.department || '[Department - Please complete your profile]',
        studentCount: userProfile?.student_count,
        facultyCount: userProfile?.faculty_count,
        staffCount: userProfile?.staff_count,
        annualBudget: userProfile?.annual_budget
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
