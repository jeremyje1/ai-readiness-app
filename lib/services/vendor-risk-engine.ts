/**
 * Vendor Risk Engine Service
 * Evaluates vendor assessments for FERPA/COPPA/PPRA compliance and generates risk scores
 * @version 1.0.0
 */

import {
    ComplianceFlag,
    Mitigation,
    RiskEngineResult,
    RiskFlag,
    RiskLevel,
    VendorAssessment
} from '@/lib/types/vendor'

export class VendorRiskEngine {
    private static readonly RISK_THRESHOLDS = {
        low: 25,
        medium: 50,
        high: 75,
        critical: 100
    }

    private static readonly COMPLIANCE_RULES = {
        FERPA: {
            name: 'Family Educational Rights and Privacy Act',
            triggers: [
                'handles_student_data',
                'stores_education_records',
                'directory_information_access',
                'no_parental_consent'
            ],
            weight: 20
        },
        COPPA: {
            name: 'Children\'s Online Privacy Protection Act',
            triggers: [
                'under_13_users',
                'no_age_gate',
                'no_parental_consent',
                'collects_personal_info_children'
            ],
            weight: 25
        },
        PPRA: {
            name: 'Protection of Pupil Rights Amendment',
            triggers: [
                'psychological_evaluation',
                'political_affiliations',
                'mental_health_assessment',
                'sex_behavior_attitudes',
                'no_opt_out_mechanism'
            ],
            weight: 15
        },
        GDPR: {
            name: 'General Data Protection Regulation',
            triggers: [
                'eu_data_subjects',
                'no_privacy_policy',
                'no_data_processing_agreement',
                'inadequate_consent'
            ],
            weight: 18
        }
    }

    /**
     * Evaluate a vendor assessment for compliance risks
     */
    static async evaluateVendor(assessment: VendorAssessment): Promise<RiskEngineResult> {
        const riskFlags: RiskFlag[] = []
        let totalScore = 0

        // FERPA Risk Assessment
        const ferpaRisk = this.assessFERPARisk(assessment)
        if (ferpaRisk.triggered) {
            riskFlags.push(ferpaRisk)
            totalScore += this.COMPLIANCE_RULES.FERPA.weight
        }

        // COPPA Risk Assessment
        const coppaRisk = this.assessCOPPARisk(assessment)
        if (coppaRisk.triggered) {
            riskFlags.push(coppaRisk)
            totalScore += this.COMPLIANCE_RULES.COPPA.weight
        }

        // PPRA Risk Assessment
        const ppraRisk = this.assessPPRARisk(assessment)
        if (ppraRisk.triggered) {
            riskFlags.push(ppraRisk)
            totalScore += this.COMPLIANCE_RULES.PPRA.weight
        }

        // GDPR Risk Assessment
        const gdprRisk = this.assessGDPRRisk(assessment)
        if (gdprRisk.triggered) {
            riskFlags.push(gdprRisk)
            totalScore += this.COMPLIANCE_RULES.GDPR.weight
        }

        // General Data Security Risks
        const securityRisks = this.assessSecurityRisks(assessment)
        riskFlags.push(...securityRisks.filter(r => r.triggered))
        totalScore += securityRisks.reduce((sum, risk) => sum + (risk.triggered ? 10 : 0), 0)

        // AI-Specific Risks
        const aiRisks = this.assessAIRisks(assessment)
        riskFlags.push(...aiRisks.filter(r => r.triggered))
        totalScore += aiRisks.reduce((sum, risk) => sum + (risk.triggered ? 8 : 0), 0)

        // Determine risk level
        const riskLevel = this.calculateRiskLevel(totalScore)

        // Generate recommendations
        const recommendations = this.generateRecommendations(riskFlags, assessment)

        // Generate required mitigations
        const requiredMitigations = this.generateMitigations(riskFlags)

        // Determine if auto-approval is possible
        const autoApproval = riskLevel === 'low' && riskFlags.length === 0
        const escalationRequired = riskLevel === 'critical' || riskFlags.some(f => f.type === 'COPPA' || f.type === 'FERPA')

        return {
            totalScore,
            riskLevel,
            flags: riskFlags,
            recommendations,
            requiredMitigations,
            autoApproval,
            escalationRequired
        }
    }

    /**
     * Assess FERPA compliance risks
     */
    private static assessFERPARisk(assessment: VendorAssessment): RiskFlag {
        const risks: string[] = []
        let severity: RiskLevel = 'low'

        if (assessment.studentData.handlesStudentData) {
            if (!assessment.studentData.educationalPurpose) {
                risks.push('Non-educational use of student data')
                severity = 'high'
            }

            if (assessment.dataHandling.storesPII && !assessment.compliance.dataProcessingAgreement) {
                risks.push('Missing data processing agreement for student PII')
                severity = 'high'
            }

            if (assessment.studentData.directoryInformation && !assessment.studentData.parentalConsent) {
                risks.push('Directory information access without proper consent')
                severity = 'medium'
            }

            if (assessment.dataHandling.dataLocation.includes('unknown') ||
                !assessment.dataHandling.dataLocation.includes('us')) {
                risks.push('Student data stored outside US without proper safeguards')
                severity = 'critical'
            }
        }

        return {
            type: 'FERPA',
            severity,
            description: risks.join('; ') || 'No FERPA risks identified',
            regulation: 'Family Educational Rights and Privacy Act (FERPA)',
            impact: 'Potential violation of student privacy rights and federal regulations',
            triggered: risks.length > 0,
            mitigationRequired: severity !== 'low'
        }
    }

    /**
     * Assess COPPA compliance risks
     */
    private static assessCOPPARisk(assessment: VendorAssessment): RiskFlag {
        const risks: string[] = []
        let severity: RiskLevel = 'low'

        if (assessment.studentData.minimumAge < 13) {
            if (!assessment.studentData.ageGate) {
                risks.push('No age verification for users under 13')
                severity = 'critical'
            }

            if (!assessment.studentData.parentalConsent) {
                risks.push('No parental consent mechanism for under-13 users')
                severity = 'critical'
            }

            if (assessment.dataHandling.storesPII) {
                risks.push('Collecting PII from children without proper safeguards')
                severity = 'high'
            }

            if (assessment.aiCapabilities.trainsOnUserData) {
                risks.push('Training AI models on data from children')
                severity = 'critical'
            }
        }

        return {
            type: 'COPPA',
            severity,
            description: risks.join('; ') || 'No COPPA risks identified',
            regulation: 'Children\'s Online Privacy Protection Act (COPPA)',
            impact: 'Severe penalties for non-compliance with children\'s privacy laws',
            triggered: risks.length > 0,
            mitigationRequired: severity === 'high' || severity === 'critical'
        }
    }

    /**
     * Assess PPRA compliance risks
     */
    private static assessPPRARisk(assessment: VendorAssessment): RiskFlag {
        const risks: string[] = []
        let severity: RiskLevel = 'low'

        if (assessment.studentData.handlesStudentData) {
            // Check for sensitive survey categories
            const sensitivePiiTypes = assessment.dataHandling.piiTypes.filter(type =>
                type.toLowerCase().includes('psychological') ||
                type.toLowerCase().includes('political') ||
                type.toLowerCase().includes('mental health') ||
                type.toLowerCase().includes('sexual') ||
                type.toLowerCase().includes('behavior')
            )

            if (sensitivePiiTypes.length > 0) {
                risks.push(`Collects sensitive information: ${sensitivePiiTypes.join(', ')}`)
                severity = 'high'

                if (!assessment.studentData.parentalConsent) {
                    risks.push('No opt-out mechanism for sensitive data collection')
                    severity = 'critical'
                }
            }

            // AI bias assessment could trigger PPRA
            if (assessment.aiCapabilities.isAIService && !assessment.aiCapabilities.biasAuditing) {
                risks.push('AI system without bias auditing may create discriminatory profiles')
                severity = 'medium'
            }
        }

        return {
            type: 'PPRA',
            severity,
            description: risks.join('; ') || 'No PPRA risks identified',
            regulation: 'Protection of Pupil Rights Amendment (PPRA)',
            impact: 'Violation of student rights regarding sensitive information surveys',
            triggered: risks.length > 0,
            mitigationRequired: severity !== 'low'
        }
    }

    /**
     * Assess GDPR compliance risks
     */
    private static assessGDPRRisk(assessment: VendorAssessment): RiskFlag {
        const risks: string[] = []
        let severity: RiskLevel = 'low'

        if (assessment.dataHandling.dataLocation.includes('eu') ||
            assessment.dataHandling.dataLocation.includes('global')) {

            if (!assessment.compliance.privacyPolicy) {
                risks.push('No privacy policy for EU data subjects')
                severity = 'high'
            }

            if (!assessment.compliance.dataProcessingAgreement) {
                risks.push('Missing GDPR-compliant data processing agreement')
                severity = 'high'
            }

            if (assessment.dataHandling.storesPII && !assessment.dataHandling.encryptionAtRest) {
                risks.push('PII not encrypted at rest in EU jurisdiction')
                severity = 'medium'
            }

            if (assessment.compliance.subprocessors.length > 0 && !assessment.compliance.dataProcessingAgreement) {
                risks.push('Subprocessors without proper GDPR agreements')
                severity = 'medium'
            }
        }

        return {
            type: 'GDPR',
            severity,
            description: risks.join('; ') || 'No GDPR risks identified',
            regulation: 'General Data Protection Regulation (GDPR)',
            impact: 'Potential fines up to 4% of annual revenue for non-compliance',
            triggered: risks.length > 0,
            mitigationRequired: severity !== 'low'
        }
    }

    /**
     * Assess general security risks
     */
    private static assessSecurityRisks(assessment: VendorAssessment): RiskFlag[] {
        const flags: RiskFlag[] = []

        // Encryption risks
        if (assessment.dataHandling.storesPII) {
            if (!assessment.dataHandling.encryptionAtRest) {
                flags.push({
                    type: 'GDPR', // Could apply to multiple regulations
                    severity: 'medium',
                    description: 'PII stored without encryption at rest',
                    regulation: 'General security best practices',
                    impact: 'Increased risk of data breach and regulatory violations',
                    triggered: true,
                    mitigationRequired: true
                })
            }

            if (!assessment.dataHandling.encryptionInTransit) {
                flags.push({
                    type: 'GDPR',
                    severity: 'high',
                    description: 'PII transmitted without encryption',
                    regulation: 'General security best practices',
                    impact: 'High risk of data interception and privacy violations',
                    triggered: true,
                    mitigationRequired: true
                })
            }
        }

        // Audit and compliance gaps
        if (!assessment.compliance.auditReports) {
            flags.push({
                type: 'SOX' as ComplianceFlag,
                severity: 'medium',
                description: 'No third-party security audit reports available',
                regulation: 'Security compliance standards',
                impact: 'Unable to verify security controls and compliance',
                triggered: true,
                mitigationRequired: false
            })
        }

        return flags
    }

    /**
     * Assess AI-specific risks
     */
    private static assessAIRisks(assessment: VendorAssessment): RiskFlag[] {
        const flags: RiskFlag[] = []

        if (assessment.aiCapabilities.isAIService) {
            // Bias and fairness
            if (!assessment.aiCapabilities.biasAuditing) {
                flags.push({
                    type: 'PPRA',
                    severity: 'medium',
                    description: 'AI system lacks bias auditing and fairness testing',
                    regulation: 'Algorithmic accountability standards',
                    impact: 'Risk of discriminatory outcomes in educational contexts',
                    triggered: true,
                    mitigationRequired: true
                })
            }

            // Explainability
            if (!assessment.aiCapabilities.explainabilityFeatures) {
                flags.push({
                    type: 'FERPA',
                    severity: 'low',
                    description: 'AI decisions lack transparency and explainability',
                    regulation: 'Educational AI transparency requirements',
                    impact: 'Difficulty in understanding AI-driven educational decisions',
                    triggered: true,
                    mitigationRequired: false
                })
            }

            // Training data concerns
            if (assessment.aiCapabilities.trainsOnUserData && assessment.studentData.handlesStudentData) {
                flags.push({
                    type: 'COPPA',
                    severity: 'high',
                    description: 'AI model training uses student data',
                    regulation: 'Student privacy protection requirements',
                    impact: 'Potential privacy violations and consent issues',
                    triggered: true,
                    mitigationRequired: true
                })
            }
        }

        return flags
    }

    /**
     * Calculate overall risk level based on score
     */
    private static calculateRiskLevel(score: number): RiskLevel {
        if (score >= this.RISK_THRESHOLDS.critical) return 'critical'
        if (score >= this.RISK_THRESHOLDS.high) return 'high'
        if (score >= this.RISK_THRESHOLDS.medium) return 'medium'
        return 'low'
    }

    /**
     * Generate actionable recommendations
     */
    private static generateRecommendations(flags: RiskFlag[], assessment: VendorAssessment): string[] {
        const recommendations: string[] = []

        // FERPA recommendations
        if (flags.some(f => f.type === 'FERPA')) {
            recommendations.push('Implement FERPA-compliant data processing agreement')
            recommendations.push('Establish clear educational purpose documentation')
            recommendations.push('Ensure US-based data storage for student records')
        }

        // COPPA recommendations
        if (flags.some(f => f.type === 'COPPA')) {
            recommendations.push('Implement robust age verification system')
            recommendations.push('Establish parental consent mechanisms')
            recommendations.push('Create child-safe data handling procedures')
        }

        // PPRA recommendations
        if (flags.some(f => f.type === 'PPRA')) {
            recommendations.push('Implement opt-out mechanisms for sensitive surveys')
            recommendations.push('Conduct bias auditing for AI systems')
            recommendations.push('Establish clear data use limitations')
        }

        // General security recommendations
        if (!assessment.dataHandling.encryptionAtRest) {
            recommendations.push('Enable encryption at rest for all stored data')
        }

        if (!assessment.dataHandling.encryptionInTransit) {
            recommendations.push('Implement end-to-end encryption for data transmission')
        }

        if (assessment.aiCapabilities.isAIService) {
            recommendations.push('Conduct regular AI bias and fairness assessments')
            recommendations.push('Implement AI decision transparency features')
        }

        return recommendations
    }

    /**
     * Generate required mitigations for identified risks
     */
    private static generateMitigations(flags: RiskFlag[]): Mitigation[] {
        const mitigations: Mitigation[] = []

        flags.forEach(flag => {
            if (flag.mitigationRequired) {
                switch (flag.type) {
                    case 'FERPA':
                        mitigations.push({
                            id: `mit-ferpa-${Date.now()}`,
                            riskFlag: flag.type,
                            title: 'FERPA Compliance Agreement',
                            description: 'Execute comprehensive FERPA-compliant data processing agreement',
                            type: 'contractual',
                            status: 'pending'
                        })
                        break

                    case 'COPPA':
                        mitigations.push({
                            id: `mit-coppa-${Date.now()}`,
                            riskFlag: flag.type,
                            title: 'Age Verification Implementation',
                            description: 'Implement robust age verification and parental consent system',
                            type: 'technical',
                            status: 'pending'
                        })
                        break

                    case 'PPRA':
                        mitigations.push({
                            id: `mit-ppra-${Date.now()}`,
                            riskFlag: flag.type,
                            title: 'Sensitive Data Opt-Out',
                            description: 'Create opt-out mechanisms for sensitive information collection',
                            type: 'procedural',
                            status: 'pending'
                        })
                        break

                    case 'GDPR':
                        mitigations.push({
                            id: `mit-gdpr-${Date.now()}`,
                            riskFlag: flag.type,
                            title: 'GDPR Data Processing Agreement',
                            description: 'Establish GDPR-compliant data processing and transfer agreements',
                            type: 'contractual',
                            status: 'pending'
                        })
                        break
                }
            }
        })

        return mitigations
    }
}
