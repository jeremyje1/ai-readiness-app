import { NextRequest, NextResponse } from 'next/server';
import { HigherEdAutonomousImplementationEngine, HigherEdInstitution } from '@/lib/highered-autonomous-implementation';
import { HigherEdDocumentGenerator } from '@/lib/highered-document-generator';

// In-memory storage for demo purposes
// In production, this would use a database
const implementations = new Map<string, HigherEdInstitution>();
const engine = new HigherEdAutonomousImplementationEngine();
const documentGenerator = new HigherEdDocumentGenerator();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get('institutionId');
  const action = searchParams.get('action');

  if (!institutionId) {
    return NextResponse.json({ error: 'Institution ID required' }, { status: 400 });
  }

  let institution = implementations.get(institutionId);

  // Removed auto-bootstrap of default populated institution to start blank until user submits onboarding
  if (!institution) {
    return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
  }

  switch (action) {
    case 'status':
      return NextResponse.json({
        institution,
        currentPhase: institution.currentPhase,
        overallProgress: institution.progressOverall,
        phases: institution.implementationPhases.map(phase => ({
          phaseNumber: phase.phaseNumber,
          name: phase.name,
          status: phase.status,
          progress: phase.progress,
          deliverables: phase.deliverables
        }))
      });

    case 'deliverables':
      const phaseNumber = searchParams.get('phase');
      if (phaseNumber) {
        const deliverables = await engine.getPhaseDeliverables(institutionId, parseInt(phaseNumber));
        return NextResponse.json({ deliverables });
      } else {
        const allDeliverables = await engine.getAllDeliverables(institutionId);
        return NextResponse.json({ deliverables: allDeliverables });
      }

    case 'dashboard':
      return NextResponse.json({
        institution,
        summary: {
          totalPhases: institution.implementationPhases.length,
          completedPhases: institution.implementationPhases.filter(p => p.status === 'completed').length,
          inProgressPhases: institution.implementationPhases.filter(p => p.status === 'in-progress').length,
          overallProgress: institution.progressOverall,
          estimatedCompletion: calculateEstimatedCompletion(institution),
          nextMilestone: getNextMilestone(institution)
        },
        phases: institution.implementationPhases,
        recentActivity: getRecentActivity(institution),
        upcomingTasks: getUpcomingTasks(institution)
      });

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, institutionData } = body;

  switch (action) {
    case 'start':
      if (!institutionData) {
        return NextResponse.json({ error: 'Institution data required' }, { status: 400 });
      }

      const newInstitution: HigherEdInstitution = {
        id: institutionData.id || generateInstitutionId(),
        name: institutionData.name || '',
        type: institutionData.type || '',
        size: institutionData.size || '',
        studentCount: institutionData.studentCount || 0,
        facultyCount: institutionData.facultyCount || 0,
        currentAIReadiness: institutionData.currentAIReadiness || 0,
        subscriptionTier: institutionData.subscriptionTier || 'professional',
        implementationPhases: [],
        currentPhase: 0,
        startDate: new Date(),
        progressOverall: 0
      };

      const startedInstitution = await engine.startImplementation(newInstitution);
      implementations.set(startedInstitution.id, startedInstitution);

      return NextResponse.json({
        success: true,
        institutionId: startedInstitution.id,
        institution: startedInstitution,
        message: 'Higher Education AI implementation started successfully'
      });

    case 'generate-document':
      const { institutionId, documentType } = body;
      
      if (!institutionId || !documentType) {
        return NextResponse.json({ error: 'Institution ID and document type required' }, { status: 400 });
      }

      const institution = implementations.get(institutionId);
      if (!institution) {
        return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
      }

      let document;
      try {
        switch (documentType) {
          case 'institutional-assessment':
            document = await documentGenerator.generateInstitutionalAssessmentReport(institution);
            break;
          case 'faculty-development':
            document = await documentGenerator.generateFacultyDevelopmentAssessment(institution);
            break;
          case 'department-analysis':
            document = await documentGenerator.generateAcademicDepartmentAnalysis(institution);
            break;
          case 'ai-strategy':
            document = await documentGenerator.generateAIStrategyDocument(institution);
            break;
          case 'ai-policies':
            document = await documentGenerator.generateAcademicAIPolicies(institution);
            break;
          case 'ferpa-compliance':
            document = await documentGenerator.generateFERPAComplianceFramework(institution);
            break;
          case 'budget-plan':
            document = await documentGenerator.generateBudgetPlan(institution);
            break;
          case 'faculty-training':
            document = await documentGenerator.generateFacultyTrainingCurriculum(institution);
            break;
          case 'integration-guide':
            document = await documentGenerator.generatePlatformIntegrationGuide(institution);
            break;
          case 'deployment-report':
            document = await documentGenerator.generateCampusDeploymentReport(institution);
            break;
          case 'research-enhancement':
            document = await documentGenerator.generateResearchEnhancementReport(institution);
            break;
          default:
            return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          document,
          message: `${documentType} generated successfully`
        });

      } catch (error) {
        console.error('Document generation error:', error);
        return NextResponse.json({ error: 'Document generation failed' }, { status: 500 });
      }

    case 'update-progress':
      const { institutionId: updateId, phaseNumber, taskId, status } = body;
      
      if (!updateId || !phaseNumber || !taskId || !status) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      const updateInstitution = implementations.get(updateId);
      if (!updateInstitution) {
        return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
      }

      // Update task status
      const phase = updateInstitution.implementationPhases[phaseNumber - 1];
      if (phase) {
        const task = phase.automatedTasks.find(t => t.id === taskId);
        if (task) {
          task.status = status;
          
          // Recalculate phase progress
          const totalTasks = phase.automatedTasks.length;
          const completedTasks = phase.automatedTasks.filter(t => t.status === 'completed').length;
          phase.progress = (completedTasks / totalTasks) * 100;

          // Update overall progress
          const totalPhases = updateInstitution.implementationPhases.length;
          const completedPhases = updateInstitution.implementationPhases.filter(p => p.status === 'completed').length;
          updateInstitution.progressOverall = (completedPhases / totalPhases) * 100;

          implementations.set(updateId, updateInstitution);
        }
      }

      return NextResponse.json({
        success: true,
        institution: updateInstitution,
        message: 'Progress updated successfully'
      });

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

// Helper functions
function generateInstitutionId(): string {
  return 'highered_' + Math.random().toString(36).substr(2, 9);
}

function calculateEstimatedCompletion(institution: HigherEdInstitution): Date {
  const startDate = institution.startDate;
  const estimatedDays = 150; // Total implementation period
  const completion = new Date(startDate);
  completion.setDate(completion.getDate() + estimatedDays);
  return completion;
}

function getNextMilestone(institution: HigherEdInstitution): { phase: string; milestone: string; date: Date } | null {
  const currentPhase = institution.implementationPhases[institution.currentPhase - 1];
  if (!currentPhase) return null;

  return {
    phase: currentPhase.name,
    milestone: currentPhase.deliverables[0] || 'Phase completion',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  };
}

function getRecentActivity(institution: HigherEdInstitution): Array<{ date: Date; activity: string; type: string }> {
  return [
    {
      date: new Date(),
      activity: 'Faculty readiness assessment completed',
      type: 'milestone'
    },
    {
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      activity: 'AI strategy document generated',
      type: 'document'
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      activity: 'Phase 1 assessment initiated',
      type: 'phase'
    }
  ];
}

function getUpcomingTasks(institution: HigherEdInstitution): Array<{ task: string; dueDate: Date; priority: string }> {
  return [
    {
      task: 'Complete institutional policy framework',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      task: 'Begin faculty training program',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'medium'
    },
    {
      task: 'Platform integration planning',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      priority: 'medium'
    }
  ];
}
