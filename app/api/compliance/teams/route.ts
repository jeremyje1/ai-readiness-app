/**
 * Compliance Teams API
 * Manages team structure and member assignments
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    const audience = searchParams.get('audience')

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 }
      )
    }

    // Get teams with members and their workloads
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members!inner (
          *,
          users:user_id (
            id,
            email
          )
        )
      `)
      .eq('org_id', orgId)
      .eq('team_members.is_active', true)

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to match frontend interface
    const teamMembers = teams?.flatMap(team => 
      team.team_members.map(member => ({
        id: member.id,
        name: member.users?.email?.split('@')[0] || 'Unknown User',
        email: member.users?.email || 'unknown@example.com',
        department: member.department || getDepartmentByRole(member.role),
        role: getRoleDisplayName(member.role),
        workload: member.current_workload || 0,
        workloadCapacity: member.workload_capacity || 15,
        avatar: `/avatars/${member.users?.email?.charAt(0).toLowerCase() || 'u'}.jpg`,
        teamId: team.id,
        teamName: team.name,
        permissions: member.permissions || { view: true }
      }))
    ) || []

    return NextResponse.json({
      success: true,
      data: {
        teams: teams || [],
        members: teamMembers
      }
    })

  } catch (error) {
    console.error('Error in teams API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orgId, teamData, members } = body

    if (!orgId || !teamData) {
      return NextResponse.json(
        { error: 'orgId and teamData are required' },
        { status: 400 }
      )
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        org_id: orgId,
        name: teamData.name,
        audience: teamData.audience,
        description: teamData.description
      })
      .select()
      .single()

    if (teamError) {
      console.error('Error creating team:', teamError)
      return NextResponse.json({ error: teamError.message }, { status: 500 })
    }

    // Add team members if provided
    if (members && members.length > 0) {
      const teamMembers = members.map((member: any) => ({
        team_id: team.id,
        user_id: member.userId,
        role: member.role,
        department: member.department,
        workload_capacity: member.workloadCapacity || 15,
        permissions: member.permissions || getDefaultPermissions(member.role)
      }))

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(teamMembers)

      if (membersError) {
        console.error('Error adding team members:', membersError)
        // Clean up team if member addition fails
        await supabase.from('teams').delete().eq('id', team.id)
        return NextResponse.json({ error: membersError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      data: team
    })

  } catch (error) {
    console.error('Error in teams POST API:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}

/**
 * Calculate workload based on user-provided formula
 */
export async function POST_workload_calculation(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, orgId } = body

    // Get user's current assignments
    const { data: assignments, error } = await supabase
      .from('compliance_tracking')
      .select(`
        *,
        framework_controls (complexity_weight),
        compliance_findings!inner (severity)
      `)
      .eq('assigned_to', userId)
      .eq('org_id', orgId)
      .not('status', 'in', '(completed,cancelled)')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Implement workload formula from user requirements:
    // workload_hours = (num_controls_assigned * control_complexity_weight) + 
    //                  (num_policies_mapped * policy_complexity_weight) + 
    //                  (num_open_findings * finding_severity_weight) + 
    //                  (evidence_items_due_soon * rush_weight)

    const weights = {
      control_complexity_weight: 1.0,
      policy_complexity_weight: 0.5,
      finding_severity_weight: { low: 0.5, medium: 1.0, high: 2.0, critical: 2.0 },
      rush_weight: 1.5 // for items due within 30 days
    }

    let workloadHours = 0

    // Calculate workload for each assignment
    assignments?.forEach(assignment => {
      const complexityWeight = assignment.framework_controls?.complexity_weight || 1.0
      
      // Base control assignment weight
      workloadHours += complexityWeight * weights.control_complexity_weight
      
      // Add findings weight
      const findings = assignment.compliance_findings || []
      findings.forEach((finding: any) => {
        const severityWeight = weights.finding_severity_weight[finding.severity] || 1.0
        workloadHours += severityWeight
      })
      
      // Add rush weight for items due within 30 days
      const daysUntilDue = Math.ceil(
        (new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilDue <= 30 && daysUntilDue >= 0) {
        workloadHours += weights.rush_weight
      }
    })

    // Update team member workload
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ 
        current_workload: Math.round(workloadHours),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating workload:', updateError)
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        calculatedWorkload: Math.round(workloadHours),
        assignmentCount: assignments?.length || 0
      }
    })

  } catch (error) {
    console.error('Error calculating workload:', error)
    return NextResponse.json(
      { error: 'Failed to calculate workload' },
      { status: 500 }
    )
  }
}

/**
 * Helper functions
 */
function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': 'Compliance Officer',
    'manager': 'Compliance Manager', 
    'contributor': 'Department Coordinator',
    'reviewer': 'Legal/Privacy Officer',
    'viewer': 'Viewer'
  }
  return roleMap[role] || 'Team Member'
}

function getDepartmentByRole(role: string): string {
  const deptMap: Record<string, string> = {
    'admin': 'Legal & Compliance',
    'manager': 'Academic Affairs',
    'contributor': 'Department',
    'reviewer': 'Legal/Privacy',
    'viewer': 'General'
  }
  return deptMap[role] || 'General'
}

function getDefaultPermissions(role: string): Record<string, boolean> {
  const permissionMap: Record<string, Record<string, boolean>> = {
    'admin': { view: true, edit: true, approve: true, assign: true, manage_users: true, manage_frameworks: true },
    'manager': { view: true, edit: true, approve: true, assign: true, manage_frameworks: true },
    'contributor': { view: true, edit: true },
    'reviewer': { view: true, approve_comments: true },
    'viewer': { view: true }
  }
  return permissionMap[role] || { view: true }
}