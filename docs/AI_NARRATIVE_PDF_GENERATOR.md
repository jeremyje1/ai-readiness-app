# AI-Narrative PDF Generator

This document describes the AI-Narrative PDF Generator implementation for automatically generating executive reports from organizational assessment data.

## 6.1 Serverless Function

### Overview

The AI-Narrative PDF Generator creates comprehensive, professional PDF reports using OpenAI's GPT models to analyze assessment data and generate executive-level insights and recommendations.

### API Endpoint

- **URL**: `/api/report/generate`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Core Libraries

- **pdf-lib**: Advanced PDF document creation and manipulation
- **openai**: GPT-powered content generation
- **svg2pdf.js**: Chart integration (installed for future enhancement)

## Implementation Files

### 1. `/app/api/report/generate/route.ts`

Main API endpoint that handles PDF generation requests.

**Request Body:**

```json
{
  "answers": {
    "organizationalStructure": "Traditional hierarchy",
    "teamCollaboration": 7,
    "digitizationLevel": 6
  },
  "scores": {
    "organizationalHealth": 7.2,
    "efficiencyScore": 6.8,
    "aiReadinessScore": 5.5,
    "overallScore": 6.5,
    "riskLevel": "Medium"
  },
  "options": {
    "includeRecommendations": true,
    "includeCharts": true,
    "templateStyle": "executive",
    "organizationName": "Your Organization",
    "reportTitle": "Assessment Report"
  }
}
```

**Response:**

- Returns a PDF file as binary data
- Content-Type: `application/pdf`
- Includes download filename with timestamp

### 2. `/lib/openai.ts`

OpenAI integration utility for AI content generation.

**Key Functions:**

- `runOpenAI(prompt, options)` - General-purpose AI text generation
- `generateExecutiveSummary(scores)` - Creates executive summary
- `generateRecommendations(answers, scores)` - Generates strategic recommendations

**Features:**

- Configurable models (default: gpt-4o-mini)
- Adjustable temperature and token limits
- Professional business-focused prompts
- Error handling and fallbacks

### 3. `/lib/ai-report-generator.ts`

Advanced PDF generation class with comprehensive formatting and layout.

**Key Features:**

- Multi-page document generation
- Professional typography and layout
- Automatic text wrapping and pagination
- Chart integration capabilities
- Customizable templates and styles
- Footer and header management

## Usage Examples

### Basic Usage

```javascript
const response = await fetch("/api/report/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    answers: assessmentAnswers,
    scores: calculatedScores,
  }),
});

const pdfBlob = await response.blob();
// Handle PDF download or display
```

### Advanced Usage with Options

```javascript
const response = await fetch("/api/report/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    answers: assessmentAnswers,
    scores: calculatedScores,
    options: {
      includeRecommendations: true,
      includeCharts: true,
      templateStyle: "executive",
      organizationName: "Acme Corporation",
      reportTitle: "Q4 2024 Organizational Assessment",
    },
  }),
});
```

## AI Content Generation

### Executive Summary Generation

The AI analyzes assessment data to create:

- Overall organizational health assessment
- Key strengths and improvement areas
- Critical insights from the data
- Executive-level strategic observations

### Recommendations Generation

AI-powered recommendations include:

- Immediate Actions (0-3 months)
- Short-term Initiatives (3-12 months)
- Long-term Strategic Changes (1-3 years)
- Risk Mitigation Strategies
- Success Metrics and KPIs

### Content Quality Features

- Professional business language
- C-level executive appropriate tone
- Actionable insights and recommendations
- Data-driven analysis
- Industry best practices integration

## PDF Features

### Document Structure

1. **Title Page**
   - Report title and organization name
   - Generation date
   - AI-powered branding

2. **Executive Summary**
   - AI-generated narrative analysis
   - Key insights and findings

3. **Performance Metrics**
   - Visual score representations
   - Key performance indicators
   - Benchmark comparisons

4. **Charts and Visualizations**
   - Text-based charts (expandable to SVG)
   - Performance overviews
   - Trend analysis

5. **Strategic Recommendations**
   - Prioritized action items
   - Implementation timelines
   - Expected outcomes

### Formatting Features

- Professional typography (Helvetica family)
- Consistent spacing and margins
- Automatic text wrapping
- Multi-page support
- Page numbering and footers
- Color-coded sections

## Configuration Options

### Template Styles

- **Executive**: Formal, C-level appropriate
- **Detailed**: Comprehensive technical analysis
- **Minimal**: Concise summary format

### Customization Options

- Organization branding
- Custom report titles
- Selective content inclusion
- Chart and visualization preferences

## Testing

### Test Script

`test-ai-pdf-generator.sh` provides comprehensive testing:

```bash
# Make executable
chmod +x test-ai-pdf-generator.sh

# Run tests (requires dev server)
./test-ai-pdf-generator.sh
```

### Test Scenarios

1. Full-featured report generation
2. Minimal configuration testing
3. Error handling validation
4. Performance benchmarking

## Performance Considerations

### AI Generation

- Typical response time: 3-10 seconds
- Token usage: 1,500-3,000 tokens per report
- Model selection impacts speed vs quality

### PDF Generation

- Memory efficient streaming
- Optimized font embedding
- Minimal file size overhead

### Caching Strategies

- Consider caching AI responses for similar inputs
- PDF template reuse for performance
- Background generation for large reports

## Error Handling

### Common Errors

- **Missing OpenAI API Key**: Ensure OPENAI_API_KEY environment variable is set
- **Invalid Input Data**: Validate answers and scores structure
- **AI Generation Timeout**: Implement retry logic with exponential backoff
- **PDF Creation Errors**: Handle memory limits and content overflow

### Error Response Format

```json
{
  "error": "Failed to generate AI narrative PDF",
  "message": "Detailed error description"
}
```

## Security Considerations

### Data Privacy

- Assessment data is processed temporarily
- No persistent storage of user data
- OpenAI API calls follow data retention policies

### API Security

- Rate limiting recommended
- Input validation and sanitization
- Access control implementation

### Content Security

- Professional content filtering
- Bias detection and mitigation
- Appropriate language enforcement

## Dependencies

### Required NPM Packages

```json
{
  "pdf-lib": "^1.17.1",
  "openai": "^5.8.2",
  "svg2pdf.js": "^2.2.1"
}
```

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Future Enhancements

### Planned Features

1. **Advanced Charts**: SVG-based visualizations with svg2pdf integration
2. **Template System**: Multiple report templates and themes
3. **Multi-language Support**: AI-generated content in multiple languages
4. **Interactive Elements**: Clickable sections and navigation
5. **Batch Generation**: Multiple reports from dataset
6. **Custom Branding**: Organization logos and color schemes
7. **Export Formats**: Word, PowerPoint, and HTML exports

### Integration Opportunities

- Power BI dashboard embedding
- SharePoint integration
- Email delivery automation
- Cloud storage synchronization

## Monitoring and Analytics

### Metrics to Track

- Report generation success rate
- AI response times and quality
- PDF file sizes and performance
- User engagement with generated content

### Logging

- Comprehensive error logging
- Performance metrics collection
- Usage analytics and insights

This AI-Narrative PDF Generator provides a powerful, scalable solution for automatically creating professional organizational assessment reports with AI-powered insights and recommendations.
