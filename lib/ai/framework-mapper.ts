/**
 * Framework Mapper Service
 * Maps document content to applicable compliance frameworks
 * 
 * @version 1.0.0
 * @author Staff Software Engineer
 */

export interface FrameworkMapping {
  framework: string;
  confidence: number;
  applicableSections: string[];
  reasons: string[];
  requirements: FrameworkRequirement[];
}

export interface FrameworkRequirement {
  id: string;
  section: string;
  requirement: string;
  mandatory: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export class FrameworkMapper {
  private frameworks: Map<string, FrameworkDefinition>;

  constructor() {
    this.frameworks = new Map([
      ['NIST AI RMF', this.getNistAiRmfDefinition()],
      ['FERPA', this.getFerpaDefinition()],
      ['COPPA', this.getCoppaDefinition()],
      ['ED AI Guidance', this.getEdAiGuidanceDefinition()],
      ['State AI Policy', this.getStateAiPolicyDefinition()],
    ]);
  }

  async mapFrameworks(
    documentText: string, 
    documentType: string, 
    institutionType: string
  ): Promise<string[]> {
    const mappings: FrameworkMapping[] = [];

    for (const [frameworkName, definition] of this.frameworks) {
      const mapping = await this.analyzeFrameworkApplicability(
        documentText,
        definition,
        documentType,
        institutionType
      );

      if (mapping.confidence > 0.3) {
        mappings.push(mapping);
      }
    }

    // Sort by confidence and return framework names
    return mappings
      .sort((a, b) => b.confidence - a.confidence)
      .map(m => m.framework);
  }

  private async analyzeFrameworkApplicability(
    text: string,
    framework: FrameworkDefinition,
    documentType: string,
    institutionType: string
  ): Promise<FrameworkMapping> {
    let confidence = 0;
    const applicableSections: string[] = [];
    const reasons: string[] = [];

    // 1. Institution type applicability
    if (framework.applicableInstitutions.includes(institutionType) || 
        framework.applicableInstitutions.includes('ALL')) {
      confidence += 0.3;
      reasons.push(`Applicable to ${institutionType} institutions`);
    }

    // 2. Document type relevance
    if (framework.relevantDocumentTypes.includes(documentType) ||
        framework.relevantDocumentTypes.includes('ALL')) {
      confidence += 0.2;
      reasons.push(`Relevant to ${documentType} documents`);
    }

    // 3. Keyword analysis
    const keywordMatches = this.analyzeKeywords(text, framework.keywords);
    confidence += keywordMatches.score * 0.3;
    if (keywordMatches.matches.length > 0) {
      reasons.push(`Contains relevant keywords: ${keywordMatches.matches.slice(0, 3).join(', ')}`);
    }

    // 4. Content pattern analysis
    const patternMatches = this.analyzePatterns(text, framework.contentPatterns);
    confidence += patternMatches.score * 0.2;
    applicableSections.push(...patternMatches.sections);

    return {
      framework: framework.name,
      confidence: Math.min(confidence, 1.0),
      applicableSections,
      reasons,
      requirements: framework.requirements,
    };
  }

  private analyzeKeywords(text: string, keywords: string[]): { score: number; matches: string[] } {
    const textLower = text.toLowerCase();
    const matches: string[] = [];
    
    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        matches.push(keyword);
      }
    }

    return {
      score: Math.min(matches.length / keywords.length, 1.0),
      matches,
    };
  }

  private analyzePatterns(text: string, patterns: RegExp[]): { score: number; sections: string[] } {
    const sections: string[] = [];
    let matchCount = 0;

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        matchCount++;
        sections.push(...matches.slice(0, 2)); // Limit to avoid spam
      }
    }

    return {
      score: Math.min(matchCount / patterns.length, 1.0),
      sections,
    };
  }

  private getNistAiRmfDefinition(): FrameworkDefinition {
    return {
      name: 'NIST AI RMF',
      version: '1.0',
      applicableInstitutions: ['K12', 'HigherEd', 'ALL'],
      relevantDocumentTypes: ['policy', 'handbook', 'contract'],
      keywords: [
        'artificial intelligence', 'AI', 'machine learning', 'algorithmic',
        'automated decision', 'risk management', 'bias', 'fairness',
        'transparency', 'accountability', 'governance', 'oversight',
      ],
      contentPatterns: [
        /AI\s+risk\s+management/gi,
        /algorithmic\s+bias/gi,
        /automated\s+decision[s]?/gi,
        /AI\s+governance/gi,
        /trustworthy\s+AI/gi,
      ],
      requirements: [
        {
          id: 'GOVERN-1.1',
          section: 'Governance',
          requirement: 'Establish AI governance structure with clear roles and responsibilities',
          mandatory: true,
          priority: 'critical',
        },
        {
          id: 'MAP-1.1',
          section: 'Map',
          requirement: 'Identify and document AI systems in use',
          mandatory: true,
          priority: 'high',
        },
        {
          id: 'MEASURE-2.1',
          section: 'Measure',
          requirement: 'Implement bias testing and monitoring',
          mandatory: true,
          priority: 'high',
        },
        {
          id: 'MANAGE-3.1',
          section: 'Manage',
          requirement: 'Establish incident response procedures for AI systems',
          mandatory: true,
          priority: 'medium',
        },
      ],
    };
  }

  private getFerpaDefinition(): FrameworkDefinition {
    return {
      name: 'FERPA',
      version: '2023.1',
      applicableInstitutions: ['K12', 'HigherEd'],
      relevantDocumentTypes: ['policy', 'handbook', 'contract'],
      keywords: [
        'student records', 'educational records', 'personally identifiable information',
        'PII', 'directory information', 'consent', 'disclosure', 'privacy',
        'FERPA', 'Family Educational Rights', 'student data',
      ],
      contentPatterns: [
        /student\s+(?:records?|data|information)/gi,
        /educational\s+records?/gi,
        /personally\s+identifiable\s+information/gi,
        /directory\s+information/gi,
        /FERPA/gi,
      ],
      requirements: [
        {
          id: 'FERPA-1',
          section: 'Access Rights',
          requirement: 'Provide students/parents access to educational records',
          mandatory: true,
          priority: 'critical',
        },
        {
          id: 'FERPA-2',
          section: 'Disclosure',
          requirement: 'Obtain consent before disclosing PII from educational records',
          mandatory: true,
          priority: 'critical',
        },
        {
          id: 'FERPA-3',
          section: 'Directory Information',
          requirement: 'Define and properly handle directory information',
          mandatory: true,
          priority: 'high',
        },
      ],
    };
  }

  private getCoppaDefinition(): FrameworkDefinition {
    return {
      name: 'COPPA',
      version: '2023.2',
      applicableInstitutions: ['K12'],
      relevantDocumentTypes: ['policy', 'contract'],
      keywords: [
        'children', 'under 13', 'parental consent', 'COPPA',
        'child privacy', 'personal information', 'collection',
        'FTC', 'Children\'s Online Privacy Protection',
      ],
      contentPatterns: [
        /children\s+(?:under\s+)?13/gi,
        /parental\s+consent/gi,
        /COPPA/gi,
        /child(?:ren)?\s+privacy/gi,
      ],
      requirements: [
        {
          id: 'COPPA-1',
          section: 'Notice',
          requirement: 'Provide clear notice of information collection practices',
          mandatory: true,
          priority: 'critical',
        },
        {
          id: 'COPPA-2',
          section: 'Consent',
          requirement: 'Obtain verifiable parental consent before collecting data from children under 13',
          mandatory: true,
          priority: 'critical',
        },
      ],
    };
  }

  private getEdAiGuidanceDefinition(): FrameworkDefinition {
    return {
      name: 'ED AI Guidance',
      version: '2023.1',
      applicableInstitutions: ['K12', 'HigherEd'],
      relevantDocumentTypes: ['policy', 'handbook'],
      keywords: [
        'Department of Education', 'AI in education', 'educational AI',
        'student learning', 'equity', 'accessibility', 'bias',
        'educational technology', 'learning analytics',
      ],
      contentPatterns: [
        /AI\s+in\s+education/gi,
        /educational\s+AI/gi,
        /learning\s+analytics/gi,
        /educational\s+technology/gi,
      ],
      requirements: [
        {
          id: 'ED-AI-1',
          section: 'Equity',
          requirement: 'Ensure AI systems promote educational equity',
          mandatory: true,
          priority: 'high',
        },
        {
          id: 'ED-AI-2',
          section: 'Accessibility',
          requirement: 'Design AI systems to be accessible to all students',
          mandatory: true,
          priority: 'high',
        },
      ],
    };
  }

  private getStateAiPolicyDefinition(): FrameworkDefinition {
    return {
      name: 'State AI Policy',
      version: '2023.1',
      applicableInstitutions: ['K12', 'HigherEd'],
      relevantDocumentTypes: ['policy'],
      keywords: [
        'state policy', 'state guidance', 'state requirements',
        'local education agency', 'LEA', 'state education department',
      ],
      contentPatterns: [
        /state\s+(?:policy|guidance|requirements)/gi,
        /local\s+education\s+agency/gi,
        /state\s+education\s+department/gi,
      ],
      requirements: [
        {
          id: 'STATE-1',
          section: 'Compliance',
          requirement: 'Comply with state-specific AI regulations',
          mandatory: true,
          priority: 'high',
        },
      ],
    };
  }
}

interface FrameworkDefinition {
  name: string;
  version: string;
  applicableInstitutions: string[];
  relevantDocumentTypes: string[];
  keywords: string[];
  contentPatterns: RegExp[];
  requirements: FrameworkRequirement[];
}
