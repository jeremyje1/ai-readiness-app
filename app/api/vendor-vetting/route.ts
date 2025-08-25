import { NextRequest, NextResponse } from 'next/server'
import { VendorVettingSystem } from '@/lib/vendor-vetting-system'

// Vendor Vetting & Tool Approval API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, ...data } = body

    const vettingSystem = new VendorVettingSystem()

    switch (action) {
      case 'submitIntakeForm':
        const {
          submittedBy,
          toolName,
          vendorName,
          toolDescription,
          requestedUseCase,
          requestingDepartment,
          targetUsers,
          minAge,
          maxAge,
          gradeLevel,
          subjectAreas,
          websiteUrl,
          hostingLocation,
          dataCenter,
          modelProvider,
          apiIntegrations,
          dataCollected,
          dataSharing,
          dataRetention,
          trainingOnUserData,
          optOutAvailable,
          ageGateImplemented,
          parentalConsentRequired,
          pricingModel,
          estimatedCost,
          contractLength,
          trialAvailable,
          assignedReviewer
        } = data

        if (!toolName || !vendorName || !submittedBy || !requestingDepartment) {
          return NextResponse.json(
            { error: 'Missing required fields for intake form' },
            { status: 400 }
          )
        }

        const intakeForm = await vettingSystem.submitIntakeForm({
          submittedBy,
          submissionDate: new Date().toISOString(),
          toolName,
          vendorName,
          toolDescription: toolDescription || '',
          requestedUseCase: requestedUseCase || '',
          requestingDepartment,
          targetUsers: targetUsers || [],
          minAge: minAge || 13,
          maxAge: maxAge || 18,
          gradeLevel: gradeLevel || [],
          subjectAreas: subjectAreas || [],
          websiteUrl: websiteUrl || '',
          hostingLocation: hostingLocation || 'Unknown',
          dataCenter: dataCenter || 'Unknown',
          modelProvider: modelProvider || 'Unknown',
          apiIntegrations: apiIntegrations || [],
          dataCollected: dataCollected || [],
          dataSharing: dataSharing || false,
          dataRetention: dataRetention || 'Unknown',
          trainingOnUserData: trainingOnUserData || false,
          optOutAvailable: optOutAvailable || false,
          ageGateImplemented: ageGateImplemented || false,
          parentalConsentRequired: parentalConsentRequired || false,
          pricingModel: pricingModel || 'Unknown',
          estimatedCost: estimatedCost || 0,
          contractLength: contractLength || 'Unknown',
          trialAvailable: trialAvailable || false,
          assignedReviewer: assignedReviewer || 'Unassigned'
        })

        return NextResponse.json({
          success: true,
          intakeForm,
          message: 'Intake form submitted successfully. Risk assessment has been initiated.'
        })

      case 'searchApprovedTools':
        const { role, subject, gradeLevel: grade, category } = data
        
        const approvedTools = await vettingSystem.searchApprovedTools({
          role,
          subject,
          gradeLevel: grade,
          category
        })

        return NextResponse.json({
          success: true,
          tools: approvedTools,
          count: approvedTools.length
        })

      case 'getVendorProfile':
        const { vendorName: vendor } = data
        
        if (!vendor) {
          return NextResponse.json(
            { error: 'Vendor name required' },
            { status: 400 }
          )
        }

        const vendorProfile = await vettingSystem.getVendorProfile(vendor)

        return NextResponse.json({
          success: true,
          vendorProfile
        })

      case 'generateComplianceReport':
        const { month } = data
        
        if (!month) {
          return NextResponse.json(
            { error: 'Month required for compliance report' },
            { status: 400 }
          )
        }

        const report = await vettingSystem.generateMonthlyComplianceReport(month)

        return NextResponse.json({
          success: true,
          report,
          month
        })

      case 'getIntakeFormStatus':
        const { intakeFormId } = data
        
        if (!intakeFormId) {
          return NextResponse.json(
            { error: 'Intake form ID required' },
            { status: 400 }
          )
        }

        // In production, would query database for actual status
        return NextResponse.json({
          success: true,
          status: {
            intakeFormId,
            currentStatus: 'Under Review',
            reviewProgress: 'Risk assessment completed, generating decision brief',
            estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            nextSteps: [
              'Complete automated risk assessment',
              'Generate decision brief',
              'Schedule board review',
              'Notify submitter of decision'
            ]
          }
        })

      case 'generateDecisionBrief':
        const { intakeFormId: briefIntakeId } = data
        
        if (!briefIntakeId) {
          return NextResponse.json(
            { error: 'Intake form ID required for decision brief' },
            { status: 400 }
          )
        }

        // In production, would generate actual brief from database
        const mockBrief = {
          id: `brief-${Date.now()}`,
          intakeFormId: briefIntakeId,
          toolName: 'Example AI Tool',
          vendorName: 'Example Vendor',
          recommendedDecision: 'Conditional Approval',
          executiveSummary: 'Tool meets most requirements with minor privacy concerns requiring mitigation.',
          primaryRisks: ['Data retention policy unclear', 'COPPA compliance needs verification'],
          mitigationStrategies: ['Require data retention limits', 'Implement parental consent workflow'],
          budgetImpact: 'Moderate budget impact - requires administrative approval',
          boardSlideContent: 'Ready-to-present board slide content with key decision points.',
          votingRecommendation: 'Motion to approve with required mitigations.',
          nextSteps: ['Implement mitigations', 'Schedule training', 'Begin pilot program']
        }

        return NextResponse.json({
          success: true,
          decisionBrief: mockBrief,
          message: 'Decision brief generated successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Vendor Vetting API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoints for browsing and searching
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    const vettingSystem = new VendorVettingSystem()

    switch (action) {
      case 'getToolCategories':
        const categories = [
          {
            id: 'content-creation',
            name: 'Content Creation',
            description: 'Writing, presentation, and media creation tools',
            riskLevel: 'Medium',
            commonTools: ['ChatGPT', 'Jasper', 'Canva AI', 'Notion AI']
          },
          {
            id: 'research-analysis',
            name: 'Research & Analysis',
            description: 'Information gathering and analysis tools',
            riskLevel: 'Low',
            commonTools: ['Perplexity', 'Elicit', 'Research Rabbit', 'Consensus']
          },
          {
            id: 'assessment-grading',
            name: 'Assessment & Grading',
            description: 'Student evaluation and feedback tools',
            riskLevel: 'High',
            commonTools: ['Gradescope AI', 'Turnitin', 'Speedgrader AI', 'Feedback AI']
          },
          {
            id: 'tutoring-support',
            name: 'Tutoring & Support',
            description: 'Student assistance and tutoring platforms',
            riskLevel: 'High',
            commonTools: ['Khan Academy AI', 'Socratic', 'Photomath', 'Duolingo AI']
          },
          {
            id: 'admin-operations',
            name: 'Administrative Operations',
            description: 'School administration and operations tools',
            riskLevel: 'Medium',
            commonTools: ['School AI Assistant', 'Schedule AI', 'Communication AI']
          },
          {
            id: 'accessibility',
            name: 'Accessibility Tools',
            description: 'Tools supporting students with disabilities',
            riskLevel: 'Medium',
            commonTools: ['Read&Write', 'Immersive Reader', 'Voice AI', 'Visual AI']
          }
        ]

        return NextResponse.json({
          success: true,
          categories
        })

      case 'getRiskFramework':
        const framework = {
          privacyRisks: [
            'Personal data collection beyond educational purpose',
            'Data sharing with third parties without consent',
            'Unclear data retention policies',
            'Student data used for AI training',
            'Lack of parental control mechanisms'
          ],
          securityRisks: [
            'Hosting in high-risk jurisdictions',
            'Inadequate encryption standards',
            'Poor access control mechanisms',
            'History of security breaches',
            'Unclear incident response procedures'
          ],
          complianceRisks: [
            'COPPA violations for under-13 users',
            'FERPA educational records mishandling',
            'PPRA protected information collection',
            'State privacy law non-compliance',
            'Accessibility standard violations'
          ],
          pedagogicalRisks: [
            'Age-inappropriate content or features',
            'Undermining of critical thinking skills',
            'Academic integrity concerns',
            'Bias in AI-generated content',
            'Over-reliance on AI assistance'
          ]
        }

        return NextResponse.json({
          success: true,
          framework
        })

      case 'getComplianceChecklist':
        const checklist = {
          coppa: [
            'Tool does not collect personal information from children under 13',
            'If collection is necessary, verifiable parental consent is obtained',
            'Parents can review and delete their child\'s information',
            'Parents can opt-out of further data collection',
            'Child data is not used for AI model training'
          ],
          ferpa: [
            'Vendor qualifies as school official under FERPA',
            'Data processing agreement includes FERPA compliance clauses',
            'Educational records are not disclosed to unauthorized parties',
            'Parents retain rights to access and correct records',
            'Data is used only for legitimate educational interests'
          ],
          ppra: [
            'No surveys collect information about protected topics without consent',
            'Parents are notified of any surveys or assessments',
            'Parents can opt their child out of surveys',
            'Survey content is age-appropriate and educationally relevant',
            'No psychological or psychiatric evaluation without consent'
          ],
          general: [
            'Privacy policy is clear and accessible',
            'Data minimization principles are followed',
            'Security measures are appropriate for data sensitivity',
            'Data breach notification procedures are in place',
            'User rights and remedies are clearly explained'
          ]
        }

        return NextResponse.json({
          success: true,
          checklist
        })

      case 'getApprovalWorkflow':
        const workflow = {
          steps: [
            {
              step: 1,
              name: 'Intake Form Submission',
              description: 'Requester completes comprehensive tool evaluation form',
              timeframe: '1 day',
              responsible: 'Department/Teacher'
            },
            {
              step: 2,
              name: 'Automated Risk Assessment',
              description: 'System analyzes tool against COPPA, FERPA, PPRA requirements',
              timeframe: 'Immediate',
              responsible: 'AI System'
            },
            {
              step: 3,
              name: 'Compliance Review',
              description: 'Privacy officer reviews automated assessment and flags',
              timeframe: '2-3 days',
              responsible: 'Privacy Officer'
            },
            {
              step: 4,
              name: 'Decision Brief Generation',
              description: 'System generates board-ready recommendation package',
              timeframe: '1 day',
              responsible: 'AI System'
            },
            {
              step: 5,
              name: 'Leadership Review',
              description: 'Administrative team reviews recommendation and brief',
              timeframe: '3-5 days',
              responsible: 'Leadership Team'
            },
            {
              step: 6,
              name: 'Board Decision',
              description: 'Board votes on tool approval based on recommendation',
              timeframe: 'Next board meeting',
              responsible: 'School Board'
            },
            {
              step: 7,
              name: 'Implementation Planning',
              description: 'If approved, create implementation and training plan',
              timeframe: '1-2 weeks',
              responsible: 'IT/Training Team'
            }
          ],
          averageTimeframe: '2-4 weeks',
          expeditedProcess: 'Available for low-risk tools (score < 30)'
        }

        return NextResponse.json({
          success: true,
          workflow
        })

      case 'getVendorDatabase':
        // In production, this would query actual vendor database
        const vendors = [
          {
            name: 'OpenAI',
            riskLevel: 'Medium',
            educationFocus: true,
            complianceStatus: 'Partial',
            popularTools: ['ChatGPT', 'GPT-4'],
            lastReviewed: '2024-08-01'
          },
          {
            name: 'Google',
            riskLevel: 'Low',
            educationFocus: true,
            complianceStatus: 'Compliant',
            popularTools: ['Bard', 'Google Classroom AI'],
            lastReviewed: '2024-08-15'
          },
          {
            name: 'Microsoft',
            riskLevel: 'Low',
            educationFocus: true,
            complianceStatus: 'Compliant',
            popularTools: ['Copilot', 'Teams AI'],
            lastReviewed: '2024-08-10'
          }
        ]

        return NextResponse.json({
          success: true,
          vendors
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Vendor Vetting GET Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
