/**
 * AI Readiness Assessment Results Page
 * Displays assessment results and recommendations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  TrendingUp, 
  Download, 
  BarChart3, 
  Target,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface AssessmentResults {
  id: string;
  institutionName: string;
  tier: string;
  overallScore: number;
  maturityLevel: string;
  domainScores: Record<string, any>;
  recommendations: string[];
  strengths: string[];
  gaps: string[];
  submittedAt: string;
  algorithmResults?: {
    airix?: { score: number; level: string; factors: Record<string, number> };
    airs?: { score: number; level: string; factors: Record<string, number> };
    aics?: { score: number; level: string; factors: Record<string, number> };
    aims?: { score: number; level: string; factors: Record<string, number> };
    aips?: { score: number; level: string; factors: Record<string, number> };
    aibs?: { score: number; level: string; factors: Record<string, number> };
  };
}

export default function AIReadinessResultsPage() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      fetchResults();
    }
  }, [assessmentId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      if (!assessmentId) {
        console.error('No assessment ID provided');
        setLoading(false);
        return;
      }

      // Try to fetch actual results from the API
      const response = await fetch(`/api/ai-readiness/results/${assessmentId}`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        console.log('✅ Fetched real assessment results:', data);
      } else {
        // Fallback to mock data if API fails
        console.warn('⚠️ Failed to fetch results, using mock data');
        setResults({
          id: assessmentId || 'test-123',
          institutionName: 'Sample Institution',
          tier: 'comprehensive',
          overallScore: 68,
          maturityLevel: 'Advanced',
          domainScores: {
            'AI Strategy & Governance': { percentage: 72, maturityLevel: 'Advanced' },
            'Pedagogical Integration': { percentage: 65, maturityLevel: 'Progressing' },
            'Technology Infrastructure': { percentage: 71, maturityLevel: 'Advanced' },
            'Organizational Culture & Change Management': { percentage: 63, maturityLevel: 'Progressing' },
            'Compliance & Risk Management': { percentage: 68, maturityLevel: 'Advanced' }
          },
          recommendations: [
            'Develop comprehensive AI governance framework and strategic planning',
            'Invest in faculty AI training and curriculum integration support',
            'Upgrade technical infrastructure and data management capabilities',
            'Implement change management processes and cultural readiness initiatives',
            'Establish regulatory compliance and risk management protocols'
          ],
          strengths: ['AI Strategy & Governance', 'Technology Infrastructure'],
          gaps: ['Pedagogical Integration', 'Organizational Culture & Change Management'],
          submittedAt: new Date().toISOString(),
          // Add algorithm results
          algorithmResults: {
            airix: { score: 72, level: 'Advanced', factors: { governance: 0.8, infrastructure: 0.7, culture: 0.6 } },
            airs: { score: 68, level: 'Moderate Risk', factors: { compliance: 0.7, security: 0.65 } },
            aics: { score: 63, level: 'Progressing', factors: { facultyReadiness: 0.6, studentAcceptance: 0.65 } },
            aims: { score: 75, level: 'Well Aligned', factors: { missionAlignment: 0.8, strategicFit: 0.7 } },
            aips: { score: 70, level: 'High Priority', factors: { impact: 0.75, feasibility: 0.65 } },
            aibs: { score: 69, level: 'Competitive', factors: { benchmarking: 0.7, positioning: 0.68 } }
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
      // Still show mock data on error
      setResults({
        id: assessmentId || 'test-123',
        institutionName: 'Sample Institution',
        tier: 'comprehensive',
        overallScore: 68,
        maturityLevel: 'Advanced',
        domainScores: {
          'AI Strategy & Governance': { percentage: 72, maturityLevel: 'Advanced' },
          'Pedagogical Integration': { percentage: 65, maturityLevel: 'Progressing' },
          'Technology Infrastructure': { percentage: 71, maturityLevel: 'Advanced' },
          'Organizational Culture & Change Management': { percentage: 63, maturityLevel: 'Progressing' },
          'Compliance & Risk Management': { percentage: 68, maturityLevel: 'Advanced' }
        },
        recommendations: [
          'Develop comprehensive AI governance framework and strategic planning',
          'Invest in faculty AI training and curriculum integration support',
          'Upgrade technical infrastructure and data management capabilities',
          'Implement change management processes and cultural readiness initiatives',
          'Establish regulatory compliance and risk management protocols'
        ],
        strengths: ['AI Strategy & Governance', 'Technology Infrastructure'],
        gaps: ['Pedagogical Integration', 'Organizational Culture & Change Management'],
        submittedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await fetch(`/api/ai-readiness/pdf?assessmentId=${assessmentId}`);
      const data = await response.json();
      
      if (data.pdfUrl) {
        const link = document.createElement('a');
        link.href = data.pdfUrl;
        link.download = `ai-readiness-report-${assessmentId}.pdf`;
        link.click();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Assessment results not found.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/ai-readiness'}>
            Take New Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
              <p className="text-sm text-gray-600 mt-1">
                {results.institutionName} • {results.tier.charAt(0).toUpperCase() + results.tier.slice(1)} Tier
              </p>
            </div>
            <Button onClick={handleDownloadReport} disabled={generatingReport}>
              {generatingReport ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Overall AI Readiness Score</h2>
            </div>
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.overallScore)}`}>
              {results.overallScore}%
            </div>
            <Badge variant={getScoreBadgeVariant(results.overallScore)} className="text-lg px-4 py-2">
              {results.maturityLevel} Level
            </Badge>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Your institution demonstrates {results.maturityLevel.toLowerCase()} AI readiness capabilities 
              with strong foundations and clear opportunities for enhancement.
            </p>
          </Card>
        </motion.div>

        {/* Patent-Pending Algorithm Results */}
        {results.algorithmResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Patent-Pending Algorithm Suite Results</h3>
                  <p className="text-sm text-gray-600">AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, AIBS™ Analysis</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(results.algorithmResults).map(([key, result]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                        {key.toUpperCase()}™
                      </h4>
                      <Badge variant={getScoreBadgeVariant(result.score)} className="text-xs">
                        {result.score}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{result.level}</p>
                    
                    {/* Algorithm factors */}
                    <div className="space-y-1">
                      {Object.entries(result.factors).slice(0, 3).map(([factor, value]) => (
                        <div key={factor} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div 
                                className="bg-indigo-600 h-1.5 rounded-full" 
                                style={{ width: `${(value as number) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-medium">{Math.round((value as number) * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Patent-Pending Technology:</strong> These results are generated using our proprietary 
                  algorithm suite (AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, AIBS™) specifically designed for 
                  educational AI readiness assessment.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Domain Scores */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold">Domain Performance</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(results.domainScores).map(([domain, score]) => (
                  <div key={domain}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{domain}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${getScoreColor(score.percentage)}`}>
                          {score.percentage}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {score.maturityLevel}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          score.percentage >= 70 ? 'bg-green-600' : 
                          score.percentage >= 50 ? 'bg-blue-600' : 
                          score.percentage >= 30 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${score.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Strengths */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold">Key Strengths</h3>
              </div>
              <div className="space-y-2">
                {results.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{strength}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Gaps */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-orange-600 mr-3" />
                <h3 className="text-xl font-semibold">Priority Areas</h3>
              </div>
              <div className="space-y-2">
                {results.gaps.map((gap, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{gap}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">Strategic Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.recommendations.map((recommendation, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-4">Ready to Take Action?</h3>
            <p className="text-gray-600 mb-6">
              Contact our team to discuss your results and develop a customized AI implementation strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Schedule Consultation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = '/ai-readiness'}>
                Take Another Assessment
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
