/**
 * Enhanced PII Scanner for Assessment 2.0
 * Detects and redacts personally identifiable information
 * @version 2.0.0
 */

export interface PiiDetection {
  type: string
  text: string
  redactedText: string
  positionStart: number
  positionEnd: number
  confidence: number
}

export interface PiiScanResult {
  detections: PiiDetection[]
  redactedText: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  summary: {
    totalDetections: number
    byType: Record<string, number>
    highConfidenceDetections: number
  }
}

export class PiiScanner {
  private patterns = {
    // Names (enhanced)
    names: {
      pattern: /\b[A-Z][a-z]{1,15}\s+[A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?\b/g,
      confidence: 0.7,
      redaction: '[NAME REDACTED]'
    },
    
    // Email addresses
    emails: {
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      confidence: 0.95,
      redaction: '[EMAIL REDACTED]'
    },
    
    // Phone numbers (various formats)
    phones: {
      pattern: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      confidence: 0.9,
      redaction: '[PHONE REDACTED]'
    },
    
    // Social Security Numbers
    ssn: {
      pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g,
      confidence: 0.95,
      redaction: '[SSN REDACTED]'
    },
    
    // Student IDs (common patterns)
    studentIds: {
      pattern: /\b(?:student|id|student id|ID)[\s:]*[A-Z0-9]{6,12}\b/gi,
      confidence: 0.8,
      redaction: '[STUDENT ID REDACTED]'
    },
    
    // Physical addresses
    addresses: {
      pattern: /\b\d{1,5}\s+([A-Z][a-z]+\s+){1,3}(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct|Place|Pl)\b/gi,
      confidence: 0.75,
      redaction: '[ADDRESS REDACTED]'
    },
    
    // Credit card numbers
    creditCards: {
      pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
      confidence: 0.9,
      redaction: '[CREDIT CARD REDACTED]'
    },
    
    // Dates of birth
    birthDates: {
      pattern: /\b(?:born|birth|dob|date of birth)[\s:]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi,
      confidence: 0.8,
      redaction: '[DATE OF BIRTH REDACTED]'
    },
    
    // Medical record numbers
    medicalRecords: {
      pattern: /\b(?:medical|mrn|patient)[\s]*(?:record|number|id)[\s:]*[A-Z0-9]{6,15}\b/gi,
      confidence: 0.85,
      redaction: '[MEDICAL RECORD REDACTED]'
    },
    
    // Insurance policy numbers
    insuranceIds: {
      pattern: /\b(?:policy|insurance)[\s]*(?:number|id)[\s:]*[A-Z0-9]{8,20}\b/gi,
      confidence: 0.8,
      redaction: '[INSURANCE ID REDACTED]'
    },
    
    // Financial account numbers
    accountNumbers: {
      pattern: /\b(?:account|acct)[\s]*(?:number|#)[\s:]*\d{8,17}\b/gi,
      confidence: 0.8,
      redaction: '[ACCOUNT NUMBER REDACTED]'
    },
    
    // Driver's license numbers
    driverLicense: {
      pattern: /\b(?:driver|license|dl)[\s]*(?:number|#)[\s:]*[A-Z0-9]{6,15}\b/gi,
      confidence: 0.85,
      redaction: '[DRIVER LICENSE REDACTED]'
    }
  }

  private commonNames = new Set([
    'ai', 'artificial', 'intelligence', 'machine', 'learning', 'deep', 'neural', 'network',
    'data', 'science', 'technology', 'computer', 'digital', 'online', 'virtual', 'cyber',
    'information', 'system', 'platform', 'software', 'hardware', 'internet', 'web'
  ])

  async scan(text: string): Promise<PiiScanResult> {
    const detections: PiiDetection[] = []
    let redactedText = text
    let offset = 0

    // Scan for each PII type
    for (const [type, config] of Object.entries(this.patterns)) {
      const matches = [...text.matchAll(config.pattern)]
      
      for (const match of matches) {
        if (match.index === undefined) continue

        const detectedText = match[0]
        const start = match.index
        const end = start + detectedText.length

        // Apply additional validation for names
        if (type === 'names' && !this.isLikelyPersonName(detectedText)) {
          continue
        }

        const detection: PiiDetection = {
          type,
          text: detectedText,
          redactedText: config.redaction,
          positionStart: start,
          positionEnd: end,
          confidence: config.confidence
        }

        detections.push(detection)
      }
    }

    // Sort detections by position (descending) to avoid index issues during redaction
    detections.sort((a, b) => b.positionStart - a.positionStart)

    // Apply redactions
    for (const detection of detections) {
      redactedText = 
        redactedText.substring(0, detection.positionStart) +
        detection.redactedText +
        redactedText.substring(detection.positionEnd)
    }

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(detections)

    // Generate summary
    const summary = this.generateSummary(detections)

    return {
      detections: detections.reverse(), // Return in original order
      redactedText,
      riskLevel,
      summary
    }
  }

  private isLikelyPersonName(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/)
    
    // Filter out common non-name words
    const nameWords = words.filter(word => !this.commonNames.has(word))
    
    // Must have at least 2 words after filtering
    if (nameWords.length < 2) return false
    
    // Check if it looks like a person name (basic heuristics)
    const hasCommonNamePattern = /^[A-Z][a-z]+ [A-Z][a-z]+( [A-Z][a-z]+)?$/.test(text)
    const hasReasonableLength = text.length <= 50
    const noNumbers = !/\d/.test(text)
    
    return hasCommonNamePattern && hasReasonableLength && noNumbers
  }

  private calculateRiskLevel(detections: PiiDetection[]): 'low' | 'medium' | 'high' | 'critical' {
    if (detections.length === 0) return 'low'

    const criticalTypes = ['ssn', 'creditCards', 'medicalRecords']
    const highRiskTypes = ['emails', 'phones', 'addresses', 'studentIds']
    
    const hasCritical = detections.some(d => criticalTypes.includes(d.type))
    const hasHighRisk = detections.some(d => highRiskTypes.includes(d.type))
    const highConfidenceCount = detections.filter(d => d.confidence > 0.8).length

    if (hasCritical) return 'critical'
    if (hasHighRisk && highConfidenceCount > 5) return 'high'
    if (hasHighRisk || highConfidenceCount > 2) return 'medium'
    return 'low'
  }

  private generateSummary(detections: PiiDetection[]) {
    const byType: Record<string, number> = {}
    
    for (const detection of detections) {
      byType[detection.type] = (byType[detection.type] || 0) + 1
    }

    return {
      totalDetections: detections.length,
      byType,
      highConfidenceDetections: detections.filter(d => d.confidence > 0.8).length
    }
  }

  // Batch processing for multiple documents
  async scanBatch(texts: string[]): Promise<PiiScanResult[]> {
    return Promise.all(texts.map(text => this.scan(text)))
  }

  // Get PII types for reporting
  getSupportedPiiTypes(): string[] {
    return Object.keys(this.patterns)
  }
}

export default PiiScanner
