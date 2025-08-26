// Data-driven PDF Generator - Legacy compatibility
// This file provides backward compatibility for older imports
export * from './fast-enhanced-ai-pdf-generator';
export { generateFastEnhancedAIPDFReport as default, generateFastEnhancedAIPDFReport as generateDataDrivenPDF } from './fast-enhanced-ai-pdf-generator';

// Add missing function
export async function generateDataDrivenPDFReport(options: any): Promise<Buffer> {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  const chunks: Uint8Array[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(new Uint8Array(chunk)));

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      resolve(Buffer.from(combined));
    });
    doc.on('error', reject);

    doc.fontSize(20).text('Data-Driven AI Readiness Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('AI readiness analysis based on assessment data');
    doc.end();
  });
}
