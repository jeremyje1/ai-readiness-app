import { AIReportGenerator } from '@/lib/ai-report-generator';
import { generateComprehensivePDFReport } from '@/lib/comprehensive-pdf-generator';
import { generateEnhancedAIPDFReport } from '@/lib/enhanced-ai-pdf-generator';
import { generateFastEnhancedAIPDFReport } from '@/lib/fast-enhanced-ai-pdf-generator';
import { generateRecommendations, runOpenAI } from '@/lib/openai';
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const { answers, scores, tier = 'express-diagnostic', openEndedResponses = {}, scenarios, options = {} } = await request.json();

    if (!answers || !scores) {
      return NextResponse.json(
        { error: 'Both answers and scores are required' },
        { status: 400 }
      );
    }

    console.log(`Generating comprehensive PDF report for tier: ${tier}...`);

    // Validate OpenAI API key first
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.length < 10) {
      console.error('❌ CRITICAL: OpenAI API key missing or invalid - clients will get fallback reports!');
      throw new Error('OpenAI API key not properly configured');
    }

    // Check if enhanced AI is requested and available
    const useEnhancedAI = options.enhancedAI !== false && process.env.OPENAI_API_KEY;

    if (useEnhancedAI) {
      // Try Enhanced AI with retry mechanism
      let attempts = 0;
      const maxRetries = 2; // Try twice before falling back

      while (attempts < maxRetries) {
        attempts++;
        try {
          console.log(`🚀 Using Fast Enhanced AI PDF Generator with GPT-4o (attempt ${attempts}/${maxRetries})...`);

          // Format data for enhanced AI generator
          const comprehensiveAnalysis = {
            assessmentId: `assessment-${Date.now()}`,
            score: scores.overall || 3.0,
            tier,
            recommendations: [],
            sectionScores: scores,
            assessmentData: answers,
            responses: answers,
            uploadedFiles: [],
            submissionDetails: {
              institution_name: options.organizationName || 'Your Organization',
              organization_type: answers.industry || 'organization',
              submitted_at: new Date().toISOString(),
              total_responses: Object.keys(answers).length
            },
            scenarios,
            openEndedResponses
          };

          // Use fast enhanced AI generator for better performance
          const pdfDoc = options.fullAI === true
            ? await generateEnhancedAIPDFReport(comprehensiveAnalysis)
            : await generateFastEnhancedAIPDFReport(comprehensiveAnalysis);

          const pdfBytes = pdfDoc.output('arraybuffer');

          console.log('✅ Enhanced AI PDF generated successfully!');
          return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="enhanced-ai-report-${Date.now()}.pdf"`,
              'Content-Length': pdfBytes.byteLength.toString(),
            },
          });

        } catch (aiError: any) {
          console.warn(`⚠️ Enhanced AI attempt ${attempts} failed:`, aiError instanceof Error ? aiError.message : 'Unknown error');

          // If it's a quota/billing error, don't retry - fall through to fallback
          if (aiError instanceof Error && (aiError.message?.includes('quota') || aiError.message?.includes('billing') || aiError.message?.includes('insufficient'))) {
            console.error('🔴 OpenAI quota/billing issue - using fallback immediately');
            break;
          }

          // If this was the last attempt, continue to fallback
          if (attempts >= maxRetries) {
            console.error('🔴 All Enhanced AI attempts failed - using fallback');
            break;
          }

          // Wait briefly before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    try {
      // Try the AI report generator first
      const generator = new AIReportGenerator();
      const pdfBytes = await generator.generateReport({
        assessmentData: { answers, scores },
        recommendationsData: options.includeRecommendations ? { recommendations: [] } : undefined,
        format: 'standard',
        includeVisualizations: options.includeCharts ?? true
      });

      // Return AI-generated PDF response
      return new NextResponse(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="ai-narrative-report-${Date.now()}.pdf"`,
          'Content-Length': pdfBytes.length.toString(),
        },
      });

    } catch (aiError: any) {
      console.error('🔴 CRITICAL: All AI generation methods failed - client will receive fallback report!');
      console.error('Error details:', aiError instanceof Error ? aiError.message : 'Unknown error');

      // Log this as a high-priority issue since clients expect AI reports
      console.error('⚠️  CLIENT IMPACT: Delivering basic 49KB report instead of 700KB+ AI-enhanced report');

      // Format data for comprehensive PDF generator
      const comprehensiveAnalysis = {
        assessmentId: `assessment-${Date.now()}`,
        score: scores.overall || 3.0,
        tier,
        recommendations: [],
        sectionScores: scores,
        assessmentData: answers,
        responses: answers,
        uploadedFiles: [],
        submissionDetails: {
          institution_name: options.organizationName || 'Your Organization',
          organization_type: answers.industry || 'organization',
          submitted_at: new Date().toISOString(),
          total_responses: Object.keys(answers).length
        },
        scenarios
      };

      // Use comprehensive PDF generator as fallback
      const pdfBytes = await generateComprehensivePDFReport(comprehensiveAnalysis);

      // Return comprehensive PDF response
      return new NextResponse(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="comprehensive-report-${Date.now()}.pdf"`,
          'Content-Length': pdfBytes.length.toString(),
        },
      });
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Legacy simple implementation for backwards compatibility
async function generateSimplePDF(answers: any, scores: any): Promise<Uint8Array> {
  // Generate AI narrative content
  const narrative = await runOpenAI(`
    Write a comprehensive 2-page executive summary explaining the organizational assessment scores and findings:
    
    Assessment Scores:
    ${JSON.stringify(scores, null, 2)}
    
    Assessment Answers Summary:
    ${JSON.stringify(answers, null, 2)}
    
    The summary should be professional, actionable, and suitable for executive leadership. 
    Include key insights, recommendations, and strategic priorities.
    Format with clear sections and bullet points where appropriate.
  `);

  // Generate additional recommendations
  const recommendations = await generateRecommendations(answers, scores);

  // Create PDF document
  const pdfDoc = await PDFDocument.create();

  // Set document metadata
  pdfDoc.setTitle('Organizational Assessment Report');
  pdfDoc.setAuthor('AI-Powered Analysis System');
  pdfDoc.setSubject('Executive Summary and Recommendations');
  pdfDoc.setCreator('AI Readiness Assessment App');
  pdfDoc.setProducer('AI-Narrative PDF Generator');

  // Add first page
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  // Load fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Define layout constants
  const margin = 50;
  const titleSize = 20;
  const headingSize = 14;
  const bodySize = 11;
  const lineHeight = 15;
  let currentY = height - margin;

  // Add header/title
  page.drawText('AI Readiness Assessment Report', {
    x: margin,
    y: currentY,
    size: titleSize,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.5),
  });
  currentY -= titleSize + 20;

  // Add generation date
  const generationDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  page.drawText(`Generated: ${generationDate}`, {
    x: margin,
    y: currentY,
    size: bodySize,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });
  currentY -= bodySize + 30;

  // Split narrative into lines and add to PDF
  const maxLineWidth = width - (margin * 2);
  const narrativeLines = wrapText(narrative, fontRegular, bodySize, maxLineWidth);

  for (const line of narrativeLines) {
    if (currentY < margin + 50) {
      // Add new page if needed
      const newPage = pdfDoc.addPage();
      currentY = newPage.getSize().height - margin;

      newPage.drawText(line, {
        x: margin,
        y: currentY,
        size: bodySize,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
    } else {
      page.drawText(line, {
        x: margin,
        y: currentY,
        size: bodySize,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
    }
    currentY -= lineHeight;
  }

  // Add scores summary section
  if (currentY < margin + 100) {
    const newPage = pdfDoc.addPage();
    currentY = newPage.getSize().height - margin;

    newPage.drawText('Key Performance Metrics', {
      x: margin,
      y: currentY,
      size: headingSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.5),
    });
  } else {
    currentY -= 30;
    page.drawText('Key Performance Metrics', {
      x: margin,
      y: currentY,
      size: headingSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.5),
    });
  }
  currentY -= headingSize + 15;

  // Add key scores
  const keyScores = extractKeyScores(scores);
  for (const [key, value] of Object.entries(keyScores)) {
    const scoreText = `${key}: ${value}`;
    page.drawText(scoreText, {
      x: margin + 20,
      y: currentY,
      size: bodySize,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });
    currentY -= lineHeight;
  }

  // Add recommendations
  currentY -= 20;
  if (currentY < margin + 100) {
    const newPage = pdfDoc.addPage();
    currentY = newPage.getSize().height - margin;

    newPage.drawText('Strategic Recommendations', {
      x: margin,
      y: currentY,
      size: headingSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.5),
    });
  } else {
    page.drawText('Strategic Recommendations', {
      x: margin,
      y: currentY,
      size: headingSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.5),
    });
  }
  currentY -= headingSize + 15;

  const recommendationLines = wrapText(recommendations, fontRegular, bodySize, maxLineWidth);
  for (const line of recommendationLines) {
    if (currentY < margin + 20) {
      const newPage = pdfDoc.addPage();
      currentY = newPage.getSize().height - margin;

      newPage.drawText(line, {
        x: margin,
        y: currentY,
        size: bodySize,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
    } else {
      page.drawText(line, {
        x: margin,
        y: currentY,
        size: bodySize,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
    }
    currentY -= lineHeight;
  }

  // Save PDF
  return await pdfDoc.save();
}

// Helper function to wrap text to fit within specified width
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Helper function to extract key scores for display
function extractKeyScores(scores: any): Record<string, string> {
  const keyScores: Record<string, string> = {};

  if (scores.organizationalHealth !== undefined) {
    keyScores['Organizational Health'] = `${scores.organizationalHealth}/10`;
  }
  if (scores.efficiencyScore !== undefined) {
    keyScores['Efficiency Score'] = `${scores.efficiencyScore}/10`;
  }
  if (scores.aiReadinessScore !== undefined) {
    keyScores['AI Readiness'] = `${scores.aiReadinessScore}/10`;
  }
  if (scores.riskLevel !== undefined) {
    keyScores['Risk Level'] = scores.riskLevel;
  }
  if (scores.overallScore !== undefined) {
    keyScores['Overall Score'] = `${scores.overallScore}/10`;
  }

  return keyScores;
}
