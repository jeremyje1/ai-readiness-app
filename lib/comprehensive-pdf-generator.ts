// Comprehensive PDF Generator - Legacy compatibility
// This file provides backward compatibility for older imports
export * from './enhanced-ai-pdf-generator'
export { generateEnhancedAIPDFReport as generateComprehensivePDF } from './enhanced-ai-pdf-generator'
export { generateEnhancedAIPDFReport as default } from './enhanced-ai-pdf-generator'

// Add missing function export
export async function generateComprehensivePDFReport(options: any): Promise<Buffer> {
  const { generateEnhancedAIPDFReport } = await import('./enhanced-ai-pdf-generator');
  const doc = await generateEnhancedAIPDFReport(options);
  // Convert jsPDF to Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
