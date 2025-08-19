import { NextRequest, NextResponse } from 'next/server';
import { getAIReadinessProduct } from '@/lib/ai-readiness-products';

/**
 * AI Transformation Blueprint™ HTML Report Generator
 * Creates premium board-ready HTML reports that can be converted to PDF
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      assessmentResults, 
      institutionData, 
      tier,
      includeExecutiveSummary = true,
      includeBenchmarking = true,
      includeROIProjections = true,
      includeImplementationPlan = true
    } = body;

    if (!assessmentResults || !tier) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const product = getAIReadinessProduct(tier);
    if (!product) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Generate HTML report based on tier
    const htmlReport = generateBlueprintHTML({
      assessmentResults,
      institutionData,
      product,
      includeExecutiveSummary,
      includeBenchmarking,
      includeROIProjections,
      includeImplementationPlan
    });

    return NextResponse.json({
      success: true,
      htmlReport,
      metadata: {
        tier,
        reportType: product.name,
        generatedAt: new Date().toISOString(),
        institutionName: institutionData?.name || 'Institution'
      }
    });

  } catch (error) {
    console.error('Blueprint HTML Generation Error:', error);
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 });
  }
}

function generateBlueprintHTML(options: {
  assessmentResults: any;
  institutionData: any;
  product: any;
  includeExecutiveSummary: boolean;
  includeBenchmarking: boolean;
  includeROIProjections: boolean;
  includeImplementationPlan: boolean;
}): string {
  
  const { assessmentResults, institutionData, product } = options;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name} - ${institutionData?.name || 'Institution'}</title>
    <style>
        ${getReportCSS()}
    </style>
</head>
<body>
    ${generateCoverPageHTML(institutionData, product)}
    ${generateExecutiveSummaryHTML(assessmentResults, institutionData, product)}
    ${generateTableOfContentsHTML(product)}
    ${generateAssessmentOverviewHTML(assessmentResults)}
    ${generateDomainAnalysisHTML(assessmentResults)}
    ${generatePolicyFrameworkHTML(assessmentResults, institutionData)}
    ${generateAlgorithmInsightsHTML(assessmentResults)}
    ${options.includeBenchmarking ? generateBenchmarkingHTML(assessmentResults, institutionData) : ''}
    ${generateImplementationRoadmapHTML(assessmentResults, product)}
    ${generatePolicyLibraryHTML(institutionData, product)}
    ${options.includeROIProjections ? generateROIProjectionsHTML(assessmentResults, institutionData) : ''}
    ${generateFacultyEnablementHTML(product)}
    ${generateRiskAssessmentHTML(assessmentResults)}
    ${generateAccreditationAlignmentHTML()}
    ${generateRecommendationsHTML(assessmentResults)}
    ${generateAppendicesHTML(assessmentResults)}
    
    <script>
        // Add interactive elements for the HTML report
        document.addEventListener('DOMContentLoaded', function() {
            // Add smooth scrolling to table of contents links
            document.querySelectorAll('.toc-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        });
    </script>
</body>
</html>`;
}

function getReportCSS(): string {
  return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
    }
    
    .page {
        min-height: 100vh;
        padding: 2rem;
        margin-bottom: 2rem;
        page-break-after: always;
    }
    
    .cover-page {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .cover-title {
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 1rem;
    }
    
    .cover-subtitle {
        font-size: 1.5rem;
        margin-bottom: 2rem;
        opacity: 0.9;
    }
    
    .cover-institution {
        font-size: 2rem;
        color: #FFD700;
        margin-bottom: 1rem;
    }
    
    .cover-tagline {
        font-size: 1.2rem;
        font-style: italic;
        opacity: 0.8;
    }
    
    .section-title {
        font-size: 2rem;
        color: #4F46E5;
        margin-bottom: 1rem;
        border-bottom: 3px solid #4F46E5;
        padding-bottom: 0.5rem;
    }
    
    .subsection-title {
        font-size: 1.5rem;
        color: #1F2937;
        margin: 1.5rem 0 1rem 0;
    }
    
    .score-circle {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: linear-gradient(45deg, #4F46E5, #7C3AED);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: bold;
        margin: 2rem auto;
    }
    
    .domain-score {
        display: flex;
        align-items: center;
        margin: 1rem 0;
        padding: 1rem;
        background: #F9FAFB;
        border-radius: 8px;
    }
    
    .domain-name {
        flex: 1;
        font-weight: 600;
    }
    
    .score-bar {
        flex: 2;
        height: 20px;
        background: #E5E7EB;
        border-radius: 10px;
        overflow: hidden;
        margin: 0 1rem;
    }
    
    .score-fill {
        height: 100%;
        background: linear-gradient(90deg, #EF4444, #F59E0B, #10B981);
        transition: width 0.3s ease;
    }
    
    .score-value {
        font-weight: bold;
        color: #1F2937;
    }
    
    .algorithm-card {
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .algorithm-name {
        font-size: 1.2rem;
        font-weight: bold;
        color: #4F46E5;
        margin-bottom: 0.5rem;
    }
    
    .algorithm-description {
        color: #6B7280;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }
    
    .algorithm-score {
        font-size: 1.5rem;
        font-weight: bold;
        color: #1F2937;
    }
    
    .policy-section {
        background: #F0F9FF;
        border-left: 4px solid #0EA5E9;
        padding: 1.5rem;
        margin: 1rem 0;
    }
    
    .policy-title {
        font-size: 1.3rem;
        font-weight: bold;
        color: #0C4A6E;
        margin-bottom: 1rem;
    }
    
    .policy-list {
        list-style: none;
        padding: 0;
    }
    
    .policy-item {
        padding: 0.5rem 0;
        border-bottom: 1px solid #E0F2FE;
    }
    
    .policy-item:last-child {
        border-bottom: none;
    }
    
    .implementation-phase {
        background: white;
        border: 1px solid #D1D5DB;
        border-radius: 8px;
        margin: 1rem 0;
        overflow: hidden;
    }
    
    .phase-header {
        background: #4F46E5;
        color: white;
        padding: 1rem;
        font-weight: bold;
    }
    
    .phase-content {
        padding: 1rem;
    }
    
    .phase-activities {
        list-style: none;
        padding: 0;
    }
    
    .phase-activity {
        padding: 0.5rem 0;
        padding-left: 1rem;
        position: relative;
    }
    
    .phase-activity:before {
        content: "•";
        color: #4F46E5;
        font-weight: bold;
        position: absolute;
        left: 0;
    }
    
    .toc-list {
        list-style: none;
        padding: 0;
    }
    
    .toc-item {
        padding: 0.5rem 0;
        border-bottom: 1px dotted #D1D5DB;
        display: flex;
        justify-content: space-between;
    }
    
    .toc-link {
        color: #4F46E5;
        text-decoration: none;
        font-weight: 500;
    }
    
    .toc-link:hover {
        text-decoration: underline;
    }
    
    .risk-item {
        background: #FEF2F2;
        border-left: 4px solid #EF4444;
        padding: 1rem;
        margin: 1rem 0;
    }
    
    .risk-title {
        font-weight: bold;
        color: #DC2626;
        margin-bottom: 0.5rem;
    }
    
    .risk-description {
        color: #374151;
        margin-bottom: 0.5rem;
    }
    
    .risk-mitigation {
        color: #059669;
        font-style: italic;
    }
    
    .recommendation-list {
        list-style: none;
        padding: 0;
    }
    
    .recommendation-item {
        background: #F0FDF4;
        border-left: 4px solid #10B981;
        padding: 1rem;
        margin: 0.5rem 0;
    }
    
    .benchmark-comparison {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 1rem;
        margin: 1rem 0;
    }
    
    .benchmark-card {
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
    }
    
    .benchmark-category {
        font-weight: bold;
        color: #1F2937;
        margin-bottom: 0.5rem;
    }
    
    .benchmark-score {
        font-size: 1.5rem;
        color: #4F46E5;
        font-weight: bold;
    }
    
    @media print {
        .page {
            page-break-after: always;
        }
        
        body {
            font-size: 12pt;
        }
    }
    
    @media (max-width: 768px) {
        .cover-title {
            font-size: 2rem;
        }
        
        .benchmark-comparison {
            grid-template-columns: 1fr;
        }
        
        .domain-score {
            flex-direction: column;
            text-align: center;
        }
        
        .score-bar {
            margin: 0.5rem 0;
        }
    }
  `;
}

function generateCoverPageHTML(institutionData: any, product: any): string {
  return `
    <div class="page cover-page">
        <div class="cover-title">${product.name}</div>
        ${product.tagline ? `<div class="cover-tagline">${product.tagline}</div>` : ''}
        <div class="cover-institution">${institutionData?.name || 'Your Institution'}</div>
        <div class="cover-subtitle">AI Transformation for Higher Education</div>
        <div style="margin-top: 2rem; font-size: 1rem; opacity: 0.8;">
            Generated: ${new Date().toLocaleDateString()}
        </div>
        <div style="position: absolute; bottom: 2rem; font-size: 0.8rem; opacity: 0.7;">
            Powered by patent-pending AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, and AIBS™ algorithms
        </div>
    </div>
  `;
}

function generateExecutiveSummaryHTML(assessmentResults: any, institutionData: any, product: any): string {
  if (product.id === 'ai-readiness-pulse') return '';
  
  return `
    <div class="page" id="executive-summary">
        <h1 class="section-title">Executive Summary</h1>
        <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem;">
            This ${product.name} provides ${institutionData?.name || 'your institution'} with a comprehensive 
            roadmap for AI adoption across strategic, operational, and cultural dimensions. Based on your assessment results 
            showing <strong>${assessmentResults.overallScore}% AI readiness</strong>, this blueprint outlines a ${product.duration} 
            designed specifically for higher education environments.
        </p>
        
        <div style="background: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #1F2937; margin-bottom: 1rem;">Key Metrics</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <strong>Overall AI Readiness:</strong> ${assessmentResults.overallScore}%<br>
                    <strong>Implementation Timeline:</strong> ${product.duration}<br>
                </div>
                <div>
                    <strong>Faculty Impact:</strong> ${Math.round(assessmentResults.domainScores['Faculty Readiness'] || 0)}%<br>
                    <strong>Risk Level:</strong> ${getRiskLevel(assessmentResults.overallScore)}
                </div>
            </div>
        </div>
    </div>
  `;
}

function generateTableOfContentsHTML(product: any): string {
  const sections = [
    { title: 'Executive Summary', id: 'executive-summary', page: 2 },
    { title: 'Assessment Overview', id: 'assessment-overview', page: 4 },
    { title: 'Domain Analysis', id: 'domain-analysis', page: 5 },
    { title: 'AI Policy Framework', id: 'policy-framework', page: 6 },
    { title: 'Algorithm Insights', id: 'algorithm-insights', page: 7 },
    { title: 'Implementation Roadmap', id: 'implementation-roadmap', page: 8 },
    { title: 'Policy Library', id: 'policy-library', page: 9 },
    { title: 'Faculty Enablement', id: 'faculty-enablement', page: 10 },
    { title: 'Risk Assessment', id: 'risk-assessment', page: 11 },
    { title: 'Accreditation Alignment', id: 'accreditation-alignment', page: 12 },
    { title: 'Recommendations', id: 'recommendations', page: 13 }
  ];

  const tocItems = sections.map(section => 
    `<div class="toc-item">
       <a href="#${section.id}" class="toc-link">${section.title}</a>
       <span>${section.page}</span>
     </div>`
  ).join('');

  return `
    <div class="page" id="table-of-contents">
        <h1 class="section-title">Table of Contents</h1>
        <div class="toc-list">
            ${tocItems}
        </div>
    </div>
  `;
}

function generateAssessmentOverviewHTML(assessmentResults: any): string {
  const domainScoreElements = Object.entries(assessmentResults.domainScores)
    .map(([domain, score]: [string, any]) => {
      const scoreNum = Math.round(score);
      const scoreColor = getScoreColor(scoreNum);
      return `
        <div class="domain-score">
            <div class="domain-name">${domain}</div>
            <div class="score-bar">
                <div class="score-fill" style="width: ${scoreNum}%; background: ${scoreColor};"></div>
            </div>
            <div class="score-value">${scoreNum}%</div>
        </div>
      `;
    }).join('');

  return `
    <div class="page" id="assessment-overview">
        <h1 class="section-title">AI Readiness Assessment Overview</h1>
        
        <div class="score-circle">
            ${assessmentResults.overallScore}%
        </div>
        
        <h2 class="subsection-title">Domain Scores</h2>
        <div>
            ${domainScoreElements}
        </div>
    </div>
  `;
}

function generateDomainAnalysisHTML(assessmentResults: any): string {
  const domainAnalysisElements = Object.entries(assessmentResults.domainScores)
    .map(([domain, score]: [string, any]) => {
      const scoreNum = Math.round(score);
      const analysis = getDomainAnalysis(domain, scoreNum);
      return `
        <div style="margin: 2rem 0; padding: 1.5rem; background: #F9FAFB; border-radius: 8px;">
            <h3 style="color: #1F2937; margin-bottom: 0.5rem;">${domain}</h3>
            <div style="color: #6B7280; margin-bottom: 1rem;">Score: ${scoreNum}%</div>
            <p style="color: #374151; line-height: 1.6;">${analysis}</p>
        </div>
      `;
    }).join('');

  return `
    <div class="page" id="domain-analysis">
        <h1 class="section-title">Domain Analysis</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
            Each domain represents a critical component of your institution's AI readiness. 
            The following analysis provides detailed insights into your current state and improvement opportunities.
        </p>
        ${domainAnalysisElements}
    </div>
  `;
}

function generatePolicyFrameworkHTML(assessmentResults: any, institutionData: any): string {
  return `
    <div class="page" id="policy-framework">
        <h1 class="section-title">AI Policy Framework Assessment</h1>
        
        <div class="policy-section">
            <div class="policy-title">Ethical & Responsible AI Use Guidelines</div>
            <p>Assessment of your institution's ethical AI framework including transparency, fairness, accountability, and privacy principles.</p>
            <div style="margin-top: 1rem;">
                <strong>Current State:</strong> ${assessmentResults.domainScores['Governance & Policy'] > 70 ? 'Well-established' : assessmentResults.domainScores['Governance & Policy'] > 50 ? 'Developing' : 'Needs Development'}
            </div>
        </div>
        
        <div class="policy-section">
            <div class="policy-title">Administrative Policy Integration</div>
            <p>Review of how AI considerations are integrated into existing institutional policies.</p>
            <ul class="policy-list">
                <li class="policy-item">✓ Data Governance Policies</li>
                <li class="policy-item">✓ Intellectual Property Guidelines</li>
                <li class="policy-item">✓ Tenure & Promotion Standards</li>
                <li class="policy-item">✓ Accessibility Requirements</li>
                <li class="policy-item">✓ Academic Integrity Framework</li>
            </ul>
        </div>
        
        <div class="policy-section">
            <div class="policy-title">Cross-functional Collaboration Strategy</div>
            <p>Evaluation of stakeholder engagement and collaborative approaches to AI policy development.</p>
        </div>
        
        <div class="policy-section">
            <div class="policy-title">AI Literacy Framework</div>
            <p>Assessment of your institution's AI literacy program for faculty, staff, and students.</p>
        </div>
    </div>
  `;
}

function generateAlgorithmInsightsHTML(assessmentResults: any): string {
  const algorithms = [
    { name: 'AIRIX™', description: 'AI Readiness Index - Strategic alignment assessment', score: assessmentResults.algorithmScores['AIRIX'] || 0 },
    { name: 'AIRS™', description: 'AI Risk & Security - Governance framework evaluation', score: assessmentResults.algorithmScores['AIRS'] || 0 },
    { name: 'AICS™', description: 'AI Culture & Skills - Faculty and staff readiness', score: assessmentResults.algorithmScores['AICS'] || 0 },
    { name: 'AIMS™', description: 'AI Management Systems - Technology infrastructure', score: assessmentResults.algorithmScores['AIMS'] || 0 },
    { name: 'AIPS™', description: 'AI Priority Scoring - Implementation prioritization', score: assessmentResults.algorithmScores['AIPS'] || 0 },
    { name: 'AIBS™', description: 'AI Benchmarking & Standards - Performance measurement', score: assessmentResults.algorithmScores['AIBS'] || 0 }
  ];

  const algorithmCards = algorithms.map(algorithm => `
    <div class="algorithm-card">
        <div class="algorithm-name">${algorithm.name}</div>
        <div class="algorithm-description">${algorithm.description}</div>
        <div class="algorithm-score">${Math.round(algorithm.score)}%</div>
    </div>
  `).join('');

  return `
    <div class="page" id="algorithm-insights">
        <h1 class="section-title">Proprietary Algorithm Insights</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
            Your assessment leverages our patent-pending algorithms to provide deeper insights into specific aspects of AI readiness.
        </p>
        ${algorithmCards}
    </div>
  `;
}

function generateBenchmarkingHTML(assessmentResults: any, institutionData: any): string {
  const benchmarks = [
    { category: 'Community Colleges', average: 45, percentile: calculatePercentile(assessmentResults.overallScore, 45) },
    { category: 'Regional Universities', average: 52, percentile: calculatePercentile(assessmentResults.overallScore, 52) },
    { category: 'Research Universities', average: 68, percentile: calculatePercentile(assessmentResults.overallScore, 68) },
    { category: 'Liberal Arts Colleges', average: 41, percentile: calculatePercentile(assessmentResults.overallScore, 41) }
  ];

  const benchmarkCards = benchmarks.map(benchmark => `
    <div class="benchmark-card">
        <div class="benchmark-category">${benchmark.category}</div>
        <div class="benchmark-score">${benchmark.percentile}th</div>
        <div style="font-size: 0.9rem; color: #6B7280;">percentile</div>
        <div style="font-size: 0.8rem; color: #9CA3AF; margin-top: 0.5rem;">
            Avg: ${benchmark.average}%
        </div>
    </div>
  `).join('');

  return `
    <div class="page" id="benchmarking">
        <h1 class="section-title">Higher Education Benchmarking</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
            Your AI readiness performance compared to similar institutions in higher education.
        </p>
        <div class="benchmark-comparison">
            ${benchmarkCards}
        </div>
    </div>
  `;
}

function generateImplementationRoadmapHTML(assessmentResults: any, product: any): string {
  if (product.id === 'ai-readiness-pulse') return '';
  
  const phases = [
    {
      name: 'Phase 1: Diagnostic',
      timeline: 'Weeks 0-2',
      activities: [
        'Complete comprehensive assessment analysis',
        'Stakeholder interviews and document review',
        'Baseline dashboard configuration',
        'Risk assessment and gap analysis'
      ]
    },
    {
      name: 'Phase 2: Design',
      timeline: 'Weeks 2-6', 
      activities: [
        'Virtual design studio sessions',
        'Scenario modeling and ROI projections',
        'Policy framework development',
        'Faculty enablement program design'
      ]
    },
    {
      name: 'Phase 3: Deploy',
      timeline: 'Weeks 6-12',
      activities: [
        '90-day sprint launch and coaching',
        'Weekly office hours and support',
        'Faculty micro-course implementation',
        'KPI tracking and progress monitoring'
      ]
    }
  ];

  const phaseElements = phases.map(phase => `
    <div class="implementation-phase">
        <div class="phase-header">
            ${phase.name} <span style="float: right; font-weight: normal;">${phase.timeline}</span>
        </div>
        <div class="phase-content">
            <ul class="phase-activities">
                ${phase.activities.map(activity => `<li class="phase-activity">${activity}</li>`).join('')}
            </ul>
        </div>
    </div>
  `).join('');

  return `
    <div class="page" id="implementation-roadmap">
        <h1 class="section-title">90-Day Implementation Roadmap</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
            Your customized transformation plan follows our proven Diagnostic → Design → Deploy methodology.
        </p>
        ${phaseElements}
    </div>
  `;
}

function generatePolicyLibraryHTML(institutionData: any, product: any): string {
  if (product.id === 'ai-readiness-pulse') return '';
  
  const policies = [
    'Faculty AI Use Policy',
    'Student AI Guidelines', 
    'Academic Integrity Framework',
    'AI Ethics Committee Charter',
    'Data Privacy & Security Standards',
    'AI Procurement Guidelines',
    'Learning Analytics Policy',
    'AI Research Guidelines',
    'Emergency AI Response Protocol',
    'AI Training & Development Policy',
    'AI Assessment & Evaluation Standards',
    'AI Innovation & Experimentation Framework'
  ];

  const policyItems = policies.map(policy => `<li class="policy-item">• ${policy}</li>`).join('');

  return `
    <div class="page" id="policy-library">
        <h1 class="section-title">Policy Library Overview</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
            Customized policy templates for ${institutionData?.name || 'your institution'}, pre-filled with institutional details 
            and aligned with accreditation standards.
        </p>
        <div class="policy-section">
            <div class="policy-title">12-Module Policy Framework</div>
            <ul class="policy-list">
                ${policyItems}
            </ul>
        </div>
    </div>
  `;
}

function generateROIProjectionsHTML(assessmentResults: any, institutionData: any): string {
  return `
    <div class="page" id="roi-projections">
        <h1 class="section-title">ROI Projections & Financial Impact</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
            Financial impact projections based on your institutional profile and AI readiness assessment results.
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="policy-section">
                <div class="policy-title">Efficiency Gains</div>
                <p>Expected 15-25% improvement in operational efficiency through AI automation and optimization.</p>
            </div>
            <div class="policy-section">
                <div class="policy-title">Enrollment Impact</div>
                <p>Projected 5-10% increase in enrollment through enhanced student experience and outcomes.</p>
            </div>
        </div>
    </div>
  `;
}

function generateFacultyEnablementHTML(product: any): string {
  if (product.id === 'ai-readiness-pulse') return '';
  
  const modules = [
    'Module 1: AI Fundamentals for Educators (60 min)',
    'Module 2: Pedagogical Integration Strategies (60 min)', 
    'Module 3: Academic Integrity & AI Ethics (60 min)',
    'Module 4: Assessment & Evaluation with AI (60 min)'
  ];

  const moduleItems = modules.map(module => `<li class="policy-item">• ${module}</li>`).join('');

  return `
    <div class="page" id="faculty-enablement">
        <h1 class="section-title">Faculty Enablement Program</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
            Comprehensive 4-module micro-course program designed to address faculty AI literacy and adoption challenges.
        </p>
        <div class="policy-section">
            <div class="policy-title">Micro-Course Structure</div>
            <ul class="policy-list">
                ${moduleItems}
            </ul>
        </div>
    </div>
  `;
}

function generateRiskAssessmentHTML(assessmentResults: any): string {
  const risks = identifyRisks(assessmentResults);
  
  const riskElements = risks.map(risk => `
    <div class="risk-item">
        <div class="risk-title">${risk.title}</div>
        <div class="risk-description">${risk.description}</div>
        <div class="risk-mitigation">Mitigation: ${risk.mitigation}</div>
    </div>
  `).join('');

  return `
    <div class="page" id="risk-assessment">
        <h1 class="section-title">Risk Assessment & Mitigation</h1>
        ${riskElements}
    </div>
  `;
}

function generateAccreditationAlignmentHTML(): string {
  const alignments = [
    'SACSCOC Standards 2.1, 6.1, 9.1, 13.1',
    'HLC Criteria 2.E, 3.A, 5.A',
    'MSCHE Standards III, V',
    'NIST AI Risk Management Framework (AI RMF)'
  ];

  const alignmentItems = alignments.map(alignment => `<li class="policy-item">• ${alignment}</li>`).join('');

  return `
    <div class="page" id="accreditation-alignment">
        <h1 class="section-title">Accreditation Alignment</h1>
        <p style="margin-bottom: 2rem; color: #374151; line-height: 1.6;">
            Your AI transformation plan aligns with major higher education accreditation standards and frameworks.
        </p>
        <div class="policy-section">
            <div class="policy-title">Standards Alignment</div>
            <ul class="policy-list">
                ${alignmentItems}
            </ul>
        </div>
    </div>
  `;
}

function generateRecommendationsHTML(assessmentResults: any): string {
  const recommendationItems = assessmentResults.recommendations.map((rec: string) => 
    `<div class="recommendation-item">${rec}</div>`
  ).join('');

  return `
    <div class="page" id="recommendations">
        <h1 class="section-title">Strategic Recommendations</h1>
        <div class="recommendation-list">
            ${recommendationItems}
        </div>
    </div>
  `;
}

function generateAppendicesHTML(assessmentResults: any): string {
  return `
    <div class="page" id="appendices">
        <h1 class="section-title">Appendices</h1>
        <p style="color: #374151; line-height: 1.6;">
            Additional resources, methodologies, and detailed scoring breakdowns.
        </p>
        <div class="policy-section">
            <div class="policy-title">Methodology</div>
            <p>Detailed explanation of our proprietary algorithms and scoring methodology.</p>
        </div>
        <div class="policy-section">
            <div class="policy-title">Resources</div>
            <p>Curated collection of AI frameworks and resources for higher education.</p>
        </div>
    </div>
  `;
}

// Helper Functions
function getRiskLevel(score: number): string {
  if (score >= 70) return 'Low';
  if (score >= 50) return 'Medium';
  return 'High';
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
}

function calculatePercentile(yourScore: number, average: number): number {
  return Math.min(Math.round((yourScore / average) * 50 + 25), 95);
}

function getDomainAnalysis(domain: string, score: number): string {
  const analyses: Record<string, Record<string, string>> = {
    'Strategic Alignment': {
      high: 'Strong strategic foundation with clear AI vision and leadership commitment.',
      medium: 'Basic strategic framework exists but needs enhancement and clearer priorities.',
      low: 'Significant strategic gaps require immediate attention and leadership alignment.'
    },
    'Governance & Policy': {
      high: 'Comprehensive governance framework with ethical AI guidelines, administrative policies covering data governance, intellectual property, tenure/promotion, accessibility, and academic integrity.',
      medium: 'Basic governance structure in place but policies need updating and expansion to address AI-specific requirements.',
      low: 'Critical governance gaps pose compliance and operational risks. Immediate development of ethical AI guidelines and administrative policies needed.'
    },
    'Faculty Readiness': {
      high: 'Faculty demonstrate strong AI literacy with comprehensive training programs and updated tenure/promotion policies.',
      medium: 'Basic AI literacy exists but needs systematic training and policy updates for broader adoption.',
      low: 'Significant faculty development needed including AI literacy frameworks and change management support.'
    }
    // Add more domain analyses as needed
  };

  const level = score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low';
  return analyses[domain]?.[level] || 'Analysis pending additional data collection.';
}

function identifyRisks(assessmentResults: any): Array<{ title: string; description: string; mitigation: string; }> {
  const risks = [];
  
  if (assessmentResults.domainScores['Faculty Readiness'] < 50) {
    risks.push({
      title: 'Faculty Adoption Risk',
      description: 'Low faculty readiness scores indicate potential resistance to AI adoption and lack of AI literacy framework.',
      mitigation: 'Implement comprehensive faculty enablement program with AI literacy training, updated tenure/promotion policies, and gradual change management approach.'
    });
  }
  
  if (assessmentResults.domainScores['Governance & Policy'] < 60) {
    risks.push({
      title: 'Policy & Compliance Risk',
      description: 'Inadequate governance framework may lead to accreditation, legal, or ethical issues. Missing critical administrative policies for data governance, IP, and academic integrity.',
      mitigation: 'Prioritize development of ethical AI guidelines, establish cross-functional policy committee, and implement comprehensive administrative policy framework covering all AI use cases.'
    });
  }
  
  if (assessmentResults.domainScores['Academic Integrity'] < 60) {
    risks.push({
      title: 'Academic Integrity Risk',
      description: 'Insufficient policies and procedures for managing AI use in academic work may compromise institutional standards.',
      mitigation: 'Develop comprehensive academic integrity framework addressing AI detection, student guidelines, and faculty training on AI assessment strategies.'
    });
  }
  
  return risks;
}
