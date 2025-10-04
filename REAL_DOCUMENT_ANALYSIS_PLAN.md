# Real Document Analysis Implementation Plan

## Current State: Mock Analysis Only

The document analysis is currently hardcoded based on filename patterns:
- "strategic" or "plan" → Strategic Plan (85% confidence)
- "policy" or "governance" → Policy Document (72% confidence)  
- "slo" or "outcome" → Student Learning Outcomes (78% confidence)
- Everything else → General Document (60% confidence)

## Recommended Implementation for Production

### 1. Free Tier / Trial Users
```typescript
// Option A: Show mock analysis with disclaimer
const analysis = await analyzeDocument(file);
return {
  ...analysis,
  isPremiumFeature: true,
  message: "Deep AI analysis available for subscribers"
};

// Option B: Basic keyword analysis only
const basicAnalysis = await performKeywordAnalysis(file);
return {
  documentType: detectDocumentType(keywords),
  keywordCount: keywords.length,
  isPremiumFeature: true
};
```

### 2. Paid Customers - Real Analysis Pipeline

```typescript
const analyzeDocumentReal = async (file: File, userId: string) => {
  // 1. Check subscription status
  const subscription = await checkUserSubscription(userId);
  if (!subscription.active) {
    return getMockAnalysis(file);
  }

  // 2. Upload to secure storage (Supabase Storage or S3)
  const fileUrl = await uploadToStorage(file, userId);

  // 3. Extract text content
  const textContent = await extractText(file); // Use pdf-parse, mammoth, etc.

  // 4. Send to AI for analysis
  const aiAnalysis = await analyzeWithAI(textContent, {
    institutionType: user.institutionType,
    analysisType: 'ai_readiness_document_review'
  });

  // 5. Calculate real confidence score
  const confidence = calculateConfidence({
    documentLength: textContent.length,
    relevantKeywords: aiAnalysis.keywords,
    topicAlignment: aiAnalysis.alignment
  });

  // 6. Store analysis results
  await saveAnalysisResults(userId, file.name, aiAnalysis);

  return {
    documentType: aiAnalysis.documentType,
    keyThemes: aiAnalysis.themes,
    aiReadinessIndicators: aiAnalysis.indicators,
    alignmentOpportunities: aiAnalysis.opportunities,
    confidenceScore: confidence,
    fullAnalysis: aiAnalysis.detailed // Only for paid users
  };
};
```

### 3. AI Analysis Prompt Template

```typescript
const AI_ANALYSIS_PROMPT = `
Analyze this educational institution document for AI readiness assessment.

Document Content:
${textContent}

Please provide:
1. Document Type Classification
2. Key Themes (5-7 main topics)
3. AI Readiness Indicators (specific mentions or implications for AI adoption)
4. Alignment Opportunities (how this document's goals could benefit from AI)
5. Gaps or Concerns (what's missing for AI readiness)
6. Confidence Score (0-100 based on document relevance and completeness)

Focus on educational AI implementation, NIST framework alignment, and institutional readiness.
`;
```

### 4. Text Extraction Libraries

```javascript
// For PDFs
import pdfParse from 'pdf-parse';

// For Word docs  
import mammoth from 'mammoth';

// For general text
import { readFileSync } from 'fs';
```

### 5. Confidence Score Calculation

```typescript
const calculateConfidence = (factors: {
  documentLength: number;
  relevantKeywords: string[];
  topicAlignment: number;
}) => {
  let score = 50; // Base score

  // Document completeness
  if (factors.documentLength > 5000) score += 15;
  else if (factors.documentLength > 2000) score += 10;
  else if (factors.documentLength > 500) score += 5;

  // Keyword relevance
  const aiKeywords = ['technology', 'digital', 'data', 'innovation', 'AI', 'artificial intelligence'];
  const matches = factors.relevantKeywords.filter(kw => 
    aiKeywords.some(ai => kw.toLowerCase().includes(ai))
  ).length;
  score += Math.min(matches * 3, 20);

  // Topic alignment from AI
  score += factors.topicAlignment * 15;

  return Math.min(Math.round(score), 95); // Cap at 95%
};
```

## Cost Considerations

- OpenAI GPT-4 API: ~$0.03 per document analysis
- PDF parsing: Minimal server CPU
- Storage: ~$0.023 per GB/month (S3)
- Processing time: 5-15 seconds per document

## Security Considerations

1. Never store documents permanently without consent
2. Encrypt at rest and in transit
3. Implement virus scanning before processing
4. Rate limit analysis requests
5. Audit trail for document access

## UI Improvements

```typescript
// Show different UI for free vs paid
{isPremiumAnalysis ? (
  <Badge variant="premium">AI-Powered Analysis</Badge>
) : (
  <Badge variant="default">Basic Analysis</Badge>
)}

// Show analysis in progress
{isAnalyzing && (
  <div className="space-y-2">
    <Progress value={progress} />
    <p className="text-sm text-muted-foreground">
      {progress < 30 && "Uploading document..."}
      {progress >= 30 && progress < 60 && "Extracting content..."}
      {progress >= 60 && progress < 90 && "AI analysis in progress..."}
      {progress >= 90 && "Finalizing results..."}
    </p>
  </div>
)}
```

## Immediate Steps to Implement

1. Add subscription check to determine analysis type
2. Implement basic text extraction for paid users
3. Add OpenAI API integration (already have key optional)
4. Update UI to show free vs premium analysis
5. Add proper progress indicators
6. Store analysis results in database
7. Add download report feature for paid users