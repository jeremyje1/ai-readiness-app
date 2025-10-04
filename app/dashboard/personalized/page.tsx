'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface GapAnalysis {
  id: string;
  user_id: string;
  overall_score: number;
  maturity_level: string;
  govern_score: number;
  govern_gaps: string[];
  govern_strengths: string[];
  govern_recommendations: string[];
  map_score: number;
  map_gaps: string[];
  map_strengths: string[];
  map_recommendations: string[];
  measure_score: number;
  measure_gaps: string[];
  measure_strengths: string[];
  measure_recommendations: string[];
  manage_score: number;
  manage_gaps: string[];
  manage_strengths: string[];
  manage_recommendations: string[];
  priority_actions: string[];
  quick_wins: string[];
  analysis_date: string;
}

interface Roadmap {
  id: string;
  roadmap_type: string;
  goals: string[];
  action_items: string[];
  milestones: string[];
}

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_size: number;
  upload_date: string;
  processing_status: string;
}

export default function PersonalizedDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const supabase = createClient();
    try {
      console.log('🔄 Loading dashboard data...');
      console.log('⏰ Timestamp:', new Date().toISOString());
      
      // Add timeout for authentication check (increased to 15 seconds)
      const authTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Authentication timeout')), 15000)
      );

      // Check authentication with timeout
      const authPromise = supabase.auth.getUser();
      let user, authError;
      
      try {
        const result: any = await Promise.race([authPromise, authTimeout]);
        user = result.data?.user;
        authError = result.error;
      } catch (timeoutError) {
        console.error('⚠️ Auth timeout, retrying without timeout...');
        // Retry without timeout
        const { data, error } = await supabase.auth.getUser();
        user = data?.user;
        authError = error;
      }

      if (authError || !user) {
        console.error('❌ Authentication failed:', authError);
        router.push('/auth/login');
        return;
      }
      
      console.log('✅ User authenticated:', user.id);
      setUserId(user.id);

      console.log('📊 Loading gap analysis...');
      
      // Load gap analysis
      const { data: gapData, error: gapError } = await supabase
        .from('gap_analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (gapData && !gapError) {
        console.log('✅ Gap analysis loaded:', gapData);
        setGapAnalysis(gapData);
      } else {
        if (gapError && gapError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is expected for new users
          console.error('❌ Error loading gap analysis:', gapError);
        } else {
          console.log('ℹ️ No gap analysis found yet');
        }
        
        // Try to load from assessment as fallback
        console.log('🔄 Checking for completed assessment...');
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('streamlined_assessment_responses')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();
        
        if (assessmentData && !assessmentError) {
          console.log('✅ Found assessment, converting to gap analysis format');
          // Convert assessment to gap analysis format
          const scores = assessmentData.scores;
          setGapAnalysis({
            id: assessmentData.id,
            user_id: user.id,
            overall_score: scores?.OVERALL?.percentage || 0,
            maturity_level: assessmentData.readiness_level || 'Beginning',
            govern_score: scores?.GOVERN?.percentage || 0,
            govern_gaps: [],
            govern_strengths: [],
            govern_recommendations: ['Focus on AI governance framework'],
            map_score: scores?.MAP?.percentage || 0,
            map_gaps: [],
            map_strengths: [],
            map_recommendations: ['Map AI systems and processes'],
            measure_score: scores?.MEASURE?.percentage || 0,
            measure_gaps: [],
            measure_strengths: [],
            measure_recommendations: ['Establish measurement metrics'],
            manage_score: scores?.MANAGE?.percentage || 0,
            manage_gaps: [],
            manage_strengths: [],
            manage_recommendations: ['Implement risk management'],
            priority_actions: ['Review policies', 'Train staff', 'Document systems'],
            quick_wins: ['Create AI policy', 'Awareness training', 'Tool inventory'],
            analysis_date: assessmentData.completed_at || new Date().toISOString()
          });
        } else {
          console.log('ℹ️ No assessment found either');
        }
      }

      // Load roadmaps
      const { data: roadmapData, error: roadmapError } = await supabase
        .from('implementation_roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('roadmap_type');

      if (roadmapData && !roadmapError) {
        setRoadmaps(roadmapData);
      } else if (roadmapError) {
        console.error('Error loading roadmaps:', roadmapError);
      }

      // Load documents
      const { data: docData, error: docError } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (docData && !docError) {
        setDocuments(docData);
      } else if (docError) {
        console.error('Error loading documents:', docError);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const getMaturityColor = (level: string) => {
    switch (level) {
      case 'Beginning':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Developing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Performing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Advanced':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  if (!gapAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 py-12">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome to Your Dashboard! 🎯
            </h1>
            <p className="text-xl text-gray-600">
              Your AI readiness analysis is being prepared...
            </p>
          </div>

          <Card className="border-2 border-indigo-100">
            <CardContent className="p-10">
              {/* How It Works Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                  Your Path to AI Excellence
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-indigo-600">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Quick Assessment</h3>
                    <p className="text-sm text-gray-600">
                      Answer 5 strategic questions about your institution's AI goals and challenges (5 minutes)
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-indigo-600">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Document Upload</h3>
                    <p className="text-sm text-gray-600">
                      Share your existing policies and plans - our AI will analyze them instantly
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-indigo-600">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Get Your Roadmap</h3>
                    <p className="text-sm text-gray-600">
                      Receive your NIST-aligned gap analysis and personalized 30/60/90-day action plan
                    </p>
                  </div>
                </div>
              </div>

              {/* What You'll Get Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-lg mb-3">What You'll Receive:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">AI Readiness Score (0-100)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">NIST Framework Gap Analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Personalized Implementation Roadmap</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Priority Actions & Quick Wins</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Detailed Recommendations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Downloadable Reports</span>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">✨ Your Analysis is Being Generated</h3>
                  <p className="text-blue-700 mb-4">
                    We're analyzing your institution's current AI readiness. Complete the assessment and upload documents to unlock your personalized roadmap!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Calendar className="h-4 w-4" />
                      <span>Assessment: 5 minutes</span>
                    </div>
                    <div className="hidden sm:block text-blue-400">•</div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <FileText className="h-4 w-4" />
                      <span>Upload: 3-5 minutes</span>
                    </div>
                    <div className="hidden sm:block text-blue-400">•</div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Zap className="h-4 w-4" />
                      <span>Results: Instant</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Ready to transform your institution's AI strategy? Let's get started!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => router.push('/assessment')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Start Assessment
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/assessment/upload-documents')}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Upload Documents
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => window.location.reload()}
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Refresh Results
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500 mt-6">
                  💡 <strong>Tip:</strong> Upload existing policies, strategic plans, or technology documents for a more accurate analysis
                </p>
                
                <p className="text-xs text-gray-400 mt-3">
                  Most institutions complete the entire process in under 15 minutes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 py-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your AI Readiness Dashboard</h1>
          <p className="text-gray-600">
            Personalized insights and roadmap based on your institutional analysis
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-gray-600 mb-2">Overall AI Readiness Score</p>
                <div className={`text-5xl font-bold ${getScoreColor(gapAnalysis.overall_score)}`}>
                  {gapAnalysis.overall_score}
                  <span className="text-2xl">/100</span>
                </div>
                <Progress value={gapAnalysis.overall_score} className="mt-3" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Maturity Level</p>
                <div className={`inline-block px-4 py-2 rounded-lg border-2 font-semibold ${getMaturityColor(gapAnalysis.maturity_level)}`}>
                  {gapAnalysis.maturity_level}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Based on NIST AI RMF Framework
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Analysis Date</p>
                <p className="text-lg font-semibold">
                  {new Date(gapAnalysis.analysis_date).toLocaleDateString()}
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NIST Framework Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>NIST AI RMF Framework Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'GOVERN', score: gapAnalysis.govern_score, icon: '🏛️' },
                { name: 'MAP', score: gapAnalysis.map_score, icon: '🗺️' },
                { name: 'MEASURE', score: gapAnalysis.measure_score, icon: '📊' },
                { name: 'MANAGE', score: gapAnalysis.manage_score, icon: '⚙️' }
              ].map((category) => (
                <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(category.score)}`}>
                    {category.score}
                  </div>
                  <Progress value={category.score} className="mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Wins */}
        {gapAnalysis.quick_wins && gapAnalysis.quick_wins.length > 0 && (
          <Card className="mb-8 border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Quick Wins (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {gapAnalysis.quick_wins.map((win, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Priority Actions */}
        {gapAnalysis.priority_actions && gapAnalysis.priority_actions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Priority Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {gapAnalysis.priority_actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Implementation Roadmaps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Implementation Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="30day" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="30day">30 Days</TabsTrigger>
                <TabsTrigger value="60day">60 Days</TabsTrigger>
                <TabsTrigger value="90day">90 Days</TabsTrigger>
              </TabsList>
              {roadmaps.map((roadmap) => (
                <TabsContent key={roadmap.roadmap_type} value={roadmap.roadmap_type}>
                  <div className="space-y-6 pt-4">
                    {roadmap.goals && roadmap.goals.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Goals
                        </h4>
                        <ul className="space-y-2">
                          {roadmap.goals.map((goal, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {roadmap.action_items && roadmap.action_items.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Action Items
                        </h4>
                        <ul className="space-y-2">
                          {roadmap.action_items.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                              <span className="text-gray-400">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {roadmap.milestones && roadmap.milestones.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Key Milestones
                        </h4>
                        <ul className="space-y-2">
                          {roadmap.milestones.map((milestone, index) => (
                            <li key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <span className="font-bold text-blue-600">{index + 1}.</span>
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Gap Analysis Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="GOVERN" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="GOVERN">GOVERN</TabsTrigger>
                <TabsTrigger value="MAP">MAP</TabsTrigger>
                <TabsTrigger value="MEASURE">MEASURE</TabsTrigger>
                <TabsTrigger value="MANAGE">MANAGE</TabsTrigger>
              </TabsList>
              {[
                { name: 'GOVERN', gaps: gapAnalysis.govern_gaps, strengths: gapAnalysis.govern_strengths, recommendations: gapAnalysis.govern_recommendations },
                { name: 'MAP', gaps: gapAnalysis.map_gaps, strengths: gapAnalysis.map_strengths, recommendations: gapAnalysis.map_recommendations },
                { name: 'MEASURE', gaps: gapAnalysis.measure_gaps, strengths: gapAnalysis.measure_strengths, recommendations: gapAnalysis.measure_recommendations },
                { name: 'MANAGE', gaps: gapAnalysis.manage_gaps, strengths: gapAnalysis.manage_strengths, recommendations: gapAnalysis.manage_recommendations }
              ].map((category) => (
                <TabsContent key={category.name} value={category.name}>
                  <div className="space-y-6 pt-4">
                    {category.gaps && category.gaps.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-red-600">⚠️ Gaps Identified</h4>
                        <ul className="space-y-2">
                          {category.gaps.map((gap, index) => (
                            <li key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                              {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {category.strengths && category.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-green-600">✅ Strengths</h4>
                        <ul className="space-y-2">
                          {category.strengths.map((strength, index) => (
                            <li key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {category.recommendations && category.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-blue-600">💡 Recommendations</h4>
                        <ul className="space-y-2">
                          {category.recommendations.map((rec, index) => (
                            <li key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Analyzed Documents ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.document_type.replace(/_/g, ' ')} • {(doc.file_size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${doc.processing_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {doc.processing_status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
