
// Policy Pack Library - Maintained templates with monthly redlines
export interface PolicyTemplate {
  id: string
  category: 'governance' | 'teaching' | 'privacy' | 'state' | 'communications' | 'syllabus'
  title: string
  description: string
  institutionType: 'K12' | 'HigherEd' | 'Both'

  // External reference anchoring
  sourceAuthority: string
  sourceUrl: string
  sourceDocument: string
  lastSourceUpdate: string

  // Template content
  templateContent: string
  fillableFields: string[]

  // Versioning and redlines
  version: string
  lastRedlineUpdate: string
  changeLog: PolicyChange[]

  // Compliance mapping
  complianceFrameworks: string[]
  riskLevel: 'Low' | 'Medium' | 'High'
  implementationComplexity: 'Simple' | 'Moderate' | 'Complex'

  created_at: string
  updated_at: string
}

export interface PolicyChange {
  id: string
  version: string
  changeDate: string
  changeType: 'Source Update' | 'Legal Requirement' | 'Best Practice' | 'User Feedback'
  sourceReference: string
  summary: string
  detailedChanges: RedlineChange[]
  approvalStatus: 'Pending' | 'Approved' | 'Rejected'
  impactLevel: 'Minor' | 'Moderate' | 'Major'
}

export interface RedlineChange {
  section: string
  changeType: 'Addition' | 'Deletion' | 'Modification'
  originalText: string
  newText: string
  rationale: string
  sourceJustification: string
}

export interface PolicyPack {
  id: string
  assessmentId: string
  institutionType: 'K12' | 'HigherEd'
  institutionName: string
  state: string

  // Included policies
  selectedPolicies: string[] // Policy template IDs
  customizations: Record<string, any>

  // Delivery tracking
  generatedAt: string
  deliveryStatus: 'Generated' | 'Delivered' | 'Reviewed' | 'Implemented'
  nextRedlineUpdate: string

  created_at: string
  updated_at: string
}

export class PolicyPackLibrary {
  private supabase: any

  constructor() {
    // Use shared anon client for read operations; server-only privileged ops should be refactored out
    this.supabase = require('./supabase').supabase
  }

  // Core policy templates with external reference anchoring
  private static readonly POLICY_TEMPLATES: PolicyTemplate[] = [
    // CORE GOVERNANCE
    {
      id: 'ai-governance-charter',
      category: 'governance',
      title: 'AI Governance Charter',
      description: 'Comprehensive AI governance framework aligned to NIST AI RMF',
      institutionType: 'Both',
      sourceAuthority: 'NIST',
      sourceUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
      sourceDocument: 'NIST AI Risk Management Framework (AI RMF 1.0)',
      lastSourceUpdate: '2024-01-15',
      templateContent: `
# AI GOVERNANCE CHARTER
## Aligned to NIST AI Risk Management Framework (AI RMF 1.0)

### 1. GOVERNANCE STRUCTURE
Based on NIST AI RMF GOVERN category requirements:

**1.1 AI Governance Board**
- Executive oversight of AI initiatives
- Risk assessment and mitigation authority
- Policy approval and enforcement
- Regular review of AI system performance

**1.2 AI Risk Management Officer**
- Day-to-day AI risk oversight
- Cross-departmental coordination
- Incident response management
- Compliance monitoring

### 2. RISK MANAGEMENT APPROACH
Implementing NIST AI RMF core functions:

**2.1 GOVERN (GV)**
- GV-1.1: Legal and regulatory requirements identification
- GV-1.2: Risk management processes establishment
- GV-1.3: Roles and responsibilities definition

**2.2 MAP (MP)**
- MP-1.1: AI system categorization and impact assessment
- MP-2.1: Risk measurement and monitoring
- MP-3.1: Risk tolerance establishment

**2.3 MEASURE (MS)**
- MS-1.1: Performance monitoring systems
- MS-2.1: Risk measurement protocols
- MS-3.1: Evaluation metrics establishment

**2.4 MANAGE (MG)**
- MG-1.1: Risk response planning
- MG-2.1: Risk mitigation implementation
- MG-3.1: Continuous monitoring processes

### 3. IMPLEMENTATION REQUIREMENTS

**3.1 AI System Registration**
All AI systems must be:
- Catalogued in institutional AI inventory
- Risk-assessed using NIST framework
- Approved through governance process
- Monitored for ongoing compliance

**3.2 Vendor Management**
Third-party AI tools require:
- Due diligence assessment
- Data processing agreements
- Risk classification
- Ongoing monitoring

### 4. COMPLIANCE AND MONITORING

**4.1 Regular Reviews**
- Quarterly risk assessments
- Annual policy updates
- Incident response evaluations
- Stakeholder feedback integration

**4.2 Documentation Requirements**
- AI system documentation
- Risk assessment records
- Decision rationale
- Audit trails

### 5. TRAINING AND AWARENESS

**5.1 Staff Training**
- AI literacy programs
- Risk awareness training
- Policy compliance education
- Incident response procedures

**5.2 Ongoing Education**
- Regular updates on AI developments
- Best practice sharing
- Regulatory change notifications
- Professional development opportunities

---
**Source Authority:** National Institute of Standards and Technology (NIST)
**Reference Document:** AI Risk Management Framework (AI RMF 1.0)
**Last Updated:** {{lastUpdated}}
**Institution:** {{institutionName}}
**Approved by:** {{approverName}}
**Effective Date:** {{effectiveDate}}
`,
      fillableFields: [
        'institutionName',
        'approverName',
        'effectiveDate',
        'lastUpdated',
        'contactEmail',
        'reviewDate'
      ],
      version: '2.1',
      lastRedlineUpdate: '2024-08-15',
      changeLog: [
        {
          id: 'change-001',
          version: '2.1',
          changeDate: '2024-08-15',
          changeType: 'Source Update',
          sourceReference: 'NIST AI RMF GenAI Profile (July 2024)',
          summary: 'Added generative AI specific risk considerations',
          detailedChanges: [
            {
              section: '2.2 MAP (MP)',
              changeType: 'Addition',
              originalText: 'MP-3.1: Risk tolerance establishment',
              newText: 'MP-3.1: Risk tolerance establishment\n- MP-3.2: Generative AI content risk assessment',
              rationale: 'NIST GenAI Profile requires specific attention to generative AI risks',
              sourceJustification: 'NIST AI RMF GenAI Profile, Section 2.3'
            }
          ],
          approvalStatus: 'Approved',
          impactLevel: 'Moderate'
        }
      ],
      complianceFrameworks: ['NIST AI RMF', 'ISO 27001', 'SOC 2'],
      riskLevel: 'High',
      implementationComplexity: 'Complex',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-08-15T00:00:00Z'
    },

    {
      id: 'ai-vendor-tools-policy',
      category: 'governance',
      title: 'AI Use of Third-Party Tools',
      description: 'Vendor intake process and DPA clauses for AI tools',
      institutionType: 'Both',
      sourceAuthority: 'NIST',
      sourceUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
      sourceDocument: 'NIST AI RMF - Third Party Risk Management',
      lastSourceUpdate: '2024-07-10',
      templateContent: `
# AI USE OF THIRD-PARTY TOOLS POLICY
## Vendor Intake and Data Processing Agreement Requirements

### 1. VENDOR EVALUATION PROCESS

**1.1 Initial Assessment**
All AI vendor tools must undergo:
- Security and privacy assessment
- Data processing capability review
- Compliance framework alignment
- Risk classification determination

**1.2 Due Diligence Requirements**
Vendors must provide:
- SOC 2 Type II certification
- Data processing agreement (DPA)
- Security incident history
- AI model transparency documentation

### 2. REQUIRED DPA CLAUSES

**2.1 Data Processing Scope**
- Specific data types authorized for processing
- Geographic processing restrictions
- Purpose limitation requirements
- Data retention periods

**2.2 AI-Specific Provisions**
- Model training data exclusion
- Output data ownership
- Bias monitoring requirements
- Explainability provisions

**2.3 Security Requirements**
- Encryption in transit and at rest
- Access control mechanisms
- Audit logging requirements
- Incident notification procedures

### 3. ONGOING MONITORING

**3.1 Performance Monitoring**
- Regular security assessments
- Data processing compliance audits
- Risk reassessment procedures
- Contract renewal evaluations

**3.2 Incident Management**
- Vendor incident reporting requirements
- Internal escalation procedures
- Remediation planning
- Stakeholder communication

---
**Source Authority:** National Institute of Standards and Technology (NIST)
**Reference Document:** AI Risk Management Framework - Third Party Risk
**Institution:** {{institutionName}}
**Effective Date:** {{effectiveDate}}
`,
      fillableFields: [
        'institutionName',
        'effectiveDate',
        'approverName',
        'contactEmail'
      ],
      version: '1.3',
      lastRedlineUpdate: '2024-07-10',
      changeLog: [],
      complianceFrameworks: ['NIST AI RMF', 'GDPR', 'CCPA'],
      riskLevel: 'High',
      implementationComplexity: 'Moderate',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-07-10T00:00:00Z'
    },

    // TEACHING & LEARNING
    {
      id: 'teaching-learning-ai-guidelines',
      category: 'teaching',
      title: 'Teaching & Learning with AI Guidelines',
      description: 'U.S. Department of Education aligned AI in education guidelines',
      institutionType: 'Both',
      sourceAuthority: 'U.S. Department of Education',
      sourceUrl: 'https://www.ed.gov/news/press-releases/department-education-releases-report-artificial-intelligence-and-future-teaching-and-learning',
      sourceDocument: 'Artificial Intelligence and the Future of Teaching and Learning',
      lastSourceUpdate: '2024-05-01',
      templateContent: `
# TEACHING & LEARNING WITH AI GUIDELINES
## U.S. Department of Education Aligned Framework

### 1. EDUCATIONAL AI PRINCIPLES
Based on ED's "Artificial Intelligence and the Future of Teaching and Learning":

**1.1 Human-Centered Approach**
- AI supplements, not replaces, human instruction
- Educator professional judgment remains paramount
- Student agency and voice are preserved
- Equity and accessibility are prioritized

**1.2 Educational Purpose Alignment**
- AI use must support learning objectives
- Tools selected based on pedagogical value
- Student development remains the focus
- Assessment integrity is maintained

### 2. CLASSROOM IMPLEMENTATION

**2.1 Permitted AI Uses**
- Research and information gathering assistance
- Writing support and brainstorming
- Language learning and translation
- Accessibility accommodations
- Personalized learning pathways

**2.2 Prohibited AI Uses**
- Completion of assessments without disclosure
- Plagiarism or academic dishonesty
- Replacement of critical thinking
- Inappropriate data collection
- Biased or discriminatory applications

**2.3 Transparency Requirements**
- Clear disclosure of AI assistance
- Attribution of AI-generated content
- Documentation of AI tool usage
- Student understanding of AI capabilities

### 3. EDUCATOR GUIDELINES

**3.1 Professional Development**
- AI literacy training requirements
- Ongoing education on AI tools
- Ethical use guidelines
- Best practice sharing

**3.2 Assessment Considerations**
- Clear AI use policies per assignment
- Alternative assessment methods
- Academic integrity enforcement
- Student skill development focus

### 4. STUDENT EXPECTATIONS

**4.1 AI Literacy Development**
- Understanding AI capabilities and limitations
- Ethical use principles
- Critical evaluation skills
- Responsible AI citizenship

**4.2 Academic Integrity**
- Proper attribution of AI assistance
- Original thought demonstration
- Honest disclosure of AI use
- Skill development over output

### 5. CAMPUS/CLASSROOM GUARDRAILS

**5.1 Technical Safeguards**
- Age-appropriate AI tool selection
- Data privacy protection
- Content filtering mechanisms
- Usage monitoring systems

**5.2 Policy Enforcement**
- Clear consequences for misuse
- Fair and consistent application
- Due process procedures
- Educational interventions

---
**Source Authority:** U.S. Department of Education
**Reference Document:** Artificial Intelligence and the Future of Teaching and Learning
**Institution:** {{institutionName}}
**Effective Date:** {{effectiveDate}}
`,
      fillableFields: [
        'institutionName',
        'effectiveDate',
        'gradeLevel',
        'approverName'
      ],
      version: '1.2',
      lastRedlineUpdate: '2024-05-01',
      changeLog: [],
      complianceFrameworks: ['ED Guidelines', 'FERPA', 'IDEA'],
      riskLevel: 'Medium',
      implementationComplexity: 'Moderate',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-05-01T00:00:00Z'
    },

    // PRIVACY & STUDENT DATA
    {
      id: 'ferpa-genai-considerations',
      category: 'privacy',
      title: 'FERPA Considerations for GenAI Use',
      description: 'Data handling guidelines for generative AI compliance with FERPA',
      institutionType: 'Both',
      sourceAuthority: 'Teaching at JHU',
      sourceUrl: 'https://teaching.jhu.edu/resources/technology/artificial-intelligence-guidance/',
      sourceDocument: 'FERPA and AI: Privacy Considerations',
      lastSourceUpdate: '2024-06-15',
      templateContent: `
# FERPA CONSIDERATIONS FOR GENERATIVE AI USE
## Data Handling Guidelines and Privacy Protection

### 1. FERPA COMPLIANCE FRAMEWORK

**1.1 Educational Record Protection**
Under FERPA (20 USC § 1232g), educational records include:
- Student academic performance data
- Behavioral records
- Personally identifiable information
- Directory information (with restrictions)

**1.2 GenAI Specific Risks**
- Inadvertent disclosure through AI training
- Model memory of student information
- Cross-contamination between users
- Persistent data in AI systems

### 2. DATA HANDLING PROTOCOLS

**2.1 De-Identification Requirements**
Before AI processing, remove:
- Student names and identifiers
- Social Security numbers
- Student ID numbers
- Addresses and contact information
- Dates of birth
- Other personally identifiable elements

**2.2 Directory Information Considerations**
Even directory information requires:
- Annual notification to parents/students
- Opt-out opportunities
- Limited use authorization
- Specific purpose documentation

**2.3 Legitimate Educational Interest**
AI use must demonstrate:
- Clear educational purpose
- Need-to-know basis
- Minimal data access
- Appropriate safeguards

### 3. FERPA EXCEPTIONS AND AI USE

**3.1 School Official Exception**
AI vendors may qualify as "school officials" if:
- Performing institutional services
- Under direct institutional control
- Subject to FERPA requirements
- Using data only for authorized purposes

**3.2 Study Exception**
AI research may qualify under study exception with:
- Written agreement with institution
- Purpose limited to specific study
- Data destruction upon completion
- No personal identification in results

### 4. IMPLEMENTATION SAFEGUARDS

**4.1 Technical Protections**
- End-to-end encryption
- Access controls and authentication
- Audit logging and monitoring
- Data loss prevention systems

**4.2 Contractual Protections**
- Data processing agreements
- FERPA compliance clauses
- Data retention limits
- Security breach notification

### 5. INCIDENT RESPONSE

**5.1 FERPA Breach Procedures**
- Immediate containment
- Risk assessment
- Notification requirements
- Remediation planning

**5.2 Documentation Requirements**
- Breach investigation records
- Corrective action plans
- Stakeholder communications
- Regulatory notifications

---
**Source Authority:** Family Educational Rights and Privacy Act (FERPA)
**Reference:** Teaching at JHU - AI Guidance
**Institution:** {{institutionName}}
**Effective Date:** {{effectiveDate}}
`,
      fillableFields: [
        'institutionName',
        'effectiveDate',
        'privacyOfficer',
        'contactEmail'
      ],
      version: '1.1',
      lastRedlineUpdate: '2024-06-15',
      changeLog: [],
      complianceFrameworks: ['FERPA', 'GDPR', 'CCPA'],
      riskLevel: 'High',
      implementationComplexity: 'Complex',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-06-15T00:00:00Z'
    },

    {
      id: 'coppa-k12-language',
      category: 'privacy',
      title: 'COPPA Language for K-12',
      description: 'Children\'s Online Privacy Protection Act compliance for AI tools',
      institutionType: 'K12',
      sourceAuthority: 'Federal Trade Commission',
      sourceUrl: 'https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/childrens-online-privacy-protection-rule',
      sourceDocument: 'Children\'s Online Privacy Protection Rule (COPPA)',
      lastSourceUpdate: '2024-04-10',
      templateContent: `
# COPPA COMPLIANCE FOR K-12 AI TOOLS
## Children's Online Privacy Protection Act Requirements

### 1. COPPA REGULATORY FRAMEWORK

**1.1 Scope and Coverage**
COPPA applies to:
- Commercial websites and online services
- Directed to children under 13
- Collecting personal information
- Including AI-powered educational tools

**1.2 Personal Information Definition**
Under COPPA, personal information includes:
- Name, address, email address
- Telephone number
- Social Security number
- Audio files with child's voice
- Video files with child's image
- Screen names and user identifiers

### 2. CONSENT REQUIREMENTS

**2.1 Verifiable Parental Consent**
Required before collecting personal information:
- Written consent (mailed or faxed)
- Electronic signature
- Credit card verification
- Video-conference with trained personnel
- Email plus additional verification

**2.2 School Authorization**
Schools may provide consent for educational purposes:
- Must be for legitimate educational use
- School acts as agent for parent
- Limited to educational context only
- Cannot be used for commercial purposes

### 3. DATA RETENTION REQUIREMENTS

**3.1 Retention Limitations**
Personal information must be:
- Kept only as long as necessary
- For the specific purpose collected
- Deleted when no longer needed
- Subject to reasonable retention periods

**3.2 AI-Specific Considerations**
- Model training data exclusion
- Temporary processing limitations
- Output data handling
- Cross-session data isolation

### 4. SAFE HARBOR PROVISIONS

**4.1 Educational Context Protection**
Schools providing consent must ensure:
- Legitimate educational purpose
- No commercial data sharing
- Limited data collection
- Appropriate security measures

**4.2 Vendor Requirements**
AI tool providers must:
- Provide clear privacy notices
- Implement data minimization
- Offer data deletion options
- Maintain security safeguards

### 5. IMPLEMENTATION FRAMEWORK

**5.1 Pre-Implementation Review**
Before deploying AI tools:
- COPPA applicability assessment
- Age verification mechanisms
- Consent process establishment
- Data flow documentation

**5.2 Ongoing Compliance**
- Regular privacy impact assessments
- Vendor compliance monitoring
- Parent notification procedures
- Data retention reviews

### 6. VIOLATION CONSEQUENCES

**6.1 FTC Enforcement**
Violations may result in:
- Civil penalties up to $46,517 per violation
- Injunctive relief
- Consumer redress
- Compliance monitoring

**6.2 Risk Mitigation**
- Legal counsel consultation
- Privacy by design implementation
- Staff training programs
- Regular compliance audits

---
**Source Authority:** Federal Trade Commission (FTC)
**Reference Document:** Children's Online Privacy Protection Rule (COPPA)
**Institution:** {{institutionName}}
**Effective Date:** {{effectiveDate}}
`,
      fillableFields: [
        'institutionName',
        'effectiveDate',
        'districtName',
        'privacyOfficer'
      ],
      version: '1.0',
      lastRedlineUpdate: '2024-04-10',
      changeLog: [],
      complianceFrameworks: ['COPPA', 'FERPA', 'State Privacy Laws'],
      riskLevel: 'High',
      implementationComplexity: 'Complex',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-04-10T00:00:00Z'
    }
  ]

  // Generate monthly redline updates
  async generateMonthlyRedlines(): Promise<PolicyChange[]> {
    const changes: PolicyChange[] = []

    // Check for source document updates
    for (const template of PolicyPackLibrary.POLICY_TEMPLATES) {
      const sourceChanges = await this.checkSourceUpdates(template)
      changes.push(...sourceChanges)
    }

    return changes
  }

  private async checkSourceUpdates(template: PolicyTemplate): Promise<PolicyChange[]> {
    // In production, this would check external sources for updates
    // For now, return simulated updates based on common change patterns

    const changes: PolicyChange[] = []

    // Simulate NIST AI RMF updates
    if (template.sourceAuthority === 'NIST') {
      changes.push({
        id: `change-${Date.now()}`,
        version: this.incrementVersion(template.version),
        changeDate: new Date().toISOString(),
        changeType: 'Source Update',
        sourceReference: 'NIST AI RMF GenAI Profile Update',
        summary: 'Updated risk assessment requirements for generative AI systems',
        detailedChanges: [
          {
            section: 'Risk Management Approach',
            changeType: 'Addition',
            originalText: 'Standard AI risk assessment procedures',
            newText: 'Standard AI risk assessment procedures with enhanced generative AI evaluations',
            rationale: 'New NIST guidance requires specific attention to generative AI risks',
            sourceJustification: 'NIST AI RMF GenAI Profile, Section 3.2'
          }
        ],
        approvalStatus: 'Pending',
        impactLevel: 'Moderate'
      })
    }

    return changes
  }

  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.')
    const minor = parseInt(parts[1]) + 1
    return `${parts[0]}.${minor}`
  }

  // Generate state-specific addenda
  async generateStateAddenda(state: string, institutionType: 'K12' | 'HigherEd'): Promise<string> {
    const stateGuidance = await this.getStateGuidance(state, institutionType)

    return `
# STATE-SPECIFIC AI GUIDANCE ADDENDUM
## ${state} AI Requirements for ${institutionType} Institutions

${stateGuidance}

---
**Source:** ${state} Department of Education AI Guidance
**Last Updated:** ${new Date().toLocaleDateString()}
**Auto-generated addendum - Updated monthly**
`
  }

  private async getStateGuidance(state: string, institutionType: string): Promise<string> {
    // In production, this would fetch real state guidance
    // Simulated state-specific requirements

    const stateRequirements: Record<string, string> = {
      'California': `
### California AI Transparency Requirements
- AB 2273 (California Age-Appropriate Design Code)
- Student data privacy enhanced protections
- AI algorithm transparency requirements
- Regular impact assessments mandated
`,
      'Texas': `
### Texas Educational Technology Requirements
- HB 3932 Student Data Privacy
- AI tool vendor approval process
- Parent notification requirements
- Data residency restrictions
`,
      'New York': `
### New York State AI in Education Guidelines
- SHIELD Act compliance requirements
- Enhanced student privacy protections
- AI bias assessment mandates
- Regular transparency reporting
`
    }

    return stateRequirements[state] || `
### ${state} AI Requirements
Please consult your state education department for specific AI guidance.
This addendum will be updated as state guidance becomes available.
`
  }

  // Generate communication kits
  async generateCommunicationKit(institutionType: 'K12' | 'HigherEd', institutionName: string): Promise<{
    parentLetter: string,
    studentGuide: string,
    faq: string
  }> {
    return {
      parentLetter: this.generateParentLetter(institutionType, institutionName),
      studentGuide: this.generateStudentGuide(institutionType, institutionName),
      faq: this.generateFAQ(institutionType, institutionName)
    }
  }

  private generateParentLetter(institutionType: 'K12' | 'HigherEd', institutionName: string): string {
    const audience = institutionType === 'K12' ? 'Parents and Guardians' : 'Families'
    const students = institutionType === 'K12' ? 'children' : 'students'

    return `
# Letter to ${audience}
## Artificial Intelligence in Education at ${institutionName}

Dear ${audience},

We are writing to inform you about how ${institutionName} is incorporating artificial intelligence (AI) tools into our educational environment and the steps we are taking to ensure your ${students}' privacy and safety.

### What AI Means at ${institutionName}

Artificial intelligence tools can help enhance learning by:
- Providing personalized learning experiences
- Assisting with research and writing
- Supporting accessibility needs
- Offering immediate feedback and guidance

### Our Commitment to Safety and Privacy

We are committed to:
- **Privacy Protection**: All AI tools undergo rigorous privacy reviews
- **Age-Appropriate Use**: Tools are selected based on developmental appropriateness
- **Transparent Policies**: Clear guidelines for students and educators
- **Ongoing Monitoring**: Regular assessment of AI tool effectiveness and safety

### Your Rights and Choices

You have the right to:
- Review our AI use policies
- Request information about specific tools
- Opt your ${students.slice(0, -1)} out of certain AI activities
- Receive regular updates on our AI practices

### Questions or Concerns

If you have any questions about our AI policies or specific tools, please contact:
- Privacy Officer: [Contact Information]
- Technology Director: [Contact Information]
- Principal/Administrator: [Contact Information]

We value your partnership in providing the best educational experience for your ${students}.

Sincerely,
${institutionName} Administration

---
**Date:** ${new Date().toLocaleDateString()}
**For questions:** privacy@${institutionName.toLowerCase().replace(/\s+/g, '')}.edu
`
  }

  private generateStudentGuide(institutionType: 'K12' | 'HigherEd', institutionName: string): string {
    const level = institutionType === 'K12' ? 'elementary' : 'college'

    return `
# What AI Means Here: A Student Guide
## ${institutionName}

### What is AI?

Artificial Intelligence (AI) is like having a very smart computer assistant that can help you learn, research, and solve problems. Think of it as a tool that can understand and respond to your questions.

### How We Use AI at ${institutionName}

✅ **Allowed Uses:**
- Getting help with research
- Brainstorming ideas
- Checking grammar and spelling
- Learning new concepts
- Accessibility support

❌ **Not Allowed:**
- Having AI do your homework for you
- Copying AI answers without understanding them
- Sharing personal information with AI tools
- Using AI to cheat on tests

### Being Honest About AI Use

When you use AI tools:
1. **Tell your teacher** when you've used AI help
2. **Explain what the AI helped you with**
3. **Show your own thinking** in your work
4. **Learn from the AI** instead of just copying

### Staying Safe

Remember to:
- Never share personal information (name, address, phone)
- Don't believe everything AI tells you - always check facts
- Ask a teacher if you're unsure about using an AI tool
- Report any problems or concerns immediately

### Your Learning Journey

AI is here to help you learn better, not to replace your thinking. Your creativity, critical thinking, and unique perspective are what make you special!

**Questions?** Ask your teacher or contact the technology office.

---
**${institutionName} Technology Team**
**Updated:** ${new Date().toLocaleDateString()}
`
  }

  private generateFAQ(institutionType: 'K12' | 'HigherEd', institutionName: string): string {
    const students = institutionType === 'K12' ? 'students' : 'students'
    const parents = institutionType === 'K12' ? 'parents' : 'families'

    return `
# AI in Education FAQ
## ${institutionName}

### General Questions

**Q: What AI tools does ${institutionName} use?**
A: We use carefully selected AI tools that have been reviewed for privacy, safety, and educational value. Current tools include [list will be populated with actual tools].

**Q: How do you protect student privacy?**
A: All AI tools undergo rigorous privacy reviews. We ensure no personal student information is used to train AI models, and all data is handled according to FERPA and other privacy laws.

**Q: Can ${parents} opt their ${students.slice(0, -1)} out of AI activities?**
A: Yes, ${parents} can request that their ${students.slice(0, -1)} not participate in specific AI-enhanced activities. Please contact our privacy officer to discuss options.

### For Educators

**Q: What training is provided for AI tools?**
A: All educators receive comprehensive training on approved AI tools, including best practices, privacy considerations, and pedagogical applications.

**Q: How do we maintain academic integrity?**
A: We provide clear guidelines on appropriate AI use, require transparency in AI assistance, and focus on learning objectives rather than just outputs.

### For ${students.charAt(0).toUpperCase() + students.slice(1)}

**Q: Will using AI hurt my learning?**
A: When used appropriately, AI can enhance your learning by providing personalized support and freeing you to focus on higher-level thinking skills.

**Q: How do I cite AI assistance in my work?**
A: Follow your instructor's guidelines for acknowledging AI assistance. Generally, this includes noting which AI tool was used and how it helped with your work.

### Technical Questions

**Q: How secure are the AI tools?**
A: All approved AI tools meet our security standards, including encryption, access controls, and regular security assessments.

**Q: What happens to student data?**
A: Student data is processed according to strict privacy policies. AI tools do not retain personal information or use it for training purposes.

### Concerns and Support

**Q: Who can I contact with concerns?**
A: Contact our technology team at tech@${institutionName.toLowerCase().replace(/\s+/g, '')}.edu or your child's teacher for specific questions.

**Q: How often are policies updated?**
A: AI policies are reviewed quarterly and updated as needed based on new guidance, technology changes, and feedback from our community.

---
**Last Updated:** ${new Date().toLocaleDateString()}
**Contact:** privacy@${institutionName.toLowerCase().replace(/\s+/g, '')}.edu
`
  }

  // Generate syllabus/handbook language
  generateSyllabusLanguage(mode: 'Allowed' | 'Limited' | 'Prohibited', subject: string): string {
    const templates = {
      'Allowed': `
# AI Use Policy - ${subject}
## Allowed with Transparency

### AI Assistance Permitted
In this course, you are **allowed** to use AI tools to support your learning, with the following requirements:

**Transparency Requirements:**
- Disclose all AI assistance in your work
- Specify which AI tool was used and how
- Include a brief reflection on what you learned
- Maintain academic honesty in all submissions

**Appropriate Uses:**
- Research assistance and source identification
- Brainstorming and idea generation
- Grammar and style suggestions
- Concept explanation and clarification
- Accessibility support

**Academic Integrity Expectations:**
- Your ideas and analysis must be original
- AI cannot substitute for required learning
- Proper attribution of AI assistance required
- Understanding and explanation of all work submitted

**Example Attribution:**
"I used ChatGPT to help brainstorm potential research topics and to check my grammar. The analysis and conclusions are entirely my own work."
`,

      'Limited': `
# AI Use Policy - ${subject}
## Limited Use with Prior Approval

### Restricted AI Use
AI tools may be used in this course **only with prior instructor approval** and under specific circumstances:

**Pre-Approval Required For:**
- Research assistance (must be documented)
- Accessibility accommodations
- Language support for non-native speakers
- Specific assignments designated as "AI-permitted"

**Prohibited Uses:**
- Assignment completion without disclosure
- Exam or quiz assistance
- Critical analysis or interpretation
- Original writing without clear attribution

**Approval Process:**
1. Request permission before using any AI tool
2. Specify the tool and intended use
3. Await explicit approval before proceeding
4. Document and attribute all AI assistance

**Academic Integrity:**
All work must demonstrate your understanding and learning. AI assistance, when approved, must be clearly documented and explained.
`,

      'Prohibited': `
# AI Use Policy - ${subject}
## AI Use Not Permitted

### No AI Assistance Allowed
The use of artificial intelligence tools is **prohibited** in this course to ensure authentic assessment of your individual learning and capabilities.

**Prohibited AI Tools Include:**
- ChatGPT, Claude, Bard, and similar text generators
- AI writing assistants (Grammarly AI, Jasper, etc.)
- AI research tools and summarizers
- AI translation services (beyond basic word lookup)
- Any automated content generation tools

**Learning Rationale:**
This policy ensures that:
- You develop essential ${subject} skills independently
- Assessments accurately reflect your abilities
- You engage deeply with course material
- Academic integrity is maintained

**Academic Integrity Violations:**
Use of AI tools in this course constitutes academic dishonesty and may result in:
- Assignment failure
- Course failure
- Academic disciplinary action
- Notation on academic record

**Support Resources:**
Instead of AI tools, please use:
- Office hours and instructor consultation
- Tutoring services
- Writing center support
- Library research assistance
- Peer study groups (as permitted)

**Questions:** Contact the instructor before using any digital tool if you're unsure whether it contains AI assistance.
`
    }

    return templates[mode]
  }

  // Policy pack generation
  async generatePolicyPack(
    assessmentId: string,
    institutionType: 'K12' | 'HigherEd',
    institutionName: string,
    state: string,
    selectedPolicies: string[]
  ): Promise<PolicyPack> {
    const policyPack: PolicyPack = {
      id: `pack-${Date.now()}`,
      assessmentId,
      institutionType,
      institutionName,
      state,
      selectedPolicies,
      customizations: {
        institutionName,
        state,
        effectiveDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toLocaleDateString()
      },
      generatedAt: new Date().toISOString(),
      deliveryStatus: 'Generated',
      nextRedlineUpdate: this.getNextRedlineDate(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Store in database
    await this.supabase
      .from('policy_packs')
      .insert(policyPack)

    return policyPack
  }

  private getNextRedlineDate(): string {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(1) // First of next month
    return nextMonth.toISOString().split('T')[0]
  }

  // Get all available templates
  getAvailableTemplates(institutionType?: 'K12' | 'HigherEd'): PolicyTemplate[] {
    if (!institutionType) {
      return PolicyPackLibrary.POLICY_TEMPLATES
    }

    return PolicyPackLibrary.POLICY_TEMPLATES.filter(
      template => template.institutionType === institutionType || template.institutionType === 'Both'
    )
  }

  // Get template by ID
  getTemplate(templateId: string): PolicyTemplate | undefined {
    return PolicyPackLibrary.POLICY_TEMPLATES.find(template => template.id === templateId)
  }
}
