/**
 * Compliance Data Hooks
 * Custom hooks for fetching real compliance data instead of mock data
 */

import { useState, useEffect } from 'react'
import { useUserContext } from '@/components/UserProvider'
import { useAudience } from '@/lib/audience/AudienceContext'

export interface ComplianceItem {
  id: string
  type: 'policy' | 'vendor' | 'training' | 'certification' | 'audit' | 'legal'
  title: string
  description: string
  status: 'pending' | 'flagged' | 'expired' | 'overdue' | 'review_needed' | 'completed' | 'in_progress'
  priority: 'critical' | 'high' | 'medium' | 'low'
  dueDate: string
  assignedTo: string
  department: string
  lastAction: string
  nextAction: string
  daysUntilDue: number
  completionPercentage?: number
  riskLevel: 'low' | 'medium' | 'high'
  impactArea: string[]
  regulatoryFramework: string[]
  documentLinks?: string[]
  notes?: string
  createdDate: string
  updatedDate: string
  
  // Extended properties for enhanced functionality
  frameworkCode?: string
  complexityWeight?: number
  evidenceCount?: number
  findingsCount?: number
  hasExpiredEvidence?: boolean
  highSeverityFindings?: number
  teamAssignment?: {
    primaryAssignee: TeamMember
    collaborators?: TeamMember[]
    reviewers?: TeamMember[]
  }
}

export interface TeamMember {
  id: string
  name: string
  email: string
  department: string
  role: string
  workload: number
  workloadCapacity: number
  avatar?: string
  teamId?: string
  teamName?: string
  permissions?: Record<string, boolean>
}

export interface ComplianceMetrics {
  totalItems: number
  overdue: number
  dueSoon: number
  inProgress: number
  completed: number
  complianceScore: number
  highRiskItems: number
  criticalItems: number
}

export interface ComplianceFilters {
  status?: string
  priority?: string
  riskLevel?: string
  assignedTo?: string
  department?: string
}

/**
 * Hook to fetch compliance items with real data
 */
export function useComplianceItems(filters?: ComplianceFilters) {
  const [items, setItems] = useState<ComplianceItem[]>([])
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { institution } = useUserContext()
  const { audience } = useAudience()

  useEffect(() => {
    async function fetchComplianceData() {
      if (!institution?.id || !audience) return

      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          orgId: institution.id,
          audience: audience === 'k12' ? 'k12' : 'highered'
        })

        // Add filters to params
        if (filters?.status) params.append('status', filters.status)
        if (filters?.priority) params.append('priority', filters.priority)
        if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel)
        if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)
        if (filters?.department) params.append('department', filters.department)

        const response = await fetch(`/api/compliance/status?${params}`)
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch compliance data')
        }

        setItems(data.data.items)
        setMetrics(data.data.metrics)

      } catch (err) {
        console.error('Error fetching compliance data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load compliance data')
        
        // Fall back to empty arrays instead of mock data
        setItems([])
        setMetrics({
          totalItems: 0,
          overdue: 0,
          dueSoon: 0,
          inProgress: 0,
          completed: 0,
          complianceScore: 0,
          highRiskItems: 0,
          criticalItems: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchComplianceData()
  }, [institution?.id, audience, filters])

  return { items, metrics, loading, error, refetch: () => {
    if (institution?.id && audience) {
      // Re-trigger the effect
      setLoading(true)
    }
  }}
}

/**
 * Hook to fetch team members with real data
 */
export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { institution } = useUserContext()
  const { audience } = useAudience()

  useEffect(() => {
    async function fetchTeamData() {
      if (!institution?.id || !audience) return

      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          orgId: institution.id,
          audience: audience === 'k12' ? 'k12' : 'highered'
        })

        const response = await fetch(`/api/compliance/teams?${params}`)
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch team data')
        }

        setMembers(data.data.members)

      } catch (err) {
        console.error('Error fetching team data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load team data')
        
        // Fall back to basic team structure
        setMembers(generateFallbackTeamMembers(audience === 'k12'))
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [institution?.id, audience])

  return { members, loading, error }
}

/**
 * Hook for compliance item actions
 */
export function useComplianceActions() {
  const { institution } = useUserContext()

  const updateItemStatus = async (itemId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/compliance/tracking/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes,
          updated_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating item status:', error)
      throw error
    }
  }

  const assignToTeamMember = async (itemId: string, memberId: string) => {
    try {
      const response = await fetch(`/api/compliance/tracking/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_to: memberId,
          updated_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to assign item')
      }

      // Recalculate workload for the assigned member
      await fetch(`/api/compliance/teams/workload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: memberId,
          orgId: institution?.id
        })
      })

      return await response.json()
    } catch (error) {
      console.error('Error assigning item:', error)
      throw error
    }
  }

  const bulkUpdateItems = async (itemIds: string[], updates: Partial<ComplianceItem>) => {
    try {
      const promises = itemIds.map(id => 
        fetch(`/api/compliance/tracking/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
      )

      const responses = await Promise.all(promises)
      
      // Check if all requests succeeded
      const failed = responses.filter(r => !r.ok)
      if (failed.length > 0) {
        throw new Error(`${failed.length} updates failed`)
      }

      return { success: true, updated: itemIds.length }
    } catch (error) {
      console.error('Error bulk updating items:', error)
      throw error
    }
  }

  return {
    updateItemStatus,
    assignToTeamMember,
    bulkUpdateItems
  }
}

/**
 * Fallback team members for when API fails
 * Based on user specifications for role-based model
 */
function generateFallbackTeamMembers(isK12: boolean): TeamMember[] {
  const baseRoles = [
    {
      id: 'tm001',
      name: 'Compliance Officer',
      email: 'compliance@institution.edu',
      department: isK12 ? 'Superintendent\'s Office' : 'Provost\'s Office',
      role: 'Compliance Owner',
      workload: 8,
      workloadCapacity: 15
    },
    {
      id: 'tm002',
      name: 'IT Security Officer',
      email: 'security@institution.edu', 
      department: 'IT Security',
      role: 'Security Lead',
      workload: 12,
      workloadCapacity: 15
    },
    {
      id: 'tm003',
      name: 'Legal Officer',
      email: 'legal@institution.edu',
      department: 'Legal/Privacy',
      role: 'Legal Counsel',
      workload: 6,
      workloadCapacity: 12
    },
    {
      id: 'tm004',
      name: isK12 ? 'Instructional Leader' : 'Faculty Representative',
      email: 'academic@institution.edu',
      department: isK12 ? 'Instruction' : 'Faculty Senate',
      role: isK12 ? 'Instructional Leader' : 'Faculty Representative',
      workload: 4,
      workloadCapacity: 10
    },
    {
      id: 'tm005',
      name: isK12 ? 'Accountability Lead' : 'IR/IE Analyst',
      email: 'research@institution.edu',
      department: isK12 ? 'Accountability' : 'Institutional Research',
      role: isK12 ? 'Accountability Lead' : 'IR/IE Analyst',
      workload: 5,
      workloadCapacity: 12
    }
  ]

  return baseRoles.map(role => ({
    ...role,
    avatar: `/avatars/${role.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    permissions: {
      view: true,
      edit: role.role.includes('Officer') || role.role.includes('Owner'),
      approve: role.role.includes('Officer') || role.role.includes('Legal'),
      assign: role.role.includes('Owner') || role.role.includes('Officer')
    }
  }))
}