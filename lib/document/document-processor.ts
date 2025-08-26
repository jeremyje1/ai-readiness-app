/**
 * Enhanced Document Processing Service
 * Handles OCR, text extraction, and section classification
 * @version 2.0.0
 */

import JSZip from 'jszip'
import * as mammoth from 'mammoth'
import { PDFDocument } from 'pdf-lib'
import { createWorker } from 'tesseract.js'

export interface DocumentSection {
    type: 'governance' | 'risk' | 'instruction' | 'assessment' | 'data' | 'vendor' | 'accessibility'
    heading: string
    content: string
    pageNumber?: number
    positionStart: number
    positionEnd: number
    confidence: number
}

export interface ExtractionResult {
    text: string
    sections: DocumentSection[]
    metadata: {
        pageCount?: number
        wordCount: number
        language?: string
        extractionMethod: 'ocr' | 'text' | 'structured'
    }
}

export interface PiiDetection {
    type: string
    text: string
    redactedText: string
    positionStart: number
    positionEnd: number
    confidence: number
}

export class DocumentProcessor {
    private ocrWorker: any = null

    async initializeOCR() {
        if (!this.ocrWorker) {
            this.ocrWorker = await createWorker('eng')
        }
    }

    async processDocument(buffer: Buffer, mimeType: string, filename: string): Promise<ExtractionResult> {
        console.log(`Processing document: ${filename} (${mimeType})`)

        switch (mimeType) {
            case 'application/pdf':
                return this.processPDF(buffer)

            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return this.processWord(buffer)

            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return this.processPowerPoint(buffer)

            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            case 'text/csv':
                return this.processSpreadsheet(buffer)

            case 'image/jpeg':
            case 'image/png':
            case 'image/gif':
            case 'image/bmp':
                return this.processImage(buffer)

            case 'text/plain':
                return this.processPlainText(buffer)

            default:
                throw new Error(`Unsupported file type: ${mimeType}`)
        }
    }

    private async processPDF(buffer: Buffer): Promise<ExtractionResult> {
        try {
            const uint8Array = new Uint8Array(buffer)
            const pdfDoc = await PDFDocument.load(uint8Array)
            const pageCount = pdfDoc.getPageCount()
            
            // For now, we'll use OCR as pdf-lib doesn't have built-in text extraction
            // This is more reliable for production use
            console.log('PDF detected, using OCR for text extraction')
            const result = await this.processImage(buffer)
            
            return {
                ...result,
                metadata: {
                    ...result.metadata,
                    pageCount,
                    extractionMethod: 'ocr'
                }
            }
        } catch (error) {
            console.log('PDF processing failed, trying OCR')
            // Fallback to OCR
            return this.processImage(buffer)
        }
    }

    private async processWord(buffer: Buffer): Promise<ExtractionResult> {
        const result = await mammoth.extractRawText({ buffer })
        const text = result.value
        const sections = await this.classifySections(text)

        return {
            text,
            sections,
            metadata: {
                wordCount: text.split(/\s+/).length,
                extractionMethod: 'structured'
            }
        }
    }

    private async processPowerPoint(buffer: Buffer): Promise<ExtractionResult> {
        // Extract text from PPTX using JSZip
        const zip = await JSZip.loadAsync(new Uint8Array(buffer))
        let text = ''

        // Extract from slide content
        const slideFiles = Object.keys(zip.files).filter(name =>
            name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
        )

        for (const slideFile of slideFiles) {
            const slideContent = await zip.files[slideFile].async('text')
            // Basic XML text extraction (remove tags)
            const slideText = slideContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            text += slideText + '\n\n'
        }

        const sections = await this.classifySections(text)

        return {
            text,
            sections,
            metadata: {
                pageCount: slideFiles.length,
                wordCount: text.split(/\s+/).length,
                extractionMethod: 'structured'
            }
        }
    }

    private async processSpreadsheet(buffer: Buffer): Promise<ExtractionResult> {
        // Basic CSV/Excel processing - extract visible text
        try {
            const text = buffer.toString('utf-8')
            const sections = await this.classifySections(text)

            return {
                text,
                sections,
                metadata: {
                    wordCount: text.split(/\s+/).length,
                    extractionMethod: 'text'
                }
            }
        } catch (error) {
            throw new Error('Failed to process spreadsheet')
        }
    }

    private async processImage(buffer: Buffer): Promise<ExtractionResult> {
        await this.initializeOCR()

        const { data: { text } } = await this.ocrWorker.recognize(buffer)
        const sections = await this.classifySections(text)

        return {
            text,
            sections,
            metadata: {
                wordCount: text.split(/\s+/).length,
                extractionMethod: 'ocr'
            }
        }
    }

    private async processPlainText(buffer: Buffer): Promise<ExtractionResult> {
        const text = buffer.toString('utf-8')
        const sections = await this.classifySections(text)

        return {
            text,
            sections,
            metadata: {
                wordCount: text.split(/\s+/).length,
                extractionMethod: 'text'
            }
        }
    }

    private async classifySections(text: string): Promise<DocumentSection[]> {
        const sections: DocumentSection[] = []

        // Split text into potential sections based on headings
        const lines = text.split('\n')
        let currentSection: Partial<DocumentSection> = {}
        let currentContent: string[] = []
        let position = 0

        for (const line of lines) {
            const trimmed = line.trim()

            // Detect potential headings (simple heuristic)
            if (this.isLikelyHeading(trimmed)) {
                // Save previous section if exists
                if (currentSection.heading && currentContent.length > 0) {
                    const content = currentContent.join('\n').trim()
                    sections.push({
                        type: this.classifySectionType(currentSection.heading!, content),
                        heading: currentSection.heading!,
                        content,
                        positionStart: currentSection.positionStart || position - content.length,
                        positionEnd: position,
                        confidence: this.calculateConfidence(currentSection.heading!, content)
                    })
                }

                // Start new section
                currentSection = {
                    heading: trimmed,
                    positionStart: position
                }
                currentContent = []
            } else if (trimmed.length > 0) {
                currentContent.push(trimmed)
            }

            position += line.length + 1
        }

        // Save final section
        if (currentSection.heading && currentContent.length > 0) {
            const content = currentContent.join('\n').trim()
            sections.push({
                type: this.classifySectionType(currentSection.heading!, content),
                heading: currentSection.heading!,
                content,
                positionStart: currentSection.positionStart || position - content.length,
                positionEnd: position,
                confidence: this.calculateConfidence(currentSection.heading!, content)
            })
        }

        // If no sections found, create a single section with all content
        if (sections.length === 0) {
            sections.push({
                type: this.classifySectionType('Document Content', text),
                heading: 'Document Content',
                content: text,
                positionStart: 0,
                positionEnd: text.length,
                confidence: 0.5
            })
        }

        return sections
    }

    private isLikelyHeading(text: string): boolean {
        if (text.length === 0 || text.length > 100) return false

        // Check for heading patterns
        const headingPatterns = [
            /^\d+\.\s+/,           // "1. Section Title"
            /^[A-Z][A-Z\s]+$/,     // "ALL CAPS HEADING"
            /^[A-Z][a-z\s]+:$/,    // "Title Case Heading:"
            /^#{1,6}\s+/,          // "# Markdown Heading"
            /^[IVX]+\.\s+/,        // "I. Roman Numeral"
            /^[A-Z]\.\s+/,         // "A. Letter Heading"
        ]

        return headingPatterns.some(pattern => pattern.test(text))
    }

    private classifySectionType(heading: string, content: string): DocumentSection['type'] {
        const combined = (heading + ' ' + content).toLowerCase()

        // Classification keywords for each section type
        const classifiers = {
            governance: ['governance', 'policy', 'oversight', 'board', 'leadership', 'authority', 'responsibility'],
            risk: ['risk', 'security', 'privacy', 'threat', 'vulnerability', 'safety', 'compliance'],
            instruction: ['instruction', 'teaching', 'learning', 'curriculum', 'classroom', 'student', 'educational'],
            assessment: ['assessment', 'evaluation', 'testing', 'measurement', 'grading', 'scoring'],
            data: ['data', 'information', 'records', 'storage', 'collection', 'processing', 'retention'],
            vendor: ['vendor', 'supplier', 'contractor', 'third-party', 'procurement', 'purchase'],
            accessibility: ['accessibility', 'disability', 'accommodation', 'ada', 'section 508', 'wcag']
        }

        let maxScore = 0
        let bestType: DocumentSection['type'] = 'governance'

        for (const [type, keywords] of Object.entries(classifiers)) {
            const score = keywords.reduce((sum, keyword) => {
                const matches = (combined.match(new RegExp(keyword, 'g')) || []).length
                return sum + matches
            }, 0)

            if (score > maxScore) {
                maxScore = score
                bestType = type as DocumentSection['type']
            }
        }

        return bestType
    }

    private calculateConfidence(heading: string, content: string): number {
        const combined = heading + ' ' + content
        const factors = [
            combined.length > 50 ? 0.2 : 0.1,              // Content length
            /\b(shall|must|will|should)\b/i.test(combined) ? 0.3 : 0.1, // Policy language
            heading.length > 5 ? 0.2 : 0.1,                // Meaningful heading
            content.split('\n').length > 2 ? 0.2 : 0.1,    // Multiple lines
            /\b(ai|artificial intelligence)\b/i.test(combined) ? 0.1 : 0.0 // AI-related
        ]

        return Math.min(factors.reduce((sum, factor) => sum + factor, 0), 1.0)
    }

    async cleanup() {
        if (this.ocrWorker) {
            await this.ocrWorker.terminate()
            this.ocrWorker = null
        }
    }
}

export default DocumentProcessor
