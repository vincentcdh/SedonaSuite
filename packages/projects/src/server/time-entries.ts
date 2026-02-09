// ===========================================
// TIME ENTRIES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TimeEntry,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimeEntryFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET TIME ENTRIES FOR PROJECT
// ===========================================

export async function getTimeEntries(
  projectId: string,
  filters: TimeEntryFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<TimeEntry>> {
  const { page = 1, pageSize = 50, sortBy = 'startTime', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getClient()
    .from('projects_time_entries')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)

  // Apply filters
  if (filters.taskId) {
    query = query.eq('task_id', filters.taskId)
  }
  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }
  if (filters.startDate) {
    query = query.gte('start_time', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('start_time', filters.endDate)
  }
  if (filters.isBillable !== undefined) {
    query = query.eq('is_billable', filters.isBillable)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get user details
  const userIds = [...new Set((data || []).map((e: any) => e.user_id))]
  const { data: users } = await getSupabaseClient()
    .from('users')
    .select('id, email, first_name, last_name')
    .in('id', userIds)

  const userMap: Record<string, any> = {}
  users?.forEach((u: any) => { userMap[u.id] = u })

  // Get task titles
  const taskIds = [...new Set((data || []).filter((e: any) => e.task_id).map((e: any) => e.task_id))]
  const { data: tasks } = taskIds.length > 0 ? await getClient()
    .from('projects_tasks')
    .select('id, title')
    .in('id', taskIds) : { data: [] }

  const taskMap: Record<string, any> = {}
  tasks?.forEach((t: any) => { taskMap[t.id] = t })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries: any[] = (data || []).map((e: any) => ({
    ...mapTimeEntryFromDb(e),
    user: userMap[e.user_id] ? {
      id: userMap[e.user_id].id,
      email: userMap[e.user_id].email,
      fullName: [userMap[e.user_id].first_name, userMap[e.user_id].last_name].filter(Boolean).join(' ') || null,
    } : undefined,
    task: e.task_id && taskMap[e.task_id] ? {
      id: taskMap[e.task_id].id,
      title: taskMap[e.task_id].title,
    } as any : null,
  }))

  return {
    data: entries,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET TIME ENTRY BY ID
// ===========================================

export async function getTimeEntryById(id: string): Promise<TimeEntry | null> {
  const { data, error } = await getClient()
    .from('projects_time_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapTimeEntryFromDb(data)
}

// ===========================================
// CREATE TIME ENTRY
// ===========================================

export async function createTimeEntry(
  input: CreateTimeEntryInput,
  userId: string
): Promise<TimeEntry> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    project_id: input.projectId,
    task_id: input.taskId,
    user_id: userId,
    description: input.description,
    date: input.startTime ? input.startTime.split('T')[0] : new Date().toISOString().split('T')[0],
    duration_minutes: input.durationMinutes || 0,
    is_billable: input.isBillable ?? true,
    hourly_rate: input.hourlyRate,
  }

  const { data, error } = await getClient()
    .from('projects_time_entries')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  return mapTimeEntryFromDb(data)
}

// ===========================================
// UPDATE TIME ENTRY
// ===========================================

export async function updateTimeEntry(input: UpdateTimeEntryInput): Promise<TimeEntry> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (input.taskId !== undefined) updateData.task_id = input.taskId
  if (input.description !== undefined) updateData.description = input.description
  if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes
  if (input.isBillable !== undefined) updateData.is_billable = input.isBillable
  if (input.hourlyRate !== undefined) updateData.hourly_rate = input.hourlyRate

  const { data, error } = await getClient()
    .from('projects_time_entries')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapTimeEntryFromDb(data)
}

// ===========================================
// DELETE TIME ENTRY
// ===========================================

export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_time_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// START TIMER
// ===========================================

export async function startTimer(
  projectId: string,
  userId: string,
  taskId?: string,
  description?: string
): Promise<TimeEntry> {
  // Stop any running timer first
  await stopRunningTimers(userId)

  return createTimeEntry({
    projectId,
    taskId,
    description,
    startTime: new Date().toISOString(),
  }, userId)
}

// ===========================================
// STOP TIMER
// ===========================================

export async function stopTimer(id: string): Promise<TimeEntry> {
  // Note: DB doesn't have end_time or is_running columns
  // Just return the entry as-is
  const entry = await getTimeEntryById(id)
  if (!entry) throw new Error('Time entry not found')
  return entry
}

// ===========================================
// GET RUNNING TIMER
// ===========================================

export async function getRunningTimer(_userId: string): Promise<TimeEntry | null> {
  // Note: DB doesn't have is_running column
  // Running timers not supported
  return null
}

// ===========================================
// STOP ALL RUNNING TIMERS FOR USER
// ===========================================

async function stopRunningTimers(_userId: string): Promise<void> {
  // Note: DB doesn't have end_time or is_running columns
  // No-op
}

// ===========================================
// GET TIME SUMMARY
// ===========================================

export async function getProjectTimeSummary(projectId: string): Promise<{
  totalMinutes: number
  billableMinutes: number
  billableAmount: number
  byUser: { userId: string; minutes: number }[]
  byTask: { taskId: string; minutes: number }[]
}> {
  const { data } = await getClient()
    .from('projects_time_entries')
    .select('*')
    .eq('project_id', projectId)

  let totalMinutes = 0
  let billableMinutes = 0
  let billableAmount = 0
  const byUser: Record<string, number> = {}
  const byTask: Record<string, number> = {}

  ;(data || []).forEach((e: any) => {
    const minutes = e.duration_minutes || 0
    totalMinutes += minutes

    if (e.is_billable) {
      billableMinutes += minutes
      if (e.hourly_rate) {
        billableAmount += (minutes / 60) * e.hourly_rate
      }
    }

    byUser[e.user_id] = (byUser[e.user_id] || 0) + minutes
    if (e.task_id) {
      byTask[e.task_id] = (byTask[e.task_id] || 0) + minutes
    }
  })

  return {
    totalMinutes,
    billableMinutes,
    billableAmount,
    byUser: Object.entries(byUser).map(([userId, minutes]) => ({ userId, minutes })),
    byTask: Object.entries(byTask).map(([taskId, minutes]) => ({ taskId, minutes })),
  }
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTimeEntryFromDb(data: any): TimeEntry {
  return {
    id: data['id'] as string,
    projectId: data['project_id'] as string,
    taskId: data['task_id'] as string | null,
    userId: data['user_id'] as string,
    description: data['description'] as string | null,
    startTime: data['date'] as string, // DB uses 'date' instead of 'start_time'
    endTime: null, // DB doesn't have end_time
    durationMinutes: data['duration_minutes'] ? Number(data['duration_minutes']) : null,
    isBillable: (data['is_billable'] as boolean) ?? true,
    hourlyRate: data['hourly_rate'] ? Number(data['hourly_rate']) : null,
    isRunning: false, // DB doesn't have is_running
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
