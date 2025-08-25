/**
 * Text Extractor Service
 * Extracts text content from various document formats
 * 
 * @version 1.0.0
 * @author Staff Software Engineer
 */

import { readFile } from 'fs/promises';
import { extname } from 'path';

export interface ExtractionResult {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    characterCount: number;
    language?: string;
    format: string;
    extractedAt: Date;
  };
  structure?: {
    headings: string[];
    sections: DocumentSection[];
    tables: TableData[];
  };
}

export interface DocumentSection {
  title: string;
  content: string;
  level: number;
  startPosition: number;
  endPosition: number;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export class TextExtractor {
  private extractors: Map<string, (buffer: Buffer) => Promise<ExtractionResult>>;

  constructor() {
    this.extractors = new Map([
      ['.pdf', this.extractFromPdf.bind(this)],
      ['.docx', this.extractFromDocx.bind(this)],
      ['.doc', this.extractFromDoc.bind(this)],
      ['.txt', this.extractFromText.bind(this)],
      ['.md', this.extractFromMarkdown.bind(this)],
      ['.html', this.extractFromHtml.bind(this)],
      ['.htm', this.extractFromHtml.bind(this)],
    ]);
  }

  async extract(filePath: string): Promise<ExtractionResult> {
    try {
      const buffer = await readFile(filePath);
      const extension = extname(filePath).toLowerCase();
      
      const extractor = this.extractors.get(extension);
      if (!extractor) {
        throw new Error(`Unsupported file format: ${extension}`);
      }

      const result = await extractor(buffer);
      
      // Validate extraction
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('No text content could be extracted from the document');
      }

      // Clean up extracted text
      result.text = this.cleanText(result.text);
      
      // Update metadata
      result.metadata.wordCount = this.countWords(result.text);
      result.metadata.characterCount = result.text.length;
      result.metadata.extractedAt = new Date();

      return result;

    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
    try {
      // In production, use pdf-parse or similar library
      // const pdf = await pdfParse(buffer);
      
      // Mock implementation for now
      const text = await this.mockPdfExtraction(buffer);
      
      return {
        text,
        metadata: {
          format: 'PDF',
          wordCount: 0, // Will be calculated later
          characterCount: 0, // Will be calculated later
          extractedAt: new Date(),
        },
        structure: await this.extractPdfStructure(text),
      };

    } catch (error) {
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractFromDocx(buffer: Buffer): Promise<ExtractionResult> {
    try {
      // In production, use mammoth or docx-parser
      // const result = await mammoth.extractRawText({ buffer });
      
      // Mock implementation for now
      const text = await this.mockDocxExtraction(buffer);
      
      return {
        text,
        metadata: {
          format: 'DOCX',
          wordCount: 0,
          characterCount: 0,
          extractedAt: new Date(),
        },
        structure: await this.extractDocxStructure(text),
      };

    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractFromDoc(buffer: Buffer): Promise<ExtractionResult> {
    try {
      // In production, use node-word-extractor or similar
      // const extractor = new WordExtractor();
      // const extracted = await extractor.extract(buffer);
      
      // Mock implementation for now
      const text = await this.mockDocExtraction(buffer);
      
      return {
        text,
        metadata: {
          format: 'DOC',
          wordCount: 0,
          characterCount: 0,
          extractedAt: new Date(),
        },
      };

    } catch (error) {
      throw new Error(`DOC extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractFromText(buffer: Buffer): Promise<ExtractionResult> {
    const text = buffer.toString('utf8');
    
    return {
      text,
      metadata: {
        format: 'TXT',
        wordCount: 0,
        characterCount: 0,
        extractedAt: new Date(),
      },
      structure: {
        headings: this.extractTextHeadings(text),
        sections: this.extractTextSections(text),
        tables: [],
      },
    };
  }

  private async extractFromMarkdown(buffer: Buffer): Promise<ExtractionResult> {
    const text = buffer.toString('utf8');
    const plainText = this.stripMarkdown(text);
    
    return {
      text: plainText,
      metadata: {
        format: 'Markdown',
        wordCount: 0,
        characterCount: 0,
        extractedAt: new Date(),
      },
      structure: {
        headings: this.extractMarkdownHeadings(text),
        sections: this.extractMarkdownSections(text),
        tables: this.extractMarkdownTables(text),
      },
    };
  }

  private async extractFromHtml(buffer: Buffer): Promise<ExtractionResult> {
    const html = buffer.toString('utf8');
    const text = this.stripHtml(html);
    
    return {
      text,
      metadata: {
        format: 'HTML',
        wordCount: 0,
        characterCount: 0,
        extractedAt: new Date(),
      },
      structure: {
        headings: this.extractHtmlHeadings(html),
        sections: this.extractHtmlSections(html),
        tables: this.extractHtmlTables(html),
      },
    };
  }

  private cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove non-printable characters except newlines and tabs
      .replace(/[^\x20-\x7E\n\t]/g, '')
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim
      .trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/`(.*?)`/g, '$1') // Remove code
      .replace(/^>\s+/gm, '') // Remove quotes
      .replace(/^[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\d+\.\s+/gm, ''); // Remove numbered lists
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/&[a-zA-Z0-9#]+;/g, ' '); // Remove entities
  }

  private extractTextHeadings(text: string): string[] {
    // Simple heading detection for plain text
    const lines = text.split('\n');
    const headings: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Detect potential headings (short lines, often capitalized)
      if (trimmed.length > 0 && trimmed.length < 100 && 
          (trimmed === trimmed.toUpperCase() || /^[A-Z]/.test(trimmed))) {
        headings.push(trimmed);
      }
    }
    
    return headings;
  }

  private extractTextSections(text: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = text.split('\n');
    let currentSection: DocumentSection | null = null;
    let position = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.length > 0 && trimmed.length < 100 && 
          (trimmed === trimmed.toUpperCase() || /^[A-Z]/.test(trimmed))) {
        // Potential heading - close previous section and start new one
        if (currentSection) {
          currentSection.endPosition = position;
          sections.push(currentSection);
        }
        
        currentSection = {
          title: trimmed,
          content: '',
          level: 1,
          startPosition: position,
          endPosition: 0,
        };
      } else if (currentSection && trimmed.length > 0) {
        currentSection.content += line + '\n';
      }
      
      position += line.length + 1;
    }
    
    if (currentSection) {
      currentSection.endPosition = position;
      sections.push(currentSection);
    }
    
    return sections;
  }

  private extractMarkdownHeadings(text: string): string[] {
    const headingRegex = /^#+\s+(.+)$/gm;
    const headings: string[] = [];
    let match;
    
    while ((match = headingRegex.exec(text)) !== null) {
      headings.push(match[1]);
    }
    
    return headings;
  }

  private extractMarkdownSections(text: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = text.split('\n');
    let currentSection: DocumentSection | null = null;
    let position = 0;
    
    for (const line of lines) {
      const headingMatch = line.match(/^(#+)\s+(.+)$/);
      
      if (headingMatch) {
        // Close previous section
        if (currentSection) {
          currentSection.endPosition = position;
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: headingMatch[2],
          content: '',
          level: headingMatch[1].length,
          startPosition: position,
          endPosition: 0,
        };
      } else if (currentSection && line.trim().length > 0) {
        currentSection.content += line + '\n';
      }
      
      position += line.length + 1;
    }
    
    if (currentSection) {
      currentSection.endPosition = position;
      sections.push(currentSection);
    }
    
    return sections;
  }

  private extractMarkdownTables(text: string): TableData[] {
    const tables: TableData[] = [];
    const tableRegex = /\|(.+)\|\s*\n\|([|-]+)\|\s*\n((?:\|.+\|\s*\n)*)/g;
    let match;
    
    while ((match = tableRegex.exec(text)) !== null) {
      const headerRow = match[1].split('|').map(cell => cell.trim());
      const dataRows = match[3].split('\n')
        .filter(row => row.includes('|'))
        .map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
      
      tables.push({
        headers: headerRow,
        rows: dataRows,
      });
    }
    
    return tables;
  }

  private extractHtmlHeadings(html: string): string[] {
    const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: string[] = [];
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      headings.push(this.stripHtml(match[1]));
    }
    
    return headings;
  }

  private extractHtmlSections(html: string): DocumentSection[] {
    // Simplified HTML section extraction
    return [];
  }

  private extractHtmlTables(html: string): TableData[] {
    // Simplified HTML table extraction
    return [];
  }

  private async extractPdfStructure(text: string): Promise<{ headings: string[]; sections: DocumentSection[]; tables: TableData[]; }> {
    // In production, use PDF structure analysis
    return {
      headings: [],
      sections: [],
      tables: [],
    };
  }

  private async extractDocxStructure(text: string): Promise<{ headings: string[]; sections: DocumentSection[]; tables: TableData[]; }> {
    // In production, use DOCX structure analysis
    return {
      headings: [],
      sections: [],
      tables: [],
    };
  }

  // Mock implementations for development
  private async mockPdfExtraction(buffer: Buffer): Promise<string> {
    // Return mock text for development
    return `
      AI Governance Policy

      1. Purpose
      This policy establishes governance framework for artificial intelligence systems in educational settings.

      2. Scope
      This policy applies to all AI systems used within the institution.

      3. Responsibilities
      All staff members must comply with AI usage guidelines.

      4. Implementation
      The IT department will oversee AI system deployments.
    `;
  }

  private async mockDocxExtraction(buffer: Buffer): Promise<string> {
    return this.mockPdfExtraction(buffer);
  }

  private async mockDocExtraction(buffer: Buffer): Promise<string> {
    return this.mockPdfExtraction(buffer);
  }
}
