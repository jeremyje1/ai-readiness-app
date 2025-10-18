'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Map,
  MessageSquare,
  Shield,
  Users
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface PolicyTemplate {
  id: string
  category: 'governance' | 'teaching' | 'privacy' | 'state' | 'communications' | 'syllabus'
  title: string
  description: string
  institutionType: 'K12' | 'HigherEd' | 'Both'
  sourceAuthority: string
  sourceUrl: string
  sourceDocument: string
  lastSourceUpdate: string
  templateContent?: string // Optional for preview
  version: string
  lastRedlineUpdate: string
  complianceFrameworks: string[]
  riskLevel: 'Low' | 'Medium' | 'High'
  implementationComplexity: 'Simple' | 'Moderate' | 'Complex'
}

interface PolicyChange {
  id: string
  version: string
  changeDate: string
  changeType: 'Source Update' | 'Legal Requirement' | 'Best Practice' | 'User Feedback'
  sourceReference: string
  summary: string
  approvalStatus: 'Pending' | 'Approved' | 'Rejected'
  impactLevel: 'Minor' | 'Moderate' | 'Major'
}

interface PolicyPackLibraryProps {
  assessmentId: string
  institutionType: 'K12' | 'HigherEd'
  institutionName: string
  state: string
  demoMode?: boolean
}

const categoryIcons = {
  governance: Shield,
  teaching: BookOpen,
  privacy: Users,
  state: Map,
  communications: MessageSquare,
  syllabus: GraduationCap
}

const categoryColors = {
  governance: 'bg-red-100 text-red-800',
  teaching: 'bg-blue-100 text-blue-800',
  privacy: 'bg-purple-100 text-purple-800',
  state: 'bg-green-100 text-green-800',
  communications: 'bg-yellow-100 text-yellow-800',
  syllabus: 'bg-indigo-100 text-indigo-800'
}

const riskColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800'
}

const DEMO_TEMPLATES: PolicyTemplate[] = [
  {
    id: 'policy-ai-governance',
    category: 'governance',
    title: 'AI Governance Framework (Board Policy)',
    description: 'Defines board-level oversight, ethical guardrails, and transparency requirements for AI tools.',
    institutionType: 'Both',
    sourceAuthority: 'NIST AI RMF + State AI Guidance 2025',
    sourceUrl: 'https://example.com/nist-ai-governance',
    sourceDocument: 'NIST AI RMF Core Document',
    lastSourceUpdate: '2025-09-01',
    templateContent: undefined,
    version: '2.4',
    lastRedlineUpdate: '2025-09-12',
    complianceFrameworks: ['NIST AI RMF', 'State AI Governance Guidance', 'FERPA'],
    riskLevel: 'High',
    implementationComplexity: 'Moderate'
  },
  {
    id: 'policy-ai-classroom',
    category: 'teaching',
    title: 'AI Use in Classroom Instruction Guidelines',
    description: 'Provides teacher-facing guardrails for responsible AI adoption in classroom workflows.',
    institutionType: 'K12',
    sourceAuthority: 'US DOE Fact Sheet – AI in Schools',
    sourceUrl: 'https://example.com/usdoe-ai-instruction',
    sourceDocument: 'USDOE_AI_Instruction.pdf',
    lastSourceUpdate: '2025-08-25',
    templateContent: undefined,
    version: '1.8',
    lastRedlineUpdate: '2025-09-08',
    complianceFrameworks: ['US DOE AI Guidance', 'ISTE Standards'],
    riskLevel: 'Medium',
    implementationComplexity: 'Simple'
  },
  {
    id: 'policy-ai-privacy',
    category: 'privacy',
    title: 'AI Data Privacy Addendum',
    description: 'Extends existing privacy policy to cover AI vendors, retention, and parent notifications.',
    institutionType: 'Both',
    sourceAuthority: 'COPPA / FERPA',
    sourceUrl: 'https://example.com/coppa-ferpa-ai',
    sourceDocument: 'COPPA_FERPA_AI_Addendum.docx',
    lastSourceUpdate: '2025-07-30',
    templateContent: undefined,
    version: '3.1',
    lastRedlineUpdate: '2025-09-05',
    complianceFrameworks: ['FERPA', 'COPPA', 'State Student Data Privacy'],
    riskLevel: 'High',
    implementationComplexity: 'Complex'
  },
  {
    id: 'policy-state-alignment',
    category: 'state',
    title: 'State AI Readiness Compliance Checklist',
    description: 'Tracks state-mandated AI reporting, parental notices, and teacher credential updates.',
    institutionType: 'Both',
    sourceAuthority: 'California AB 3023 Draft',
    sourceUrl: 'https://example.com/ca-ab3023',
    sourceDocument: 'CA_AB3023_AI.docx',
    lastSourceUpdate: '2025-09-10',
    templateContent: undefined,
    version: '0.9 (Draft)',
    lastRedlineUpdate: '2025-09-15',
    complianceFrameworks: ['CA AB 3023', 'State AI Disclosure Requirements'],
    riskLevel: 'Medium',
    implementationComplexity: 'Moderate'
  },
  {
    id: 'policy-communications-kit',
    category: 'communications',
    title: 'AI Implementation Communications Kit',
    description: 'Includes parent letters, staff FAQs, and board briefing scripts tailored to AI rollouts.',
    institutionType: 'Both',
    sourceAuthority: 'NorthPath Communications Lab',
    sourceUrl: 'https://example.com/np-communications-kit',
    sourceDocument: 'AI_Communications_Toolkit.pdf',
    lastSourceUpdate: '2025-09-04',
    templateContent: undefined,
    version: '1.3',
    lastRedlineUpdate: '2025-09-11',
    complianceFrameworks: ['Public Engagement Best Practices'],
    riskLevel: 'Low',
    implementationComplexity: 'Simple'
  },
  {
    id: 'policy-syllabus-updates',
    category: 'syllabus',
    title: 'Higher Education Syllabus AI Disclosure Clause',
    description: 'Standard language for faculty syllabi describing permitted AI tool usage and citation expectations.',
    institutionType: 'HigherEd',
    sourceAuthority: 'AAC&U Ethical AI Guidelines',
    sourceUrl: 'https://example.com/aacu-ai-syllabus',
    sourceDocument: 'AACU_AI_Syllabus_Template.docx',
    lastSourceUpdate: '2025-08-18',
    templateContent: undefined,
    version: '2.0',
    lastRedlineUpdate: '2025-09-09',
    complianceFrameworks: ['AAC&U Ethical AI', 'Institutional Academic Integrity'],
    riskLevel: 'Medium',
    implementationComplexity: 'Simple'
  }
]

const DEMO_REDLINES: PolicyChange[] = [
  {
    id: 'redline-privacy-2025-09',
    version: '3.1',
    changeDate: '2025-09-10',
    changeType: 'Legal Requirement',
    sourceReference: 'COPPA Rulemaking Update (September 2025)',
    summary: 'Added parental opt-out workflow and AI vendor retention policy language.',
    approvalStatus: 'Pending',
    impactLevel: 'Major'
  },
  {
    id: 'redline-governance-2025-09',
    version: '2.4',
    changeDate: '2025-09-12',
    changeType: 'Best Practice',
    sourceReference: 'NIST RMF Community of Practice Bulletin',
    summary: 'Updated risk committee charter to include quarterly AI model inventory review.',
    approvalStatus: 'Pending',
    impactLevel: 'Moderate'
  },
  {
    id: 'redline-communications-2025-09',
    version: '1.3',
    changeDate: '2025-09-08',
    changeType: 'User Feedback',
    sourceReference: 'Pilot District Feedback Session',
    summary: 'Added Spanish-language family outreach templates and FAQ translations.',
    approvalStatus: 'Approved',
    impactLevel: 'Minor'
  }
]

export default function PolicyPackLibrary({
  assessmentId,
  institutionType,
  institutionName,
  state,
  demoMode = false
}: PolicyPackLibraryProps) {
  const [templates, setTemplates] = useState<PolicyTemplate[]>([])
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [redlines, setRedlines] = useState<PolicyChange[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Use real user profile data instead of props
  const { profile } = useUserProfile()

  // Override props with real user data from database (NO MOCK DATA)
  const actualInstitutionType = (profile?.institution_type === 'K12' || profile?.institution_type === 'District') ? 'K12' : 'HigherEd'
  const actualInstitutionName = profile?.institution_name || institutionName || '[Please complete your profile]'
  const actualState = profile?.state || state || '[State - Please complete your profile]'

  const loadTemplates = useCallback(async () => {
    if (demoMode) {
      setTemplates(DEMO_TEMPLATES)
      setLoading(false)
      return
    }
    try {
      const response = await fetch(`/api/policy-packs?action=getAvailableTemplates&institutionType=${actualInstitutionType}`)
      const data = await response.json()

      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      if (!demoMode) {
        setLoading(false)
      }
    }
  }, [actualInstitutionType, demoMode])

  const loadRedlines = useCallback(async () => {
    if (demoMode) {
      setRedlines(DEMO_REDLINES)
      return
    }
    try {
      const response = await fetch('/api/policy-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getMonthlyRedlines' })
      })
      const data = await response.json()

      if (data.success) {
        setRedlines(data.redlines)
      }
    } catch (error) {
      console.error('Error loading redlines:', error)
    }
  }, [demoMode])

  useEffect(() => {
    if (demoMode) {
      setTemplates(DEMO_TEMPLATES)
      setRedlines(DEMO_REDLINES)
      setLoading(false)
      return
    }

    loadTemplates()
    loadRedlines()
  }, [demoMode, loadTemplates, loadRedlines])

  const generatePolicyPack = async () => {
    if (selectedTemplates.length === 0) {
      alert('Please select at least one policy template')
      return
    }

    setGenerating(true)
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 800))
        alert('Demo Mode: Generated sample policy pack bundle. Download links unlocked in production accounts.')
      } else {
        const response = await fetch('/api/policy-packs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generatePolicyPack',
            assessmentId,
            institutionType: actualInstitutionType,
            institutionName: actualInstitutionName,
            state,
            selectedPolicies: selectedTemplates
          })
        })

        const data = await response.json()

        if (data.success) {
          alert('Policy pack generated successfully!')
          // In production, would trigger download or redirect to policy pack view
        } else {
          throw new Error(data.error)
        }
      }
    } catch (error) {
      console.error('Error generating policy pack:', error)
      alert('Error generating policy pack')
    } finally {
      setGenerating(false)
    }
  }

  const generateCommunicationKit = async () => {
    setGenerating(true)
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 600))
        alert('Demo Mode: Generated sample communications kit preview. Full exports are available for customers.')
      } else {
        const response = await fetch('/api/policy-packs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateCommunicationKit',
            institutionType,
            institutionName
          })
        })

        const data = await response.json()

        if (data.success) {
          // In production, would display or download the communication kit
          console.log('Communication Kit:', data.communicationKit)
          alert('Communication kit generated successfully!')
        }
      }
    } catch (error) {
      console.error('Error generating communication kit:', error)
      alert('Error generating communication kit')
    } finally {
      setGenerating(false)
    }
  }

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory)

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'governance', name: 'Core Governance', count: templates.filter(t => t.category === 'governance').length },
    { id: 'teaching', name: 'Teaching & Learning', count: templates.filter(t => t.category === 'teaching').length },
    { id: 'privacy', name: 'Privacy & Data', count: templates.filter(t => t.category === 'privacy').length },
    { id: 'state', name: 'State Alignment', count: templates.filter(t => t.category === 'state').length },
    { id: 'communications', name: 'Communications', count: templates.filter(t => t.category === 'communications').length },
    { id: 'syllabus', name: 'Syllabus/Handbook', count: templates.filter(t => t.category === 'syllabus').length }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Policy Pack Library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Policy Pack Library</h1>
        <p className="text-blue-100">
          Maintained templates with monthly redlines • Anchored to external authorities •
          Ready for {actualInstitutionType} institutions in {actualState}
        </p>
      </div>

      {demoMode && (
        <Card className="border border-blue-200 bg-blue-50 text-blue-900">
          <CardContent className="p-4">
            <p className="font-semibold">Demo Preview</p>
            <p className="text-sm mt-1">
              Explore curated policy templates, monthly redlines, and the messaging toolkit. Downloads are simulated here but live accounts export DOCX, PDF, and PPTX bundles instantly.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Monthly Redlines Alert */}
      {redlines.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Calendar className="h-5 w-5" />
              Monthly Redline Updates Available
            </CardTitle>
            <CardDescription>
              {redlines.length} policy updates available based on source changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {redlines.slice(0, 3).map((change) => (
                <div key={change.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{change.sourceReference}</span>
                    <p className="text-sm text-gray-600">{change.summary}</p>
                  </div>
                  <Badge className={change.impactLevel === 'Major' ? 'bg-red-100 text-red-800' :
                    change.impactLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}>
                    {change.impactLevel}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-3">
              Review All Updates ({redlines.length})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            onClick={() => setActiveCategory(category.id)}
            className="text-sm"
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={generatePolicyPack}
          disabled={generating || selectedTemplates.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Policy Pack ({selectedTemplates.length} selected)
        </Button>

        <Button
          onClick={generateCommunicationKit}
          disabled={generating}
          variant="outline"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Generate Communication Kit
        </Button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const CategoryIcon = categoryIcons[template.category]
          const isSelected = selectedTemplates.includes(template.id)

          return (
            <Card key={template.id} className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
              }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTemplates([...selectedTemplates, template.id])
                        } else {
                          setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                        }
                      }}
                    />
                    <CategoryIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <Badge className={riskColors[template.riskLevel]}>
                    {template.riskLevel} Risk
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Source Authority */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Source Authority:</span>
                  <a
                    href={template.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {template.sourceAuthority}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Version and Updates */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Version:</span>
                  <span className="text-sm">{template.version}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated:</span>
                  <span className="text-sm">{new Date(template.lastRedlineUpdate).toLocaleDateString()}</span>
                </div>

                {/* Compliance Frameworks */}
                <div>
                  <span className="text-sm font-medium mb-1 block">Compliance:</span>
                  <div className="flex flex-wrap gap-1">
                    {template.complianceFrameworks.map((framework) => (
                      <Badge key={framework} variant="secondary" className="text-xs">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Category Badge */}
                <Badge className={categoryColors[template.category]}>
                  {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                </Badge>

                {/* Preview Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Preview Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{template.title}</DialogTitle>
                      <DialogDescription>
                        {template.description} • Source: {template.sourceAuthority}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Template Preview:</h4>
                        <div className="text-sm whitespace-pre-wrap font-mono bg-white p-3 rounded border max-h-96 overflow-y-auto">
                          {template.templateContent?.substring(0, 1000)}...
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                        <Button variant="outline" size="sm">
                          Customize
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Value Proposition */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Monthly Value Delivery</CardTitle>
          <CardDescription>
            Continuous policy maintenance and updates anchored to authoritative sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">Source-Anchored</h4>
                <p className="text-sm text-gray-600">Every template linked to authoritative guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">Monthly Updates</h4>
                <p className="text-sm text-gray-600">Automatic redlines when sources change</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Compliance Ready</h4>
                <p className="text-sm text-gray-600">Board-approved policy language</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
