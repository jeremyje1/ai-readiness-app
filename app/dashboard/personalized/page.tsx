'use client';

import BlueprintDashboardWidget from '@/components/blueprint/BlueprintDashboardWidget';
import GoalSettingWizard from '@/components/blueprint/GoalSettingWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { buildNistAlignment, buildRiskHotspots, type NistAlignmentInsight, type RiskHotspot } from '@/lib/analysis/gap-insights';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  FileText,
  Loader2,
  Scale,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface GapAnalysis {
  id: string;
  user_id: string;
  overall_score: number;
  maturity_level: string;
  govern_score: number;
  govern_gaps: string[] | null;
  govern_strengths: string[] | null;
  govern_recommendations: string[] | null;
  map_score: number;
  map_gaps: string[] | null;
  map_strengths: string[] | null;
  map_recommendations: string[] | null;
  measure_score: number;
  measure_gaps: string[] | null;
  measure_strengths: string[] | null;
  measure_recommendations: string[] | null;
  manage_score: number;
  manage_gaps: string[] | null;
  manage_strengths: string[] | null;
  manage_recommendations: string[] | null;
  priority_actions: string[] | null;
  quick_wins: string[] | null;
  risk_hotspots: RiskHotspot[] | null;
  nist_alignment: NistAlignmentInsight[] | null;
  analysis_date: string;
}

const buildDomainInsightsFromGap = (data: Partial<GapAnalysis>) => ([
  {
    key: 'govern' as const,
    label: 'Govern',
    score: data.govern_score ?? 0,
    recommendation: data.govern_recommendations?.[0] ?? null
  },
  {
    key: 'map' as const,
    label: 'Map',
    score: data.map_score ?? 0,
    recommendation: data.map_recommendations?.[0] ?? null
  },
  {
    key: 'measure' as const,
    label: 'Measure',
    score: data.measure_score ?? 0,
    recommendation: data.measure_recommendations?.[0] ?? null
  },
  {
    key: 'manage' as const,
    label: 'Manage',
    score: data.manage_score ?? 0,
    recommendation: data.manage_recommendations?.[0] ?? null
  }
]);

const computeRiskHotspots = (data: Partial<GapAnalysis>): RiskHotspot[] => {
  const quickWins = Array.isArray(data.quick_wins) ? data.quick_wins : [];
  const domains = buildDomainInsightsFromGap(data);
  const recommendations = domains
    .filter((domain) => (domain.recommendation ?? '').trim().length > 0)
    .map((domain) => ({
      title: domain.recommendation as string,
      category: domain.label
    }));

  return buildRiskHotspots({
    overallScore: data.overall_score ?? 0,
    domains,
    recommendations,
    quickWins
  });
};

const computeNistAlignment = (data: Partial<GapAnalysis>): NistAlignmentInsight[] => {
  const domains = buildDomainInsightsFromGap(data);
  return buildNistAlignment({
    overallScore: data.overall_score ?? 0,
    domains
  });
};

const SEVERITY_RANK: Record<RiskHotspot['severity'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

const SEVERITY_BADGE_CLASSES: Record<RiskHotspot['severity'], string> = {
  critical: 'bg-red-100 text-red-800 border border-red-200',
  high: 'bg-orange-100 text-orange-800 border border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border border-amber-200',
  low: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
};

const ALIGNMENT_BADGE_CLASSES: Record<NistAlignmentInsight['status'], string> = {
  critical: 'bg-red-100 text-red-800 border border-red-200',
  attention: 'bg-orange-100 text-orange-800 border border-orange-200',
  progressing: 'bg-amber-100 text-amber-800 border border-amber-200',
  optimized: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
};

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [goalWizardLoading, setGoalWizardLoading] = useState(false);
  const [goalWizardAssessmentId, setGoalWizardAssessmentId] = useState<string | null>(null);

  const quickWinHighlights = useMemo(() => {
    if (!gapAnalysis) return [];

    type QuickWinHighlight = {
      title: string;
      category: string;
      context: string;
      score: number;
    };

    const items: QuickWinHighlight[] = [];
    const seen = new Set<string>();

    const addItem = (item: QuickWinHighlight) => {
      const normalized = item.title?.trim().toLowerCase();
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      items.push(item);
    };

    const domains = [
      {
        label: 'Govern',
        score: gapAnalysis.govern_score,
        recommendations: gapAnalysis.govern_recommendations,
        gaps: gapAnalysis.govern_gaps
      },
      {
        label: 'Map',
        score: gapAnalysis.map_score,
        recommendations: gapAnalysis.map_recommendations,
        gaps: gapAnalysis.map_gaps
      },
      {
        label: 'Measure',
        score: gapAnalysis.measure_score,
        recommendations: gapAnalysis.measure_recommendations,
        gaps: gapAnalysis.measure_gaps
      },
      {
        label: 'Manage',
        score: gapAnalysis.manage_score,
        recommendations: gapAnalysis.manage_recommendations,
        gaps: gapAnalysis.manage_gaps
      }
    ];

    domains
      .filter((domain) => domain.score < 80)
      .sort((a, b) => a.score - b.score)
      .forEach((domain) => {
        const candidate = domain.recommendations?.find((text) => text?.trim().length) ??
          domain.gaps?.find((text) => text?.trim().length);

        if (!candidate) return;

        const emphasis = domain.score < 40 ? 'Immediate stabilization needed.' : 'High-impact 30-day momentum builder.';
        addItem({
          title: candidate,
          category: `${domain.label} pillar`,
          context: `${emphasis} Current score: ${domain.score}/100.`,
          score: domain.score
        });
      });

    const addFromList = (list: (string | null)[] | null | undefined, category: string, context: string) => {
      if (!list) return;
      list
        .filter((item): item is string => !!item && item.trim().length > 0)
        .forEach((item) => addItem({ title: item, category, context, score: gapAnalysis.overall_score }));
    };

    if (items.length < 3) {
      addFromList(gapAnalysis.priority_actions, 'Cross-functional', 'Pulled directly from your priority action list.');
    }

    if (items.length < 3) {
      addFromList(gapAnalysis.quick_wins, 'Quick win', 'Flagged in your readiness results as a fast-start initiative.');
    }

    return items.slice(0, 4);
  }, [gapAnalysis]);

  const riskHotspots = useMemo(() => {
    if (!gapAnalysis?.risk_hotspots) return [] as RiskHotspot[];
    return [...gapAnalysis.risk_hotspots].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  }, [gapAnalysis]);

  const nistAlignment = useMemo(() => {
    if (!gapAnalysis?.nist_alignment) return [] as NistAlignmentInsight[];
    return [...gapAnalysis.nist_alignment];
  }, [gapAnalysis]);

  const loadDashboardData = useCallback(async () => {
    const supabase = createClient();
    try {
      console.log('🔄 Loading dashboard data...');
      console.log('⏰ Timestamp:', new Date().toISOString());

      let hasAssessmentRecord = false;

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
        .maybeSingle(); // Use maybeSingle to avoid 406 errors

      if (gapData && !gapError) {
        console.log('✅ Gap analysis loaded:', gapData);
        const riskHotspots = Array.isArray(gapData.risk_hotspots) && gapData.risk_hotspots.length > 0
          ? gapData.risk_hotspots as RiskHotspot[]
          : computeRiskHotspots(gapData as Partial<GapAnalysis>);

        const nistAlignment = Array.isArray(gapData.nist_alignment) && gapData.nist_alignment.length > 0
          ? gapData.nist_alignment as NistAlignmentInsight[]
          : computeNistAlignment(gapData as Partial<GapAnalysis>);

        setGapAnalysis({
          ...(gapData as GapAnalysis),
          risk_hotspots: riskHotspots,
          nist_alignment: nistAlignment
        });
        hasAssessmentRecord = true;
      } else {
        if (gapError) {
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
          .maybeSingle(); // Use maybeSingle to avoid 406 errors

        if (assessmentData && !assessmentError) {
          console.log('✅ Found assessment, converting to gap analysis format');
          // Convert assessment to gap analysis format
          const scores = assessmentData.scores;
          const fallbackBase: GapAnalysis = {
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
            risk_hotspots: [],
            nist_alignment: [],
            analysis_date: assessmentData.completed_at || new Date().toISOString()
          };

          setGapAnalysis({
            ...fallbackBase,
            risk_hotspots: computeRiskHotspots(fallbackBase),
            nist_alignment: computeNistAlignment(fallbackBase)
          });
          hasAssessmentRecord = true;
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

      // Load blueprints (limit to 3 for dashboard widget)
      const { data: blueprintData, error: blueprintError } = await supabase
        .from('blueprints')
        .select(`
          id,
          title,
          status,
          maturity_level,
          generated_at,
          blueprint_progress (
            overall_progress,
            is_on_track
          )
        `)
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(3);

      if (blueprintData && !blueprintError) {
        setBlueprints(blueprintData);
      } else if (blueprintError) {
        console.error('Error loading blueprints:', blueprintError);
      }

      // Set hasAssessment flag based on loaded gap analysis
      setHasAssessment(hasAssessmentRecord);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleOpenGoalWizard = async () => {
    setGoalWizardLoading(true);
    setGoalWizardAssessmentId(null);

    try {
      const response = await fetch('/api/assessment/latest');
      if (!response.ok) {
        throw new Error('Please complete the AI readiness assessment before planning goals.');
      }

      const data = await response.json();
      const assessmentId = data.assessment?.id;

      if (!assessmentId) {
        throw new Error('Please complete the AI readiness assessment before planning goals.');
      }

      setGoalWizardAssessmentId(assessmentId);
      setShowGoalWizard(true);
    } catch (error: any) {
      console.error('Error preparing goal wizard:', error);
      toast({
        title: 'Assessment required',
        description:
          error?.message ||
          'We could not find a recent assessment. Complete the readiness assessment to tailor your blueprint.',
        variant: 'destructive'
      });
    } finally {
      setGoalWizardLoading(false);
    }
  };

  const handleGoalWizardComplete = async (goalsId: string) => {
    if (!goalWizardAssessmentId) return;

    try {
      setGoalWizardLoading(true);
      const response = await fetch('/api/blueprint/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals_id: goalsId,
          assessment_id: goalWizardAssessmentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate blueprint from your goals.');
      }

      const data = await response.json();
      setShowGoalWizard(false);
      router.push(`/blueprint/${data.blueprint_id}`);
    } catch (error: any) {
      console.error('Error generating blueprint:', error);
      toast({
        title: 'Blueprint generation failed',
        description: error?.message || 'We could not generate the blueprint. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGoalWizardLoading(false);
    }
  };

  const handleCloseGoalWizard = () => {
    setShowGoalWizard(false);
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

  const handleDownloadReport = async () => {
    if (!gapAnalysis) return;

    try {
      console.log('📄 Generating assessment report...');

      // Generate report content as HTML
      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>AI Readiness Assessment Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
            h2 { color: #4f46e5; margin-top: 30px; }
            h3 { color: #6366f1; }
            .score { font-size: 48px; font-weight: bold; color: ${gapAnalysis.overall_score >= 60 ? '#059669' : '#dc2626'}; }
            .maturity { display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: bold; background: #eff6ff; color: #1e40af; }
            .section { margin: 20px 0; padding: 15px; border-left: 4px solid #4f46e5; background: #f9fafb; }
            .category { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
            .recommendation { padding: 8px; margin: 5px 0; background: #eff6ff; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #4f46e5; color: white; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>🎯 AI Readiness Assessment Report</h1>
          
          <div class="section">
            <h2>Executive Summary</h2>
            <p><strong>Overall Score:</strong> <span class="score">${gapAnalysis.overall_score}/100</span></p>
            <p><strong>Maturity Level:</strong> <span class="maturity">${gapAnalysis.maturity_level}</span></p>
            <p><strong>Assessment Date:</strong> ${new Date(gapAnalysis.analysis_date).toLocaleDateString()}</p>
            <p><strong>Framework:</strong> NIST AI Risk Management Framework</p>
          </div>

          <div class="section">
            <h2>NIST AI RMF Framework Scores</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Score</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🏛️ GOVERN</td>
                  <td>${gapAnalysis.govern_score}/100</td>
                  <td>${gapAnalysis.govern_score >= 60 ? 'Good' : 'Needs Improvement'}</td>
                </tr>
                <tr>
                  <td>🗺️ MAP</td>
                  <td>${gapAnalysis.map_score}/100</td>
                  <td>${gapAnalysis.map_score >= 60 ? 'Good' : 'Needs Improvement'}</td>
                </tr>
                <tr>
                  <td>📊 MEASURE</td>
                  <td>${gapAnalysis.measure_score}/100</td>
                  <td>${gapAnalysis.measure_score >= 60 ? 'Good' : 'Needs Improvement'}</td>
                </tr>
                <tr>
                  <td>⚙️ MANAGE</td>
                  <td>${gapAnalysis.manage_score}/100</td>
                  <td>${gapAnalysis.manage_score >= 60 ? 'Good' : 'Needs Improvement'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Recommendations by Category</h2>
            
            <div class="category">
              <h3>🏛️ GOVERN Recommendations</h3>
              ${gapAnalysis.govern_recommendations?.map(rec => `<div class="recommendation">${rec}</div>`).join('') || '<p>No recommendations available</p>'}
            </div>

            <div class="category">
              <h3>🗺️ MAP Recommendations</h3>
              ${gapAnalysis.map_recommendations?.map(rec => `<div class="recommendation">${rec}</div>`).join('') || '<p>No recommendations available</p>'}
            </div>

            <div class="category">
              <h3>📊 MEASURE Recommendations</h3>
              ${gapAnalysis.measure_recommendations?.map(rec => `<div class="recommendation">${rec}</div>`).join('') || '<p>No recommendations available</p>'}
            </div>

            <div class="category">
              <h3>⚙️ MANAGE Recommendations</h3>
              ${gapAnalysis.manage_recommendations?.map(rec => `<div class="recommendation">${rec}</div>`).join('') || '<p>No recommendations available</p>'}
            </div>
          </div>

          ${gapAnalysis.priority_actions && gapAnalysis.priority_actions.length > 0 ? `
          <div class="section">
            <h2>🎯 Priority Actions</h2>
            ${gapAnalysis.priority_actions.map((action, i) => `<div class="recommendation">${i + 1}. ${action}</div>`).join('')}
          </div>
          ` : ''}

          ${quickWinHighlights.length > 0 ? `
          <div class="section">
            <h2>⚡ Quick Momentum Plays</h2>
            ${quickWinHighlights
            .map((win, i) => `
                <div class="recommendation">
                  ${i + 1}. <strong>${win.category}:</strong> ${win.title}
                  <div style="font-size: 13px; color: #4b5563; margin-top: 4px;">
                    ${win.context.replace(/"/g, '&quot;')}
                  </div>
                </div>
              `)
            .join('')}
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated by AI Blueprint - Education AI Readiness Platform</p>
            <p>For more information, visit educationaiblueprint.com</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI-Readiness-Report-${new Date(gapAnalysis.analysis_date).toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Report downloaded successfully');
    } catch (error) {
      console.error('❌ Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
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
                      Answer 5 strategic questions about your institution&rsquo;s AI goals and challenges (5 minutes)
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

              {/* What You&rsquo;ll Get Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-lg mb-3">What You&rsquo;ll Receive:</h3>
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
                    We&rsquo;re analyzing your institution&rsquo;s current AI readiness. Complete the assessment and upload documents to unlock your personalized roadmap!
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
                  Ready to transform your institution&rsquo;s AI strategy? Let&rsquo;s get started!
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

        <Card className="mb-8 border border-dashed border-indigo-200 bg-white/80">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-indigo-100 p-3">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Goal-driven blueprint planning</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Capture institutional priorities, budgets, and departmental strategies to generate a tailored AI implementation blueprint.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-indigo-700">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1">
                      <Target className="h-3 w-3" />
                      Priorities
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1">
                      <Users className="h-3 w-3" />
                      Departments
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1">
                      <Calendar className="h-3 w-3" />
                      Timelines
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1">
                      <DollarSign className="h-3 w-3" />
                      Budgets
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
                <Button
                  onClick={handleOpenGoalWizard}
                  disabled={goalWizardLoading}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {goalWizardLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing wizard...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Launch goal wizard
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 md:text-right">
                  Tailor blueprints for Academic Affairs, IT, Student Services, and more.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <Button variant="outline" size="sm" className="mt-3" onClick={handleDownloadReport}>
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

        {/* AI Implementation Blueprints */}
        <BlueprintDashboardWidget
          blueprints={blueprints}
          hasAssessment={hasAssessment}
          loading={loading}
        />

        {/* Risk Mitigation Hotspots */}
        {riskHotspots.length > 0 && (
          <Card className="mb-8 border border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <ShieldAlert className="h-5 w-5" />
                Risk Mitigation Hotspots
              </CardTitle>
              <p className="text-sm text-red-800/80">
                High-leverage risk areas surfaced by your NIST AI RMF readiness assessment.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {riskHotspots.map((risk) => (
                  <li key={risk.id} className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-gray-900">
                          {risk.pillar} • {risk.riskStatement}
                        </p>
                        <p className="mt-2 text-sm text-gray-700">
                          {risk.recommendedMitigation}
                        </p>
                      </div>
                      <span className={`${SEVERITY_BADGE_CLASSES[risk.severity]} rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide`}>
                        {risk.severityLabel}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        Likelihood: <strong className="font-medium text-gray-800">{risk.likelihood}</strong>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        Impact: <strong className="font-medium text-gray-800">{risk.impact}</strong>
                      </span>
                      <span className="flex items-center gap-2">
                        <Scale className="h-3.5 w-3.5 text-indigo-500" />
                        {risk.nistReference}
                      </span>
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                        Score: <strong className="font-medium text-gray-800">{risk.score}/100</strong>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Quick Wins */}
        {quickWinHighlights.length > 0 && (
          <Card className="mb-8 border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Quick Momentum Plays
              </CardTitle>
              <p className="text-sm text-yellow-700/90">
                Prioritized 30-day actions pulled straight from your readiness assessment to build early wins.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {quickWinHighlights.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 rounded-lg bg-white/70 p-4 shadow-sm">
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{item.title}</span>
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          {item.category}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-wide text-yellow-700/80">
                          {item.score}/100 focus
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{item.context}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* NIST Gap Analysis */}
        {nistAlignment.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-indigo-600" />
                NIST Gap Analysis
              </CardTitle>
              <p className="text-sm text-gray-600">
                Where your practices align with, or diverge from, NIST AI RMF expectations—and how to course-correct.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {nistAlignment.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-2xl">
                      <p className="text-sm font-semibold text-gray-900">{item.function}</p>
                      <p className="mt-1 text-sm text-gray-600">{item.requirement}</p>
                    </div>
                    <span className={`${ALIGNMENT_BADGE_CLASSES[item.status]} rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide`}>
                      {item.statusLabel}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                    <Progress value={item.score} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-gray-800">{item.score}/100</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                    <p className="flex-1 min-w-[200px]">
                      {item.guidance}
                    </p>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {item.priority}
                    </span>
                  </div>
                </div>
              ))}
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

      <Dialog
        open={showGoalWizard}
        onOpenChange={(value) => {
          if (!value) {
            handleCloseGoalWizard();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan your AI implementation blueprint</DialogTitle>
          </DialogHeader>
          {goalWizardAssessmentId && !goalWizardLoading ? (
            <GoalSettingWizard
              assessmentId={goalWizardAssessmentId}
              onComplete={handleGoalWizardComplete}
              onCancel={handleCloseGoalWizard}
            />
          ) : (
            <div className="py-12 text-center text-sm text-gray-600">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-indigo-600" />
              Preparing your goal wizard...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
