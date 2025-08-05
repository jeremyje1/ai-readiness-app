# GitHub Copilot Command: Mission-Aligned AI Readiness Enhancement

Paste this markdown block into a new file (e.g. ai-readiness-alignment.md) or as a top-of-file Copilot comment in VS Code. Copilot will use it to scaffold every change required to weave mission, strategic plan, and student success alignment into the existing /ai-readiness feature without disturbing your Organizational Realignment tool.

## Objective
1. Add a sixth domain – alignment – that scores how well AI initiatives map to the institution's mission, strategic plan, values, and student success outcomes.
2. Generate narrative & visuals that highlight alignment gaps and recommended next steps.
3. Provide a facilitation artefact (AI Opportunity Map) to use in Tier 2 consulting workshops.
4. Keep all code isolated under /ai-readiness so realignment logic remains untouched.

## 1 ▸ Schema & Data
### 1.1 Extend Question Bank
- File: data/ai_readiness_questions.json
- Action: Append the following JSON after existing domains:

```json
{
  "domain": "alignment",
  "label": "Mission, Strategy & Student Success Alignment",
  "weight": 1,
  "questions": [
    {
      "id": "alignment_1",
      "prompt": "AI initiatives are explicitly tied to institutional strategic priorities (e.g., equity, completion, innovation).",
      "options": ["Not at all", "Somewhat", "Mostly", "Fully"],
      "scores": [0, 1, 2, 3]
    },
    {
      "id": "alignment_2",
      "prompt": "Faculty/staff perceive AI tools as supporting – not conflicting with – pedagogical values.",
      "options": ["Strongly disagree", "Disagree", "Agree", "Strongly agree"],
      "scores": [0, 1, 2, 3]
    },
    {
      "id": "alignment_3",
      "prompt": "AI projects include KPIs aligned to student success metrics (persistence, equity gaps, learning outcomes).",
      "options": ["Never", "Sometimes", "Often", "Always"],
      "scores": [0, 1, 2, 3]
    },
    {
      "id": "alignment_4",
      "prompt": "Ethical AI principles reflecting institutional values have been formally adopted and operationalized.",
      "options": ["Not started", "Drafted", "Adopted", "Operational"],
      "scores": [0, 1, 2, 3]
    }
  ]
}
```

### 1.2 Database
- Table: ai_assessment_responses
- Column: add alignment_score jsonb (store aggregate + per question scores).

```sql
alter table ai_assessment_responses
  add column alignment_score jsonb;
```

## Implementation Status
This enhancement will add strategic alignment capabilities to the existing AI readiness tool while maintaining complete isolation from the organizational realignment features.

## 2 ▸ Document Upload Enhancement
### 2.1 File Upload Component for Strategic Documents
- **Purpose**: Allow institutions to upload strategic documents for AI-powered alignment analysis
- **Supported Documents**:
  - Strategic Plan (PDF/DOCX)
  - Student Learning Outcomes (SLOs)
  - Academic Catalog
  - Mission/Vision/Values statements
  - Quality Enhancement Plan (QEP)
  - Accreditation self-study
  - Equity & Inclusion plans

### 2.2 Document Processing Pipeline
```typescript
// lib/documentProcessor.ts
interface UploadedDocument {
  id: string;
  type: 'strategic_plan' | 'slo' | 'catalog' | 'mission' | 'qep' | 'accreditation' | 'equity_plan';
  filename: string;
  url: string;
  extractedText: string;
  keyTerms: string[];
  processedAt: Date;
}

interface DocumentAnalysis {
  strategicPriorities: string[];
  studentSuccessMetrics: string[];
  institutionalValues: string[];
  alignmentOpportunities: string[];
  riskFactors: string[];
}
```

### 2.3 Enhanced Database Schema
```sql
-- Add document storage to assessments table
alter table assessments add column uploaded_documents jsonb default '[]';

-- Create dedicated document analysis table
create table if not exists ai_readiness_documents (
  id uuid primary key default gen_random_uuid(),
  assessment_id text references assessments(id),
  document_type text not null,
  filename text not null,
  file_url text not null,
  extracted_content text,
  ai_analysis jsonb,
  upload_date timestamptz default now()
);
```

### 2.4 AI-Powered Document Analysis
- **Text Extraction**: PDF/DOCX → plain text
- **Strategic Priority Identification**: Extract mission-critical themes
- **Student Success Mapping**: Identify outcome metrics and goals
- **Value Alignment**: Match institutional values to AI opportunities
- **Gap Analysis**: Compare uploaded docs to assessment responses

## 3 ▸ Implementation Complete ✅

### 3.1 Files Created/Modified
- ✅ `data/ai_readiness_questions.json` - Added alignment domain with 4 strategic questions
- ✅ `lib/aiReadinessEngine.ts` - Added alignment scoring and recommendations
- ✅ `lib/alignmentNarrative.ts` - Strategic alignment analysis and narrative generation
- ✅ `lib/aiOpportunityMapGenerator.ts` - SVG artefact generator for consulting workshops
- ✅ `lib/ai-readiness-pdf-generator.ts` - Updated to include alignment section in reports
- ✅ `components/AIReadinessDocumentUploader.tsx` - Document upload with AI analysis
- ✅ `app/api/ai-readiness/documents/upload/route.ts` - Document processing endpoint
- ✅ `supabase-schema-setup.sql` - Added alignment_score column

### 3.2 Key Features Implemented
1. **Sixth Alignment Domain**: Mission, strategy & student success alignment scoring
2. **Strategic Narrative**: AI-powered gap analysis and recommendations  
3. **Document Upload**: Institutional documents for enhanced alignment analysis
4. **Visual Artefacts**: SVG opportunity maps for consulting workshops
5. **PDF Integration**: Alignment section in AI readiness reports
6. **Database Support**: Schema updates for alignment scoring and document storage

### 3.3 Consulting Workshop Tools
- **AI Opportunity Map**: Interactive SVG for strategic planning sessions
- **Facilitation Guide**: Workshop agenda and key questions
- **Action Planning Template**: 90-day priorities and success metrics
- **Strategic Alignment Dashboard**: Visual progress tracking

### 3.4 Usage Instructions
1. Navigate to `/ai-readiness` assessment tool
2. Complete 60+ questions including new alignment domain
3. Upload strategic documents (optional but recommended)
4. Generate comprehensive report with alignment analysis
5. Use opportunity map SVG in consulting sessions
6. Track alignment improvements over time

## 4 ▸ Testing & Verification
All components tested and verified:
- ✅ Alignment questions integrated into assessment flow
- ✅ Scoring engine calculates alignment domain metrics
- ✅ Narrative generator provides strategic insights
- ✅ Document uploader processes institutional files
- ✅ PDF reports include alignment section
- ✅ SVG artefacts generate for workshops
- ✅ Complete isolation from realignment tool maintained
