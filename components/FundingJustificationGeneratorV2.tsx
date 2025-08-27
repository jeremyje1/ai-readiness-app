'use client'

import { FundingTutorialTrigger } from '@/components/TutorialTrigger'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUserContext } from '@/components/UserProvider'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  FileText,
  GraduationCap,
  Target,
  Upload,
  Users
} from 'lucide-react'
import { useRef, useState } from 'react'

interface FundingOpportunity {
  id: string
  program: string
  agency: string
  amount: string
  deadline: string
  eligibleUses: string[]
  aiCategories: string[]
  matchScore: number
  estimatedAward: number
  requirements: string[]
}

interface SchoolInformation {
  schoolName: string
  districtName?: string
  schoolType: 'elementary' | 'middle' | 'high' | 'k12' | 'college' | 'university'
  studentCount: number
  teacherCount: number
  administratorCount: number
  currentTechBudget: number
  aiExperience: 'none' | 'basic' | 'intermediate' | 'advanced'
  primaryChallenges: string[]
  specificNeeds: string
}

interface GrantRequirements {
  file?: File
  keyRequirements: string
  complianceAreas: string[]
  reportingRequirements: string
  evaluationCriteria: string
}

const STEP_TITLES = [
  'Select Funding Opportunity',
  'School/Institution Information', 
  'Grant Requirements & Context',
  'AI Implementation Needs',
  'Generate & Review Narrative'
]

export default function FundingJustificationGeneratorV2() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOpportunity, setSelectedOpportunity] = useState<FundingOpportunity | null>(null)
  const [schoolInfo, setSchoolInfo] = useState<SchoolInformation>({
    schoolName: '',
    districtName: '',
    schoolType: 'k12',
    studentCount: 0,
    teacherCount: 0,
    administratorCount: 0,
    currentTechBudget: 0,
    aiExperience: 'none',
    primaryChallenges: [],
    specificNeeds: ''
  })
  const [grantRequirements, setGrantRequirements] = useState<GrantRequirements>({
    keyRequirements: '',
    complianceAreas: [],
    reportingRequirements: '',
    evaluationCriteria: ''
  })
  const [implementationNeeds, setImplementationNeeds] = useState<string[]>([])
  const [generatedNarrative, setGeneratedNarrative] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { user, institution } = useUserContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pre-populate with user's institution data if available
  useState(() => {
    if (institution) {
      setSchoolInfo(prev => ({
        ...prev,
        schoolName: institution.name || '',
        studentCount: institution.headcount || 0,
        schoolType: institution.org_type === 'K12' ? 'k12' : 'university'
      }))
    }
  })

  const fundingOpportunities: FundingOpportunity[] = [
    {
      id: 'title-iv',
      program: 'Title IV - Student Support & Academic Enrichment',
      agency: 'Department of Education',
      amount: '$50,000 - $200,000',
      deadline: '2025-10-15',
      eligibleUses: [
        'Technology integration',
        'Professional development',
        'Student support services',
        'Safe and healthy schools'
      ],
      aiCategories: [
        'AI literacy training for educators',
        'Educational technology platforms',
        'Student assessment tools',
        'Digital citizenship programs'
      ],
      matchScore: 92,
      estimatedAward: 125000,
      requirements: [
        'Demonstrate educational benefit',
        'Include professional development component',
        'Address student equity',
        'Provide sustainability plan'
      ]
    },
    {
      id: 'esser',
      program: 'ESSER Remaining Allocation',
      agency: 'Department of Education',
      amount: '$75,000 - $300,000',
      deadline: '2025-09-30',
      eligibleUses: [
        'Learning recovery',
        'Technology infrastructure',
        'Staff development',
        'Student mental health'
      ],
      aiCategories: [
        'Personalized learning platforms',
        'Assessment and intervention tools',
        'Teacher coaching systems',
        'Student support technologies'
      ],
      matchScore: 88,
      estimatedAward: 180000,
      requirements: [
        'Address learning loss',
        'Support disadvantaged students',
        'Include measurement plan',
        'Demonstrate evidence-based practices'
      ]
    },
    {
      id: 'state-ai',
      program: 'State AI Education Initiative Grant',
      agency: 'State Department of Education',
      amount: '$25,000 - $100,000',
      deadline: '2025-11-01',
      eligibleUses: [
        'AI curriculum development',
        'Ethics training',
        'Infrastructure upgrades',
        'Policy development'
      ],
      aiCategories: [
        'AI governance frameworks',
        'Ethical AI training programs',
        'Policy development support',
        'Community engagement initiatives'
      ],
      matchScore: 95,
      estimatedAward: 75000,
      requirements: [
        'Demonstrate AI readiness',
        'Include community stakeholders',
        'Address ethical considerations',
        'Provide evaluation framework'
      ]
    }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setGrantRequirements(prev => ({ ...prev, file }))
      // In a real implementation, you would parse the file content
      // and extract key requirements, compliance areas, etc.
    }
  }

  const handleChallengeToggle = (challenge: string) => {
    setSchoolInfo(prev => ({
      ...prev,
      primaryChallenges: prev.primaryChallenges.includes(challenge)
        ? prev.primaryChallenges.filter(c => c !== challenge)
        : [...prev.primaryChallenges, challenge]
    }))
  }

  const handleComplianceToggle = (area: string) => {
    setGrantRequirements(prev => ({
      ...prev,
      complianceAreas: prev.complianceAreas.includes(area)
        ? prev.complianceAreas.filter(c => c !== area)
        : [...prev.complianceAreas, area]
    }))
  }

  const handleImplementationNeedToggle = (need: string) => {
    setImplementationNeeds(prev =>
      prev.includes(need)
        ? prev.filter(n => n !== need)
        : [...prev, need]
    )
  }

  const generateNarrative = async () => {
    if (!selectedOpportunity) return
    
    setIsGenerating(true)
    
    // Simulate API call with more sophisticated processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const narrative = `
**COMPREHENSIVE GRANT NARRATIVE: ${selectedOpportunity.program}**

**Executive Summary**
${schoolInfo.schoolName}${schoolInfo.districtName ? ` (${schoolInfo.districtName})` : ''} respectfully requests $${selectedOpportunity.estimatedAward.toLocaleString()} under the ${selectedOpportunity.program} to implement a comprehensive AI readiness initiative. Our ${schoolInfo.schoolType === 'k12' ? 'educational institution' : schoolInfo.schoolType} serves ${schoolInfo.studentCount.toLocaleString()} students with ${schoolInfo.teacherCount} teaching staff and ${schoolInfo.administratorCount} administrators. This initiative directly addresses our identified challenges while aligning with federal education priorities.

**Institution Profile & Current State**
${schoolInfo.schoolName} currently operates with:
- Student Population: ${schoolInfo.studentCount.toLocaleString()} students
- Teaching Staff: ${schoolInfo.teacherCount} educators
- Administrative Team: ${schoolInfo.administratorCount} administrators
- Annual Technology Budget: $${schoolInfo.currentTechBudget.toLocaleString()}
- AI Readiness Level: ${schoolInfo.aiExperience.toUpperCase()}

**Statement of Need**
Our comprehensive needs assessment has identified the following priority challenges:
${schoolInfo.primaryChallenges.map(challenge => `• ${challenge}`).join('\n')}

${schoolInfo.specificNeeds ? `\nSpecific Institutional Needs:\n${schoolInfo.specificNeeds}` : ''}

**Grant Requirements Alignment**
${grantRequirements.keyRequirements ? `\nKey Requirements Analysis:\n${grantRequirements.keyRequirements}` : ''}

This project specifically addresses the following compliance areas:
${grantRequirements.complianceAreas.map(area => `• ${area}`).join('\n')}

**Project Description**
Our AI readiness initiative will implement the following evidence-based components:

${implementationNeeds.map((need, index) => `
${index + 1}. **${need}**
   Directly supports: ${selectedOpportunity.eligibleUses.find(use => use.toLowerCase().includes(need.toLowerCase().split(' ')[0])) || selectedOpportunity.eligibleUses[0]}
   Timeline: 6-12 months implementation
`).join('')}

**Alignment with Federal Priorities**
This project directly addresses allowable uses under ${selectedOpportunity.program}:
${selectedOpportunity.eligibleUses.map(use => `• ${use}`).join('\n')}

AI-specific implementation categories:
${selectedOpportunity.aiCategories.map(cat => `• ${cat}`).join('\n')}

**Student Impact & Outcomes**
The proposed initiative will benefit all ${schoolInfo.studentCount.toLocaleString()} students by:
- Providing personalized learning experiences through AI-enabled platforms
- Ensuring safe and ethical AI use through comprehensive digital citizenship education
- Supporting ${schoolInfo.teacherCount} teachers with AI-enhanced assessment tools
- Creating sustainable systems for ongoing AI integration

**Professional Development Component**
Comprehensive training program includes:
- 40+ hours of AI literacy training for all ${schoolInfo.teacherCount} teaching staff
- Leadership development for ${schoolInfo.administratorCount} administrators
- Ongoing coaching and classroom integration support
- Community engagement for parents and stakeholders

**Evaluation & Measurement**
${grantRequirements.evaluationCriteria ? `\nEvaluation Framework:\n${grantRequirements.evaluationCriteria}` : ''}

Success metrics include:
- Pre/post AI readiness assessments for all staff
- Student learning outcome improvements (standardized metrics)
- Teacher confidence and competency surveys
- Technology integration usage analytics

**Reporting & Compliance**
${grantRequirements.reportingRequirements ? `\n${grantRequirements.reportingRequirements}` : 'Standard federal reporting requirements will be met with quarterly progress reports and annual outcome assessments.'}

**Budget Justification**
Requested Amount: $${selectedOpportunity.estimatedAward.toLocaleString()}
Institutional Match: $${Math.round(selectedOpportunity.estimatedAward * 0.25).toLocaleString()} (25% local contribution)
Total Project Value: $${Math.round(selectedOpportunity.estimatedAward * 1.25).toLocaleString()}

Budget allocation prioritizes high-impact areas identified in our needs assessment while ensuring sustainable implementation and maximum benefit for our student population.

**Sustainability & Long-term Impact**
${schoolInfo.schoolName} is committed to maintaining AI initiatives beyond the grant period through:
- Integration into annual technology budget planning
- Ongoing professional development programs
- Policy development and governance framework establishment
- Community partnership development for continued support

**Conclusion**
This comprehensive initiative positions ${schoolInfo.schoolName} as a model for responsible AI integration in ${schoolInfo.schoolType === 'k12' ? 'K-12' : 'higher'} education. The requested funding will enable evidence-based implementation while ensuring student privacy, educational equity, and sustainable long-term impact.
    `.trim()

    setGeneratedNarrative(narrative)
    setIsGenerating(false)
    setCurrentStep(4) // Move to final review step
  }

  const downloadNarrative = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedNarrative], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `grant-narrative-${selectedOpportunity?.id}-${schoolInfo.schoolName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: return selectedOpportunity !== null
      case 1: return schoolInfo.schoolName && schoolInfo.studentCount > 0 && schoolInfo.teacherCount > 0
      case 2: return true // Optional step, allow proceeding
      case 3: return implementationNeeds.length > 0
      default: return false
    }
  }

  const nextStep = () => {
    if (currentStep < STEP_TITLES.length - 1 && canProceedToNextStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const commonChallenges = [
    'Limited AI literacy among staff',
    'Insufficient technology infrastructure',
    'Budget constraints for new technology',
    'Student digital divide',
    'Privacy and data security concerns',
    'Lack of AI governance policies',
    'Need for professional development',
    'Parent and community concerns',
    'Integration with existing systems',
    'Measuring AI impact on learning outcomes'
  ]

  const complianceAreas = [
    'FERPA (Student Privacy)',
    'COPPA (Children\'s Online Privacy)',
    'Section 508 (Accessibility)',
    'Civil Rights (Equity & Non-discrimination)',
    'Data Security Standards',
    'AI Ethics Guidelines',
    'Title I Requirements',
    'ESSA Compliance',
    'State Education Standards',
    'Local Board Policies'
  ]

  const implementationOptions = [
    'AI Literacy Training for Educators',
    'Student Assessment & Analytics Tools',
    'Personalized Learning Platforms',
    'Digital Citizenship & AI Ethics Curriculum',
    'AI Governance Policy Development',
    'Technology Infrastructure Upgrades',
    'Parent & Community Engagement Program',
    'Teacher Coaching & Support Systems',
    'Data Privacy & Security Framework',
    'AI Impact Measurement Systems'
  ]

  return (
    <div className="space-y-6" data-testid="funding-justification-generator-v2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Funding Justification Wizard</h1>
          <p className="text-muted-foreground">
            Step-by-step grant narrative generator with contextualized requirements
          </p>
        </div>
        <FundingTutorialTrigger showNewBadge={true} variant="floating" />
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep + 1} of {STEP_TITLES.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(((currentStep + 1) / STEP_TITLES.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / STEP_TITLES.length) * 100}%` }}
            />
          </div>
          <div className="mt-2">
            <h2 className="font-semibold">{STEP_TITLES[currentStep]}</h2>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {/* Step 0: Select Funding Opportunity */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Choose Your Funding Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fundingOpportunities.map((opportunity) => (
                <Card 
                  key={opportunity.id} 
                  className={`border-2 cursor-pointer transition-all ${
                    selectedOpportunity?.id === opportunity.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOpportunity(opportunity)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{opportunity.program}</h3>
                        <p className="text-sm text-muted-foreground">{opportunity.agency}</p>
                        <div className="text-2xl font-bold text-green-600 mt-2">{opportunity.amount}</div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-100 text-blue-800 mb-2">
                          {opportunity.matchScore}% Match Score
                        </Badge>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {opportunity.deadline}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Eligible Uses:</h4>
                        <div className="space-y-1">
                          {opportunity.eligibleUses.map((use, i) => (
                            <Badge key={i} variant="outline" className="mr-2 mb-1">
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">AI Categories:</h4>
                        <div className="space-y-1">
                          {opportunity.aiCategories.map((category, i) => (
                            <Badge key={i} className="mr-2 mb-1 bg-green-100 text-green-800">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 1: School Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                School/Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School/Institution Name *</Label>
                  <Input
                    id="schoolName"
                    value={schoolInfo.schoolName}
                    onChange={(e) => setSchoolInfo(prev => ({ ...prev, schoolName: e.target.value }))}
                    placeholder="Enter your school or institution name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="districtName">District Name (if applicable)</Label>
                  <Input
                    id="districtName"
                    value={schoolInfo.districtName}
                    onChange={(e) => setSchoolInfo(prev => ({ ...prev, districtName: e.target.value }))}
                    placeholder="Enter district name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Institution Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: 'elementary', label: 'Elementary School' },
                    { value: 'middle', label: 'Middle School' },
                    { value: 'high', label: 'High School' },
                    { value: 'k12', label: 'K-12 District' },
                    { value: 'college', label: 'Community College' },
                    { value: 'university', label: 'University' }
                  ].map(type => (
                    <Button
                      key={type.value}
                      variant={schoolInfo.schoolType === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSchoolInfo(prev => ({ ...prev, schoolType: type.value as any }))}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentCount">Number of Students *</Label>
                  <Input
                    id="studentCount"
                    type="number"
                    value={schoolInfo.studentCount || ''}
                    onChange={(e) => setSchoolInfo(prev => ({ ...prev, studentCount: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacherCount">Number of Teachers *</Label>
                  <Input
                    id="teacherCount"
                    type="number"
                    value={schoolInfo.teacherCount || ''}
                    onChange={(e) => setSchoolInfo(prev => ({ ...prev, teacherCount: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="administratorCount">Number of Administrators</Label>
                  <Input
                    id="administratorCount"
                    type="number"
                    value={schoolInfo.administratorCount || ''}
                    onChange={(e) => setSchoolInfo(prev => ({ ...prev, administratorCount: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="techBudget">Annual Technology Budget</Label>
                  <Input
                    id="techBudget"
                    type="number"
                    value={schoolInfo.currentTechBudget || ''}
                    onChange={(e) => setSchoolInfo(prev => ({ ...prev, currentTechBudget: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current AI Experience Level</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'none', label: 'No Experience' },
                      { value: 'basic', label: 'Basic' },
                      { value: 'intermediate', label: 'Intermediate' },
                      { value: 'advanced', label: 'Advanced' }
                    ].map(level => (
                      <Button
                        key={level.value}
                        variant={schoolInfo.aiExperience === level.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSchoolInfo(prev => ({ ...prev, aiExperience: level.value as any }))}
                      >
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Challenges (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {commonChallenges.map(challenge => (
                    <Button
                      key={challenge}
                      variant={schoolInfo.primaryChallenges.includes(challenge) ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => handleChallengeToggle(challenge)}
                    >
                      <CheckCircle className={`h-4 w-4 mr-2 ${schoolInfo.primaryChallenges.includes(challenge) ? 'opacity-100' : 'opacity-0'}`} />
                      {challenge}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specificNeeds">Specific Needs & Context</Label>
                <Textarea
                  id="specificNeeds"
                  value={schoolInfo.specificNeeds}
                  onChange={(e) => setSchoolInfo(prev => ({ ...prev, specificNeeds: e.target.value }))}
                  placeholder="Describe any specific challenges, goals, or context that should be included in your grant narrative..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Grant Requirements */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Grant Requirements & Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="grantFile">Upload Grant Guidelines (Optional)</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {grantRequirements.file ? grantRequirements.file.name : 'Upload Grant Guidelines Document'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload grant guidelines, RFP documents, or requirements to auto-populate fields below
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyRequirements">Key Grant Requirements</Label>
                  <Textarea
                    id="keyRequirements"
                    value={grantRequirements.keyRequirements}
                    onChange={(e) => setGrantRequirements(prev => ({ ...prev, keyRequirements: e.target.value }))}
                    placeholder="Paste or describe the main requirements from the grant guidelines..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Compliance Areas (Select all that apply)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {complianceAreas.map(area => (
                      <Button
                        key={area}
                        variant={grantRequirements.complianceAreas.includes(area) ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => handleComplianceToggle(area)}
                      >
                        <CheckCircle className={`h-4 w-4 mr-2 ${grantRequirements.complianceAreas.includes(area) ? 'opacity-100' : 'opacity-0'}`} />
                        {area}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportingRequirements">Reporting & Documentation Requirements</Label>
                  <Textarea
                    id="reportingRequirements"
                    value={grantRequirements.reportingRequirements}
                    onChange={(e) => setGrantRequirements(prev => ({ ...prev, reportingRequirements: e.target.value }))}
                    placeholder="Describe any specific reporting requirements, documentation needs, or compliance reporting..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evaluationCriteria">Evaluation & Success Metrics</Label>
                  <Textarea
                    id="evaluationCriteria"
                    value={grantRequirements.evaluationCriteria}
                    onChange={(e) => setGrantRequirements(prev => ({ ...prev, evaluationCriteria: e.target.value }))}
                    placeholder="How will success be measured? What evaluation criteria are specified in the grant?"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Implementation Needs */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Implementation Priorities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select Implementation Areas (Choose 3-5 priorities)</Label>
                <p className="text-sm text-muted-foreground">
                  Choose the AI implementation areas that best align with your needs and the selected funding opportunity
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {implementationOptions.map(option => (
                    <Button
                      key={option}
                      variant={implementationNeeds.includes(option) ? "default" : "outline"}
                      size="sm"
                      className="justify-start p-4 h-auto"
                      onClick={() => handleImplementationNeedToggle(option)}
                    >
                      <div className="flex items-start gap-3 text-left">
                        <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${implementationNeeds.includes(option) ? 'opacity-100' : 'opacity-0'}`} />
                        <div>
                          <div className="font-medium">{option}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {selectedOpportunity?.eligibleUses.find(use => 
                              use.toLowerCase().includes(option.toLowerCase().split(' ')[0]) ||
                              option.toLowerCase().includes(use.toLowerCase().split(' ')[0])
                            ) && `Aligns with: ${selectedOpportunity.eligibleUses.find(use => 
                              use.toLowerCase().includes(option.toLowerCase().split(' ')[0]) ||
                              option.toLowerCase().includes(use.toLowerCase().split(' ')[0])
                            )}`}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {implementationNeeds.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Selected Priorities ({implementationNeeds.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {implementationNeeds.map(need => (
                      <Badge key={need} className="bg-blue-100 text-blue-800">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Generate & Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {!generatedNarrative && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Ready to Generate Your Grant Narrative
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Selected Funding Opportunity</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-semibold">{selectedOpportunity?.program}</div>
                        <div className="text-sm text-muted-foreground">{selectedOpportunity?.agency}</div>
                        <div className="text-lg font-bold text-green-600 mt-1">{selectedOpportunity?.amount}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Institution Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-semibold">{schoolInfo.schoolName}</div>
                        {schoolInfo.districtName && <div className="text-sm text-muted-foreground">{schoolInfo.districtName}</div>}
                        <div className="text-sm mt-1">
                          <Users className="h-4 w-4 inline mr-1" />
                          {schoolInfo.studentCount.toLocaleString()} students, {schoolInfo.teacherCount} teachers
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Implementation Priorities</h3>
                    <div className="flex flex-wrap gap-2">
                      {implementationNeeds.map(need => (
                        <Badge key={need}>{need}</Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={generateNarrative} 
                    className="w-full" 
                    size="lg"
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating Comprehensive Narrative...' : 'Generate Grant Narrative'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {generatedNarrative && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Your Customized Grant Narrative
                    </span>
                    <Button onClick={downloadNarrative} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{generatedNarrative}</pre>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => setCurrentStep(0)} variant="outline">
                      Start Over
                    </Button>
                    <Button onClick={() => generateNarrative()} variant="outline">
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          onClick={prevStep} 
          variant="outline" 
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < STEP_TITLES.length - 1 ? (
          <Button 
            onClick={nextStep} 
            disabled={!canProceedToNextStep()}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={generateNarrative} 
            disabled={isGenerating || !canProceedToNextStep()}
          >
            {isGenerating ? 'Generating...' : 'Generate Narrative'}
          </Button>
        )}
      </div>
    </div>
  )
}