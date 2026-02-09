import { getSupabaseClient } from '@sedona/database'
import type {
  Activity,
  CreateActivityInput,
  UpdateActivityInput,
  ActivityFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// ACTIVITIES SERVER FUNCTIONS
// ===========================================

// Helper to get Supabase client (public schema)
function getClient() {
  return getSupabaseClient()
}

/**
 * Get paginated activities for an organization
 */
export async function getActivities(
  organizationId: string,
  filters: ActivityFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Activity>> {
  const client = getClient()
  const { page = 1, pageSize = 25, sortBy = 'created_at', sortOrder = 'desc' } = pagination

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = client
    .from('crm_activities')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null) as any

  // Apply filters
  if (filters.type) {
    query = query.eq('type', filters.type)
  }

  if (filters.contactId) {
    query = query.eq('contact_id', filters.contactId)
  }

  if (filters.companyId) {
    query = query.eq('company_id', filters.companyId)
  }

  if (filters.dealId) {
    query = query.eq('deal_id', filters.dealId)
  }

  if (filters.createdBy) {
    query = query.eq('created_by', filters.createdBy)
  }

  if (filters.completed !== undefined) {
    if (filters.completed) {
      query = query.not('completed_at', 'is', null)
    } else {
      query = query.is('completed_at', null)
    }
  }

  if (filters.dueBefore) {
    query = query.lte('due_date', filters.dueBefore)
  }

  if (filters.dueAfter) {
    query = query.gte('due_date', filters.dueAfter)
  }

  // Apply sorting
  const columnMap: Record<string, string> = {
    createdAt: 'created_at',
    dueDate: 'due_date',
    type: 'type',
  }
  const column = columnMap[sortBy] || sortBy
  query = query.order(column, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch activities: ${error.message}`)
  }

  return {
    data: (data || []).map(mapActivityFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get activities for a contact (timeline)
 */
export async function getContactActivities(
  contactId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Activity>> {
  const client = getClient()
  const { page = 1, pageSize = 25 } = pagination

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await client
    .from('crm_activities')
    .select('*', { count: 'exact' })
    .eq('contact_id', contactId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(`Failed to fetch contact activities: ${error.message}`)
  }

  return {
    data: (data || []).map(mapActivityFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get activities for a deal
 */
export async function getDealActivities(
  dealId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Activity>> {
  const client = getClient()
  const { page = 1, pageSize = 25 } = pagination

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await client
    .from('crm_activities')
    .select('*', { count: 'exact' })
    .eq('deal_id', dealId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(`Failed to fetch deal activities: ${error.message}`)
  }

  return {
    data: (data || []).map(mapActivityFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(organizationId: string): Promise<Activity[]> {
  const client = getClient()

  const { data, error } = await client
    .from('crm_activities')
    .select('*')
    .eq('organization_id', organizationId)
    .in('type', ['task', 'meeting'])
    .is('completed_at', null)
    .lt('due_date', new Date().toISOString())
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch overdue tasks: ${error.message}`)
  }

  return (data || []).map(mapActivityFromDb)
}

/**
 * Get upcoming tasks
 */
export async function getUpcomingTasks(
  organizationId: string,
  days: number = 7
): Promise<Activity[]> {
  const client = getClient()

  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const { data, error } = await client
    .from('crm_activities')
    .select('*')
    .eq('organization_id', organizationId)
    .in('type', ['task', 'meeting'])
    .is('completed_at', null)
    .gte('due_date', now.toISOString())
    .lte('due_date', futureDate.toISOString())
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch upcoming tasks: ${error.message}`)
  }

  return (data || []).map(mapActivityFromDb)
}

/**
 * Get a single activity by ID
 */
export async function getActivity(activityId: string): Promise<Activity | null> {
  const client = getClient()

  const { data, error } = await client
    .from('crm_activities')
    .select('*')
    .eq('id', activityId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch activity: ${error.message}`)
  }

  return data ? mapActivityFromDb(data) : null
}

/**
 * Create a new activity
 */
export async function createActivity(
  organizationId: string,
  userId: string,
  input: CreateActivityInput
): Promise<Activity> {
  const client = getClient()

  // Validate that at least one relation is provided
  if (!input.contactId && !input.companyId && !input.dealId) {
    throw new Error('Activity must be linked to a contact, company, or deal')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client
    .from('crm_activities') as any)
    .insert({
      organization_id: organizationId,
      type: input.type,
      subject: input.subject,
      description: input.description,
      contact_id: input.contactId,
      company_id: input.companyId,
      deal_id: input.dealId,
      due_date: input.dueDate,
      duration_minutes: input.durationMinutes,
      created_by: userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create activity: ${error.message}`)
  }

  return mapActivityFromDb(data)
}

/**
 * Update an activity
 */
export async function updateActivity(input: UpdateActivityInput): Promise<Activity> {
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (input.type !== undefined) updateData['type'] = input.type
  if (input.subject !== undefined) updateData['subject'] = input.subject
  if (input.description !== undefined) updateData['description'] = input.description
  if (input.contactId !== undefined) updateData['contact_id'] = input.contactId
  if (input.companyId !== undefined) updateData['company_id'] = input.companyId
  if (input.dealId !== undefined) updateData['deal_id'] = input.dealId
  if (input.dueDate !== undefined) updateData['due_date'] = input.dueDate
  if (input.durationMinutes !== undefined) updateData['duration_minutes'] = input.durationMinutes
  if (input.completedAt !== undefined) updateData['completed_at'] = input.completedAt

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client
    .from('crm_activities') as any)
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update activity: ${error.message}`)
  }

  return mapActivityFromDb(data)
}

/**
 * Mark an activity as completed
 */
export async function completeActivity(activityId: string): Promise<Activity> {
  return updateActivity({
    id: activityId,
    completedAt: new Date().toISOString(),
  })
}

/**
 * Mark an activity as incomplete
 */
export async function uncompleteActivity(activityId: string): Promise<Activity> {
  return updateActivity({
    id: activityId,
    completedAt: null,
  })
}

/**
 * Delete an activity (soft delete)
 */
export async function deleteActivity(activityId: string): Promise<void> {
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client
    .from('crm_activities') as any)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', activityId)

  if (error) {
    throw new Error(`Failed to delete activity: ${error.message}`)
  }
}

/**
 * Get activity statistics
 */
export async function getActivityStats(organizationId: string): Promise<{
  total: number
  completedThisWeek: number
  overdue: number
  byType: Record<string, number>
}> {
  const client = getClient()

  // Get all activities
  const { data: activities, error } = await client
    .from('crm_activities')
    .select('type, completed_at, due_date')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (error) {
    throw new Error(`Failed to fetch activity stats: ${error.message}`)
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const total = activities?.length || 0

  const completedThisWeek =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities?.filter((a: any) => {
      const completedAt = a['completed_at'] as string | null
      if (!completedAt) return false
      return new Date(completedAt) >= weekAgo
    }).length || 0

  const overdue =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities?.filter((a: any) => {
      const dueDate = a['due_date'] as string | null
      const completedAt = a['completed_at'] as string | null
      if (!dueDate || completedAt) return false
      return new Date(dueDate) < now
    }).length || 0

  const byType: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activities?.forEach((a: any) => {
    const type = a['type'] as string
    byType[type] = (byType[type] || 0) + 1
  })

  return {
    total,
    completedThisWeek,
    overdue,
    byType,
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapActivityFromDb(data: any): Activity {
  return {
    id: data['id'] as string,
    organizationId: data['organization_id'] as string,
    type: data['type'] as Activity['type'],
    subject: data['subject'] as string,
    description: data['description'] as string | null,
    contactId: data['contact_id'] as string | null,
    companyId: data['company_id'] as string | null,
    dealId: data['deal_id'] as string | null,
    dueDate: data['due_date'] as string | null,
    completedAt: data['completed_at'] as string | null,
    durationMinutes: data['duration_minutes'] as number | null,
    createdBy: data['created_by'] as string | null,
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
    deletedAt: data['deleted_at'] as string | null,
  }
}
