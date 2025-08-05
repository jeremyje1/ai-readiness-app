'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { Progress } from '@/components/progress';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  TrendingUp, 
  Users, 
  Download,
  Play,
  Calendar,
  AlertCircle,
  Shield,
  BookOpen,
  Monitor,
  Settings
} from 'lucide-react';

interface K12Implementation {
  id: string;
  schoolName: string;
  schoolType: 'elementary' | 'middle' | 'high' | 'k12_district';
  currentPhase: number;
  overallProgress: number;
  startDate: string;
  phases: Phase[];
  deliverables: Deliverable[];
  metrics: ImplementationMetrics;
}

interface Phase {
  phaseNumber: number;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  dayRange: string;
  activities: Activity[];
  deliverables: string[];
  estimatedCompletion?: string;
}

interface Activity {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'automated';
  type: 'assessment' | 'analysis' | 'training' | 'deployment' | 'monitoring';
  automationLevel: 'fully_automated' | 'ai_assisted' | 'manual';
  estimatedHours?: number;
}

interface Deliverable {
  id: string;
  name: string;
  type: 'pdf_report' | 'dashboard' | 'checklist' | 'template' | 'video' | 'presentation';
  phase: number;
  status: 'pending' | 'generating' | 'ready' | 'delivered';
  downloadUrl?: string;
  accessUrl?: string;
  generatedAt?: string;
}

interface ImplementationMetrics {
  teacherAdoption: { current: number; target: number };
  studentEngagement: { current: number; target: number };
  safetyCompliance: { current: number; target: number };
  satisfactionScore: { current: number; target: number };
}

export default function K12AutonomousDashboard() {
  const [implementation, setImplementation] = useState<K12Implementation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchImplementationData();
  }, []);

  const fetchImplementationData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in production this would fetch from the API
      const mockImplementation: K12Implementation = {
        id: 'impl-001',
        schoolName: 'Lincoln Elementary School',
        schoolType: 'elementary',
        currentPhase: 2,
        overallProgress: 35,
        startDate: '2025-01-15',
        phases: [
          {
            phaseNumber: 1,
            name: 'Assessment & Discovery',
            status: 'completed',
            progress: 100,
            dayRange: 'Days 1-14',
            activities: [
              { id: 'tech_audit', name: 'Technology Infrastructure Audit', status: 'completed', type: 'assessment', automationLevel: 'fully_automated' },
              { id: 'teacher_survey', name: 'Teacher Readiness Survey', status: 'completed', type: 'assessment', automationLevel: 'fully_automated' },
              { id: 'compliance_review', name: 'COPPA Compliance Review', status: 'completed', type: 'assessment', automationLevel: 'fully_automated' }
            ],
            deliverables: ['AI Readiness Report', 'Infrastructure Gap Analysis', 'Teacher Training Needs Assessment', 'Compliance Checklist']
          },
          {
            phaseNumber: 2,
            name: 'Strategic Planning',
            status: 'in-progress',
            progress: 75,
            dayRange: 'Days 15-28',
            activities: [
              { id: 'tool_selection', name: 'AI Tool Selection', status: 'completed', type: 'analysis', automationLevel: 'ai_assisted' },
              { id: 'roadmap_creation', name: 'Implementation Roadmap Creation', status: 'completed', type: 'analysis', automationLevel: 'ai_assisted' },
              { id: 'policy_development', name: 'AI Usage Policy Development', status: 'in-progress', type: 'analysis', automationLevel: 'ai_assisted' },
              { id: 'budget_planning', name: 'Budget & Resource Planning', status: 'pending', type: 'analysis', automationLevel: 'ai_assisted' }
            ],
            deliverables: ['Implementation Roadmap', 'AI Tool Recommendations', 'Budget & Resource Plan', 'AI Usage Policies'],
            estimatedCompletion: '2025-02-12'
          },
          {
            phaseNumber: 3,
            name: 'Infrastructure Setup',
            status: 'pending',
            progress: 0,
            dayRange: 'Days 29-42',
            activities: [
              { id: 'security_setup', name: 'Network Security Enhancement', status: 'pending', type: 'deployment', automationLevel: 'ai_assisted' },
              { id: 'platform_deployment', name: 'AI Platform Deployment', status: 'pending', type: 'deployment', automationLevel: 'ai_assisted' },
              { id: 'access_setup', name: 'User Account Setup', status: 'pending', type: 'deployment', automationLevel: 'fully_automated' },
              { id: 'privacy_controls', name: 'Privacy Controls Implementation', status: 'pending', type: 'deployment', automationLevel: 'ai_assisted' }
            ],
            deliverables: ['Configured AI Platforms', 'Security Implementation Report', 'User Access Management System', 'Privacy Controls Documentation']
          },
          {
            phaseNumber: 4,
            name: 'Teacher Training & Pilot',
            status: 'pending',
            progress: 0,
            dayRange: 'Days 43-70',
            activities: [
              { id: 'teacher_training', name: 'Teacher AI Literacy Training', status: 'pending', type: 'training', automationLevel: 'ai_assisted' },
              { id: 'workshops', name: 'Hands-on Tool Workshops', status: 'pending', type: 'training', automationLevel: 'ai_assisted' },
              { id: 'pilot_implementation', name: 'Pilot Classroom Implementation', status: 'pending', type: 'deployment', automationLevel: 'ai_assisted' },
              { id: 'safety_training', name: 'Student Safety Training', status: 'pending', type: 'training', automationLevel: 'ai_assisted' }
            ],
            deliverables: ['Training Materials & Resources', 'Pilot Implementation Results', 'Teacher Competency Assessments', 'Student Usage Guidelines']
          },
          {
            phaseNumber: 5,
            name: 'Full Deployment & Optimization',
            status: 'pending',
            progress: 0,
            dayRange: 'Days 71-90',
            activities: [
              { id: 'school_deployment', name: 'School-wide AI Tool Deployment', status: 'pending', type: 'deployment', automationLevel: 'ai_assisted' },
              { id: 'parent_communication', name: 'Parent and Community Communication', status: 'pending', type: 'monitoring', automationLevel: 'fully_automated' },
              { id: 'usage_monitoring', name: 'Usage Monitoring and Analytics', status: 'pending', type: 'monitoring', automationLevel: 'fully_automated' },
              { id: 'optimization', name: 'Continuous Improvement Planning', status: 'pending', type: 'analysis', automationLevel: 'ai_assisted' }
            ],
            deliverables: ['Deployment Success Report', 'Usage Analytics Dashboard', 'Parent Communication Materials', 'Ongoing Support Plan']
          }
        ],
        deliverables: [
          { id: 'del-001', name: 'AI Readiness Report', type: 'pdf_report', phase: 1, status: 'ready', downloadUrl: '/downloads/ai-readiness-report.pdf', generatedAt: '2025-01-29' },
          { id: 'del-002', name: 'Infrastructure Gap Analysis', type: 'pdf_report', phase: 1, status: 'ready', downloadUrl: '/downloads/infrastructure-gap-analysis.pdf', generatedAt: '2025-01-29' },
          { id: 'del-003', name: 'Teacher Training Needs Assessment', type: 'pdf_report', phase: 1, status: 'ready', downloadUrl: '/downloads/teacher-needs-assessment.pdf', generatedAt: '2025-01-29' },
          { id: 'del-004', name: 'COPPA Compliance Checklist', type: 'checklist', phase: 1, status: 'ready', downloadUrl: '/downloads/compliance-checklist.pdf', generatedAt: '2025-01-29' },
          { id: 'del-005', name: 'Implementation Roadmap', type: 'pdf_report', phase: 2, status: 'ready', downloadUrl: '/downloads/implementation-roadmap.pdf', generatedAt: '2025-02-05' },
          { id: 'del-006', name: 'AI Tool Recommendations', type: 'pdf_report', phase: 2, status: 'ready', downloadUrl: '/downloads/ai-tool-recommendations.pdf', generatedAt: '2025-02-05' },
          { id: 'del-007', name: 'AI Usage Policies', type: 'pdf_report', phase: 2, status: 'generating', downloadUrl: undefined },
          { id: 'del-008', name: 'Budget & Resource Plan', type: 'pdf_report', phase: 2, status: 'pending', downloadUrl: undefined }
        ],
        metrics: {
          teacherAdoption: { current: 15, target: 85 },
          studentEngagement: { current: 5, target: 25 },
          safetyCompliance: { current: 85, target: 100 },
          satisfactionScore: { current: 0, target: 4.5 }
        }
      };
      
      setImplementation(mockImplementation);
    } catch (error) {
      console.error('Failed to fetch implementation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNextPhase = async () => {
    if (!implementation) return;
    
    try {
      const response = await fetch('/api/k12-implementation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_phase',
          schoolId: implementation.id,
          phaseNumber: implementation.currentPhase + 1
        })
      });
      
      if (response.ok) {
        fetchImplementationData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to start next phase:', error);
    }
  };

  const downloadDeliverable = (deliverable: Deliverable) => {
    if (deliverable.downloadUrl) {
      const link = document.createElement('a');
      link.href = deliverable.downloadUrl;
      link.download = deliverable.name;
      link.click();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'generating':
        return <Settings className="h-5 w-5 text-purple-600 animate-spin" />;
      case 'automated':
        return <Monitor className="h-5 w-5 text-indigo-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'assessment':
        return <FileText className="h-4 w-4" />;
      case 'training':
        return <BookOpen className="h-4 w-4" />;
      case 'deployment':
        return <Monitor className="h-4 w-4" />;
      case 'monitoring':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!implementation) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">No Implementation Found</h3>
        <p className="text-gray-600">Start your K12 AI implementation to see progress here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{implementation.schoolName}</h1>
            <p className="text-pink-100 mb-4">K12 AI Implementation Dashboard</p>
            <div className="flex items-center space-x-4">
              <Badge className="bg-white text-purple-600">
                Phase {implementation.currentPhase}: {implementation.phases[implementation.currentPhase - 1]?.name}
              </Badge>
              <Badge className="bg-purple-700 text-white">
                {implementation.schoolType.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{implementation.overallProgress}%</div>
            <div className="text-pink-100">Overall Progress</div>
            <div className="mt-2">
              <Progress value={implementation.overallProgress} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'phases', 'deliverables', 'metrics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Phase */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Current Phase Progress</h3>
              {implementation.phases[implementation.currentPhase - 1] && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                      Phase {implementation.currentPhase}: {implementation.phases[implementation.currentPhase - 1].name}
                    </h4>
                    <Badge variant={implementation.phases[implementation.currentPhase - 1].status === 'completed' ? 'default' : 'secondary'}>
                      {implementation.phases[implementation.currentPhase - 1].status}
                    </Badge>
                  </div>
                  <Progress value={implementation.phases[implementation.currentPhase - 1].progress} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {implementation.phases[implementation.currentPhase - 1].activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getActivityTypeIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(activity.status)}
                            <span className="text-xs text-gray-500 capitalize">{activity.status}</span>
                            {activity.automationLevel === 'fully_automated' && (
                              <Badge variant="outline" className="text-xs">Automated</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {implementation.phases[implementation.currentPhase - 1].status === 'completed' && implementation.currentPhase < 5 && (
                    <Button onClick={startNextPhase} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Next Phase
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Implementation Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phases Completed</span>
                  <span className="font-medium">{implementation.phases.filter(p => p.status === 'completed').length}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deliverables Ready</span>
                  <span className="font-medium">{implementation.deliverables.filter(d => d.status === 'ready').length}/{implementation.deliverables.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days Elapsed</span>
                  <span className="font-medium">{Math.ceil((new Date().getTime() - new Date(implementation.startDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3">Autonomous Features</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Auto Document Generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">AI-Powered Assessments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Real-time Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Automated Reporting</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Phases Tab */}
      {activeTab === 'phases' && (
        <div className="space-y-6">
          {implementation.phases.map((phase) => (
            <Card key={phase.phaseNumber} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    phase.status === 'completed' ? 'bg-green-600' :
                    phase.status === 'in-progress' ? 'bg-blue-600' : 'bg-gray-400'
                  }`}>
                    {phase.phaseNumber}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{phase.name}</h3>
                    <p className="text-gray-600">{phase.dayRange}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'}>
                    {phase.status}
                  </Badge>
                  <div className="mt-2">
                    <Progress value={phase.progress} className="w-24" />
                    <span className="text-sm text-gray-500">{phase.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Activities</h4>
                  <div className="space-y-2">
                    {phase.activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                        {getActivityTypeIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.name}</p>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(activity.status)}
                            <span className="text-xs text-gray-500 capitalize">{activity.status}</span>
                            <Badge variant="outline" className="text-xs">
                              {activity.automationLevel.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Deliverables</h4>
                  <div className="space-y-2">
                    {phase.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {phase.estimatedCompletion && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Estimated completion: {phase.estimatedCompletion}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Deliverables Tab */}
      {activeTab === 'deliverables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {implementation.deliverables.map((deliverable) => (
            <Card key={deliverable.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{deliverable.name}</h4>
                    <p className="text-xs text-gray-500">Phase {deliverable.phase}</p>
                  </div>
                </div>
                {getStatusIcon(deliverable.status)}
              </div>

              <div className="mb-3">
                <Badge variant={deliverable.status === 'ready' ? 'default' : 'secondary'} className="text-xs">
                  {deliverable.status}
                </Badge>
                <Badge variant="outline" className="text-xs ml-2">
                  {deliverable.type.replace('_', ' ')}
                </Badge>
              </div>

              {deliverable.generatedAt && (
                <p className="text-xs text-gray-500 mb-3">
                  Generated: {new Date(deliverable.generatedAt).toLocaleDateString()}
                </p>
              )}

              {deliverable.status === 'ready' && deliverable.downloadUrl && (
                <Button 
                  onClick={() => downloadDeliverable(deliverable)}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}

              {deliverable.status === 'generating' && (
                <div className="flex items-center justify-center py-2">
                  <Settings className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-600">Generating...</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(implementation.metrics).map(([key, metric]) => (
            <Card key={key} className="p-6">
              <h3 className="font-semibold mb-4 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <div className="flex items-end space-x-4 mb-4">
                <div className="text-3xl font-bold text-blue-600">
                  {key === 'satisfactionScore' ? metric.current.toFixed(1) : metric.current}
                  {key !== 'satisfactionScore' && '%'}
                </div>
                <div className="text-sm text-gray-500">
                  Target: {key === 'satisfactionScore' ? metric.target.toFixed(1) : metric.target}
                  {key !== 'satisfactionScore' && '%'}
                </div>
              </div>
              <Progress 
                value={key === 'satisfactionScore' ? (metric.current / metric.target) * 100 : (metric.current / metric.target) * 100} 
                className="mb-2"
              />
              <p className="text-xs text-gray-500">
                {Math.round((metric.current / metric.target) * 100)}% of target achieved
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
