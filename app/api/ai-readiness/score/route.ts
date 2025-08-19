/**
 * AI Readiness API Route
 * Updated to use separate AI Readiness database
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIReadinessEngine } from '@/lib/aiReadinessEngine';
import { aiReadinessDatabase, formatAssessmentForDatabase, formatTeamAssessmentForDatabase } from '@/lib/aiReadinessDatabase';
import type { AIReadinessResults } from '@/lib/aiReadinessEngine';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Readiness Assessment API called');
    
    const body = await request.json();
    const { 
      responses, 
      institutionInfo, 
      tier = 'basic', 
      isTeamAssessment = false, 
      teamMembers = [],
      uploadedDocuments = []
    } = body;

    if (!responses) {
      return NextResponse.json(
        { error: 'Missing required field: responses' },
        { status: 400 }
      );
    }

    // Log document upload information
    if (uploadedDocuments && uploadedDocuments.length > 0) {
      console.log(`📄 Processing ${uploadedDocuments.length} uploaded documents for enhanced analysis`);
    }

    // Create database record first
    let assessmentRecord = null;
    if (aiReadinessDatabase.isAvailable()) {
      try {
        const assessmentData = isTeamAssessment 
          ? formatTeamAssessmentForDatabase(responses, institutionInfo, tier, teamMembers, uploadedDocuments)
          : formatAssessmentForDatabase(responses, institutionInfo, tier, uploadedDocuments);

        assessmentRecord = await aiReadinessDatabase.createAssessment(assessmentData);
        console.log('✅ AI readiness assessment record created:', assessmentRecord?.id);
      } catch (dbError) {
        console.warn('⚠️  Failed to create database record, continuing with analysis:', dbError);
      }
    }

    // Initialize AI Readiness Engine
    const engine = new AIReadinessEngine();
    
    // Process the assessment
    let results: AIReadinessResults;
    
    if (isTeamAssessment && teamMembers && teamMembers.length > 0) {
      // For team assessments, aggregate team member responses
      const aggregatedResponses: any[] = [];
      const allQuestionIds = new Set<string>();
      
      // Collect all unique question IDs from team responses
      teamMembers.forEach((member: any) => {
        Object.keys(member.responses || {}).forEach(questionId => {
          allQuestionIds.add(questionId);
        });
      });
      
      // Aggregate responses for each question
      allQuestionIds.forEach(questionId => {
        const questionResponses = teamMembers
          .map((member: any) => member.responses?.[questionId])
          .filter(Boolean);
          
        if (questionResponses.length > 0) {
          // Calculate average score for this question
          const avgScore = questionResponses.reduce((sum: any, resp: any) => 
            sum + (resp.score || 0), 0) / questionResponses.length;
          
          // Use the most common text response
          const mostCommonValue = questionResponses
            .map((resp: any) => resp.value)
            .sort((a: any, b: any) => 
              questionResponses.filter((r: any) => r.value === a).length -
              questionResponses.filter((r: any) => r.value === b).length
            ).pop() || '';
          
          aggregatedResponses.push({
            questionId,
            value: mostCommonValue,
            score: avgScore
          });
        }
      });
      
            results = await AIReadinessEngine.assessReadiness(aggregatedResponses, institutionInfo?.name);
      results.isTeamAssessment = true;
      results.teamMembers = teamMembers;
    } else {
      // Convert responses to the expected format
      let responseArray: any[] = [];
      
      // Check if responses is already in the correct format (flat structure with response objects)
      const firstValue = Object.values(responses)[0];
      if (firstValue && typeof firstValue === 'object' && 'questionId' in firstValue) {
        // Already in correct format
        responseArray = Object.values(responses);
      } else if (typeof firstValue === 'object' && firstValue !== null) {
        // Nested domain format (like {technical_infrastructure: {q1: 4, q2: 3}})
        responseArray = [];
        Object.entries(responses).forEach(([domain, domainResponses]) => {
          if (typeof domainResponses === 'object' && domainResponses !== null) {
            Object.entries(domainResponses).forEach(([questionKey, value]) => {
              responseArray.push({
                questionId: questionKey,
                value: String(value),
                score: typeof value === 'number' ? value : 0
              });
            });
          }
        });
      } else {
        // Flat format (like {q1: 4, q2: 3})
        responseArray = Object.entries(responses).map(([questionId, value]) => ({
          questionId,
          value: String(value),
          score: typeof value === 'number' ? value : 0
        }));
      }
      
      results = await AIReadinessEngine.assessReadiness(responseArray, institutionInfo?.name);
    }

    // Save results to database
    if (assessmentRecord && aiReadinessDatabase.isAvailable()) {
      try {
        await aiReadinessDatabase.saveResults(assessmentRecord.id, results);
        console.log('✅ AI readiness results saved to database');
      } catch (dbError) {
        console.warn('⚠️  Failed to save results to database:', dbError);
      }
    }

    // Return results with assessment ID if available
    const response = {
      success: true,
      results,
      assessmentId: assessmentRecord?.id || null,
      tier,
      timestamp: new Date().toISOString()
    };

    console.log('✅ AI Readiness assessment completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ AI Readiness assessment error:', error);
    
    return NextResponse.json(
      { 
        error: 'Assessment processing failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!aiReadinessDatabase.isAvailable()) {
      return NextResponse.json(
        { error: 'AI Readiness database not available' },
        { status: 503 }
      );
    }

    // Get specific assessment
    if (assessmentId) {
      const assessment = await aiReadinessDatabase.getAssessment(assessmentId);
      if (!assessment) {
        return NextResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ assessment });
    }

    // Get user assessments
    if (userId) {
      const assessments = await aiReadinessDatabase.getUserAssessments(userId);
      return NextResponse.json({ assessments });
    }

    // Get analytics (admin only - add auth check in production)
    if (action === 'analytics') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const analytics = await aiReadinessDatabase.getAnalytics(startDate || undefined, endDate || undefined);
      return NextResponse.json({ analytics });
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ AI Readiness GET error:', error);
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
