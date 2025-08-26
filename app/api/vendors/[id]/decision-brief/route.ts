/**
 * API Route: Vendor Decision Brief Generation
 * POST /api/vendors/:id/decision-brief - Generate decision brief PDF
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { VendorService } from '@/lib/services/vendor'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Get user info from headers
    const userId = request.headers.get('x-user-id') || 'demo-user'
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    const vendorId = params.id
    
    if (!vendorId) {
      return NextResponse.json({
        success: false,
        error: 'Vendor ID is required'
      }, { status: 400 })
    }

    console.log(`Generating decision brief for vendor: ${vendorId}`)

    // Generate the decision brief
    const brief = await VendorService.generateDecisionBrief(vendorId, userId)

    // In a real implementation, you would generate a PDF here
    // For now, we'll return the structured brief data
    const pdfUrl = await generateDecisionBriefPDF(brief)

    return NextResponse.json({
      success: true,
      data: {
        brief,
        pdfUrl,
        downloadUrl: `/api/vendors/${vendorId}/decision-brief/download`
      },
      message: 'Decision brief generated successfully'
    })

  } catch (error) {
    console.error('Decision brief generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

/**
 * Mock PDF generation function
 * In production, this would use a PDF library like Puppeteer, jsPDF, or PDFKit
 */
async function generateDecisionBriefPDF(brief: any): Promise<string> {
  // Mock PDF generation - in reality you'd use:
  // - Puppeteer to render HTML to PDF
  // - jsPDF for client-side PDF generation
  // - PDFKit for server-side PDF creation
  // - A template engine like Handlebars + HTML/CSS
  
  const pdfContent = generatePDFContent(brief)
  
  // In a real implementation:
  // const pdf = await puppeteer.launch()
  // const page = await pdf.newPage()
  // await page.setContent(pdfContent)
  // const pdfBuffer = await page.pdf({ format: 'A4' })
  // const pdfUrl = await uploadToStorage(pdfBuffer)
  
  // For demo, return a mock URL
  return `/api/vendors/${brief.vendorId}/decision-brief.pdf`
}

/**
 * Generate HTML content for PDF
 */
function generatePDFContent(brief: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Vendor Decision Brief - ${brief.vendorName}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .risk-level { padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
            .risk-low { background-color: #28a745; }
            .risk-medium { background-color: #ffc107; color: #333; }
            .risk-high { background-color: #fd7e14; }
            .risk-critical { background-color: #dc3545; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .mitigation { background-color: #f8f9fa; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Vendor Decision Brief</h1>
            <h2>${brief.vendorName}</h2>
            <p>Generated on ${new Date(brief.generatedAt).toLocaleDateString()}</p>
            <p>Risk Level: <span class="risk-level risk-${brief.summary.riskLevel}">${brief.summary.riskLevel.toUpperCase()}</span></p>
        </div>

        <div class="section">
            <h2>Executive Summary</h2>
            <p><strong>Recommendation:</strong> ${brief.summary.recommendation.toUpperCase()}</p>
            <p><strong>Risk Score:</strong> ${brief.summary.riskScore}/100</p>
            <p><strong>Key Risks:</strong></p>
            <ul>
                ${brief.summary.keyRisks.map((risk: string) => `<li>${risk}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>Data Handling Assessment</h2>
            <table>
                <tr><th>Data Type</th><th>Details</th></tr>
                <tr><td>Stores PII</td><td>${brief.assessment.dataHandling.storesPII ? 'Yes' : 'No'}</td></tr>
                <tr><td>PII Types</td><td>${brief.assessment.dataHandling.piiTypes.join(', ')}</td></tr>
                <tr><td>Trains on User Data</td><td>${brief.assessment.dataHandling.trainsOnUserData ? 'Yes' : 'No'}</td></tr>
                <tr><td>Data Location</td><td>${brief.assessment.dataHandling.dataLocation}</td></tr>
                <tr><td>Retention Period</td><td>${brief.assessment.dataHandling.retention}</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>Compliance Flags</h2>
            <p><strong>Flagged Regulations:</strong> ${brief.assessment.compliance.flaggedRegulations.join(', ')}</p>
            <p><strong>Missing Certifications:</strong></p>
            <ul>
                ${brief.assessment.compliance.missingCertifications.map((cert: string) => `<li>${cert}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>Required Mitigations</h2>
            ${brief.mitigations.map((mitigation: any) => `
                <div class="mitigation">
                    <h4>${mitigation.title}</h4>
                    <p><strong>Type:</strong> ${mitigation.type}</p>
                    <p><strong>Risk Flag:</strong> ${mitigation.riskFlag}</p>
                    <p>${mitigation.description}</p>
                    <p><strong>Status:</strong> ${mitigation.status}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>Monitoring & Review</h2>
            <p><strong>Review Frequency:</strong> ${brief.monitoring.reviewFrequency}</p>
            <p><strong>Key Metrics:</strong></p>
            <ul>
                ${brief.monitoring.keyMetrics.map((metric: string) => `<li>${metric}</li>`).join('')}
            </ul>
            <p><strong>Escalation Triggers:</strong></p>
            <ul>
                ${brief.monitoring.escalationTriggers.map((trigger: string) => `<li>${trigger}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>Approval Requirements</h2>
            <p><strong>Required Approvers:</strong> ${brief.approvals.requiredApprovers.join(', ')}</p>
            <p><strong>Current Status:</strong> ${brief.approvals.currentStatus}</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
                ${brief.approvals.nextSteps.map((step: string) => `<li>${step}</li>`).join('')}
            </ul>
        </div>

        <div class="footer">
            <p>This document was automatically generated by the Vendor Intake System</p>
            <p>Generated by: ${brief.generatedBy} on ${new Date(brief.generatedAt).toLocaleString()}</p>
        </div>
    </body>
    </html>
  `
}
