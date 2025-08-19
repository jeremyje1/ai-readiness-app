/**
 * AI Readiness PDF Generator
 * Enhanced implementation for generating comprehensive PDF reports
 */

import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
  title?: string;
  includeCharts?: boolean;
  theme?: 'light' | 'dark';
}

export interface AIReadinessReportData {
  institutionName?: string;
  assessmentResults?: any;
  score?: number;
  recommendations?: string[];
  benchmarks?: any;
  results?: any;
  institution?: any;
  institutionInfo?: any;
  tier?: 'basic' | 'custom';
  submissionDate?: string;
  assessmentId?: string;
  uploadedDocuments?: string[];
}

export async function generateAIReadinessPDF(
  data: any,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  return generateAIReadinessPDFReport(data, options);
}

export async function generateAIReadinessPDFReport(
  data: AIReadinessReportData,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  try {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Get data safely
    const institutionName = data.institutionInfo?.name || data.institutionName || 'Institution';
    const overallScore = data.results?.scores?.overall || data.score || 0;
    const tier = data.tier || 'basic';
    const submissionDate = data.submissionDate ? new Date(data.submissionDate).toLocaleDateString() : new Date().toLocaleDateString();
    
    // Title Page
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Readiness Assessment Report', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(institutionName, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Generated: ${submissionDate}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Assessment Tier: ${tier.charAt(0).toUpperCase() + tier.slice(1)}`, 20, yPosition);
    yPosition += 20;
    
    // Executive Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const executiveSummary = `Your institution achieved an overall AI readiness score of ${overallScore}%. This comprehensive assessment evaluated your organization across five critical domains of AI implementation readiness.`;
    
    const splitSummary = doc.splitTextToSize(executiveSummary, 170);
    doc.text(splitSummary, 20, yPosition);
    yPosition += splitSummary.length * 6 + 10;
    
    // Overall Score Box
    doc.setDrawColor(0, 100, 200);
    doc.setLineWidth(2);
    doc.rect(20, yPosition, 170, 30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall AI Readiness Score', 25, yPosition + 10);
    
    doc.setFontSize(24);
    doc.setTextColor(0, 100, 200);
    doc.text(`${overallScore}%`, 25, yPosition + 25);
    
    // Score interpretation
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const interpretation = getScoreInterpretation(overallScore);
    doc.text(`Level: ${interpretation}`, 80, yPosition + 25);
    
    yPosition += 40;
    
    // Domain Scores
    if (data.results?.scores?.domains) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Domain Performance', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      Object.entries(data.results.scores.domains).forEach(([domain, score]: [string, any]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        const domainScore = typeof score === 'object' ? score.percentage || 0 : score;
        doc.text(`${domain}: ${domainScore}%`, 25, yPosition);
        
        // Simple progress bar
        doc.setDrawColor(200, 200, 200);
        doc.rect(120, yPosition - 4, 60, 6);
        
        const barWidth = (domainScore / 100) * 60;
        const color = domainScore >= 70 ? [0, 150, 0] : domainScore >= 50 ? [255, 165, 0] : [200, 0, 0];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(120, yPosition - 4, barWidth, 6, 'F');
        
        yPosition += 12;
      });
      
      yPosition += 10;
    }
    
    // Recommendations
    if (data.results?.recommendations && data.results.recommendations.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Recommendations', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      data.results.recommendations.slice(0, 5).forEach((rec: any, index: number) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        const recommendation = typeof rec === 'string' ? rec : rec.title || rec.description || String(rec);
        const splitRec = doc.splitTextToSize(`${index + 1}. ${recommendation}`, 170);
        doc.text(splitRec, 20, yPosition);
        yPosition += splitRec.length * 6 + 5;
      });
    }
    
    // Document Analysis (if available)
    if (data.uploadedDocuments && data.uploadedDocuments.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Document Analysis', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.uploadedDocuments.length} strategic documents were analyzed to provide context-specific recommendations.`, 20, yPosition);
      yPosition += 15;
    }
    
    // Footer on each page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`AI Readiness Assessment Report - ${institutionName}`, 20, 285);
      doc.text(`Page ${i} of ${pageCount}`, 170, 285);
    }
    
    return Buffer.from(doc.output('arraybuffer'));
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Return a simple fallback PDF
    const doc = new jsPDF();
    doc.text('AI Readiness Assessment Report', 20, 20);
    doc.text('Report generation encountered an error.', 20, 40);
    doc.text('Please contact support for assistance.', 20, 50);
    return Buffer.from(doc.output('arraybuffer'));
  }
}

export function generateReportHTML(data: any): string {
  const institutionName = data.institutionInfo?.name || data.institutionName || 'Institution';
  const overallScore = data.results?.scores?.overall || data.score || 0;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI Readiness Report - ${institutionName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .score-box { 
            background: #f0f8ff; 
            border: 2px solid #0066cc; 
            padding: 20px; 
            margin: 20px 0; 
            text-align: center; 
          }
          .score { font-size: 2em; color: #0066cc; font-weight: bold; }
          .domain { margin: 10px 0; }
          .recommendation { margin: 8px 0; padding: 8px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AI Readiness Assessment Report</h1>
          <h2>${institutionName}</h2>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="score-box">
          <h3>Overall AI Readiness Score</h3>
          <div class="score">${overallScore}%</div>
          <p>Level: ${getScoreInterpretation(overallScore)}</p>
        </div>
        
        <h3>Assessment Summary</h3>
        <p>This comprehensive assessment evaluated your organization across five critical domains of AI implementation readiness.</p>
      </body>
    </html>
  `;
}

function getScoreInterpretation(score: number): string {
  if (score >= 81) return 'Exemplary';
  if (score >= 61) return 'Advanced';
  if (score >= 41) return 'Progressing';
  if (score >= 21) return 'Developing';
  return 'Beginning';
}
