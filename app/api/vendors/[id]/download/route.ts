/**
 * Decision Brief Download API
 * Serves generated decision briefs as PDF files
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { VendorService } from '@/lib/services/vendor'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = request.headers.get('x-user-id')
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const vendorId = params.id
    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      )
    }

    // Get the vendor and generate decision brief if needed
    const vendor = await VendorService.getVendor(vendorId, currentUserId)
    
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Generate the decision brief (will return existing if already generated)
    const decisionBrief = await VendorService.generateDecisionBrief(vendorId, currentUserId)
    
    if (!decisionBrief) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate decision brief' },
        { status: 500 }
      )
    }

    // Convert the decision brief to HTML content for PDF generation
    const htmlContent = `
      <div class="header">
        <h1>Vendor Assessment Decision Brief</h1>
        <h2>${decisionBrief.vendorName}</h2>
        <p>Generated: ${new Date(decisionBrief.generatedAt).toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h3>Executive Summary</h3>
        <p><strong>Recommendation:</strong> ${decisionBrief.summary.recommendation}</p>
        <p><strong>Risk Level:</strong> ${decisionBrief.summary.riskLevel}</p>
        <p><strong>Risk Score:</strong> ${decisionBrief.summary.riskScore}/100</p>
      </div>

      <div class="section">
        <h3>Key Risks</h3>
        <ul>
          ${decisionBrief.summary.keyRisks.map(risk => `<li>${risk}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h3>Required Mitigations</h3>
        <ul>
          ${decisionBrief.summary.primaryMitigations.map(mitigation => `<li>${mitigation}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h3>Data Handling Assessment</h3>
        <p><strong>Stores PII:</strong> ${decisionBrief.assessment.dataHandling.storesPII ? 'Yes' : 'No'}</p>
        <p><strong>Data Location:</strong> ${decisionBrief.assessment.dataHandling.dataLocation}</p>
        <p><strong>Retention Period:</strong> ${decisionBrief.assessment.dataHandling.retention}</p>
      </div>

      <div class="section">
        <h3>Compliance Status</h3>
        <p><strong>Flagged Regulations:</strong> ${decisionBrief.assessment.compliance.flaggedRegulations.join(', ') || 'None'}</p>
        <p><strong>Required Actions:</strong></p>
        <ul>
          ${decisionBrief.assessment.compliance.requiredActions.map(action => `<li>${action}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h3>Next Steps</h3>
        <p><strong>Current Status:</strong> ${decisionBrief.approvals.currentStatus}</p>
        <p><strong>Required Approvers:</strong> ${decisionBrief.approvals.requiredApprovers.join(', ')}</p>
        <ul>
          ${decisionBrief.approvals.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>
      </div>
    `
    
    // Mock PDF generation - convert HTML to a simple text format
    const textContent = htmlContent
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()

    // Create a simple PDF-like response
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${textContent.length + 100}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${textContent.replace(/\n/g, ') Tj T* (')}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000205 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${300 + textContent.length}
%%EOF`

    // Set appropriate headers for PDF download
    const fileName = `${vendor.assessment.basicInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_decision_brief.pdf`
    
    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Error downloading decision brief:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to download decision brief' 
      },
      { status: 500 }
    )
  }
}

// Alternative implementation using Puppeteer for real PDF generation
// Uncomment and install puppeteer for production use:

/*
import puppeteer from 'puppeteer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = request.headers.get('x-user-id')
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const vendorId = params.id
    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      )
    }

    // Get the vendor and its decision brief
    const vendorService = new VendorService()
    const vendor = await vendorService.getVendor(vendorId)
    
    if (!vendor || !vendor.decisionBrief) {
      return NextResponse.json(
        { success: false, error: 'Decision brief not found' },
        { status: 404 }
      )
    }

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Set the HTML content with proper styling
    const styledContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .risk-high { color: #dc2626; font-weight: bold; }
            .risk-medium { color: #ea580c; font-weight: bold; }
            .risk-low { color: #16a34a; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          ${vendor.decisionBrief.content}
        </body>
      </html>
    `
    
    await page.setContent(styledContent, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    })
    
    await browser.close()

    // Set appropriate headers for PDF download
    const fileName = `${vendor.assessment.basicInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_decision_brief.pdf`
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate PDF' 
      },
      { status: 500 }
    )
  }
}
*/
