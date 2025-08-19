import { NextRequest, NextResponse } from 'next/server';
import { runOpenAI } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tier = formData.get('tier') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Extract text from file
    const extractedText = await extractTextFromFile(file);
    
    // Analyze document with AI for strategic alignment
    const analysis = await analyzeDocumentForAlignment(extractedText, tier);

    // In production, you'd store the file in cloud storage
    const fileUrl = '#'; // Placeholder for actual file storage URL

    return NextResponse.json({
      url: fileUrl,
      extractedText: extractedText.substring(0, 500) + '...', // Truncate for preview
      analysis
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const text = await file.text();
  
  // For PDF files, you'd use a library like pdf-parse
  // For DOCX files, you'd use mammoth.js
  // For now, return plain text or simulate extraction
  
  if (file.type === 'application/pdf') {
    // Simulate PDF text extraction
    return `Strategic Plan 2024-2029
    
    Mission: To provide transformative educational experiences that prepare students for success in a rapidly changing world.
    
    Vision: To be a leading institution recognized for innovation, equity, and student success.
    
    Strategic Priorities:
    1. Student Success and Completion
    2. Academic Excellence and Innovation
    3. Diversity, Equity, and Inclusion
    4. Community Engagement and Partnerships
    5. Institutional Sustainability
    
    Student Success Metrics:
    - Increase graduation rates to 75% by 2029
    - Reduce equity gaps in completion by 50%
    - Achieve 90% first-year retention rate
    - Improve post-graduation employment to 85%
    
    Values:
    - Excellence in teaching and learning
    - Integrity and ethical conduct
    - Diversity and inclusive community
    - Innovation and continuous improvement
    - Service to community and society`;
  }
  
  return text;
}

async function analyzeDocumentForAlignment(text: string, tier: string) {
  if (tier === 'basic') {
    // Basic analysis - simple keyword extraction
    return {
      strategicPriorities: extractKeywords(text, ['student success', 'completion', 'equity', 'innovation', 'excellence']),
      studentSuccessMetrics: extractKeywords(text, ['graduation', 'retention', 'employment', 'completion', 'persistence']),
      institutionalValues: extractKeywords(text, ['excellence', 'integrity', 'diversity', 'innovation', 'service']),
      alignmentOpportunities: ['AI-powered student advising', 'Predictive analytics for retention'],
      riskFactors: ['Data privacy', 'Digital equity'],
      confidenceScore: 0.75
    };
  }

  // Advanced AI analysis for custom tier
  const analysisPrompt = `
    Analyze this institutional document for strategic alignment opportunities with AI initiatives.
    
    Document text: ${text.substring(0, 3000)}
    
    Extract and categorize:
    1. Strategic Priorities (main institutional goals and focus areas)
    2. Student Success Metrics (measurable outcomes related to student achievement)
    3. Institutional Values (core beliefs and principles)
    4. AI Alignment Opportunities (specific ways AI could support these priorities)
    5. Risk Factors (potential concerns or challenges with AI implementation)
    
    Provide specific, actionable insights that could guide AI readiness planning.
    Format as JSON with arrays for each category and a confidence score (0-1).
  `;

  try {
    const aiResponse = await runOpenAI(analysisPrompt, {
      model: 'gpt-4o',
      maxTokens: 1000,
      temperature: 0.3
    });

    // Parse AI response as JSON
    const analysis = JSON.parse(aiResponse);
    return {
      strategicPriorities: analysis.strategicPriorities || [],
      studentSuccessMetrics: analysis.studentSuccessMetrics || [],
      institutionalValues: analysis.institutionalValues || [],
      alignmentOpportunities: analysis.alignmentOpportunities || [],
      riskFactors: analysis.riskFactors || [],
      confidenceScore: analysis.confidenceScore || 0.8
    };
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    
    // Fallback analysis
    return {
      strategicPriorities: extractKeywords(text, ['strategic', 'priority', 'goal', 'objective', 'initiative']),
      studentSuccessMetrics: extractKeywords(text, ['student', 'success', 'graduation', 'retention', 'completion']),
      institutionalValues: extractKeywords(text, ['value', 'mission', 'vision', 'principle', 'commitment']),
      alignmentOpportunities: ['AI-enhanced learning analytics', 'Automated student support systems'],
      riskFactors: ['Implementation challenges', 'Resource requirements'],
      confidenceScore: 0.6
    };
  }
}

function extractKeywords(text: string, keywords: string[]): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      found.push(keyword);
    }
  });
  
  return found;
}
