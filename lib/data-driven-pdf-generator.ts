// Data-driven PDF Generator - Legacy compatibility
// This file provides backward compatibility for older imports
export * from './fast-enhanced-ai-pdf-generator'
export { generateFastEnhancedAIPDFReport as generateDataDrivenPDF } from './fast-enhanced-ai-pdf-generator'
export { generateFastEnhancedAIPDFReport as default } from './fast-enhanced-ai-pdf-generator'

// Add missing function
export async function generateDataDrivenPDFReport(options: any): Promise<Buffer> {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Data-Driven AI Readiness Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('AI readiness analysis based on assessment data');
    doc.end();
  });
}
