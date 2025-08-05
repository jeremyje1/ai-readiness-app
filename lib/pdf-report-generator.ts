import jsPDF from 'jspdf';
import { translateText, translateUIElement, getReportLabels, InstitutionType } from './industryLanguageMapping';

export interface ReportData {
  analysis: any;
  institutionName?: string;
  assessmentDate: string;
  generatedBy?: string;
  includeAI?: boolean;
  isStaticContent?: boolean;
  institutionType?: InstitutionType;
}

export class PDFReportGenerator {
  private pdf: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;
  private margin: number;
  private institutionType: InstitutionType | null;

  constructor(institutionType?: InstitutionType) {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.margin = 20;
    this.currentY = this.margin;
    this.institutionType = institutionType || null;
  }

  private translateContent(text: string): string {
    if (!this.institutionType) return text;
    return translateText(text, this.institutionType);
  }

  private translateReportElement(element: string): string {
    if (!this.institutionType) return element;
    return translateUIElement(element, this.institutionType);
  }

  private getIndustryReportLabels(): Record<string, string> {
    if (!this.institutionType) return {};
    return getReportLabels(this.institutionType);
  }

  async generateReport(data: ReportData): Promise<Blob> {
    // Set institution type for language customization
    if (data.institutionType) {
      this.institutionType = data.institutionType;
    }
    
    // Handle static content documents
    if (data.isStaticContent) {
      return await this.generateStaticContentPDF(data);
    }

    // Create a simplified PDF for now to avoid complex template issues
    await this.createCoverPage(data);
    await this.createSimplifiedReport(data.analysis);
    
    return this.pdf.output('blob');
  }

  async createSimplifiedReport(analysis: any): Promise<void> {
    this.checkPageSpace(30);
    
    // Executive Summary
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Executive Summary', this.margin, this.currentY);
    this.currentY += 15;
    
    // Overall Score - Fixed NaN issue
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    if (analysis.executiveSummary?.organizationalHealth) {
      const healthScore = analysis.executiveSummary.organizationalHealth.score || 0;
      this.pdf.text(`Organizational Health Score: ${healthScore}/100`, this.margin, this.currentY);
      this.currentY += 8;
      this.pdf.text(`Status: ${analysis.executiveSummary.organizationalHealth.status || 'Not Available'}`, this.margin, this.currentY);
      this.currentY += 8;
      
      // Description with text wrapping
      const description = analysis.executiveSummary.organizationalHealth.description || 'Assessment analysis not available';
      const lines = this.pdf.splitTextToSize(description, this.pageWidth - 2 * this.margin);
      this.pdf.text(lines, this.margin, this.currentY);
      this.currentY += lines.length * 6 + 10;
    }
    
    // Assessment Details - NEW SECTION
    if (analysis.submissionDetails) {
      this.checkPageSpace(30);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Assessment Details', this.margin, this.currentY);
      this.currentY += 10;
      this.pdf.setFont('helvetica', 'normal');
      
      this.pdf.text(`Institution: ${analysis.submissionDetails.institution_name || 'Not provided'}`, this.margin, this.currentY);
      this.currentY += 8;
      this.pdf.text(`Organization Type: ${analysis.submissionDetails.organization_type || 'Not specified'}`, this.margin, this.currentY);
      this.currentY += 8;
      this.pdf.text(`Total Questions Answered: ${analysis.submissionDetails.total_responses || 0}`, this.margin, this.currentY);
      this.currentY += 8;
      
      if (analysis.uploadedFiles && analysis.uploadedFiles.length > 0) {
        this.pdf.text(`Uploaded Documents: ${analysis.uploadedFiles.length} files`, this.margin, this.currentY);
        this.currentY += 8;
        
        // List uploaded files
        analysis.uploadedFiles.forEach((file: any, index: number) => {
          if (index < 5) { // Limit to first 5 files
            const fileName = typeof file === 'string' ? file : (file.name || file.filename || 'Document');
            this.pdf.text(`  • ${fileName}`, this.margin + 10, this.currentY);
            this.currentY += 6;
          }
        });
        
        if (analysis.uploadedFiles.length > 5) {
          this.pdf.text(`  ... and ${analysis.uploadedFiles.length - 5} more files`, this.margin + 10, this.currentY);
          this.currentY += 6;
        }
      }
      this.currentY += 5;
    }
    
    // AI Readiness
    if (analysis.executiveSummary?.aiReadiness) {
      this.checkPageSpace(20);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('AI Readiness Assessment', this.margin, this.currentY);
      this.currentY += 10;
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`AI Readiness Level: ${analysis.executiveSummary.aiReadiness.level || 'Not assessed'}`, this.margin, this.currentY);
      this.currentY += 8;
      
      const aiScore = analysis.executiveSummary.aiReadiness.score || 0;
      this.pdf.text(`AI Score: ${aiScore}/100`, this.margin, this.currentY);
      this.currentY += 8;
      
      const aiDescription = analysis.executiveSummary.aiReadiness.description || 'AI readiness analysis not available';
      const aiLines = this.pdf.splitTextToSize(aiDescription, this.pageWidth - 2 * this.margin);
      this.pdf.text(aiLines, this.margin, this.currentY);
      this.currentY += aiLines.length * 6 + 10;
    }
    
    // Recommendations - Fixed [object Object] issue
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      this.checkPageSpace(30);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Key Recommendations', this.margin, this.currentY);
      this.currentY += 10;
      this.pdf.setFont('helvetica', 'normal');
      
      analysis.recommendations.forEach((rec: any, index: number) => {
        this.checkPageSpace(10);
        // Convert object to string if necessary
        const recText = typeof rec === 'string' ? rec : (rec.text || rec.description || rec.title || JSON.stringify(rec));
        const recommendation = `${index + 1}. ${recText}`;
        const recLines = this.pdf.splitTextToSize(recommendation, this.pageWidth - 2 * this.margin);
        this.pdf.text(recLines, this.margin, this.currentY);
        this.currentY += recLines.length * 6 + 5;
      });
    }
    
    // Key Assessment Insights - NEW SECTION
    if (analysis.responses && Object.keys(analysis.responses).length > 0) {
      this.checkPageSpace(40);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Key Assessment Insights', this.margin, this.currentY);
      this.currentY += 10;
      this.pdf.setFont('helvetica', 'normal');
      
      // Analyze and display top insights from responses
      const responses = analysis.responses;
      const responseCount = Object.keys(responses).length;
      
      this.pdf.text(`Based on your ${responseCount} detailed responses, key insights include:`, this.margin, this.currentY);
      this.currentY += 10;
      
      // Find highest and lowest scoring areas
      const sectionScores = analysis.sectionScores || {};
      const sortedSections = Object.entries(sectionScores).sort(([,a], [,b]) => (b as number) - (a as number));
      
      if (sortedSections.length > 0) {
        const [highestSection, highestScore] = sortedSections[0];
        const [lowestSection, lowestScore] = sortedSections[sortedSections.length - 1];
        
        this.pdf.text(`• Strongest area: ${highestSection.charAt(0).toUpperCase() + highestSection.slice(1)} (${Math.round((highestScore as number) * 100)}%)`, this.margin + 10, this.currentY);
        this.currentY += 8;
        
        this.pdf.text(`• Area for improvement: ${lowestSection.charAt(0).toUpperCase() + lowestSection.slice(1)} (${Math.round((lowestScore as number) * 100)}%)`, this.margin + 10, this.currentY);
        this.currentY += 8;
      }
      
      // Sample of specific responses (first few non-null responses)
      let responseCount2 = 0;
      for (const [question, answer] of Object.entries(responses)) {
        if (responseCount2 >= 3) break;
        if (answer !== null && answer !== undefined && answer !== '') {
          this.checkPageSpace(15);
          const questionText = question.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
          const displayText = `• ${questionText}: ${answer}`;
          const questionLines = this.pdf.splitTextToSize(displayText, this.pageWidth - 2 * this.margin - 10);
          this.pdf.text(questionLines, this.margin + 10, this.currentY);
          this.currentY += questionLines.length * 6 + 3;
          responseCount2++;
        }
      }
      this.currentY += 5;
    }
    
    // Action Items
    if (analysis.executiveSummary?.actionRequired) {
      this.checkPageSpace(25);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Executive Action Items', this.margin, this.currentY);
      this.currentY += 10;
      this.pdf.setFont('helvetica', 'normal');
      
      const criticalItems = analysis.executiveSummary.actionRequired.critical || 0;
      const highPriorityItems = analysis.executiveSummary.actionRequired.high || 0;
      
      this.pdf.text(`Critical Issues: ${criticalItems}`, this.margin, this.currentY);
      this.currentY += 8;
      this.pdf.text(`High Priority Items: ${highPriorityItems}`, this.margin, this.currentY);
      this.currentY += 8;
      
      const actionDescription = analysis.executiveSummary.actionRequired.description || 'Action items based on assessment findings';
      const actionLines = this.pdf.splitTextToSize(actionDescription, this.pageWidth - 2 * this.margin);
      this.pdf.text(actionLines, this.margin, this.currentY);
      this.currentY += actionLines.length * 6 + 10;
    }
  }

  async generateStaticContentPDF(data: ReportData): Promise<Blob> {
    // Create professional static content PDF
    this.pdf.setFillColor(25, 43, 81); // Professional dark blue header
    this.pdf.rect(0, 0, this.pageWidth, 60, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('NORTHPATH STRATEGIES', this.margin, 30);
    this.pdf.setFontSize(16);
    this.pdf.text(this.translateContent(data.institutionName || 'Resource Guide'), this.margin, 45);

    this.pdf.setTextColor(0, 0, 0);
    this.currentY = 80;

    // Process and add content with language translation
    if (data.analysis.content) {
      const content = this.translateContent(data.analysis.content);
      const lines = content.split('\n');
      
      for (const line of lines) {
        this.checkPageSpace(15);
        
        if (line.startsWith('# ')) {
          // Main heading
          this.pdf.setFontSize(18);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(this.translateContent(line.substring(2)), this.margin, this.currentY);
          this.currentY += 15;
        } else if (line.startsWith('## ')) {
          // Subheading
          this.pdf.setFontSize(14);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(this.translateContent(line.substring(3)), this.margin, this.currentY);
          this.currentY += 10;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // Bullet point
          this.pdf.setFontSize(12);
          this.pdf.setFont('helvetica', 'normal');
          this.pdf.text('• ' + this.translateContent(line.substring(2)), this.margin + 5, this.currentY);
          this.currentY += 8;
        } else if (line.trim()) {
          // Regular paragraph
          this.pdf.setFontSize(12);
          this.pdf.setFont('helvetica', 'normal');
          const translatedLine = this.translateContent(line);
          const splitText = this.pdf.splitTextToSize(translatedLine, this.pageWidth - 2 * this.margin);
          this.pdf.text(splitText, this.margin, this.currentY);
          this.currentY += splitText.length * 6;
        } else {
          // Empty line
          this.currentY += 6;
        }
      }
    }

    // Footer
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('© 2025 NorthPath Strategies', this.margin, this.pageHeight - 20);
    this.pdf.text(`Generated: ${new Date().toLocaleDateString()}`, this.pageWidth - 80, this.pageHeight - 20);

    return this.pdf.output('blob');
  }

  private async createCoverPage(data: ReportData) {
    // Header
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Organizational Realignment', this.margin, 50);
    this.pdf.text('Assessment Report', this.margin, 65);

    // Institution name
    if (data.institutionName) {
      this.pdf.setFontSize(20);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(data.institutionName, this.margin, 85);
    }

    // Executive assessment details with premium layout
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Assessment Overview', this.margin, 155);

    // Professional info boxes
    this.pdf.setFillColor(250, 250, 250);
    this.pdf.rect(this.margin, 165, 90, 45, 'F');
    this.pdf.rect(this.margin + 100, 165, 90, 45, 'F');

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Assessment Date', this.margin + 5, 175);
    this.pdf.text('Report Generated', this.margin + 105, 175);

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(new Date(data.assessmentDate).toLocaleDateString(), this.margin + 5, 185);
    this.pdf.text(new Date().toLocaleDateString(), this.margin + 105, 185);

    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setFontSize(10);
    this.pdf.text('OREA™ Algorithm Analysis', this.margin + 5, 195);
    this.pdf.text('AI-Powered Strategic Insights', this.margin + 105, 195);

    // Key executive metrics preview with visual emphasis
    const executiveSummary = data.analysis.executiveSummary || {};
    const organizationalHealth = executiveSummary.organizationalHealth?.score || 0;
    const aiReadinessScore = executiveSummary.aiReadiness?.score || 0;
    const redundancyIndex = executiveSummary.redundancyAssessment?.index || 0;
    
    this.pdf.setFillColor(25, 43, 81);
    this.pdf.rect(this.margin, 225, this.pageWidth - 2 * this.margin, 25, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('EXECUTIVE DASHBOARD', this.margin + 10, 240);

    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFillColor(255, 255, 255);
    
    // Professional metric boxes
    const metrics = [
      { label: 'Organizational Health', value: `${Math.round(organizationalHealth)}/100`, color: this.getScoreColor(organizationalHealth) },
      { label: 'AI Readiness Score', value: `${Math.round(aiReadinessScore)}/100`, color: this.getScoreColor(aiReadinessScore) },
      { label: 'Redundancy Index', value: `${Math.round(redundancyIndex)}%`, color: this.getRedundancyColor(redundancyIndex) }
    ];

    let yPos = 260;
    metrics.forEach((metric, index) => {
      const xPos = this.margin + (index * 65);
      
      // Metric box
      this.pdf.setFillColor(250, 250, 250);
      this.pdf.rect(xPos, yPos, 60, 30, 'F');
      
      // Metric value with color coding
      this.pdf.setTextColor(metric.color.r, metric.color.g, metric.color.b);
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(metric.value, xPos + 5, yPos + 15);
      
      // Metric label
      this.pdf.setTextColor(70, 70, 70);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      const labelLines = this.pdf.splitTextToSize(metric.label, 50);
      this.pdf.text(labelLines, xPos + 5, yPos + 23);
    });

    // Executive confidentiality notice
    this.pdf.setTextColor(120, 120, 120);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('CONFIDENTIAL - BOARD USE ONLY', this.margin, 310);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('This report contains proprietary analysis and strategic recommendations.', this.margin, 320);
    this.pdf.text('Distribution limited to executive leadership and board members.', this.margin, 330);

    // Professional footer
    this.pdf.setTextColor(25, 43, 81);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('© 2025 NorthPath Strategies', this.pageWidth - 120, 350);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.text('Strategic Organizational Consulting', this.pageWidth - 120, 360);

    this.addNewPage();
  }

  private getScoreColor(score: number) {
    if (score >= 80) return { r: 34, g: 139, b: 34 }; // Green
    if (score >= 60) return { r: 255, g: 165, b: 0 }; // Orange
    return { r: 220, g: 20, b: 60 }; // Red
  }

  private getRedundancyColor(redundancy: number) {
    if (redundancy <= 15) return { r: 34, g: 139, b: 34 }; // Green - low redundancy is good
    if (redundancy <= 30) return { r: 255, g: 165, b: 0 }; // Orange
    return { r: 220, g: 20, b: 60 }; // Red - high redundancy is bad
  }

  private async createEnhancedCoverPage(data: ReportData) {
    // Board-Ready Professional Header with logo space
    this.pdf.setFillColor(25, 43, 81); // Executive navy blue
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F');
    
    // Executive-level title styling
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(36);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ORGANIZATIONAL', this.margin, 35);
    this.pdf.text('REALIGNMENT', this.margin, 50);
    this.pdf.setFontSize(28);
    this.pdf.text('STRATEGIC ASSESSMENT', this.margin, 65);

    // NorthPath Strategies branding
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('NorthPath Strategies', this.pageWidth - 100, 35);
    this.pdf.text('Board-Ready Report', this.pageWidth - 100, 50);

    // Reset text color and add premium styling
    this.pdf.setTextColor(0, 0, 0);
    
    // Executive institution name section
    if (data.institutionName) {
      this.pdf.setFillColor(245, 245, 245);
      this.pdf.rect(this.margin, 95, this.pageWidth - 2 * this.margin, 35, 'F');
      
      this.pdf.setFontSize(28);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(data.institutionName, this.margin + 10, 115);
      
      // Subtitle
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(70, 70, 70);
      this.pdf.text('Strategic Organizational Analysis', this.margin + 10, 125);
      this.pdf.setTextColor(0, 0, 0);
    }

    // AI-Enhanced badge if applicable
    if (data.includeAI) {
      this.pdf.setFillColor(138, 43, 226); // Purple for AI
      this.pdf.roundedRect(this.margin, 95, 80, 15, 3, 3, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('AI-ENHANCED ANALYSIS', this.margin + 5, 105);
      this.pdf.setTextColor(0, 0, 0);
    }

    // Assessment details
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Assessment Date: ${new Date(data.assessmentDate).toLocaleDateString()}`, this.margin, 130);
    this.pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, this.margin, 145);
    this.pdf.text(`Generated for: ${data.generatedBy || 'Organization Leadership'}`, this.margin, 160);

    // Key metrics preview with enhanced design
    const { organizationalHealth, aiReadinessScore, redundancyIndex } = data.analysis;
    
    this.pdf.setFillColor(248, 249, 250);
    this.pdf.rect(this.margin, 175, this.pageWidth - 2 * this.margin, 60, 'F');
    this.pdf.setDrawColor(220, 221, 225);
    this.pdf.rect(this.margin, 175, this.pageWidth - 2 * this.margin, 60);

    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('EXECUTIVE SUMMARY', this.margin + 10, 190);

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    const healthColor = organizationalHealth >= 80 ? [34, 197, 94] : organizationalHealth >= 60 ? [251, 146, 60] : [239, 68, 68];
    const aiColor = aiReadinessScore >= 80 ? [34, 197, 94] : aiReadinessScore >= 60 ? [251, 146, 60] : [239, 68, 68];
    
    this.pdf.setTextColor(healthColor[0], healthColor[1], healthColor[2]);
    this.pdf.text(`Organizational Health: ${Math.round(organizationalHealth)}/100`, this.margin + 10, 205);
    
    this.pdf.setTextColor(aiColor[0], aiColor[1], aiColor[2]);
    this.pdf.text(`AI Readiness Score: ${Math.round(aiReadinessScore)}/100`, this.margin + 10, 220);
    
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(`Optimization Potential: ${Math.round(redundancyIndex)}%`, this.margin + 10, 235);

    // Professional footer
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('Powered by OREA (Organizational Realignment Engine Algorithm)', this.margin, 255);
    this.pdf.text('Northpath Strategies - Strategic Organizational Consulting', this.margin, 265);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('CONFIDENTIAL - For Internal Use Only', this.margin, 280);
    this.pdf.text('© 2025 Northpath Strategies', this.pageWidth - 80, 280);

    this.addNewPage();
  }

  private async createTableOfContents() {
    this.addSectionHeader('Table of Contents');
    
    const contents = [
      { title: 'Executive Summary', page: 3 },
      { title: 'Key Performance Metrics', page: 4 },
      { title: 'Priority Recommendations', page: 5 },
      { title: 'Detailed Section Analysis', page: 6 },
      { title: 'AI Implementation Roadmap', page: 7 },
      { title: 'Transformation Strategy', page: 8 },
      { title: 'Cost-Benefit Analysis', page: 9 },
      { title: 'Industry Benchmarks', page: 10 },
      { title: 'Risk Assessment', page: 11 },
      { title: 'Implementation Timeline', page: 12 },
      { title: 'Appendix', page: 13 }
    ];

    contents.forEach((item, index) => {
      const y = this.currentY + (index * 12);
      this.pdf.setFontSize(12);
      this.pdf.text(item.title, this.margin, y);
      
      // Draw dots
      const dotsStart = this.margin + 120;
      const dotsEnd = this.pageWidth - 40;
      this.pdf.setFontSize(8);
      let dotX = dotsStart;
      while (dotX < dotsEnd) {
        this.pdf.text('.', dotX, y);
        dotX += 3;
      }
      
      this.pdf.setFontSize(12);
      this.pdf.text(item.page.toString(), this.pageWidth - 30, y);
    });

    this.addNewPage();
  }

  private async createExecutiveSummary(executiveSummary: any) {
    // Board-ready executive summary with professional layout
    this.addBoardReadyHeader('Executive Summary');
    
    // Strategic overview section
    this.addSubsectionHeader('Strategic Overview');
    this.addText('This executive summary provides board-level insights into organizational health, AI readiness, and strategic realignment opportunities. The analysis leverages our proprietary OREA™ algorithm to deliver actionable intelligence for executive decision-making.');
    
    this.addLineBreak();

    // Organizational Health - Executive Format
    this.addSubsectionHeader('Organizational Health Assessment');
    this.addExecutiveMetric('Current Status', executiveSummary.organizationalHealth.status);
    this.addExecutiveMetric('Health Score', `${executiveSummary.organizationalHealth.score}/100`);
    this.addText(executiveSummary.organizationalHealth.description);
    
    this.addLineBreak();

    // AI Readiness - Strategic Perspective
    this.addSubsectionHeader('AI Readiness & Strategic Positioning');
    this.addExecutiveMetric('Readiness Level', executiveSummary.aiReadiness.level);
    this.addExecutiveMetric('AI Score', `${executiveSummary.aiReadiness.score}/100`);
    this.addText(executiveSummary.aiReadiness.description);
    
    this.addLineBreak();

    // Redundancy Assessment - Cost Impact Focus
    this.addSubsectionHeader('Operational Efficiency & Redundancy Analysis');
    this.addExecutiveMetric('Redundancy Index', `${executiveSummary.redundancyAssessment.index}%`);
    this.addText(executiveSummary.redundancyAssessment.description);
    
    this.addLineBreak();

    // Action Required - Board Decision Points
    this.addSubsectionHeader('Executive Action Items & Board Decisions');
    this.addExecutiveMetric('Critical Issues Requiring Immediate Attention', `${executiveSummary.actionRequired.critical} items`);
    this.addExecutiveMetric('High Priority Strategic Initiatives', `${executiveSummary.actionRequired.high} items`);
    this.addText(executiveSummary.actionRequired.description);

    this.addNewPage();
  }

  private addBoardReadyHeader(title: string) {
    this.pdf.setFillColor(25, 43, 81);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin + 10, this.currentY + 17);
    this.pdf.setTextColor(0, 0, 0);
    
    this.currentY += 35;
  }

  private addSubsectionHeader(title: string) {
    this.checkPageBreak(20);
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 18, 'F');
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin + 8, this.currentY + 12);
    this.currentY += 25;
  }

  private addExecutiveMetric(label: string, value: string) {
    this.checkPageBreak(15);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${label}:`, this.margin + 5, this.currentY);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(25, 43, 81);
    this.pdf.text(value, this.margin + 5 + this.pdf.getTextWidth(`${label}: `), this.currentY);
    this.pdf.setTextColor(0, 0, 0);
    
    this.currentY += 15;
  }

  private async createAIExecutiveSummary(analysis: any) {
    this.addSectionHeader('AI-Enhanced Executive Summary');
    
    if (analysis.executiveSummary) {
      this.addText(analysis.executiveSummary);
      this.addSpacing(10);
    }
    
    this.addSubheader('AI-Generated Insights');
    this.addText('This analysis leverages advanced artificial intelligence to provide deeper insights into your organizational structure, efficiency patterns, and strategic opportunities.');
    
    this.addNewPage();
  }

  private async createAIKeyFindings(analysis: any) {
    this.addSectionHeader('Key Findings');
    
    if (analysis.keyFindings && Array.isArray(analysis.keyFindings)) {
      analysis.keyFindings.forEach((finding: string, index: number) => {
        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(`${index + 1}.`, this.margin, this.currentY);
        
        this.pdf.setFont('helvetica', 'normal');
        const lines = this.pdf.splitTextToSize(finding, this.pageWidth - 2 * this.margin - 10);
        this.pdf.text(lines, this.margin + 10, this.currentY);
        
        this.currentY += lines.length * 6 + 5;
        this.checkPageSpace(10);
      });
    }
    
    this.addNewPage();
  }

  private async createKeyMetrics(analysis: any) {
    this.addSectionHeader('Key Performance Metrics');

    // Create a simple bar chart representation
    const metrics = [
      { label: 'Organizational Health', value: analysis.organizationalHealth },
      { label: 'AI Readiness', value: analysis.aiReadinessScore },
      { label: 'Efficiency Index', value: 100 - analysis.redundancyIndex }
    ];

    metrics.forEach((metric, index) => {
      const y = this.currentY + (index * 25);
      this.pdf.setFontSize(12);
      this.pdf.text(metric.label, this.margin, y);
      
      // Draw bar
      const barWidth = (metric.value / 100) * 100;
      this.pdf.setFillColor(metric.value > 70 ? 76 : metric.value > 50 ? 255 : 220, 
                           metric.value > 70 ? 175 : metric.value > 50 ? 193 : 53, 
                           metric.value > 70 ? 80 : metric.value > 50 ? 7 : 69);
      this.pdf.rect(this.margin + 50, y - 5, barWidth, 8, 'F');
      
      // Draw border
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.rect(this.margin + 50, y - 5, 100, 8);
      
      // Add percentage
      this.pdf.text(`${Math.round(metric.value)}%`, this.margin + 160, y);
    });

    this.currentY += 80;
    this.addNewPage();
  }

  private async createRecommendations(recommendations: any[]) {
    this.addBoardReadyHeader('Strategic Recommendations & Financial Impact');

    // Executive summary of recommendations
    this.addText('The following strategic recommendations have been prioritized based on financial impact, implementation complexity, and organizational readiness. Each recommendation includes detailed ROI projections and executive accountability assignments.');
    this.addLineBreak();

    recommendations.slice(0, 8).forEach((rec, index) => {
      this.checkPageBreak(60);
      
      // Recommendation header with priority styling
      const priorityColor = this.getPriorityColor(rec.priority);
      this.pdf.setFillColor(priorityColor.r, priorityColor.g, priorityColor.b);
      this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 'F');
      
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`RECOMMENDATION ${index + 1}: ${rec.title.toUpperCase()}`, this.margin + 8, this.currentY + 13);
      this.pdf.setTextColor(0, 0, 0);
      this.currentY += 30;

      // Board-ready metrics section
      this.addExecutiveMetric('Strategic Priority', rec.priority.toUpperCase());
      this.addExecutiveMetric('Financial Category', rec.category);
      this.addExecutiveMetric('Department/Division', rec.section);
      
      // Financial impact section
      this.pdf.setFillColor(250, 250, 250);
      this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 40, 'F');
      
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('FINANCIAL IMPACT ANALYSIS', this.margin + 8, this.currentY + 12);
      
      this.currentY += 20;
      this.addExecutiveMetric('Expected ROI', `${rec.expectedROI}% within ${rec.timeToImplement} months`);
      
      // Calculate and display dollar impact
      const estimatedSavings = this.calculateSavings(rec.expectedROI, rec.section);
      this.addExecutiveMetric('Projected Annual Savings', `$${estimatedSavings.toLocaleString()}`);
      this.addExecutiveMetric('Risk Assessment', `${rec.riskLevel}/10 (${this.getRiskLabel(rec.riskLevel)})`);
      
      this.currentY += 15;
      
      // Implementation details
      this.addSubsectionHeader('Implementation Strategy');
      this.addText(rec.description);
      
      if (rec.aiOpportunity) {
        this.addLineBreak();
        this.addExecutiveMetric('AI Automation Potential', `${rec.aiOpportunity.automationPotential}%`);
        this.addExecutiveMetric('Technology Requirements', rec.aiOpportunity.toolsRequired.join(', '));
      }
      
      // Responsible party and timeline
      this.addExecutiveMetric('Executive Owner', this.getExecutiveOwner(rec.section));
      this.addExecutiveMetric('Board Review Date', this.getReviewDate(rec.timeToImplement));
      
      this.currentY += 20;
    });

    this.addNewPage();
  }

  private getPriorityColor(priority: string) {
    switch(priority.toLowerCase()) {
      case 'critical': return { r: 220, g: 20, b: 60 }; // Red
      case 'high': return { r: 255, g: 140, b: 0 }; // Orange
      case 'medium': return { r: 255, g: 215, b: 0 }; // Gold
      default: return { r: 70, g: 130, b: 180 }; // Steel blue
    }
  }

  private calculateSavings(roi: number, section: string): number {
    // Base savings calculation - board-ready estimates
    const baseSalary = 75000;
    const departmentSize = this.getDepartmentSize(section);
    const annualCost = baseSalary * departmentSize;
    return Math.round(annualCost * (roi / 100));
  }

  private getDepartmentSize(section: string): number {
    const sectionSizes: Record<string, number> = {
      'Human Resources': 8,
      'Finance': 12,
      'Operations': 15,
      'IT': 10,
      'Academic Affairs': 25,
      'Student Services': 18,
      'Administration': 12
    };
    return sectionSizes[section] || 10;
  }

  private getRiskLabel(riskLevel: number): string {
    if (riskLevel <= 3) return 'Low Risk - Board Approved';
    if (riskLevel <= 6) return 'Moderate Risk - Board Review Required';
    return 'High Risk - Executive Committee Approval Required';
  }

  private getExecutiveOwner(section: string): string {
    const owners: Record<string, string> = {
      'Human Resources': 'Chief Human Resources Officer',
      'Finance': 'Chief Financial Officer',
      'Operations': 'Chief Operating Officer',
      'IT': 'Chief Information Officer',
      'Academic Affairs': 'Provost/Chief Academic Officer',
      'Student Services': 'Vice President of Student Affairs',
      'Administration': 'Chief Executive Officer'
    };
    return owners[section] || 'Chief Executive Officer';
  }

  private getReviewDate(timeToImplement: number): string {
    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() + Math.ceil(timeToImplement / 2));
    return reviewDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  private async createSectionAnalysis(sectionsAnalysis: any[]) {
    this.addSectionHeader('Detailed Section Analysis');

    sectionsAnalysis.forEach((section) => {
      this.checkPageSpace(35);
      
      this.addSubheader(section.section);
      this.addText(`Performance: ${section.performance}`);
      this.addText(`Average Score: ${section.averageScore}/5.0`);
      this.addText(`Consistency: ${section.consistency}%`);
      this.addText(`Strength Areas: ${section.strengthAreas} questions`);
      this.addText(`Improvement Areas: ${section.improvementAreas} questions`);
      this.addText(`Total Questions: ${section.totalQuestions}`);
      
      this.addSpacing(6);
    });

    this.addNewPage();
  }

  private async createAIRoadmap(aiPlan: any) {
    this.addSectionHeader('AI Implementation Roadmap');

    this.addSubheader('Quick Wins (0-6 months)');
    aiPlan.quickWins.slice(0, 5).forEach((win: any) => {
      this.addText(`• ${win.section}: ${win.title}`);
      this.addText(`  ROI: ${win.expectedROI}%, Time: ${win.timeToImplement} months`);
    });

    this.addSpacing(10);

    this.addSubheader('Strategic Initiatives (6-18 months)');
    aiPlan.strategicInitiatives.slice(0, 5).forEach((initiative: any) => {
      this.addText(`• ${initiative.section}: ${initiative.title}`);
      this.addText(`  ROI: ${initiative.expectedROI}%, Cost: $${initiative.estimatedCost?.toLocaleString() || 'TBD'}`);
    });

    this.addNewPage();
  }

  private async createTransformationPlan(roadmap: any[]) {
    this.addSectionHeader('Transformation Roadmap');

    roadmap.forEach((phase) => {
      this.checkPageSpace(25);
      
      this.addSubheader(`Phase ${phase.phase}: ${phase.name}`);
      this.addText(`Duration: ${phase.duration} months`);
      this.addText(`Expected Impact: ${phase.expectedImpact}`);
      this.addText(`Recommendations: ${phase.recommendations.length} items`);
      
      this.addSpacing(6);
    });

    this.addNewPage();
  }

  private async createCostBenefitAnalysis(analysis: any) {
    this.addSectionHeader('Cost-Benefit Analysis');
    
    if (analysis.costBenefitAnalysis) {
      const cba = analysis.costBenefitAnalysis;
      
      this.addSubheader('Financial Impact Summary');
      this.addText(`Total Implementation Cost: $${cba.totalImplementationCost?.toLocaleString() || 'N/A'}`);
      this.addText(`Expected Annual Savings: $${cba.expectedAnnualSavings?.toLocaleString() || 'N/A'}`);
      this.addText(`Payback Period: ${cba.paybackPeriodMonths || 'N/A'} months`);
      this.addText(`5-Year ROI: ${cba.fiveYearROI || 'N/A'}%`);
      this.addText(`Risk-Adjusted ROI: ${cba.riskAdjustedROI || 'N/A'}%`);
    }
    
    this.addNewPage();
  }

  private async createBenchmarkComparison(analysis: any) {
    this.addSectionHeader('Industry Benchmarks');
    
    if (analysis.benchmarkComparison) {
      const benchmark = analysis.benchmarkComparison;
      
      this.addSubheader('Peer Comparison');
      this.addText(benchmark.peerComparison);
      this.addSpacing(10);
      
      this.addSubheader('Performance Metrics vs Industry Standards');
      
      if (benchmark.industryStandards) {
        benchmark.industryStandards.forEach((metric: any) => {
          this.addText(`${metric.metric}:`);
          this.addText(`  Your Score: ${metric.yourScore}`);
          this.addText(`  Industry Average: ${metric.industryAverage}`);
          this.addText(`  Top Performers: ${metric.topPerformers}`);
          this.addSpacing(5);
        });
      }
    }
    
    this.addNewPage();
  }

  private async createRiskAssessment(analysis: any) {
    this.addSectionHeader('Risk Assessment');
    
    if (analysis.riskAssessment) {
      this.addText(analysis.riskAssessment);
    }
    
    this.addNewPage();
  }

  private async createImplementationRoadmap(analysis: any) {
    this.addSectionHeader('Implementation Roadmap');
    
    if (analysis.implementationRoadmap) {
      analysis.implementationRoadmap.forEach((phase: any) => {
        this.addSubheader(`${phase.phase.toUpperCase()} (${phase.timeframe})`);
        this.addText(`Priority: ${phase.priority.toUpperCase()}`);
        
        if (phase.initiatives) {
          phase.initiatives.forEach((initiative: any) => {
            this.pdf.setFontSize(11);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.text(`• ${initiative.title}`, this.margin + 5, this.currentY);
            this.currentY += 6;
            
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setFontSize(10);
            this.addText(`  ${initiative.description}`);
            this.addText(`  Expected ROI: ${initiative.expectedROI}% | Cost: $${initiative.implementationCost.toLocaleString()} | Risk Level: ${initiative.riskLevel}/10`);
            this.addSpacing(3);
          });
        }
        
        this.addSpacing(10);
      });
    }
    
    this.addNewPage();
  }

  private async createAppendix() {
    this.addSectionHeader('Appendix');
    
    this.addSubheader('Methodology');
    this.addText('This analysis was conducted using the Organizational Realignment Engine Algorithm (OREA), which evaluates organizational efficiency, AI readiness, and optimization opportunities across multiple dimensions.');
    
    this.addSpacing(5);
    
    this.addSubheader('Data Sources');
    this.addText('• Assessment responses from key stakeholders');
    this.addText('• Industry benchmarking data');
    this.addText('• Best practice frameworks');
    this.addText('• AI capability assessments');
    
    this.addSpacing(5);
    
    this.addSubheader('Scoring Methodology');
    this.addText('Scores are calculated using weighted averages across response categories, with additional algorithms for consistency checking and outlier detection.');
    
    this.addNewPage();
  }

  private addSectionHeader(title: string) {
    this.checkPageSpace(15);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;
  }

  private addSubheader(title: string) {
    this.checkPageSpace(10);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addText(text: string) {
    this.checkPageSpace(8);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    // Handle text wrapping
    const lines = this.pdf.splitTextToSize(text, this.pageWidth - (this.margin * 2));
    lines.forEach((line: string) => {
      this.checkPageSpace(5);
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });
  }

  private addSpacing(space: number) {
    this.currentY += space;
  }

  private checkPageSpace(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.addNewPage();
    }
  }

  private addNewPage() {
    this.pdf.addPage();
    this.currentY = this.margin;
  }

  private addPageNumbers() {
    const pageCount = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`Page ${i} of ${pageCount}`, this.pageWidth - 40, this.pageHeight - 10);
    }
  }

  private addLineBreak() {
    this.currentY += 12;
  }

  private checkPageBreak(spaceNeeded: number) {
    if (this.currentY + spaceNeeded > this.pageHeight - 50) {
      this.addNewPage();
    }
  }
}

export async function generatePDFReport(analysisData: any, institutionName?: string): Promise<Blob> {
  const generator = new PDFReportGenerator();
  
  // Transform simple assessment data into the expected complex structure
  const transformedAnalysis = {
    executiveSummary: {
      organizationalHealth: {
        status: getHealthStatus(analysisData.score || 0),
        score: Math.round((analysisData.score || 0) * 100),
        description: `Based on comprehensive assessment, your organization shows a health score of ${Math.round((analysisData.score || 0) * 100)}%. ${getHealthDescription(analysisData.score || 0)}`
      },
      aiReadiness: {
        level: getAIReadinessLevel(analysisData.score || 0),
        score: Math.round((analysisData.score || 0) * 80), // AI readiness typically lower than overall
        description: `Your organization's AI readiness assessment indicates ${getAIReadinessDescription(analysisData.score || 0)}.`
      },
      redundancyAssessment: {
        index: Math.round((1 - (analysisData.score || 0)) * 30), // Lower scores = higher redundancy
        description: `Operational efficiency analysis shows ${getRedundancyDescription(analysisData.score || 0)}.`
      },
      actionRequired: {
        critical: Math.max(1, Math.round((1 - (analysisData.score || 0)) * 5)), // Lower scores = more critical items
        high: Math.max(2, Math.round((1 - (analysisData.score || 0)) * 8)),
        description: `Immediate attention is required for ${Math.max(1, Math.round((1 - (analysisData.score || 0)) * 5))} critical organizational issues to ensure continued operational effectiveness.`
      }
    },
    recommendations: analysisData.recommendations || ['Complete detailed assessment for specific recommendations'],
    sectionScores: analysisData.sectionScores || { overall: analysisData.score || 0 },
    sectionsAnalysis: transformSectionScores(analysisData.sectionScores || {}),
    aiImplementationPlan: {
      phases: generateAIImplementationPhases(analysisData.tier),
      timeline: '6-12 months',
      priorities: analysisData.recommendations?.slice(0, 3) || ['Assessment completion', 'Strategic planning', 'Implementation']
    },
    transformationRoadmap: {
      quickWins: analysisData.recommendations?.slice(0, 2) || ['Process optimization'],
      mediumTerm: ['Organizational restructuring', 'Technology integration'],
      longTerm: ['Cultural transformation', 'Continuous improvement systems']
    }
  };
  
  const reportData: ReportData = {
    analysis: transformedAnalysis,
    institutionName: institutionName || analysisData.assessmentData?.institutionName || 'Your Institution',
    assessmentDate: analysisData.generatedAt || new Date().toISOString(),
    generatedBy: 'NorthPath Strategies AI Assessment',
    institutionType: getInstitutionType(analysisData.assessmentData?.organizationType)
  };

  return await generator.generateReport(reportData);
}

// Helper functions for data transformation
function getHealthStatus(score: number): string {
  if (score >= 0.8) return 'Excellent';
  if (score >= 0.6) return 'Good';
  if (score >= 0.4) return 'Fair';
  return 'Needs Improvement';
}

function getHealthDescription(score: number): string {
  if (score >= 0.8) return 'Your organization demonstrates strong operational efficiency and strategic alignment.';
  if (score >= 0.6) return 'Your organization shows solid fundamentals with opportunities for optimization.';
  if (score >= 0.4) return 'Your organization has moderate efficiency with several areas requiring attention.';
  return 'Your organization has significant opportunities for improvement across multiple dimensions.';
}

function getAIReadinessLevel(score: number): string {
  if (score >= 0.7) return 'Advanced';
  if (score >= 0.5) return 'Intermediate';
  if (score >= 0.3) return 'Basic';
  return 'Foundational';
}

function getAIReadinessDescription(score: number): string {
  if (score >= 0.7) return 'strong readiness for AI implementation with existing infrastructure and processes supporting advanced technologies';
  if (score >= 0.5) return 'moderate readiness with some infrastructure in place, requiring focused preparation for AI initiatives';
  if (score >= 0.3) return 'basic readiness with foundational elements present, requiring significant preparation for AI adoption';
  return 'foundational readiness requiring comprehensive preparation and infrastructure development before AI implementation';
}

function getRedundancyDescription(score: number): string {
  if (score >= 0.7) return 'high operational efficiency with minimal redundancy in processes and systems';
  if (score >= 0.5) return 'moderate efficiency with some redundancies that can be optimized';
  if (score >= 0.3) return 'fair efficiency with notable redundancies impacting performance';
  return 'significant redundancies present, offering substantial optimization opportunities';
}

function transformSectionScores(sectionScores: any): any {
  const sections = ['leadership', 'operations', 'technology', 'culture', 'strategy'];
  const result: any = {};
  
  sections.forEach(section => {
    const score = sectionScores[section] || sectionScores.overall || 0.5;
    result[section] = {
      score: Math.round(score * 100),
      analysis: `${section.charAt(0).toUpperCase() + section.slice(1)} assessment shows ${getHealthStatus(score).toLowerCase()} performance with ${getHealthDescription(score).toLowerCase()}`,
      recommendations: [`Improve ${section} effectiveness`, `Enhance ${section} processes`]
    };
  });
  
  return result;
}

function generateAIImplementationPhases(tier: string): string[] {
  const phases = [
    'Assessment and Planning',
    'Infrastructure Preparation',
    'Pilot Implementation',
    'Full Deployment',
    'Optimization and Scaling'
  ];
  
  if (tier === 'enterprise-transformation') {
    return phases;
  } else if (tier === 'comprehensive-package') {
    return phases.slice(0, 4);
  }
  
  return phases.slice(0, 3);
}

function getInstitutionType(orgType: string): InstitutionType | undefined {
  const mapping: Record<string, InstitutionType> = {
    'higher-education': 'community-college',
    'community_college': 'community-college',
    'public_university': 'public-university',
    'private_university': 'private-university',
    'hospital_healthcare': 'healthcare',
    'nonprofit': 'nonprofit',
    'government_agency': 'government',
    'company_business': 'corporate',
    'trade_technical': 'community-college'
  };
  
  return mapping[orgType];
}

/**
 * Generates industry-specific PDF content based on institution type
 * This function is used for testing and specialized report generation
 */
export function generateIndustrySpecificPDFContent(
  analysisData: any, 
  institutionType: InstitutionType
): { translatedSections: Record<string, string>; customTerms: Record<string, string> } {
  const reportLabels = getReportLabels(institutionType);
  
  // Create sample translated sections for testing
  const translatedSections: Record<string, string> = {};
  const customTerms: Record<string, string> = {};
  
  // Translate common report sections
  const commonSections = [
    'Executive Summary',
    'Recommendations', 
    'Implementation Plan',
    'Success Metrics',
    'Cost Analysis',
    'Risk Assessment'
  ];
  
  commonSections.forEach(section => {
    translatedSections[section] = reportLabels[section] || section;
  });
  
  // Translate common terms based on institution type
  const commonTerms = ['student', 'curriculum', 'enrollment'];
  commonTerms.forEach(term => {
    customTerms[term] = translateText(term, institutionType);
  });
  
  return {
    translatedSections,
    customTerms
  };
}
