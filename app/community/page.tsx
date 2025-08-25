'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StateBriefing {
  state: string;
  title: string;
  date: string;
  status: string;
  highlights: string[];
}

interface DisciplineBrief {
  discipline: string;
  title: string;
  date: string;
  status: string;
  highlights: string[];
}

export default function CommunityPage() {
  const [userType, setUserType] = useState<'k12' | 'highered'>('k12');

  const stateBriefings: StateBriefing[] = [
    {
      state: 'California',
      title: 'AB 2273 Student Privacy Updates & AI Compliance',
      date: '2024-12-15',
      status: 'Latest',
      highlights: [
        'New data privacy requirements for AI tools',
        'Required parental consent mechanisms',
        'Model implementation from San Diego USD'
      ]
    },
    {
      state: 'Texas',
      title: 'AI Pilot Program Results & Scaling Guidance',
      date: '2024-12-10',
      status: 'New',
      highlights: [
        'Statewide pilot outcomes data',
        'Recommended vendor approval process',
        'Dallas ISD case study highlights'
      ]
    },
    {
      state: 'Florida',
      title: 'Updated COPPA Guidance for AI Educational Tools',
      date: '2024-12-05',
      status: 'Updated',
      highlights: [
        'Clarified age verification requirements',
        'AI tool audit checklist',
        'Miami-Dade implementation model'
      ]
    }
  ];

  const disciplineBriefs: DisciplineBrief[] = [
    {
      discipline: 'Computer Science',
      title: 'LLM Integration in Programming Courses',
      date: '2024-12-12',
      status: 'Latest',
      highlights: [
        'Code review and debugging pedagogies',
        'Academic integrity frameworks',
        'MIT and Stanford adoption models'
      ]
    },
    {
      discipline: 'Business',
      title: 'AI Policy Frameworks for Business Schools',
      date: '2024-12-08',
      status: 'New',
      highlights: [
        'Case study development guidelines',
        'Ethics curriculum integration',
        'Wharton and Kellogg examples'
      ]
    },
    {
      discipline: 'Liberal Arts',
      title: 'Critical Thinking in the Age of AI',
      date: '2024-12-03',
      status: 'Updated',
      highlights: [
        'Enhanced analysis methodologies',
        'Source verification protocols',
        'Harvard and Yale approaches'
      ]
    }
  ];

  const monthlyTemplates = [
    {
      title: 'Student AI Acceptable Use Agreement',
      type: 'Policy Template',
      date: '2024-12-01',
      category: 'Student Policies',
      description: 'Comprehensive template for K-12 and Higher Ed student AI usage policies',
      includes: ['Legal compliance checklist', 'Implementation guide', 'Parent communication']
    },
    {
      title: 'Board Resolution Framework for AI Adoption',
      type: 'Governance Template',
      date: '2024-12-01',
      category: 'Board Materials',
      description: 'Ready-to-use board resolution template for formal AI policy adoption',
      includes: ['Risk assessment framework', 'Budget considerations', 'Timeline template']
    },
    {
      title: 'Faculty AI Development Workshop Curriculum',
      type: 'Training Material',
      date: '2024-11-15',
      category: 'Professional Development',
      description: '8-week faculty development program for AI integration',
      includes: ['Session plans', 'Assessment rubrics', 'Resource library']
    }
  ];

  const benchmarkData = {
    quarter: 'Q4 2024',
    totalParticipants: 847,
    yourScore: 78,
    averageScore: 62,
    topPercentile: 85,
    categories: [
      { name: 'Policy Maturity', yourScore: 82, average: 58, top10: 88 },
      { name: 'Implementation Speed', yourScore: 75, average: 64, top10: 84 },
      { name: 'Compliance Readiness', yourScore: 80, average: 61, top10: 87 },
      { name: 'Faculty/Staff Adoption', yourScore: 73, average: 65, top10: 83 }
    ]
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Community & Content Hub</h1>
          <p className="text-muted-foreground mt-2">
            Monthly value drops: briefings, templates, and peer benchmarking
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={userType === 'k12' ? 'default' : 'outline'}
            onClick={() => setUserType('k12')}
          >
            K-12 View
          </Button>
          <Button 
            variant={userType === 'highered' ? 'default' : 'outline'}
            onClick={() => setUserType('highered')}
          >
            Higher Ed View
          </Button>
        </div>
      </div>

      <Tabs defaultValue="briefings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="briefings">
            {userType === 'k12' ? 'State Briefings' : 'Discipline Briefs'}
          </TabsTrigger>
          <TabsTrigger value="templates">Monthly Templates</TabsTrigger>
          <TabsTrigger value="benchmarks">Peer Benchmarks (AIBS™)</TabsTrigger>
        </TabsList>

        <TabsContent value="briefings" className="space-y-6">
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                {userType === 'k12' ? 'State-by-State AI Education Briefings' : 'Discipline-by-Discipline Implementation Briefs'}
              </h2>
              <Badge variant="secondary">
                {userType === 'k12' ? `${stateBriefings.length} States This Month` : `${disciplineBriefs.length} Disciplines This Month`}
              </Badge>
            </div>

            {userType === 'k12' ? (
              stateBriefings.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {item.state}: {item.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                      </div>
                      <Badge variant={item.status === 'Latest' ? 'default' : item.status === 'New' ? 'secondary' : 'outline'}>
                        {item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium">Key Highlights:</h4>
                      <ul className="space-y-1">
                        {item.highlights.map((highlight, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">Download Brief</Button>
                        <Button size="sm" variant="ghost">View Implementation Guide</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              disciplineBriefs.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {item.discipline}: {item.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                      </div>
                      <Badge variant={item.status === 'Latest' ? 'default' : item.status === 'New' ? 'secondary' : 'outline'}>
                        {item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium">Key Highlights:</h4>
                      <ul className="space-y-1">
                        {item.highlights.map((highlight, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">Download Brief</Button>
                        <Button size="sm" variant="ghost">View Implementation Guide</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Monthly Template Drop</h2>
            <Badge variant="secondary">{monthlyTemplates.length} Templates This Month</Badge>
          </div>

          <div className="grid gap-6">
            {monthlyTemplates.map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{template.type}</Badge>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.date}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{template.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Includes:</h4>
                    <ul className="space-y-1">
                      {template.includes.map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button size="sm">Download Template</Button>
                    <Button size="sm" variant="outline">View Implementation Guide</Button>
                    <Button size="sm" variant="ghost">Expert Review Available</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Quarterly Peer Benchmarking (AIBS™)</h2>
            <Badge variant="secondary">{benchmarkData.quarter}</Badge>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall AI Readiness Score</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compared to {benchmarkData.totalParticipants} peer {userType === 'k12' ? 'districts' : 'institutions'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span>Your Score: {benchmarkData.yourScore}</span>
                    <Badge variant="default" className="text-lg">
                      Top 15%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-semibold text-muted-foreground">{benchmarkData.averageScore}</div>
                      <div className="text-sm">Peer Average</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-green-600">{benchmarkData.yourScore}</div>
                      <div className="text-sm">Your Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-blue-600">{benchmarkData.topPercentile}</div>
                      <div className="text-sm">Top 10%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benchmarkData.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.yourScore} / 100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full relative"
                          style={{ width: `${category.yourScore}%` }}
                        >
                          <div 
                            className="absolute top-0 h-2 bg-gray-400 rounded-full"
                            style={{ width: `${category.average}%` }}
                          ></div>
                          <div 
                            className="absolute top-0 h-2 bg-green-400 rounded-full"
                            style={{ width: `${category.top10}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Avg: {category.average}</span>
                        <span>Top 10%: {category.top10}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-2">
                  <Button>Download Full Report</Button>
                  <Button variant="outline">Schedule Strategy Call</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
