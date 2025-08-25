/**
 * PII Scanner Service
 * Scans documents for personally identifiable information
 * 
 * @version 1.0.0
 * @author Staff Software Engineer
 */

import { z } from 'zod';

export interface PiiScanResult {
  hasPii: boolean;
  confidence: number;
  findings: PiiFinding[];
  redactedText?: string;
  summary: {
    totalFindings: number;
    criticalFindings: number;
    typesFound: string[];
  };
}

export interface PiiFinding {
  type: PiiType;
  text: string;
  start: number;
  end: number;
  confidence: number;
  context: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export enum PiiType {
  SSN = 'ssn',
  EMAIL = 'email',
  PHONE = 'phone',
  CREDIT_CARD = 'credit_card',
  STUDENT_ID = 'student_id',
  NAME = 'name',
  ADDRESS = 'address',
  DATE_OF_BIRTH = 'date_of_birth',
  MEDICAL_RECORD = 'medical_record',
  BANK_ACCOUNT = 'bank_account',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
}

export class PiiScanner {
  private patterns: Map<PiiType, RegExp[]>;
  private nameDetector: NameDetector;

  constructor() {
    this.patterns = new Map([
      [PiiType.SSN, [
        /\b\d{3}-\d{2}-\d{4}\b/g,
        /\b\d{3}\s\d{2}\s\d{4}\b/g,
        /\b\d{9}\b/g,
      ]],
      [PiiType.EMAIL, [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      ]],
      [PiiType.PHONE, [
        /\b\d{3}-\d{3}-\d{4}\b/g,
        /\b\(\d{3}\)\s?\d{3}-\d{4}\b/g,
        /\b\d{10}\b/g,
      ]],
      [PiiType.CREDIT_CARD, [
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      ]],
      [PiiType.STUDENT_ID, [
        /\b[Ss]tudent\s?[Ii][Dd]:?\s?(\d{6,10})\b/g,
        /\b[Ii][Dd]\s?[Nn]umber:?\s?(\d{6,10})\b/g,
      ]],
      [PiiType.DATE_OF_BIRTH, [
        /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
        /\b\d{4}-\d{2}-\d{2}\b/g,
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}\b/gi,
      ]],
      [PiiType.BANK_ACCOUNT, [
        /\b[Aa]ccount\s?[Nn]umber:?\s?(\d{8,17})\b/g,
        /\b[Rr]outing\s?[Nn]umber:?\s?(\d{9})\b/g,
      ]],
    ]);
    
    this.nameDetector = new NameDetector();
  }

  async scan(text: string): Promise<PiiScanResult> {
    const findings: PiiFinding[] = [];

    // Scan with regex patterns
    for (const [type, patterns] of this.patterns) {
      for (const pattern of patterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          if (match.index !== undefined) {
            const finding: PiiFinding = {
              type,
              text: match[0],
              start: match.index,
              end: match.index + match[0].length,
              confidence: this.calculateConfidence(type, match[0]),
              context: this.getContext(text, match.index, 50),
              severity: this.getSeverity(type),
            };
            findings.push(finding);
          }
        }
      }
    }

    // Scan for names using ML/NLP
    const nameFindings = await this.nameDetector.findNames(text);
    findings.push(...nameFindings);

    // Filter out false positives
    const filteredFindings = this.filterFalsePositives(findings);

    // Generate redacted text
    const redactedText = this.redactText(text, filteredFindings);

    // Calculate summary
    const summary = {
      totalFindings: filteredFindings.length,
      criticalFindings: filteredFindings.filter(f => f.severity === 'critical').length,
      typesFound: [...new Set(filteredFindings.map(f => f.type))],
    };

    return {
      hasPii: filteredFindings.length > 0,
      confidence: this.calculateOverallConfidence(filteredFindings),
      findings: filteredFindings,
      redactedText,
      summary,
    };
  }

  private calculateConfidence(type: PiiType, text: string): number {
    // Confidence based on pattern strength and context
    switch (type) {
      case PiiType.SSN:
        return /^\d{3}-\d{2}-\d{4}$/.test(text) ? 0.95 : 0.7;
      case PiiType.EMAIL:
        return 0.9;
      case PiiType.PHONE:
        return /^\(\d{3}\)\s?\d{3}-\d{4}$/.test(text) ? 0.9 : 0.7;
      case PiiType.CREDIT_CARD:
        return this.isValidCreditCard(text) ? 0.95 : 0.6;
      default:
        return 0.8;
    }
  }

  private getSeverity(type: PiiType): PiiFinding['severity'] {
    const severityMap: Record<PiiType, PiiFinding['severity']> = {
      [PiiType.SSN]: 'critical',
      [PiiType.CREDIT_CARD]: 'critical',
      [PiiType.BANK_ACCOUNT]: 'critical',
      [PiiType.MEDICAL_RECORD]: 'critical',
      [PiiType.STUDENT_ID]: 'high',
      [PiiType.DATE_OF_BIRTH]: 'high',
      [PiiType.DRIVERS_LICENSE]: 'high',
      [PiiType.PASSPORT]: 'high',
      [PiiType.EMAIL]: 'medium',
      [PiiType.PHONE]: 'medium',
      [PiiType.NAME]: 'medium',
      [PiiType.ADDRESS]: 'medium',
    };
    return severityMap[type] || 'low';
  }

  private getContext(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.substring(start, end);
  }

  private filterFalsePositives(findings: PiiFinding[]): PiiFinding[] {
    return findings.filter(finding => {
      // Filter common false positives
      if (finding.type === PiiType.SSN && finding.text === '000-00-0000') {
        return false;
      }
      
      if (finding.type === PiiType.PHONE && finding.text.startsWith('555')) {
        return false;
      }

      if (finding.type === PiiType.EMAIL && finding.text.includes('example.com')) {
        return false;
      }

      // Only keep high-confidence findings
      return finding.confidence > 0.6;
    });
  }

  private redactText(text: string, findings: PiiFinding[]): string {
    let redacted = text;
    
    // Sort findings by position (descending) to avoid index shifting
    const sortedFindings = findings.sort((a, b) => b.start - a.start);
    
    for (const finding of sortedFindings) {
      const replacement = this.getRedactionReplacement(finding.type, finding.text);
      redacted = redacted.substring(0, finding.start) + 
                replacement + 
                redacted.substring(finding.end);
    }
    
    return redacted;
  }

  private getRedactionReplacement(type: PiiType, originalText: string): string {
    const replacements: Record<PiiType, string> = {
      [PiiType.SSN]: '[SSN REDACTED]',
      [PiiType.EMAIL]: '[EMAIL REDACTED]',
      [PiiType.PHONE]: '[PHONE REDACTED]',
      [PiiType.CREDIT_CARD]: '[CREDIT CARD REDACTED]',
      [PiiType.STUDENT_ID]: '[STUDENT ID REDACTED]',
      [PiiType.NAME]: '[NAME REDACTED]',
      [PiiType.ADDRESS]: '[ADDRESS REDACTED]',
      [PiiType.DATE_OF_BIRTH]: '[DOB REDACTED]',
      [PiiType.MEDICAL_RECORD]: '[MEDICAL RECORD REDACTED]',
      [PiiType.BANK_ACCOUNT]: '[BANK ACCOUNT REDACTED]',
      [PiiType.PASSPORT]: '[PASSPORT REDACTED]',
      [PiiType.DRIVERS_LICENSE]: '[DRIVERS LICENSE REDACTED]',
    };
    return replacements[type] || '[PII REDACTED]';
  }

  private calculateOverallConfidence(findings: PiiFinding[]): number {
    if (findings.length === 0) return 0;
    const avgConfidence = findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length;
    return Math.round(avgConfidence * 100) / 100;
  }

  private isValidCreditCard(number: string): boolean {
    // Luhn algorithm check
    const digits = number.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
}

class NameDetector {
  private commonFirstNames: Set<string>;
  private commonLastNames: Set<string>;

  constructor() {
    // In production, load from comprehensive name databases
    this.commonFirstNames = new Set([
      'john', 'jane', 'michael', 'sarah', 'david', 'lisa', 'robert', 'maria',
      'james', 'jennifer', 'william', 'elizabeth', 'richard', 'susan', 'joseph',
      'karen', 'thomas', 'nancy', 'christopher', 'betty', 'daniel', 'helen',
      'matthew', 'sandra', 'anthony', 'donna', 'mark', 'carol', 'donald', 'ruth',
    ]);

    this.commonLastNames = new Set([
      'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller',
      'davis', 'rodriguez', 'martinez', 'hernandez', 'lopez', 'gonzalez',
      'wilson', 'anderson', 'thomas', 'taylor', 'moore', 'jackson', 'martin',
    ]);
  }

  async findNames(text: string): Promise<PiiFinding[]> {
    const findings: PiiFinding[] = [];
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase().replace(/[^\w]/g, '');
      
      // Check for common first name patterns
      if (this.commonFirstNames.has(word) && i + 1 < words.length) {
        const nextWord = words[i + 1].toLowerCase().replace(/[^\w]/g, '');
        
        if (this.commonLastNames.has(nextWord) || this.isCapitalized(words[i + 1])) {
          const fullName = `${words[i]} ${words[i + 1]}`;
          const startPos = text.indexOf(fullName);
          
          if (startPos !== -1) {
            findings.push({
              type: PiiType.NAME,
              text: fullName,
              start: startPos,
              end: startPos + fullName.length,
              confidence: 0.7,
              context: this.getContext(text, startPos, 30),
              severity: 'medium',
            });
          }
        }
      }
    }
    
    return findings;
  }

  private isCapitalized(word: string): boolean {
    return /^[A-Z][a-z]+$/.test(word.replace(/[^\w]/g, ''));
  }

  private getContext(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.substring(start, end);
  }
}
