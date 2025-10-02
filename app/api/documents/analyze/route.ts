import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// NIST AI RMF Framework Categories
const NIST_CATEGORIES = {
  GOVERN: {
    name: 'GOVERN',
    description: 'Leadership and governance structure for AI',
    subcategories: [
      'AI governance structure and accountability',
      'Policies and procedures for AI development',
      'Risk management framework',
      'Stakeholder engagement',
      'Legal and regulatory compliance'
    ]
  },
  MAP: {
    name: 'MAP',
    description: 'Context mapping and categorization of AI systems',
    subcategories: [
      'AI system categorization and documentation',
      'Impact assessment',
      'Context understanding',
      'Risk identification',
      'Stakeholder mapping'
    ]
  },
  MEASURE: {
    name: 'MEASURE',
    description: 'Measurement and assessment of AI risks',
    subcategories: [
      'Performance metrics',
      'Bias and fairness assessment',
      'Safety and security metrics',
      'Privacy and data protection measures',
      'Transparency and explainability'
    ]
  },
  MANAGE: {
    name: 'MANAGE',
    description: 'Risk management and mitigation',
    subcategories: [
      'Risk mitigation strategies',
      'Incident response planning',
      'Monitoring and oversight',
      'Documentation and reporting',
      'Continuous improvement'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all completed documents for user
    const { data: documents, error: docsError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('user_id', user_id)
      .eq('processing_status', 'completed');

    if (docsError || !documents || documents.length === 0) {
      return NextResponse.json({ error: 'No processed documents found' }, { status: 404 });
    }

    // Get streamlined assessment responses
    const { data: assessment } = await supabase
      .from('streamlined_assessment_responses')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Combine all document text
    const combinedText = documents
      .map(doc => `\n\n=== ${doc.document_type.toUpperCase()}: ${doc.file_name} ===\n${doc.extracted_text || ''}`)
      .join('\n');

    // Generate AI analysis using OpenAI
    const analysisPrompt = `You are an AI readiness expert analyzing institutional documents against the NIST AI Risk Management Framework.

Institution Context:
- Type: ${assessment?.institution_type || 'Unknown'}
- Size: ${assessment?.institution_size || 'Unknown'}
- AI Journey Stage: ${assessment?.ai_journey_stage || 'Unknown'}
- Biggest Challenge: ${assessment?.biggest_challenge || 'Unknown'}

Documents Provided:
${combinedText.substring(0, 15000)} // Limit to first 15K chars to avoid token limits

NIST AI RMF Framework Categories:
1. GOVERN: ${NIST_CATEGORIES.GOVERN.description}
2. MAP: ${NIST_CATEGORIES.MAP.description}
3. MEASURE: ${NIST_CATEGORIES.MEASURE.description}
4. MANAGE: ${NIST_CATEGORIES.MANAGE.description}

Analyze these documents and provide:

1. For each NIST category (GOVERN, MAP, MEASURE, MANAGE):
   - Score (0-100) based on maturity and coverage
   - Top 3 gaps identified
   - Top 3 strengths identified
   - Specific recommendations

2. Overall Assessment:
   - Overall maturity level (Beginning, Developing, Performing, Advanced)
   - Overall score (0-100)
   - Top 5 priority actions
   - Quick wins (actions that can be done in 30 days)

Respond in valid JSON format with this structure:
{
  "overall_score": number,
  "maturity_level": string,
  "categories": {
    "GOVERN": {
      "score": number,
      "gaps": [string, string, string],
      "strengths": [string, string, string],
      "recommendations": [string, string, string]
    },
    "MAP": { ... },
    "MEASURE": { ... },
    "MANAGE": { ... }
  },
  "priority_actions": [string, string, string, string, string],
  "quick_wins": [string, string, string]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in AI governance and the NIST AI Risk Management Framework. Provide detailed, actionable analysis in valid JSON format.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content || '{}');

    // Store gap analysis results
    const { data: gapAnalysis, error: gapError } = await supabase
      .from('gap_analysis_results')
      .upsert({
        user_id,
        overall_score: analysisResult.overall_score || 0,
        maturity_level: analysisResult.maturity_level || 'Beginning',
        govern_score: analysisResult.categories?.GOVERN?.score || 0,
        govern_gaps: analysisResult.categories?.GOVERN?.gaps || [],
        govern_strengths: analysisResult.categories?.GOVERN?.strengths || [],
        govern_recommendations: analysisResult.categories?.GOVERN?.recommendations || [],
        map_score: analysisResult.categories?.MAP?.score || 0,
        map_gaps: analysisResult.categories?.MAP?.gaps || [],
        map_strengths: analysisResult.categories?.MAP?.strengths || [],
        map_recommendations: analysisResult.categories?.MAP?.recommendations || [],
        measure_score: analysisResult.categories?.MEASURE?.score || 0,
        measure_gaps: analysisResult.categories?.MEASURE?.gaps || [],
        measure_strengths: analysisResult.categories?.MEASURE?.strengths || [],
        measure_recommendations: analysisResult.categories?.MEASURE?.recommendations || [],
        manage_score: analysisResult.categories?.MANAGE?.score || 0,
        manage_gaps: analysisResult.categories?.MANAGE?.gaps || [],
        manage_strengths: analysisResult.categories?.MANAGE?.strengths || [],
        manage_recommendations: analysisResult.categories?.MANAGE?.recommendations || [],
        priority_actions: analysisResult.priority_actions || [],
        quick_wins: analysisResult.quick_wins || [],
        analysis_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (gapError) {
      console.error('Gap analysis storage error:', gapError);
      return NextResponse.json({ error: 'Failed to store analysis results' }, { status: 500 });
    }

    // Generate 30/60/90-day roadmaps
    await generateRoadmaps(supabase, user_id, analysisResult, assessment);

    // Update all documents with analysis complete flag
    await supabase
      .from('uploaded_documents')
      .update({ ai_analysis: analysisResult, analyzed_at: new Date().toISOString() })
      .eq('user_id', user_id);

    return NextResponse.json({
      success: true,
      gap_analysis: gapAnalysis,
      overall_score: analysisResult.overall_score,
      maturity_level: analysisResult.maturity_level
    });

  } catch (error: any) {
    console.error('AI analysis error:', error);
    return NextResponse.json({
      error: 'Analysis failed',
      details: error.message
    }, { status: 500 });
  }
}

async function generateRoadmaps(supabase: any, userId: string, analysis: any, assessment: any) {
  const roadmapPrompt = `Based on this AI readiness gap analysis, create detailed 30/60/90-day implementation roadmaps.

Institution: ${assessment?.institution_type || 'Unknown'} (${assessment?.institution_size || 'Unknown'})
Overall Score: ${analysis.overall_score}/100
Maturity Level: ${analysis.maturity_level}
Top Priorities: ${analysis.priority_actions?.join(', ')}

Create three roadmaps (30-day, 60-day, 90-day) with:
- 3-5 specific goals for each period
- 5-7 action items per period
- 2-3 key milestones

Respond in valid JSON format:
{
  "30day": {
    "goals": [string, ...],
    "action_items": [string, ...],
    "milestones": [string, ...]
  },
  "60day": { ... },
  "90day": { ... }
}`;

  const roadmapCompletion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an AI implementation strategist. Create practical, actionable roadmaps in valid JSON.' },
      { role: 'user', content: roadmapPrompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const roadmaps = JSON.parse(roadmapCompletion.choices[0].message.content || '{}');

  // Store each roadmap
  for (const period of ['30day', '60day', '90day']) {
    if (roadmaps[period]) {
      await supabase
        .from('implementation_roadmaps')
        .upsert({
          user_id: userId,
          roadmap_type: period,
          goals: roadmaps[period].goals || [],
          action_items: roadmaps[period].action_items || [],
          milestones: roadmaps[period].milestones || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,roadmap_type'
        });
    }
  }
}
