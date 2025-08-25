import { NextRequest, NextResponse } from 'next/server'
import { PolicyPackLibrary } from '@/lib/policy-pack-library'

// Policy Pack API - Generate maintained templates with monthly redlines
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      action, 
      assessmentId, 
      institutionType, 
      institutionName, 
      state, 
      selectedPolicies,
      templateId,
      mode,
      subject
    } = body

    const policyLibrary = new PolicyPackLibrary()

    switch (action) {
      case 'generatePolicyPack':
        if (!assessmentId || !institutionType || !institutionName || !state || !selectedPolicies) {
          return NextResponse.json(
            { error: 'Missing required fields for policy pack generation' },
            { status: 400 }
          )
        }

        const policyPack = await policyLibrary.generatePolicyPack(
          assessmentId,
          institutionType,
          institutionName,
          state,
          selectedPolicies
        )

        return NextResponse.json({
          success: true,
          policyPack,
          message: 'Policy pack generated successfully'
        })

      case 'getAvailableTemplates':
        const templates = policyLibrary.getAvailableTemplates(institutionType)
        return NextResponse.json({
          success: true,
          templates,
          count: templates.length
        })

      case 'getTemplate':
        if (!templateId) {
          return NextResponse.json(
            { error: 'Template ID required' },
            { status: 400 }
          )
        }

        const template = policyLibrary.getTemplate(templateId)
        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          template
        })

      case 'generateCommunicationKit':
        if (!institutionType || !institutionName) {
          return NextResponse.json(
            { error: 'Institution type and name required' },
            { status: 400 }
          )
        }

        const communicationKit = await policyLibrary.generateCommunicationKit(
          institutionType,
          institutionName
        )

        return NextResponse.json({
          success: true,
          communicationKit,
          message: 'Communication kit generated successfully'
        })

      case 'generateSyllabusLanguage':
        if (!mode || !subject) {
          return NextResponse.json(
            { error: 'Mode and subject required' },
            { status: 400 }
          )
        }

        const syllabusLanguage = policyLibrary.generateSyllabusLanguage(
          mode as 'Allowed' | 'Limited' | 'Prohibited',
          subject
        )

        return NextResponse.json({
          success: true,
          syllabusLanguage,
          message: 'Syllabus language generated successfully'
        })

      case 'generateStateAddenda':
        if (!state || !institutionType) {
          return NextResponse.json(
            { error: 'State and institution type required' },
            { status: 400 }
          )
        }

        const stateAddenda = await policyLibrary.generateStateAddenda(state, institutionType)

        return NextResponse.json({
          success: true,
          stateAddenda,
          message: 'State addenda generated successfully'
        })

      case 'getMonthlyRedlines':
        const redlines = await policyLibrary.generateMonthlyRedlines()

        return NextResponse.json({
          success: true,
          redlines,
          count: redlines.length,
          message: 'Monthly redlines generated successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Policy Pack API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get policy pack information
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const institutionType = searchParams.get('institutionType') as 'K12' | 'HigherEd' | undefined

    const policyLibrary = new PolicyPackLibrary()

    switch (action) {
      case 'getAvailableTemplates':
        const templates = policyLibrary.getAvailableTemplates(institutionType)
        
        // Group templates by category for easier navigation
        const templatesByCategory = templates.reduce((acc, template) => {
          if (!acc[template.category]) {
            acc[template.category] = []
          }
          acc[template.category].push(template)
          return acc
        }, {} as Record<string, typeof templates>)

        return NextResponse.json({
          success: true,
          templates,
          templatesByCategory,
          categories: Object.keys(templatesByCategory),
          totalCount: templates.length
        })

      case 'getPolicyCategories':
        const categories = [
          {
            id: 'governance',
            name: 'Core Governance',
            description: 'AI governance frameworks and vendor management',
            templates: ['ai-governance-charter', 'ai-vendor-tools-policy']
          },
          {
            id: 'teaching',
            name: 'Teaching & Learning',
            description: 'Educational AI guidelines and classroom policies',
            templates: ['teaching-learning-ai-guidelines']
          },
          {
            id: 'privacy',
            name: 'Privacy & Student Data',
            description: 'FERPA, COPPA, and data protection requirements',
            templates: ['ferpa-genai-considerations', 'coppa-k12-language']
          },
          {
            id: 'state',
            name: 'State Alignment',
            description: 'State-specific AI guidance and compliance',
            templates: []
          },
          {
            id: 'communications',
            name: 'Communications Kits',
            description: 'Parent letters, student guides, and FAQs',
            templates: []
          },
          {
            id: 'syllabus',
            name: 'Syllabus/Handbook Generators',
            description: 'Academic policy language and integrity guidelines',
            templates: []
          }
        ]

        return NextResponse.json({
          success: true,
          categories
        })

      case 'getRedlineSchedule':
        // Return schedule for upcoming monthly updates
        const schedule = [
          {
            date: '2024-09-01',
            sources: ['NIST AI RMF', 'U.S. Department of Education'],
            expectedChanges: 'Generative AI guidance updates',
            impactLevel: 'Moderate'
          },
          {
            date: '2024-10-01',
            sources: ['State guidance updates', 'FTC COPPA'],
            expectedChanges: 'State compliance requirements',
            impactLevel: 'Low'
          },
          {
            date: '2024-11-01',
            sources: ['NIST Publications', 'Legal precedents'],
            expectedChanges: 'Risk assessment framework updates',
            impactLevel: 'High'
          }
        ]

        return NextResponse.json({
          success: true,
          schedule,
          nextUpdate: schedule[0]?.date
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Policy Pack GET Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
