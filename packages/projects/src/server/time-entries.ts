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

function getProjectsClient() {
  return getSupabaseClient().schema('projects' as any) as any
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

  let query = getProjectsClient()
    .from('time_entries')
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
    .select('id, email, full_name')
    .in('id', userIds)

  const userMap: Record<string, any> = {}
  users?.forEach((u: any) => { userMap[u.id] = u })

  // Get task titles
  const taskIds = [...new Set((data || []).filter((e: any) => e.task_id).map((e: any) => e.task_id))]
  const { data: tasks } = taskIds.length > 0 ? await getProjectsClient()
    .from('tasks')
    .select('id, title')
    .in('id', taskIds) : { data: [] }

  const taskMap: Record<string, any> = {}
  tasks?.forEach((t: any) => { taskMap[t.id] = t })

  return {
    data: (data || []).map((e: any) => ({
      ...mapTimeEntryFromDb(e),
      user: userMap[e.user_id] ? {
        id: userMap[e.user_id].id,
        email: userMap[e.user_id].email,
        fullName: userMap[e.user_id].full_name,
      } : undefined,
      task: e.task_id && taskMap[e.task_id] ? {
        id: taskMap[e.task_id].id,
        title: taskMap[e.task_id].title,
      } : null,
    })),
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
  const { data, error } = await getProjectsClient()
    .from('time_entries')
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
  const { data, error } = await getProjectsClient()
    .from('time_entries')
    .insert({
      project_id: input.projectId,
      task_id: input.taskId,
      user_id: userId,
      description: input.description,
      start_time: input.startTime,
      end_time: input.endTime,
      duration_minutes: input.durationMinutes,
      is_billable: input.isBillable ?? true,
      hourly_rate: input.hourlyRate,
      is_running: !input.endTime,
    })
    .select()
    .single()

  if (error) throw error

  return mapTimeEntryFromDb(data)
}

// ===========================================
// UPDATE TIME ENTRY
// ===========================================

export async function updateTimeEntry(input: UpdateTimeEntryInput): Promise<TimeEntry> {
  const updateData: Record<string, unknown> = {}

  if (input.taskId !== undefined) updateData.task_id = input.taskId
  if (input.description !== undefined) updateData.description = input.description
  if (input.startTime !== undefined) updateData.start_time = input.startTime
  if (input.endTime !== undefined) {
    updateData.end_time = input.endTime
    updateData.is_running = false
  }
  if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes
  if (input.isBillable !== undefined) updateData.is_billable = input.isBillable
  if (input.hourlyRate !== undefined) updateData.hourly_rate = input.hourlyRate

  const { data, error } = await getProjectsClient()
    .from('time_entries')
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
  const { error } = await getProjectsClient()
    .from('time_entries')
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
  const endTime = new Date().toISOString()

  const { data, error } = await getProjectsClient()
    .from('time_entries')
    .update({
      end_time: endTime,
      is_running: false,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapTimeEntryFromDb(data)
}

// ===========================================
// GET RUNNING TIMER
// ===========================================

export async function getRunningTimer(userId: string): Promise<TimeEntry | null> {
  const { data, error } = await getProjectsClient()
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('is_running', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapTimeEntryFromDb(data)
}

// ===========================================
// STOP ALL RUNNING TIMERS FOR USER
// ===========================================

async function stopRunningTimers(userId: string): Promise<void> {
  const { error } = await getProjectsClient()
    .from('time_entries')
    .update({
      end_time: new Date().toISOString(),
      is_running: false,
    })
    .eq('user_id', userId)
    .eq('is_running', true)

  if (error) throw error
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
  const { data } = await getProjectsClient()
    .from('time_entries')
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

function mapTimeEntryFromDb(data: Record<string, unknown>): TimeEntry {
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    taskId: data.task_id as string | null,
    userId: data.user_id as string,
    description: data.description as string | null,
    startTime: data.start_time as string,
    endTime: data.end_time as string | null,
    durationMinutes: data.duration_minutes ? Number(data.duration_minutes) : null,
    isBillable: (data.is_billable as boolean) ?? true,
    hourlyRate: data.hourly_rate ? Number(data.hourly_rate) : null,
    isRunning: (data.is_running as boolean) || false,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
