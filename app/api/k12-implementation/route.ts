import { NextRequest, NextResponse } from 'next/server';
import { K12AutonomousImplementationEngine, K12School } from '@/lib/k12-autonomous-implementation';

const implementationEngine = new K12AutonomousImplementationEngine();

export async function POST(request: NextRequest) {
  try {
    const { action, schoolData, schoolId, phaseNumber } = await request.json();

    switch (action) {
      case 'start_implementation':
        if (!schoolData) {
          return NextResponse.json({ error: 'School data required' }, { status: 400 });
        }

        const school = await implementationEngine.startImplementation(schoolData as K12School);
        
        return NextResponse.json({
          success: true,
          school,
          message: 'Autonomous implementation started successfully'
        });

      case 'start_phase':
        if (!schoolId || !phaseNumber) {
          return NextResponse.json({ error: 'School ID and phase number required' }, { status: 400 });
        }

        // Get school implementation status
        const schoolStatus = await implementationEngine.getImplementationStatus(schoolId);
        if (!schoolStatus) {
          return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        await implementationEngine.startPhase(schoolStatus, phaseNumber);

        return NextResponse.json({
          success: true,
          message: `Phase ${phaseNumber} started successfully`
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Implementation API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process implementation request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const schoolId = searchParams.get('schoolId');
    const phaseNumber = searchParams.get('phaseNumber');

    switch (action) {
      case 'status':
        if (!schoolId) {
          return NextResponse.json({ error: 'School ID required' }, { status: 400 });
        }

        const status = await implementationEngine.getImplementationStatus(schoolId);
        if (!status) {
          return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, status });

      case 'deliverables':
        if (!schoolId) {
          return NextResponse.json({ error: 'School ID required' }, { status: 400 });
        }

        let deliverables;
        if (phaseNumber) {
          deliverables = await implementationEngine.getPhaseDeliverables(schoolId, parseInt(phaseNumber));
        } else {
          deliverables = await implementationEngine.getAllDeliverables(schoolId);
        }

        return NextResponse.json({ success: true, deliverables });

      case 'phases':
        // Return the standard phase template
        const phases = new K12AutonomousImplementationEngine()['phases'];
        return NextResponse.json({ success: true, phases });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Implementation API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch implementation data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
