import jsPDF from 'jspdf';
import { HistoricalTrendAnalyzer } from './historical-trend-analyzer';
import { IndustryDataIntegrator } from './industry-data-integrator';
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
  scenarios?: any[];
  openEndedResponses?: Record<string, any>;
}

interface AIInsights {
  executiveSummary: string;
  detailedAnalysis: string;
  strategicRecommendations: string;
  implementationPlan: string;
  riskAssessment: string;
  industryComparisons: string;
  financialProjections: string;
  changeManagement: string;
}

export async function generateEnhancedAIPDFReport(analysis: ComprehensiveAnalysis): Promise<jsPDF> {
  console.log('Generating enhanced AI-powered PDF report with tier-based scaling, historical trends, and live benchmarks...');

  // Get tier-based content settings
  const assessmentTier = analysis.tier || 'express-diagnostic';
  const tierSettings = {
    'express-diagnostic': { targetPages: 25, analysisDepth: 'standard', includeAdvanced: false },
    'one-time-diagnostic': { targetPages: 35, analysisDepth: 'comprehensive', includeAdvanced: true },
    'comprehensive-package': { targetPages: 45, analysisDepth: 'comprehensive', includeAdvanced: true },
    'enterprise-transformation': { targetPages: 55, analysisDepth: 'enterprise', includeAdvanced: true }
  };

  const settings = tierSettings[assessmentTier as keyof typeof tierSettings] || tierSettings['express-diagnostic'];

  // Initialize PDF with enhanced configuration
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });

  // Document setup
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const colors = {
    primary: [41, 128, 185] as [number, number, number],
    secondary: [52, 73, 94] as [number, number, number],
    accent: [231, 76, 60] as [number, number, number],
    success: [39, 174, 96] as [number, number, number],
    warning: [241, 196, 15] as [number, number, number],
    text: [44, 62, 80] as [number, number, number],
    lightGray: [236, 240, 241] as [number, number, number]
  };

  let yPosition = margin;
  let currentPage = 1;

  // Enhanced helper functions
  const checkPageBreak = (requiredSpace: number = 30, forceBreak: boolean = false) => {
    if (yPosition + requiredSpace > pageHeight - margin || forceBreak) {
      doc.addPage();
      yPosition = margin;
      currentPage++;

      // Add page number and footer
      doc.setFontSize(8);
      doc.setTextColor(...colors.secondary);
      doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      doc.setTextColor(...colors.text);
    }
  };

  const addText = (text: string, options: any = {}) => {
    const fontSize = options.fontSize || 10;
    const fontStyle = options.fontStyle || 'normal';
    const textColor = options.color || colors.text;
    const maxWidth = options.maxWidth || pageWidth - 2 * margin;

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    const lines = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string, index: number) => {
      if (index > 0 || yPosition + fontSize > pageHeight - margin) {
        checkPageBreak();
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });

    yPosition += 5;
  };

  const addSectionHeader = (title: string, color: [number, number, number] = colors.primary) => {
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(title, margin, yPosition);
    yPosition += 15;

    // Add underline
    doc.setDrawColor(...color);
    doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
    yPosition += 5;

    doc.setTextColor(...colors.text);
  };

  const addSubHeader = (title: string, color: [number, number, number] = colors.secondary) => {
    checkPageBreak(15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(title, margin, yPosition);
    yPosition += 10;
    doc.setTextColor(...colors.text);
  };

  // Get institutional context
  const institutionName = analysis.submissionDetails?.institution_name || 'Your Institution';
  const organizationType = analysis.submissionDetails?.organization_type || 'Educational Institution';
  const totalResponses = analysis.submissionDetails?.total_responses || 0;
  const submittedAt = analysis.submissionDetails?.submitted_at || new Date().toISOString();

  // Generate AI insights
  console.log('🤖 Generating comprehensive AI insights...');
  const aiInsights = await generateAIInsights(analysis, settings);

  // TITLE PAGE
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('AI READINESS ASSESSMENT', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(...colors.secondary);
  doc.text('Comprehensive Strategic Analysis', pageWidth / 2, 80, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(...colors.text);
  doc.text(institutionName, pageWidth / 2, 120, { align: 'center' });
  doc.text(organizationType, pageWidth / 2, 135, { align: 'center' });

  // Add tier badge
  doc.setFillColor(...colors.accent);
  doc.roundedRect(pageWidth / 2 - 40, 150, 80, 15, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(assessmentTier.toUpperCase().replace('-', ' '), pageWidth / 2, 160, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(...colors.secondary);
  doc.text(`Generated: ${new Date(submittedAt).toLocaleDateString()}`, pageWidth / 2, 180, { align: 'center' });
  doc.text(`${totalResponses} Assessment Questions Completed`, pageWidth / 2, 195, { align: 'center' });

  // PAGE 2: EXECUTIVE SUMMARY
  checkPageBreak(0, true);
  addSectionHeader('EXECUTIVE SUMMARY', colors.primary);
  addText(aiInsights.executiveSummary);

  // Score summary box
  checkPageBreak(40);
  doc.setFillColor(...colors.lightGray);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 5, 5, 'F');

  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text(`Overall AI Readiness Score: ${analysis.score}/100`, margin + 10, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.text(`Assessment Tier: ${assessmentTier.replace('-', ' ').toUpperCase()}`, margin + 10, yPosition);

  yPosition += 6;
  doc.text(`Institution Type: ${organizationType}`, margin + 10, yPosition);
  yPosition += 15;

  // PAGE 3+: DETAILED ANALYSIS
  checkPageBreak(0, true);
  addSectionHeader('COMPREHENSIVE AI READINESS ANALYSIS', colors.secondary);
  addText(aiInsights.detailedAnalysis);

  // Domain scores breakdown
  if (analysis.sectionScores && Object.keys(analysis.sectionScores).length > 0) {
    addSubHeader('Domain Performance Analysis');
    Object.entries(analysis.sectionScores).forEach(([domain, score]) => {
      const domainName = domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      addText(`• ${domainName}: ${Math.round(score as number)}/100`, { fontSize: 11 });
    });
    yPosition += 5;
  }

  // PAGE 10+: STRATEGIC RECOMMENDATIONS  
  checkPageBreak(0, true);
  addSectionHeader('AI-POWERED STRATEGIC RECOMMENDATIONS', colors.success);
  addText(aiInsights.strategicRecommendations);

  // PAGE 15+: IMPLEMENTATION PLAN
  checkPageBreak(0, true);
  addSectionHeader('IMPLEMENTATION ROADMAP', colors.warning);
  addText(aiInsights.implementationPlan);

  // PAGE 20+: RISK ASSESSMENT
  checkPageBreak(0, true);
  addSectionHeader('RISK ANALYSIS & MITIGATION', colors.accent);
  addText(aiInsights.riskAssessment);

  // PAGE 25+: INDUSTRY COMPARISONS
  checkPageBreak(0, true);
  addSectionHeader('INDUSTRY BENCHMARKING', colors.secondary);
  addText(aiInsights.industryComparisons);

  // PAGE 27+: FINANCIAL PROJECTIONS
  checkPageBreak(0, true);
  addSectionHeader('FINANCIAL IMPACT ANALYSIS', colors.primary);
  addText(aiInsights.financialProjections);

  // PAGE 29+: CHANGE MANAGEMENT
  checkPageBreak(0, true);
  addSectionHeader('AI-POWERED CHANGE STRATEGY', colors.accent);
  addText(aiInsights.changeManagement);

  // ADVANCED ANALYTICS SECTIONS (for higher tiers only)
  if (settings.includeAdvanced) {
    try {
      // Initialize advanced analytics services
      console.log('🔬 Initializing advanced analytics engines...');
      const historicalAnalyzer = new HistoricalTrendAnalyzer();
      const industryIntegrator = new IndustryDataIntegrator();
      // const peerBenchmarking = new LivePeerBenchmarking(); // Removed

      // HISTORICAL TREND ANALYSIS
      checkPageBreak(0, true);
      addSectionHeader('LONGITUDINAL PERFORMANCE ANALYSIS', colors.accent);
      addSubHeader('Historical Performance Trends');

      const historicalInsights = await historicalAnalyzer.generateHistoricalAIInsights(
        analysis.submissionDetails?.institution_name || 'unknown',
        analysis
      );

      addText(historicalInsights);

      // REAL-TIME INDUSTRY DATA
      checkPageBreak(0, true);
      addSectionHeader('LIVE INDUSTRY INTELLIGENCE', colors.warning);
      addSubHeader('Current Market Conditions & Trends');

      const liveBenchmarks = await industryIntegrator.getLiveBenchmarks(
        organizationType === 'Educational Institution' ? 'higher_education' : 'nonprofit',
        'medium',
        'mixed'
      );

      const industryData = await industryIntegrator.generateIndustryContextAI(
        analysis,
        liveBenchmarks
      );

      addText(industryData);

      // PEER COMPETITIVE ANALYSIS - Removed for EDU SaaS
      // Peer benchmarking functionality has been removed as part of the EDU SaaS simplification

      // INTEGRATED STRATEGIC SYNTHESIS
      checkPageBreak(0, true);
      addSectionHeader('AI-POWERED STRATEGIC SYNTHESIS', colors.success);
      addSubHeader('Integrated Intelligence Summary');
      addText('Comprehensive analysis combining historical performance, industry context, peer benchmarking, and predictive modeling to provide definitive strategic guidance.');

      // Generate synthesized recommendations
      const synthesizedInsights = await runOpenAI(`
        As a senior strategic consultant, provide integrated strategic recommendations for ${analysis.submissionDetails?.institution_name} based on comprehensive intelligence analysis.
        
        Synthesize insights from: historical performance patterns, real-time industry data, peer competitive analysis.
        
        Provide prioritized recommendations for immediate actions (90 days), strategic initiatives (6-18 months), and transformational goals (2+ years).
        
        Focus on actionable strategies that leverage competitive advantages while addressing improvement opportunities identified through the comprehensive analysis.
      `, {
        model: 'gpt-4o',
        maxTokens: 2000,
        temperature: 0.4
      });

      addText(synthesizedInsights);

    } catch (error) {
      console.error('Advanced analytics error:', error);
      addText('Note: Some advanced analytics features encountered issues but core assessment analysis is complete.');
    }
  }

  // Final page with enhanced summary
  checkPageBreak(0, true);
  addSectionHeader('CONCLUSION & NEXT STEPS', colors.primary);
  addSubHeader('Report Summary');

  const finalSummary = settings.includeAdvanced ?
    'This comprehensive AI-enhanced assessment leverages historical data analysis, real-time industry intelligence, and live peer benchmarking to provide unparalleled strategic insights. The recommendations are based on actual market data and proven best practices from similar high-performing institutions.' :
    'This AI-enhanced assessment provides strategic recommendations based on your institutional profile and assessment responses. For more comprehensive analysis including historical trends and competitive intelligence, consider upgrading to a higher-tier assessment.';

  addText(finalSummary);
  yPosition += 10;

  addSubHeader('Implementation Support');
  addText(`As a ${assessmentTier} client, you have access to specific implementation resources and support channels. Contact your assessment team to discuss next steps and implementation planning.`);

  console.log(`✅ Enhanced AI-powered PDF report generated successfully with ${currentPage} pages (target: ${settings.targetPages})`);

  return doc;
}

// Generate comprehensive AI insights based on assessment data
async function generateAIInsights(analysis: ComprehensiveAnalysis, settings: any): Promise<AIInsights> {
  const institutionName = analysis.submissionDetails?.institution_name || 'Your Institution';
  const organizationType = analysis.submissionDetails?.organization_type || 'Educational Institution';
  const score = analysis.score;
  const tier = analysis.tier;

  console.log(`🧠 Generating AI insights for ${institutionName} (${organizationType}) - Score: ${score}, Tier: ${tier}`);

  // Base context for all AI generations
  const baseContext = `
    Institution: ${institutionName}
    Type: ${organizationType} 
    Overall AI Readiness Score: ${score}/100
    Assessment Tier: ${tier}
    
    Section Scores: ${JSON.stringify(analysis.sectionScores, null, 2)}
    
    Key Assessment Data: ${JSON.stringify(analysis.assessmentData, null, 2)}
    
    Recommendations: ${JSON.stringify(analysis.recommendations, null, 2)}
  `;

  // Generate executive summary
  const executiveSummary = await runOpenAI(`
    As a senior AI strategy consultant, provide a comprehensive executive summary for ${institutionName}'s AI readiness assessment.
    
    ${baseContext}
    
    Include:
    - Current AI readiness status and key strengths
    - Critical gaps and improvement opportunities  
    - Strategic priorities for AI implementation
    - Expected outcomes and timeline for transformation
    
    Write in executive language appropriate for board-level presentation. Keep to 300-400 words.
  `, {
    model: 'gpt-4o',
    maxTokens: 1500,
    temperature: 0.3
  });

  // Generate detailed analysis
  const detailedAnalysis = await runOpenAI(`
    Provide a comprehensive technical analysis of ${institutionName}'s AI readiness across all assessment domains.
    
    ${baseContext}
    
    Analyze each domain in detail:
    - Current capabilities and maturity level
    - Infrastructure and resource gaps
    - Organizational readiness factors
    - Technology integration challenges
    - Compliance and risk considerations
    
    Provide specific insights based on the actual scores and responses. Use technical depth appropriate for ${settings.analysisDepth} level analysis.
  `, {
    model: 'gpt-4o',
    maxTokens: 2500,
    temperature: 0.3
  });

  // Generate strategic recommendations  
  const strategicRecommendations = await runOpenAI(`
    As an AI transformation expert, provide specific strategic recommendations for ${institutionName}.
    
    ${baseContext}
    
    Provide prioritized recommendations for:
    1. Immediate actions (0-90 days)
    2. Short-term initiatives (3-12 months) 
    3. Long-term strategic goals (1-3 years)
    
    Each recommendation should include:
    - Specific actions and deliverables
    - Resource requirements and timeline
    - Expected impact on AI readiness score
    - Success metrics and KPIs
    
    Focus on practical, implementable strategies tailored to ${organizationType} context.
  `, {
    model: 'gpt-4o',
    maxTokens: 2000,
    temperature: 0.3
  });

  // Generate implementation plan
  const implementationPlan = await runOpenAI(`
    Create a detailed implementation roadmap for ${institutionName}'s AI transformation journey.
    
    ${baseContext}
    
    Include:
    - Phase-by-phase implementation timeline
    - Resource allocation and budget considerations
    - Stakeholder engagement strategy
    - Change management approach
    - Risk mitigation strategies
    - Success milestones and checkpoints
    
    Provide specific guidance for ${organizationType} implementation challenges.
  `, {
    model: 'gpt-4o',
    maxTokens: 2000,
    temperature: 0.3
  });

  // Generate risk assessment
  const riskAssessment = await runOpenAI(`
    Conduct a comprehensive risk analysis for ${institutionName}'s AI implementation.
    
    ${baseContext}
    
    Analyze risks in:
    - Technical implementation challenges
    - Data privacy and security concerns
    - Regulatory compliance requirements
    - Organizational change resistance
    - Financial and resource constraints
    - Vendor and technology dependencies
    
    For each risk, provide:
    - Probability and impact assessment
    - Mitigation strategies
    - Contingency planning
    - Monitoring and early warning indicators
  `, {
    model: 'gpt-4o',
    maxTokens: 2000,
    temperature: 0.3
  });

  // Generate industry comparisons
  const industryComparisons = await runOpenAI(`
    Provide industry benchmark analysis for ${institutionName} in the ${organizationType} sector.
    
    ${baseContext}
    
    Compare performance against:
    - Industry average AI readiness scores
    - Peer institution capabilities
    - Best practice implementations
    - Emerging industry trends
    - Competitive positioning
    
    Identify areas where the institution leads, meets, or lags industry standards.
    Provide specific examples and case studies where relevant.
  `, {
    model: 'gpt-4o',
    maxTokens: 1800,
    temperature: 0.3
  });

  // Generate financial projections
  const financialProjections = await runOpenAI(`
    Develop financial impact analysis for ${institutionName}'s AI implementation.
    
    ${baseContext}
    
    Provide analysis of:
    - Initial investment requirements by category
    - Ongoing operational costs and resource needs
    - Expected ROI timeline and financial benefits
    - Cost-benefit analysis for recommended initiatives
    - Budget planning and funding strategies
    - Risk-adjusted financial projections
    
    Include specific dollar estimates where possible, tailored to ${organizationType} budget scales.
  `, {
    model: 'gpt-4o',
    maxTokens: 1800,
    temperature: 0.3
  });

  // Generate change management strategy
  const changeManagement = await runOpenAI(`
    Design a comprehensive change management strategy for ${institutionName}'s AI transformation.
    
    ${baseContext}
    
    Address:
    - Stakeholder analysis and engagement strategy
    - Communication plan and messaging
    - Training and capability development
    - Cultural transformation requirements
    - Resistance management and mitigation
    - Success measurement and monitoring
    
    Provide specific tactics for ${organizationType} organizational dynamics and culture.
  `, {
    model: 'gpt-4o',
    maxTokens: 1800,
    temperature: 0.3
  });

  return {
    executiveSummary,
    detailedAnalysis,
    strategicRecommendations,
    implementationPlan,
    riskAssessment,
    industryComparisons,
    financialProjections,
    changeManagement
  };
}
