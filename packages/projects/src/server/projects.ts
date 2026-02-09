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

// Helper to get Supabase client (public schema)
function getClient() {
  return getSupabaseClient()
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

  let query = getClient()
    .from('projects_projects')
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
    query = query.eq('time_tracking_enabled', filters.hasTimeTracking) // DB uses 'time_tracking_enabled'
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

  const client = getClient()

  // Get tasks for each project
  const { data: tasksData } = await client
    .from('projects_tasks')
    .select('project_id, completed_at, estimated_hours')
    .in('project_id', projectIds)
    .is('deleted_at', null)

  // Get members count for each project
  const { data: membersData } = await client
    .from('projects_project_members')
    .select('project_id')
    .in('project_id', projectIds)

  // Get time entries for each project
  const { data: timeData } = await client
    .from('projects_time_entries')
    .select('project_id, duration_minutes')
    .in('project_id', projectIds)

  // Calculate stats per project
  const taskStats: Record<string, { total: number; completed: number; estimatedMinutes: number }> = {}
  tasksData?.forEach((t: any) => {
    const pid = t.project_id
    if (!taskStats[pid]) {
      taskStats[pid] = { total: 0, completed: 0, estimatedMinutes: 0 }
    }
    taskStats[pid].total++
    if (t.completed_at) {
      taskStats[pid].completed++
    }
    if (t.estimated_hours) {
      taskStats[pid].estimatedMinutes += t.estimated_hours * 60
    }
  })

  const memberCounts: Record<string, number> = {}
  membersData?.forEach((m: any) => {
    memberCounts[m.project_id] = (memberCounts[m.project_id] || 0) + 1
  })

  const timeTotals: Record<string, number> = {}
  timeData?.forEach((t: any) => {
    const pid = t.project_id
    timeTotals[pid] = (timeTotals[pid] || 0) + (t.duration_minutes || 0)
  })

  return projectIds.map((projectId) => {
    const stats = taskStats[projectId] || { total: 0, completed: 0, estimatedMinutes: 0 }
    const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

    return {
      projectId,
      totalTasks: stats.total,
      completedTasks: stats.completed,
      progressPercentage,
      totalTimeMinutes: timeTotals[projectId] || 0,
      totalEstimatedMinutes: stats.estimatedMinutes,
      membersCount: memberCounts[projectId] || 0,
    }
  })
}

// ===========================================
// GET PROJECT BY ID
// ===========================================

export async function getProjectById(id: string): Promise<ProjectWithStats | null> {
  const { data, error } = await getClient()
    .from('projects_projects')
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
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    organization_id: organizationId,
    name: input.name,
    description: input.description,
    color: input.color || '#3B82F6',
    // Note: 'icon' and 'is_public' don't exist in DB schema
    status: input.status || 'active',
    start_date: input.startDate,
    end_date: input.endDate,
    budget: input.budgetAmount,
    currency: input.budgetCurrency || 'EUR',
    time_tracking_enabled: input.allowTimeTracking ?? true,
    deal_id: input.dealId,
    client_id: input.clientId,
    custom_fields: input.customFields || {},
    created_by: userId,
  }

  const { data, error } = await client
    .from('projects_projects')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memberData: any = {
    project_id: data.id,
    user_id: userId,
    role: 'owner',
    can_edit_project: true,
    can_manage_members: true,
    can_delete_tasks: true,
    invited_by: userId,
  }

  // Add creator as owner
  await client
    .from('projects_project_members')
    .insert(memberData)

  return mapProjectFromDb(data)
}

// ===========================================
// UPDATE PROJECT
// ===========================================

export async function updateProject(input: UpdateProjectInput): Promise<Project> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.color !== undefined) updateData.color = input.color
  if (input.icon !== undefined) updateData.icon = input.icon
  if (input.status !== undefined) updateData.status = input.status
  if (input.startDate !== undefined) updateData.start_date = input.startDate
  if (input.endDate !== undefined) updateData.end_date = input.endDate
  if (input.budgetAmount !== undefined) updateData.budget = input.budgetAmount // DB uses 'budget'
  if (input.budgetCurrency !== undefined) updateData.currency = input.budgetCurrency // DB uses 'currency'
  // Note: 'is_public' doesn't exist in DB schema
  if (input.allowTimeTracking !== undefined) updateData.time_tracking_enabled = input.allowTimeTracking // DB uses 'time_tracking_enabled'
  if (input.dealId !== undefined) updateData.deal_id = input.dealId
  if (input.clientId !== undefined) updateData.client_id = input.clientId
  if (input.customFields !== undefined) updateData.custom_fields = input.customFields

  const { data, error } = await getClient()
    .from('projects_projects')
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
  // Soft delete by setting archived_at
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { archived_at: new Date().toISOString() }
  const { error } = await getClient()
    .from('projects_projects')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProjectFromDb(data: any): Project {
  return {
    id: data['id'] as string,
    organizationId: data['organization_id'] as string,
    name: data['name'] as string,
    description: data['description'] as string | null,
    color: (data['color'] as string) || '#3B82F6',
    icon: 'folder', // Not in DB schema - using default
    status: data['status'] as Project['status'],
    startDate: data['start_date'] as string | null,
    endDate: data['end_date'] as string | null,
    budgetAmount: data['budget'] ? Number(data['budget']) : null,
    budgetCurrency: (data['currency'] as string) || 'EUR',
    isPublic: false, // Not in DB schema - using default
    allowTimeTracking: (data['time_tracking_enabled'] as boolean) ?? true,
    dealId: data['deal_id'] as string | null,
    clientId: data['client_id'] as string | null,
    customFields: (data['custom_fields'] as Record<string, unknown>) || {},
    createdBy: data['created_by'] as string | null,
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
    archivedAt: data['archived_at'] as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
