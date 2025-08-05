import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runOpenAI(prompt: string, options?: {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Model fallback chain - try in order of preference
    const modelChain = [
      options?.model || 'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo'
    ];

    let lastError = null;

    for (const model of modelChain) {
      try {
        console.log(`🤖 Attempting AI generation with ${model}...`);
        
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert organizational analyst and technical writer. Create clear, professional, and actionable content for executive reports.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options?.maxTokens || 2000,
          temperature: options?.temperature || 0.7,
        });

        const response = completion.choices[0]?.message?.content;
        
        if (!response) {
          throw new Error('No response generated from OpenAI');
        }

        console.log(`✅ AI generation successful with ${model}`);
        return response;

      } catch (modelError) {
        console.warn(`⚠️ ${model} failed:`, modelError instanceof Error ? modelError.message : 'Unknown error');
        lastError = modelError;
        
        // Don't try fallbacks for quota/billing errors
        if (modelError instanceof Error && 
           (modelError.message.includes('quota') || 
            modelError.message.includes('billing') ||
            modelError.message.includes('insufficient'))) {
          throw modelError;
        }
        
        continue; // Try next model in chain
      }
    }

    // If all models failed
    throw new Error(`All AI models failed. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate AI content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateExecutiveSummary(scores: any): Promise<string> {
  const prompt = `
    Write a comprehensive 2-page executive summary for an organizational assessment report based on the following scores and data:
    
    ${JSON.stringify(scores, null, 2)}
    
    The summary should include:
    1. Executive Overview (2-3 paragraphs)
    2. Key Performance Indicators and Scores
    3. Critical Findings and Insights
    4. Strategic Recommendations
    5. Implementation Priorities
    6. Expected ROI and Business Impact
    
    Use professional business language appropriate for C-level executives. Focus on actionable insights and clear recommendations.
    Format the content with clear headings and structure suitable for a PDF report.
  `;

  return await runOpenAI(prompt, { maxTokens: 3000 });
}

export async function generateRecommendations(answers: any, scores: any): Promise<string> {
  const prompt = `
    Based on the following assessment answers and calculated scores, generate detailed recommendations:
    
    Assessment Answers:
    ${JSON.stringify(answers, null, 2)}
    
    Calculated Scores:
    ${JSON.stringify(scores, null, 2)}
    
    Provide:
    1. Top 5 Priority Actions
    2. Quick Wins (0-3 months)
    3. Medium-term Initiatives (3-12 months)
    4. Long-term Strategic Changes (1-3 years)
    5. Risk Mitigation Strategies
    
    Each recommendation should include specific actions, expected benefits, and implementation considerations.
  `;

  return await runOpenAI(prompt, { maxTokens: 2500 });
}
