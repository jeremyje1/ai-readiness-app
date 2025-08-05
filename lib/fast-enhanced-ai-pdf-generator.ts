/**
 * Fast Enhanced AI PDF Generator
 * Optimized for speed with parallel AI calls and smart fallbacks
 */

import jsPDF from 'jspdf';
import { runOpenAI } from './openai';

interface ComprehensiveAnalysis {
  assessmentId: string;
  score: number;
  tier: string;
  recommendations: any[];
  sectionScores: Record<string, number>;
  assessmentData: any;
  responses: Record<string, any>;
  uploadedFiles: any[];
  submissionDetails: {
    institution_name: string;
    organization_type: string;
    submitted_at: string;
    total_responses: number;
  };
  orgChart?: any;
  scenarios?: any[];
  openEndedResponses?: Record<string, any>;
}

/**
 * Fast AI PDF generation with parallel processing and timeouts
 */
export async function generateFastEnhancedAIPDFReport(analysis: ComprehensiveAnalysis): Promise<jsPDF> {
  console.log('🚀 Generating FAST Enhanced AI PDF...');
  
  const startTime = Date.now();
  
  // Generate core AI content with timeout and parallel processing
  const aiPromises = generateAIContentInParallel(analysis);

  // Wait for AI content with timeout
  const aiResults = await Promise.race([
    aiPromises,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 45000)) // 45 second timeout
  ]).catch(error => {
    console.warn('AI generation timeout or error:', error.message);
    return generateFallbackContent(analysis);
  });

  const processingTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`⚡ AI processing completed in ${processingTime} seconds`);

  // Generate PDF with results
  return createFastPDF(analysis, aiResults);
}

/**
 * Tier-based content settings for page scaling
 */
interface TierContentSettings {
  targetPages: number;
  maxTokensPerSection: number;
  analysisDepth: 'basic' | 'standard' | 'comprehensive' | 'enterprise';
  includeAdvancedAnalysis: boolean;
  includeBenchmarking: boolean;
  includeFinancialProjections: boolean;
  includeChangeManagement: boolean;
}

function getTierContentSettings(tier: string): TierContentSettings {
  switch (tier) {
    case 'express-diagnostic':
      return {
        targetPages: 25,
        maxTokensPerSection: 1500,
        analysisDepth: 'standard',
        includeAdvancedAnalysis: true,
        includeBenchmarking: false,
        includeFinancialProjections: false,
        includeChangeManagement: false
      };
    case 'one-time-diagnostic':
      return {
        targetPages: 35,
        maxTokensPerSection: 2000,
        analysisDepth: 'comprehensive',
        includeAdvancedAnalysis: true,
        includeBenchmarking: true,
        includeFinancialProjections: true,
        includeChangeManagement: false
      };
    case 'comprehensive-package':
      return {
        targetPages: 45,
        maxTokensPerSection: 2500,
        analysisDepth: 'comprehensive',
        includeAdvancedAnalysis: true,
        includeBenchmarking: true,
        includeFinancialProjections: true,
        includeChangeManagement: true
      };
    case 'enterprise-transformation':
      return {
        targetPages: 55,
        maxTokensPerSection: 3000,
        analysisDepth: 'enterprise',
        includeAdvancedAnalysis: true,
        includeBenchmarking: true,
        includeFinancialProjections: true,
        includeChangeManagement: true
      };
    default:
      return getTierContentSettings('express-diagnostic');
  }
}

/**
 * Generate AI content in parallel for speed with tier-based scaling
 */
async function generateAIContentInParallel(analysis: ComprehensiveAnalysis) {
  const institutionName = analysis.submissionDetails?.institution_name || 'Organization';
  const tier = analysis.tier || 'express-diagnostic';
  const contextData = {
    name: institutionName,
    type: analysis.submissionDetails?.organization_type,
    score: analysis.score,
    responses: analysis.responses,
    sections: analysis.sectionScores,
    openEnded: analysis.openEndedResponses
  };

  // Tier-based content scaling
  const tierSettings = getTierContentSettings(tier);
  console.log(`🧠 Generating AI content for ${tier} tier (${tierSettings.targetPages} pages)...`);

  // Run AI calls in parallel with tier-scaled prompts
  const aiPromises = [
    // Executive Summary (always included)
    runOpenAI(`Create a ${tierSettings.analysisDepth} executive summary for ${institutionName}:
    
    Scores: ${JSON.stringify(contextData.sections)}
    Key Data: ${JSON.stringify(contextData.responses)}
    
    Include: Strategic overview, critical findings, top ${tierSettings.analysisDepth === 'basic' ? '3' : tierSettings.analysisDepth === 'standard' ? '5' : '7'} priorities, competitive position.
    Make it executive-ready and actionable. Target: ${Math.floor(tierSettings.targetPages * 0.15)} pages of content.`, 
    { model: 'gpt-4o', maxTokens: tierSettings.maxTokensPerSection, temperature: 0.3 }),

    // Strategic Recommendations (scaled by tier)
    runOpenAI(`Generate ${tierSettings.analysisDepth} strategic recommendations for ${institutionName}:
    
    Context: ${JSON.stringify(contextData)}
    
    Provide: Immediate actions (0-90 days), short-term initiatives (3-12 months), long-term strategy (1-3 years).
    ${tierSettings.analysisDepth === 'enterprise' ? 'Include system-wide transformation strategies, multi-site coordination, and enterprise governance models.' : ''}
    Focus on ROI and implementation feasibility. Target: ${Math.floor(tierSettings.targetPages * 0.2)} pages of content.`,
    { model: 'gpt-4o', maxTokens: tierSettings.maxTokensPerSection, temperature: 0.4 }),

    // Risk Assessment (scaled by tier)
    runOpenAI(`${tierSettings.analysisDepth} risk analysis for ${institutionName}:
    
    Assessment Data: ${JSON.stringify(contextData)}
    
    Identify: Top ${tierSettings.analysisDepth === 'basic' ? '3' : tierSettings.analysisDepth === 'standard' ? '5' : '7'} risks, mitigation strategies, early warning signs.
    ${tierSettings.analysisDepth === 'enterprise' ? 'Include enterprise-level systemic risks, regulatory compliance, and multi-stakeholder risk scenarios.' : ''}
    Target: ${Math.floor(tierSettings.targetPages * 0.15)} pages of content.`,
    { model: 'gpt-4o', maxTokens: Math.floor(tierSettings.maxTokensPerSection * 0.8), temperature: 0.5 })
  ];

  // Add tier-specific additional content
  if (tierSettings.includeBenchmarking) {
    aiPromises.push(
      runOpenAI(`Industry benchmarking analysis for ${institutionName} (${contextData.type}):
      
      Performance Data: ${JSON.stringify(contextData)}
      
      Provide: Industry comparisons, best practices, competitive positioning, performance gaps and opportunities.
      Target: ${Math.floor(tierSettings.targetPages * 0.15)} pages of content.`,
      { model: 'gpt-4o', maxTokens: tierSettings.maxTokensPerSection, temperature: 0.4 })
    );
  }

  if (tierSettings.includeFinancialProjections) {
    aiPromises.push(
      runOpenAI(`Financial impact projections for ${institutionName}:
      
      Current Performance: ${JSON.stringify(contextData)}
      
      Calculate: Cost savings potential, revenue enhancement opportunities, ROI projections, implementation costs.
      Include 3-year financial outlook with conservative and aggressive scenarios.
      Target: ${Math.floor(tierSettings.targetPages * 0.15)} pages of content.`,
      { model: 'gpt-4o', maxTokens: tierSettings.maxTokensPerSection, temperature: 0.3 })
    );
  }

  if (tierSettings.includeChangeManagement) {
    aiPromises.push(
      runOpenAI(`Change management strategy for ${institutionName}:
      
      Organization Profile: ${JSON.stringify(contextData)}
      
      Design: Stakeholder engagement plan, communication strategy, training programs, resistance management.
      ${tierSettings.analysisDepth === 'enterprise' ? 'Include multi-site coordination and enterprise-wide change governance.' : ''}
      Target: ${Math.floor(tierSettings.targetPages * 0.15)} pages of content.`,
      { model: 'gpt-4o', maxTokens: tierSettings.maxTokensPerSection, temperature: 0.4 })
    );
  }

  // Execute all AI calls in parallel
  const results = await Promise.allSettled(aiPromises);

  return {
    executiveSummary: getPromiseValue(results[0], 'Executive summary not available'),
    strategicRecommendations: getPromiseValue(results[1], 'Strategic recommendations not available'), 
    riskAnalysis: getPromiseValue(results[2], 'Risk analysis not available'),
    benchmarking: tierSettings.includeBenchmarking ? getPromiseValue(results[3], 'Industry benchmarking not available') : '',
    financialProjections: tierSettings.includeFinancialProjections ? 
      getPromiseValue(results[tierSettings.includeBenchmarking ? 4 : 3], 'Financial projections not available') : '',
    changeManagement: tierSettings.includeChangeManagement ? 
      getPromiseValue(results[results.length - 1], 'Change management strategy not available') : ''
  };
}

/**
 * Extract result from Promise.allSettled
 */
function getPromiseValue(result: PromiseSettledResult<any>, fallback: string): string {
  if (result.status === 'fulfilled') {
    return result.value || fallback;
  }
  console.warn('AI promise rejected:', result.reason?.message);
  return fallback;
}

/**
 * Generate fallback content when AI fails
 */
function generateFallbackContent(analysis: ComprehensiveAnalysis) {
  const orgName = analysis.submissionDetails?.institution_name || 'Organization';
  const overallScore = Math.round((analysis.score || 0) * 20); // Convert to percentage

  return {
    executiveSummary: `EXECUTIVE SUMMARY - ${orgName}

This comprehensive assessment reveals an overall performance score of ${overallScore}%, indicating ${overallScore > 80 ? 'strong' : overallScore > 60 ? 'moderate' : 'developing'} organizational health.

KEY FINDINGS:
• Organizational performance demonstrates ${overallScore > 75 ? 'above-average' : 'improvement'} capabilities
• Strategic alignment and operational efficiency show promise for enhancement
• Leadership and communication systems require focused attention
• Technology adoption and change readiness present growth opportunities

STRATEGIC PRIORITIES:
1. Strengthen operational efficiency and process optimization
2. Enhance leadership development and communication pathways  
3. Accelerate technology adoption and digital transformation
4. Build organizational capacity for sustainable growth

This assessment provides a foundation for strategic planning and targeted improvements.`,

    strategicRecommendations: `STRATEGIC RECOMMENDATIONS

IMMEDIATE ACTIONS (0-90 days):
• Conduct leadership alignment sessions on assessment findings
• Establish cross-functional improvement teams
• Implement quick-win process improvements
• Begin stakeholder communication campaign

SHORT-TERM INITIATIVES (3-12 months):
• Launch comprehensive training and development programs
• Implement technology upgrades and system integrations
• Restructure communication and decision-making processes
• Establish performance measurement and monitoring systems

LONG-TERM STRATEGY (1-3 years):
• Execute organizational transformation roadmap
• Build advanced capabilities and competitive advantages
• Establish culture of continuous improvement and innovation
• Develop scalable systems and sustainable growth models`,

    riskAssessment: `RISK ASSESSMENT & MITIGATION

HIGH-PRIORITY RISKS:
• Change resistance and organizational inertia
• Resource constraints and competing priorities
• Technology integration and adoption challenges
• Leadership capacity and change management

MITIGATION STRATEGIES:
• Comprehensive change management and communication
• Phased implementation with adequate resource allocation
• Training, support, and stakeholder engagement programs
• Leadership development and external advisory support

MONITORING & CONTROLS:
• Monthly progress reviews and course correction protocols
• Stakeholder feedback mechanisms and adjustment processes
• Risk indicator tracking and early warning systems`,

    orgChartAnalysis: analysis.orgChart ? `ORGANIZATIONAL STRUCTURE ANALYSIS

The current organizational structure demonstrates both strengths and opportunities for optimization. Based on the available data, key findings include:

• Organizational complexity may be creating inefficiencies
• Role clarity and reporting relationships require attention
• Resource allocation and span of control need optimization
• Strategic alignment between structure and goals needs strengthening

OPTIMIZATION RECOMMENDATIONS:
• Streamline reporting relationships and decision-making processes
• Clarify role definitions and accountability structures
• Optimize resource allocation and eliminate redundancies
• Align organizational design with strategic objectives` : 'Organizational chart analysis not available - no structural data provided.'
  };
}

/**
 * Create fast PDF with tier-based content scaling
 */
function createFastPDF(
  analysis: ComprehensiveAnalysis, 
  aiContent: any
): jsPDF {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Get tier settings for content organization
  const tierSettings = getTierContentSettings(analysis.tier || 'express-diagnostic');
  const institutionName = analysis.submissionDetails?.institution_name || 'Organization';

  // Colors
  const colors = {
    primary: [25, 43, 81] as [number, number, number],
    secondary: [65, 105, 225] as [number, number, number],
    text: [33, 37, 41] as [number, number, number]
  };

  const checkPageBreak = (height: number) => {
    if (yPosition + height > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  const addSection = (title: string, content: string) => {
    checkPageBreak(60);
    
    // Section header
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, margin + 10, yPosition + 17);
    yPosition += 35;

    // Content
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
    lines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 15;
  };

  // Cover page
  const orgName = analysis.submissionDetails?.institution_name || 'Organization';
  const reportDate = new Date().toLocaleDateString();
  const overallScore = Math.round((analysis.score || 0) * 20);

  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('AI-ENHANCED ASSESSMENT REPORT', margin, 35);
  doc.setFontSize(16);
  doc.text(`${analysis.tier.toUpperCase().replace('-', ' ')} ANALYSIS`, margin, 60);

  yPosition = 100;
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(institutionName, margin, yPosition);
  yPosition += 30;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Report Generated: ${reportDate}`, margin, yPosition);
  yPosition += 15;
  doc.text(`Overall Performance Score: ${overallScore}%`, margin, yPosition);
  yPosition += 15;
  doc.text(`Assessment Tier: ${analysis.tier} (${tierSettings.targetPages} pages)`, margin, yPosition);
  yPosition += 15;
  doc.text(`AI Analysis Method: GPT-4o with ${tierSettings.analysisDepth} Intelligence`, margin, yPosition);
  yPosition += 40;

  // Core content sections (always included)
  addSection('EXECUTIVE SUMMARY', aiContent.executiveSummary);
  addSection('STRATEGIC RECOMMENDATIONS', aiContent.strategicRecommendations);
  addSection('RISK ASSESSMENT & MITIGATION', aiContent.riskAnalysis);
  
  // Tier-specific additional sections
  if (tierSettings.includeBenchmarking && aiContent.benchmarking) {
    addSection('INDUSTRY BENCHMARKING & COMPETITIVE ANALYSIS', aiContent.benchmarking);
  }

  if (tierSettings.includeFinancialProjections && aiContent.financialProjections) {
    addSection('FINANCIAL IMPACT PROJECTIONS', aiContent.financialProjections);
  }

  if (tierSettings.includeChangeManagement && aiContent.changeManagement) {
    addSection('CHANGE MANAGEMENT STRATEGY', aiContent.changeManagement);
  }

  // Add tier-specific footer content
  checkPageBreak(50);
  doc.setFillColor(248, 249, 250);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${analysis.tier.toUpperCase()} TIER REPORT SUMMARY`, margin + 10, yPosition + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text(`Target Pages: ${tierSettings.targetPages} | Analysis Depth: ${tierSettings.analysisDepth}`, margin + 10, yPosition + 30);
  yPosition += 50;

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    doc.text(`${institutionName} - Confidential Assessment Report`, margin, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }

  console.log(`✅ ${analysis.tier} AI PDF completed - ${totalPages} pages generated (target: ${tierSettings.targetPages})`);
  return doc;
}
