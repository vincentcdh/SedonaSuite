// ===========================================
// PROJECT SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Project,
  ProjectWithStats,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

function getProjectsClient() {
  return getSupabaseClient().schema('projects' as any) as any
}

// ===========================================
// GET PROJECTS
// ===========================================

export async function getProjects(
  organizationId: string,
  filters: ProjectFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<ProjectWithStats>> {
  const { page = 1, pageSize = 20, sortBy = 'name', sortOrder = 'asc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getProjectsClient()
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('archived_at', null)

  // Apply filters
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.hasTimeTracking !== undefined) {
    query = query.eq('allow_time_tracking', filters.hasTimeTracking)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get stats for each project
  const projectIds = (data || []).map((p: any) => p.id)
  const stats = await getProjectsStats(projectIds)

  const projectsWithStats = (data || []).map((p: any) => {
    const projectStats = stats.find((s: any) => s.projectId === p.id)
    return {
      ...mapProjectFromDb(p),
      totalTasks: projectStats?.totalTasks || 0,
      completedTasks: projectStats?.completedTasks || 0,
      progressPercentage: projectStats?.progressPercentage || 0,
      totalTimeMinutes: projectStats?.totalTimeMinutes || 0,
      totalEstimatedMinutes: projectStats?.totalEstimatedMinutes || 0,
      membersCount: projectStats?.membersCount || 0,
    }
  })

  return {
    data: projectsWithStats,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

async function getProjectsStats(projectIds: string[]) {
  if (projectIds.length === 0) return []

  const { data: progressData } = await getProjectsClient()
    .from('project_progress')
    .select('*')
    .in('project_id', projectIds)

  const { data: membersData } = await getProjectsClient()
    .from('project_members')
    .select('project_id')
    .in('project_id', projectIds)

  const memberCounts: Record<string, number> = {}
  membersData?.forEach((m: any) => {
    memberCounts[m.project_id] = (memberCounts[m.project_id] || 0) + 1
  })

  return (progressData || []).map((p: any) => ({
    projectId: p.project_id,
    totalTasks: p.total_tasks,
    completedTasks: p.completed_tasks,
    progressPercentage: Number(p.progress_percentage),
    totalTimeMinutes: Number(p.total_time_minutes),
    totalEstimatedMinutes: Number(p.total_estimated_minutes),
    membersCount: memberCounts[p.project_id] || 0,
  }))
}

// ===========================================
// GET PROJECT BY ID
// ===========================================

export async function getProjectById(id: string): Promise<ProjectWithStats | null> {
  const { data, error } = await getProjectsClient()
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const stats = await getProjectsStats([id])
  const projectStats = stats[0]

  return {
    ...mapProjectFromDb(data),
    totalTasks: projectStats?.totalTasks || 0,
    completedTasks: projectStats?.completedTasks || 0,
    progressPercentage: projectStats?.progressPercentage || 0,
    totalTimeMinutes: projectStats?.totalTimeMinutes || 0,
    totalEstimatedMinutes: projectStats?.totalEstimatedMinutes || 0,
    membersCount: projectStats?.membersCount || 0,
  }
}

// ===========================================
// CREATE PROJECT
// ===========================================

export async function createProject(
  organizationId: string,
  input: CreateProjectInput,
  userId: string
): Promise<Project> {
  const { data, error } = await getProjectsClient()
    .from('projects')
    .insert({
      organization_id: organizationId,
      name: input.name,
      description: input.description,
      color: input.color || '#3B82F6',
      icon: input.icon || 'folder',
      status: input.status || 'active',
      start_date: input.startDate,
      end_date: input.endDate,
      budget_amount: input.budgetAmount,
      budget_currency: input.budgetCurrency || 'EUR',
      is_public: input.isPublic ?? false,
      allow_time_tracking: input.allowTimeTracking ?? true,
      deal_id: input.dealId,
      client_id: input.clientId,
      custom_fields: input.customFields || {},
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  // Add creator as owner
  await getProjectsClient()
    .from('project_members')
    .insert({
      project_id: data.id,
      user_id: userId,
      role: 'owner',
      can_edit_project: true,
      can_manage_members: true,
      can_delete_tasks: true,
      invited_by: userId,
    })

  return mapProjectFromDb(data)
}

// ===========================================
// UPDATE PROJECT
// ===========================================

export async function updateProject(input: UpdateProjectInput): Promise<Project> {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.color !== undefined) updateData.color = input.color
  if (input.icon !== undefined) updateData.icon = input.icon
  if (input.status !== undefined) updateData.status = input.status
  if (input.startDate !== undefined) updateData.start_date = input.startDate
  if (input.endDate !== undefined) updateData.end_date = input.endDate
  if (input.budgetAmount !== undefined) updateData.budget_amount = input.budgetAmount
  if (input.budgetCurrency !== undefined) updateData.budget_currency = input.budgetCurrency
  if (input.isPublic !== undefined) updateData.is_public = input.isPublic
  if (input.allowTimeTracking !== undefined) updateData.allow_time_tracking = input.allowTimeTracking
  if (input.dealId !== undefined) updateData.deal_id = input.dealId
  if (input.clientId !== undefined) updateData.client_id = input.clientId
  if (input.customFields !== undefined) updateData.custom_fields = input.customFields

  const { data, error } = await getProjectsClient()
    .from('projects')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapProjectFromDb(data)
}

// ===========================================
// DELETE PROJECT (archive)
// ===========================================

export async function deleteProject(id: string): Promise<void> {
  const { error } = await getProjectsClient()
    .from('projects')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// HELPERS
// ===========================================

function mapProjectFromDb(data: Record<string, unknown>): Project {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    description: data.description as string | null,
    color: (data.color as string) || '#3B82F6',
    icon: (data.icon as string) || 'folder',
    status: data.status as Project['status'],
    startDate: data.start_date as string | null,
    endDate: data.end_date as string | null,
    budgetAmount: data.budget_amount ? Number(data.budget_amount) : null,
    budgetCurrency: (data.budget_currency as string) || 'EUR',
    isPublic: (data.is_public as boolean) || false,
    allowTimeTracking: (data.allow_time_tracking as boolean) ?? true,
    dealId: data.deal_id as string | null,
    clientId: data.client_id as string | null,
    customFields: (data.custom_fields as Record<string, unknown>) || {},
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    archivedAt: data.archived_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
