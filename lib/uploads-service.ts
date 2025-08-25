import { createHash } from 'crypto'
import { Document, PIIFlag, DocumentSection, FrameworkTag, StateTag } from '../types/core-data-models'

// Upload Service - Virus scan, hash, OCR, PII flags
export class UploadsService {
  private readonly maxFileSize = 50 * 1024 * 1024 // 50MB
  private readonly allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  // PII Detection Patterns (Enhanced with education-specific patterns)
  private readonly piiPatterns = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    address: /\b\d{1,5}\s+([A-Za-z0-9\s]+)\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Plaza|Pl)\b/gi,
    student_id: /\b(?:student|id|sid)[\s#:]*([A-Z0-9]{6,12})\b/gi,
    employee_id: /\b(?:employee|emp|staff)[\s#:]*([A-Z0-9]{4,10})\b/gi,
    financial: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b|\b\d{13,19}\b/g,
    birthdate: /\b(?:0[1-9]|1[0-2])[-\/](?:0[1-9]|[12][0-9]|3[01])[-\/](?:19|20)\d{2}\b/g,
    grade_info: /\b(?:grade|class|gpa)[\s:]*([0-9]{1,2}\.?[0-9]*)\b/gi,
    parent_info: /\b(?:parent|guardian|mother|father)[\s:]*([A-Za-z\s]{2,50})\b/gi
  }

  /**
   * Process uploaded file with comprehensive security and compliance checks
   */
  async processUpload(
    file: File, 
    orgId: string, 
    uploadedBy: string,
    documentType: Document['type']
  ): Promise<Document> {
    // 1. Initial validation
    this.validateFile(file)
    
    // 2. Generate file hash for integrity
    const fileHash = await this.generateFileHash(file)
    
    // 3. Create initial document record
    const document: Document = {
      id: this.generateId(),
      orgId,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      type: documentType,
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      virusScanStatus: 'pending',
      fileHash,
      piiFlags: [],
      extractedText: '',
      ocrStatus: 'pending',
      ocrConfidence: 0,
      sections: [],
      frameworkTags: [],
      stateTags: [],
      searchKeywords: [],
      versions: [{
        version: '1.0',
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        changeDescription: 'Initial upload',
        filePath: '', // Will be set after storage
        isActive: true
      }],
      currentVersion: '1.0',
      accessLevel: 'internal',
      authorizedRoles: ['admin', 'privacy_officer'],
      processingStatus: 'uploaded',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: uploadedBy,
      updated_by: uploadedBy
    }

    try {
      // 4. Virus scanning
      await this.performVirusScan(document, file)
      
      // 5. Text extraction (OCR for images/PDFs)
      await this.extractText(document, file)
      
      // 6. PII detection and flagging
      await this.detectAndFlagPII(document)
      
      // 7. Content classification
      await this.classifyContent(document)
      
      // 8. Framework mapping
      await this.mapToFrameworks(document)
      
      // 9. State regulation mapping
      await this.mapToStateRegulations(document)
      
      // 10. Generate search keywords
      this.generateSearchKeywords(document)
      
      document.processingStatus = 'completed'
      document.updated_at = new Date().toISOString()
      
      return document
      
    } catch (error) {
      document.processingStatus = 'failed'
      document.processingErrors = [error instanceof Error ? error.message : String(error)]
      throw error
    }
  }

  /**
   * Validate file type, size, and basic security checks
   */
  private validateFile(file: File): void {
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`)
    }
    
    if (!this.allowedMimeTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }
    
    // Basic filename validation (prevent path traversal)
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      throw new Error('Invalid filename - contains prohibited characters')
    }
  }

  /**
   * Generate SHA-256 hash for file integrity verification
   */
  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const hash = createHash('sha256')
    hash.update(new Uint8Array(buffer))
    return hash.digest('hex')
  }

  /**
   * Perform virus scanning (Mock implementation - integrate with ClamAV or similar)
   */
  private async performVirusScan(document: Document, file: File): Promise<void> {
    document.virusScanStatus = 'pending'
    
    try {
      // Mock virus scanning - in production, integrate with:
      // - ClamAV
      // - Windows Defender API
      // - Third-party services like VirusTotal
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate scanning time
      
      // Simulate basic checks
      const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js']
      const isSuspicious = suspiciousExtensions.some(ext => 
        document.originalFilename.toLowerCase().endsWith(ext)
      )
      
      if (isSuspicious) {
        document.virusScanStatus = 'infected'
        throw new Error('File failed virus scan - suspicious file type detected')
      }
      
      // Check for embedded executables in documents (basic check)
      if (file.size > 10 * 1024 * 1024 && document.mimeType.includes('document')) {
        // Large documents might contain embedded executables
        console.warn('Large document detected - manual review recommended')
      }
      
      document.virusScanStatus = 'clean'
      document.virusScanTimestamp = new Date().toISOString()
      
    } catch (error) {
      document.virusScanStatus = 'failed'
      throw new Error(`Virus scan failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Extract text content from documents using OCR when necessary
   */
  private async extractText(document: Document, file: File): Promise<void> {
    document.ocrStatus = 'pending'
    
    try {
      let extractedText = ''
      
      if (document.mimeType === 'application/pdf') {
        // PDF text extraction (mock - integrate with pdf-parse or similar)
        extractedText = await this.extractPDFText(file)
        document.ocrConfidence = 0.95
      } else if (document.mimeType.includes('word')) {
        // Word document text extraction (mock - integrate with mammoth or similar)
        extractedText = await this.extractWordText(file)
        document.ocrConfidence = 0.98
      } else if (document.mimeType === 'text/plain') {
        // Plain text - direct extraction
        extractedText = await file.text()
        document.ocrConfidence = 1.0
      } else {
        // Other formats - use OCR service
        extractedText = await this.performOCR(file)
        document.ocrConfidence = 0.85
      }
      
      document.extractedText = extractedText
      document.ocrStatus = 'completed'
      
    } catch (error) {
      document.ocrStatus = 'failed'
      console.error('Text extraction failed:', error)
      // Don't throw - allow processing to continue with empty text
    }
  }

  /**
   * Detect and flag PII in extracted text
   */
  private async detectAndFlagPII(document: Document): Promise<void> {
    const piiFlags: PIIFlag[] = []
    const text = document.extractedText
    
    // Process each PII pattern
    for (const [piiType, pattern] of Object.entries(this.piiPatterns)) {
      const matches = Array.from(text.matchAll(pattern))
      
      for (const match of matches) {
        const flag: PIIFlag = {
          id: this.generateId(),
          documentId: document.id,
          detectionType: piiType as PIIFlag['detectionType'],
          location: {
            page: 1, // TODO: Calculate actual page
            line: this.getLineNumber(text, match.index!),
            startChar: match.index!,
            endChar: match.index! + match[0].length
          },
          confidence: this.calculateConfidence(piiType, match[0]),
          redactionRequired: this.requiresRedaction(piiType),
          complianceRisk: this.assessComplianceRisk(piiType),
          detectedAt: new Date().toISOString()
        }
        
        piiFlags.push(flag)
      }
    }
    
    document.piiFlags = piiFlags
    
    // Set access level based on PII findings
    if (piiFlags.some(flag => flag.complianceRisk === 'critical')) {
      document.accessLevel = 'confidential'
    } else if (piiFlags.some(flag => flag.complianceRisk === 'high')) {
      document.accessLevel = 'restricted'
    }
  }

  /**
   * Classify document content into sections and categories
   */
  private async classifyContent(document: Document): Promise<void> {
    const text = document.extractedText
    const sections: DocumentSection[] = []
    
    // Basic section detection based on headers and content patterns
    const sectionPatterns = [
      { title: 'Purpose', pattern: /(?:purpose|objective|scope)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi },
      { title: 'Definitions', pattern: /(?:definitions?|terms?)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi },
      { title: 'Policy Statement', pattern: /(?:policy|statement|requirements?)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi },
      { title: 'Procedures', pattern: /(?:procedures?|process|implementation)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi },
      { title: 'Responsibilities', pattern: /(?:responsibilities?|roles?|accountable)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi },
      { title: 'Compliance', pattern: /(?:compliance|legal|regulatory|ferpa|coppa)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi }
    ]
    
    sectionPatterns.forEach((pattern, index) => {
      const matches = Array.from(text.matchAll(pattern.pattern))
      
      matches.forEach((match, matchIndex) => {
        const section: DocumentSection = {
          id: this.generateId(),
          documentId: document.id,
          sectionNumber: `${index + 1}.${matchIndex + 1}`,
          title: pattern.title,
          content: match[0].substring(0, 1000), // Limit section content
          classification: this.classifySection(match[0]),
          riskLevel: this.assessSectionRisk(match[0]),
          complianceFrameworks: this.identifyFrameworks(match[0])
        }
        
        sections.push(section)
      })
    })
    
    document.sections = sections
  }

  /**
   * Map document content to framework controls
   */
  private async mapToFrameworks(document: Document): Promise<void> {
    const text = document.extractedText.toLowerCase()
    const frameworkTags: FrameworkTag[] = []
    
    // NIST AI RMF mapping
    const nistMappings = [
      { keywords: ['ai risk', 'artificial intelligence', 'machine learning'], control: 'MP-1.1', title: 'AI Risk Management' },
      { keywords: ['bias', 'fairness', 'discrimination'], control: 'MP-2.1', title: 'Bias Assessment' },
      { keywords: ['transparency', 'explainable', 'interpretable'], control: 'MP-3.1', title: 'Transparency Requirements' },
      { keywords: ['privacy', 'personal data', 'pii'], control: 'MP-4.1', title: 'Privacy Protection' },
      { keywords: ['security', 'cybersecurity', 'data protection'], control: 'MP-5.1', title: 'Security Controls' }
    ]
    
    // FERPA mapping
    const ferpaMappings = [
      { keywords: ['educational records', 'student data', 'directory information'], control: '99.3', title: 'Educational Records Definition' },
      { keywords: ['consent', 'parent permission', 'disclosure'], control: '99.30', title: 'Disclosure Requirements' },
      { keywords: ['legitimate educational interest'], control: '99.31', title: 'School Official Exception' }
    ]
    
    // COPPA mapping
    const coppaMappings = [
      { keywords: ['under 13', 'children', 'parental consent'], control: '312.2', title: 'COPPA Definitions' },
      { keywords: ['verifiable parental consent'], control: '312.5', title: 'Consent Requirements' },
      { keywords: ['data collection', 'personal information'], control: '312.3', title: 'Information Collection' }
    ]
    
    // Process each framework
    this.processFrameworkMappings(text, nistMappings, 'NIST_AI_RMF', frameworkTags, document.id)
    this.processFrameworkMappings(text, ferpaMappings, 'FERPA', frameworkTags, document.id)
    this.processFrameworkMappings(text, coppaMappings, 'COPPA', frameworkTags, document.id)
    
    document.frameworkTags = frameworkTags
  }

  /**
   * Map document content to state regulations
   */
  private async mapToStateRegulations(document: Document): Promise<void> {
    const text = document.extractedText.toLowerCase()
    const stateTags: StateTag[] = []
    
    // State-specific AI regulations (examples)
    const stateRegulations = {
      'CA': [
        { regulation: 'AB 2273', section: '1798.99.31', requirement: 'Age-appropriate design code', keywords: ['children', 'design', 'age verification'] },
        { regulation: 'SB 1001', section: '22584.5', requirement: 'Bot disclosure', keywords: ['bot', 'automated', 'disclosure'] }
      ],
      'NY': [
        { regulation: 'SHIELD Act', section: '899-aa', requirement: 'Data security', keywords: ['data security', 'breach notification'] }
      ],
      'TX': [
        { regulation: 'HB 4', section: '521.002', requirement: 'Student data privacy', keywords: ['student data', 'educational technology'] }
      ]
    }
    
    // Process state regulations (could be enhanced with org location detection)
    Object.entries(stateRegulations).forEach(([state, regulations]) => {
      regulations.forEach(regulation => {
        const hasKeywords = regulation.keywords.some(keyword => text.includes(keyword))
        
        if (hasKeywords) {
          const tag: StateTag = {
            state,
            regulation: regulation.regulation,
            section: regulation.section,
            requirement: regulation.requirement,
            complianceStatus: 'review_needed',
            lastReviewed: new Date().toISOString()
          }
          
          stateTags.push(tag)
        }
      })
    })
    
    document.stateTags = stateTags
  }

  /**
   * Generate search keywords from document content
   */
  private generateSearchKeywords(document: Document): void {
    const text = document.extractedText.toLowerCase()
    const keywords = new Set<string>()
    
    // Add document metadata keywords
    keywords.add(document.type)
    keywords.add(document.name.toLowerCase())
    
    // Add PII types found
    document.piiFlags.forEach(flag => keywords.add(flag.detectionType))
    
    // Add framework tags
    document.frameworkTags.forEach(tag => {
      keywords.add(tag.framework.toLowerCase())
      keywords.add(tag.controlId)
    })
    
    // Add common policy terms
    const policyTerms = [
      'policy', 'procedure', 'guideline', 'standard', 'requirement',
      'privacy', 'security', 'compliance', 'governance', 'risk',
      'ai', 'artificial intelligence', 'machine learning', 'automation',
      'student', 'teacher', 'parent', 'staff', 'administrator'
    ]
    
    policyTerms.forEach(term => {
      if (text.includes(term)) {
        keywords.add(term)
      }
    })
    
    document.searchKeywords = Array.from(keywords)
  }

  // Helper methods
  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private getLineNumber(text: string, index: number): number {
    return text.substring(0, index).split('\n').length
  }

  private calculateConfidence(piiType: string, matchText: string): number {
    // Enhanced confidence calculation based on context and pattern strength
    const baseConfidences: Record<string, number> = {
      ssn: 0.95,
      email: 0.90,
      phone: 0.85,
      address: 0.80,
      student_id: 0.75,
      employee_id: 0.75,
      financial: 0.85,
      birthdate: 0.80,
      grade_info: 0.70,
      parent_info: 0.65
    }
    
    return baseConfidences[piiType] || 0.70
  }

  private requiresRedaction(piiType: string): boolean {
    const redactionRequired = ['ssn', 'financial', 'student_id', 'birthdate']
    return redactionRequired.includes(piiType)
  }

  private assessComplianceRisk(piiType: string): PIIFlag['complianceRisk'] {
    const riskLevels: Record<string, PIIFlag['complianceRisk']> = {
      ssn: 'critical',
      financial: 'critical',
      student_id: 'high',
      birthdate: 'high',
      email: 'medium',
      phone: 'medium',
      address: 'medium',
      employee_id: 'medium',
      grade_info: 'low',
      parent_info: 'low'
    }
    
    return riskLevels[piiType] || 'medium'
  }

  private classifySection(content: string): string {
    const content_lower = content.toLowerCase()
    
    if (content_lower.includes('privacy') || content_lower.includes('personal data')) {
      return 'privacy'
    } else if (content_lower.includes('security') || content_lower.includes('protection')) {
      return 'security'
    } else if (content_lower.includes('compliance') || content_lower.includes('legal')) {
      return 'compliance'
    } else if (content_lower.includes('procedure') || content_lower.includes('implementation')) {
      return 'operational'
    }
    
    return 'general'
  }

  private assessSectionRisk(content: string): DocumentSection['riskLevel'] {
    const content_lower = content.toLowerCase()
    
    const highRiskTerms = ['critical', 'sensitive', 'confidential', 'restricted']
    const mediumRiskTerms = ['important', 'required', 'mandatory', 'compliance']
    
    if (highRiskTerms.some(term => content_lower.includes(term))) {
      return 'high'
    } else if (mediumRiskTerms.some(term => content_lower.includes(term))) {
      return 'medium'
    }
    
    return 'low'
  }

  private identifyFrameworks(content: string): string[] {
    const content_lower = content.toLowerCase()
    const frameworks: string[] = []
    
    if (content_lower.includes('ferpa') || content_lower.includes('educational records')) {
      frameworks.push('FERPA')
    }
    if (content_lower.includes('coppa') || content_lower.includes('children')) {
      frameworks.push('COPPA')
    }
    if (content_lower.includes('nist') || content_lower.includes('ai risk')) {
      frameworks.push('NIST AI RMF')
    }
    if (content_lower.includes('iso 27001') || content_lower.includes('information security')) {
      frameworks.push('ISO 27001')
    }
    
    return frameworks
  }

  private processFrameworkMappings(
    text: string, 
    mappings: any[], 
    framework: string, 
    frameworkTags: FrameworkTag[], 
    documentId: string
  ): void {
    mappings.forEach(mapping => {
      const hasKeywords = mapping.keywords.some((keyword: string) => text.includes(keyword))
      
      if (hasKeywords) {
        const tag: FrameworkTag = {
          framework: framework as any,
          controlId: mapping.control,
          controlTitle: mapping.title,
          mappingConfidence: 0.80,
          requiresAction: true,
          gapIdentified: false // Will be determined by policy engine
        }
        
        frameworkTags.push(tag)
      }
    })
  }

  // Mock implementations for text extraction (replace with actual libraries)
  private async extractPDFText(file: File): Promise<string> {
    // Mock PDF text extraction - integrate with pdf-parse or similar
    return `[PDF content extracted from ${file.name}]`
  }

  private async extractWordText(file: File): Promise<string> {
    // Mock Word document extraction - integrate with mammoth or similar
    return `[Word document content extracted from ${file.name}]`
  }

  private async performOCR(file: File): Promise<string> {
    // Mock OCR - integrate with Tesseract.js or cloud OCR service
    return `[OCR content extracted from ${file.name}]`
  }
}
