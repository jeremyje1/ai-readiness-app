'use client'

// FundingTutorialTrigger removed - using simplified tutorial system
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserContext } from '@/components/UserProvider'
import {
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  FileText,
  Target
} from 'lucide-react'
import { useState } from 'react'

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

interface DistrictRecommendation {
  category: string
  description: string
  estimatedCost: number
  timeline: string
  alignment: string[]
  priority: 'high' | 'medium' | 'low'
}

export default function FundingJustificationGenerator() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('')
  const [generatedNarrative, setGeneratedNarrative] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { user, institution, loading } = useUserContext()

  // Use actual institution data or fallback values
  const institutionName = institution?.name || 'Your Institution'
  const institutionType = institution?.org_type === 'K12' ? 'School District' : 'Institution'
  const studentCount = institution?.headcount || 2330 // fallback number
  const schoolCount = institution?.org_type === 'K12' ? 'three schools' : 'multiple departments'

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

  const districtRecommendations: DistrictRecommendation[] = [
    {
      category: 'Professional Development',
      description: 'Comprehensive AI literacy training for all teaching staff (180 educators)',
      estimatedCost: 45000,
      timeline: '6 months',
      alignment: ['Technology integration', 'Professional development', 'AI literacy training for educators'],
      priority: 'high'
    },
    {
      category: 'Technology Infrastructure',
      description: 'AI-enabled learning management system with personalized learning capabilities',
      estimatedCost: 120000,
      timeline: '12 months',
      alignment: ['Technology integration', 'Personalized learning platforms', 'Educational technology platforms'],
      priority: 'high'
    },
    {
      category: 'Policy Development',
      description: 'AI governance framework development with community engagement process',
      estimatedCost: 25000,
      timeline: '4 months',
      alignment: ['AI governance frameworks', 'Policy development support', 'Community engagement initiatives'],
      priority: 'medium'
    },
    {
      category: 'Student Assessment',
      description: 'AI-powered formative assessment tools for personalized intervention',
      estimatedCost: 65000,
      timeline: '8 months',
      alignment: ['Student assessment tools', 'Assessment and intervention tools', 'Learning recovery'],
      priority: 'high'
    },
    {
      category: 'Digital Citizenship',
      description: 'AI ethics and digital citizenship curriculum for grades K-12',
      estimatedCost: 30000,
      timeline: '6 months',
      alignment: ['Digital citizenship programs', 'Ethical AI training programs', 'AI curriculum development'],
      priority: 'medium'
    }
  ]

  const generateNarrative = async (opportunityId: string) => {
    setIsGenerating(true)
    const opportunity = fundingOpportunities.find(o => o.id === opportunityId)
    if (!opportunity) return

    // Get matching recommendations
    const matchingRecommendations = districtRecommendations.filter(rec =>
      rec.alignment.some(align =>
        opportunity.eligibleUses.includes(align) || opportunity.aiCategories.includes(align)
      )
    )

    const totalCost = matchingRecommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0)
    const highPriorityItems = matchingRecommendations.filter(rec => rec.priority === 'high')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    const narrative = `
**GRANT NARRATIVE: ${opportunity.program}**

**Executive Summary**
${institutionName} respectfully requests $${opportunity.estimatedAward.toLocaleString()} under the ${opportunity.program} to implement a comprehensive AI readiness initiative that directly supports ${opportunity.eligibleUses.slice(0, 2).join(' and ')}. Our ${institutionType.toLowerCase()} serves ${studentCount.toLocaleString()} students across ${schoolCount} and has completed a comprehensive AI readiness assessment that identified specific opportunities to leverage artificial intelligence for educational improvement while maintaining strict ethical and privacy standards.

**Statement of Need**
Our recent AI readiness assessment revealed critical gaps in our current capacity to effectively and safely integrate AI technologies:
- Only 62% of our teaching staff have received formal AI literacy training
- Current technology infrastructure lacks AI-enabled personalized learning capabilities
- Students require enhanced digital citizenship education specific to AI technologies
- ${institutionType} policies need updating to address AI governance and ethical use

**Project Description**
This initiative will implement ${matchingRecommendations.length} evidence-based components over ${Math.max(...matchingRecommendations.map(r => parseInt(r.timeline)))} months:

${matchingRecommendations.map((rec, index) => `
${index + 1}. **${rec.category}** (${rec.timeline})
   ${rec.description}
   Estimated Cost: $${rec.estimatedCost.toLocaleString()}
   Priority: ${rec.priority.toUpperCase()}
`).join('')}

**Alignment with Federal Priorities**
This project directly addresses the following allowable uses under ${opportunity.program}:
${opportunity.eligibleUses.map(use => `• ${use}`).join('\n')}

Specific AI-related activities include:
${opportunity.aiCategories.map(cat => `• ${cat}`).join('\n')}

**Student Impact**
The proposed initiative will benefit all 2,330 students in our district by:
- Providing personalized learning experiences through AI-enabled platforms
- Ensuring safe and ethical AI use through comprehensive digital citizenship education
- Supporting teachers with AI-enhanced assessment and intervention tools
- Creating sustainable systems for ongoing AI integration

**Professional Development Component**
As required by federal guidance, this project includes substantial professional development:
- 40 hours of AI literacy training for all teaching staff
- Ongoing coaching and support for classroom integration
- Leadership development for administrators
- Community engagement for parents and stakeholders

**Evaluation and Sustainability**
Success will be measured through:
- Pre/post AI readiness assessments
- Teacher confidence and competency surveys
- Student learning outcome improvements
- Policy implementation compliance rates

**Budget Justification**
Total Project Cost: $${totalCost.toLocaleString()}
Requested Amount: $${opportunity.estimatedAward.toLocaleString()} (${Math.round((opportunity.estimatedAward / totalCost) * 100)}% of total)
District Match: $${(totalCost - opportunity.estimatedAward).toLocaleString()} (${Math.round(((totalCost - opportunity.estimatedAward) / totalCost) * 100)}% local contribution)

High-priority components totaling $${highPriorityItems.reduce((sum, item) => sum + item.estimatedCost, 0).toLocaleString()} will be funded through this grant, ensuring maximum impact on student learning and teacher effectiveness.

**Conclusion**
${institutionName} is committed to responsible AI integration that enhances educational outcomes while protecting student privacy and promoting ethical use. This grant will enable us to establish a model program that can be replicated across our state and region.
    `.trim()

    setGeneratedNarrative(narrative)
    setIsGenerating(false)
  }

  const downloadNarrative = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedNarrative], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `grant-narrative-${selectedOpportunity}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6" data-testid="funding-justification-generator">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Funding Justification Generator</h1>
          <p className="text-muted-foreground">
            Auto-generate grant narratives aligned with federal funding guidelines for AI initiatives
          </p>
        </div>
      </div>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">Funding Opportunities</TabsTrigger>
          <TabsTrigger value="recommendations">District Recommendations</TabsTrigger>
          <TabsTrigger value="generator">Narrative Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Available Funding Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {fundingOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                          <h4 className="font-medium mb-2">AI-Specific Categories:</h4>
                          <div className="space-y-1">
                            {opportunity.aiCategories.map((category, i) => (
                              <Badge key={i} className="mr-2 mb-1 bg-green-100 text-green-800">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Key Requirements:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {opportunity.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedOpportunity(opportunity.id)
                          generateNarrative(opportunity.id)
                        }}
                        className="w-full"
                        disabled={isGenerating}
                      >
                        {isGenerating && selectedOpportunity === opportunity.id
                          ? 'Generating Narrative...'
                          : 'Generate Grant Narrative'
                        }
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                District AI Recommendations for Funding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {districtRecommendations.map((rec, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{rec.category}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        </div>
                        <Badge className={rec.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Cost: </span>
                          <span className="text-green-600 font-semibold">${rec.estimatedCost.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Timeline: </span>
                          <span>{rec.timeline}</span>
                        </div>
                        <div>
                          <span className="font-medium">Funding Alignment: </span>
                          <span className="text-blue-600">{rec.alignment.length} matches</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h4 className="font-medium text-sm mb-2">Aligned Funding Categories:</h4>
                        <div className="flex flex-wrap gap-1">
                          {rec.alignment.map((align, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {align}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Funding Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${districtRecommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Estimated Cost</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {districtRecommendations.filter(rec => rec.priority === 'high').length}
                      </div>
                      <div className="text-sm text-muted-foreground">High Priority Items</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${fundingOpportunities.reduce((sum, opp) => sum + opp.estimatedAward, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Available Funding</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((fundingOpportunities.reduce((sum, opp) => sum + opp.estimatedAward, 0) /
                          districtRecommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0)) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Funding Coverage</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          {generatedNarrative ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Grant Narrative
                  </span>
                  <Button onClick={downloadNarrative} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{generatedNarrative}</pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Generate Grant Narrative</h3>
                <p className="text-muted-foreground mb-6">
                  Select a funding opportunity from the first tab to generate a customized grant narrative
                  that aligns your district’s AI recommendations with federal funding guidelines.
                </p>
                <Button variant="outline">
                  View Funding Opportunities
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
