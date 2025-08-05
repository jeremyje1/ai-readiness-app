#!/bin/bash

# Test script for Enhanced AI PDF Generator
echo "Testing Enhanced AI PDF Generator with GPT-4o..."

# Comprehensive test data
ENHANCED_TEST_DATA='{
  "answers": {
    "span_control_1": 2.5,
    "span_control_2": 2.0,
    "culture_1": 4.2,
    "culture_2": 3.8,
    "tech_fit_1": 1.8,
    "tech_fit_2": 2.4,
    "readiness_1": 2.2,
    "readiness_2": 3.9,
    "industry": "higher-education",
    "company_size": "5000-10000",
    "segment": "public-university"
  },
  "scores": {
    "overall": 2.85,
    "organizational_structure": 2.25,
    "culture": 4.0,
    "technology": 2.1,
    "change_readiness": 3.05
  },
  "tier": "express-diagnostic",
  "openEndedResponses": {
    "challenges": "Our main challenges include outdated technology infrastructure, resistance to change from long-tenured staff, and budget constraints limiting our ability to invest in new systems. We also struggle with siloed departments that dont communicate effectively.",
    "priorities": "Top priorities are modernizing our student information system, improving interdepartmental collaboration, implementing data-driven decision making, and developing our staff digital literacy skills.",
    "vision": "We envision becoming a digitally-enabled institution that provides seamless, personalized experiences for students while maintaining our commitment to academic excellence and accessibility.",
    "strategic_goals": "Increase student retention by 15%, reduce administrative processing time by 40%, improve staff satisfaction scores, and establish ourselves as a regional leader in educational innovation."
  },
  "orgChart": {
    "levels": 4,
    "departments": 12,
    "span_of_control": "high",
    "structure_type": "traditional_hierarchy"
  },
  "scenarios": [
    {
      "title": "Technology Modernization",
      "description": "Comprehensive upgrade of IT infrastructure and systems",
      "cost": "$2.5M",
      "timeline": "18 months"
    }
  ],
  "options": {
    "enhancedAI": true,
    "organizationName": "Metropolitan State University",
    "includeRecommendations": true,
    "includeCharts": true,
    "templateStyle": "executive"
  }
}'

echo "1. Testing Enhanced AI PDF generation with comprehensive data..."
curl -X POST http://localhost:3001/api/report/generate \
  -H "Content-Type: application/json" \
  -d "$ENHANCED_TEST_DATA" \
  -o "test-enhanced-ai-report.pdf" \
  -w "HTTP Status: %{http_code}, Download Size: %{size_download} bytes, Total Time: %{time_total}s\n"

if [ -f "test-enhanced-ai-report.pdf" ]; then
  echo "✅ Enhanced AI PDF generated successfully: test-enhanced-ai-report.pdf"
  echo "File size: $(du -h test-enhanced-ai-report.pdf | cut -f1)"
  echo "File details: $(ls -la test-enhanced-ai-report.pdf)"
else
  echo "❌ Enhanced AI PDF generation failed"
fi

echo ""

# Test fallback behavior with AI disabled
FALLBACK_TEST_DATA='{
  "answers": {
    "span_control_1": 3.0,
    "culture_1": 3.5,
    "tech_fit_1": 2.5
  },
  "scores": {
    "overall": 3.0,
    "organizational_structure": 3.0
  },
  "tier": "express-diagnostic",
  "options": {
    "enhancedAI": false,
    "organizationName": "Test Institution"
  }
}'

echo "2. Testing fallback to comprehensive PDF (AI disabled)..."
curl -X POST http://localhost:3001/api/report/generate \
  -H "Content-Type: application/json" \
  -d "$FALLBACK_TEST_DATA" \
  -o "test-fallback-report.pdf" \
  -w "HTTP Status: %{http_code}, Download Size: %{size_download} bytes\n"

if [ -f "test-fallback-report.pdf" ]; then
  echo "✅ Fallback PDF generated successfully: test-fallback-report.pdf"
  echo "File size: $(du -h test-fallback-report.pdf | cut -f1)"
else
  echo "❌ Fallback PDF generation failed"
fi

echo ""
echo "Enhanced AI PDF Generator tests completed!"
echo ""
echo "File comparison:"
echo "Enhanced AI Report: $(ls -lah test-enhanced-ai-report.pdf 2>/dev/null || echo 'Not generated')"
echo "Fallback Report:    $(ls -lah test-fallback-report.pdf 2>/dev/null || echo 'Not generated')"
