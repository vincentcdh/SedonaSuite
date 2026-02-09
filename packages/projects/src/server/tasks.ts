// ===========================================
// TASK SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Task,
  TaskWithRelations,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskStatus,
  CreateTaskStatusInput,
  UpdateTaskStatusInput,
  PaginatedResult,
  PaginationParams,
} from '../types'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET TASKS FOR PROJECT
// ===========================================

export async function getTasks(
  projectId: string,
  filters: TaskFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<TaskWithRelations>> {
  const { page = 1, pageSize = 50, sortBy = 'position', sortOrder = 'asc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getClient()
    .from('projects_tasks')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .is('parent_id', null) // Only top-level tasks

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters.statusId) {
    query = query.eq('status_id', filters.statusId)
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }
  if (filters.isCompleted === true) {
    query = query.not('completed_at', 'is', null)
  } else if (filters.isCompleted === false) {
    query = query.is('completed_at', null)
  }
  if (filters.hasDueDate === true) {
    query = query.not('due_date', 'is', null)
  }
  if (filters.isOverdue === true) {
    query = query
      .not('due_date', 'is', null)
      .lt('due_date', new Date().toISOString().split('T')[0])
      .is('completed_at', null)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get related data
  const taskIds = (data || []).map((t: any) => t.id)
  const [statuses, assignees, checklistItems] = await Promise.all([
    getTaskStatuses(projectId),
    getTaskAssigneesForTasks(taskIds),
    getChecklistItemsForTasks(taskIds),
  ])

  const statusMap: Record<string, TaskStatus> = {}
  statuses.forEach(s => { statusMap[s.id] = s })

  const tasksWithRelations = (data || []).map((t: any) => {
    const task = mapTaskFromDb(t)
    return {
      ...task,
      status: task.statusId ? statusMap[task.statusId] : null,
      assignees: assignees.filter(a => a.taskId === task.id),
      checklistItems: checklistItems.filter(c => c.taskId === task.id),
    }
  })

  return {
    data: tasksWithRelations,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET TASKS BY STATUS (for Kanban)
// ===========================================

export async function getTasksByStatus(projectId: string): Promise<Record<string, TaskWithRelations[]>> {
  const { data: tasks, error } = await getClient()
    .from('projects_tasks')
    .select('*')
    .eq('project_id', projectId)
    .is('parent_id', null)
    .order('position', { ascending: true })

  if (error) throw error

  const statuses = await getTaskStatuses(projectId)
  const taskIds = (tasks || []).map((t: any) => t.id)
  const assignees = await getTaskAssigneesForTasks(taskIds)

  const statusMap: Record<string, TaskStatus> = {}
  statuses.forEach(s => { statusMap[s.id] = s })

  const result: Record<string, TaskWithRelations[]> = {}
  statuses.forEach(s => { result[s.id] = [] })

  ;(tasks || []).forEach((t: any) => {
    const task = mapTaskFromDb(t)
    const taskWithRelations: TaskWithRelations = {
      ...task,
      status: task.statusId ? statusMap[task.statusId] : null,
      assignees: assignees.filter(a => a.taskId === task.id),
    }
    if (task.statusId) {
      const statusTasks = result[task.statusId]
      if (statusTasks) {
        statusTasks.push(taskWithRelations)
      }
    }
  })

  return result
}

// ===========================================
// GET TASK BY ID
// ===========================================

export async function getTaskById(id: string): Promise<TaskWithRelations | null> {
  const { data, error } = await getClient()
    .from('projects_tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const task = mapTaskFromDb(data)

  // Get related data
  const [statuses, assignees, checklistItems, subtasks] = await Promise.all([
    task.statusId ? getTaskStatuses(task.projectId) : Promise.resolve([]),
    getTaskAssigneesForTasks([id]),
    getChecklistItemsForTasks([id]),
    getSubtasks(id),
  ])

  const status = statuses.find(s => s.id === task.statusId)

  // Get comments and attachments count
  const [{ count: commentsCount }, { count: attachmentsCount }] = await Promise.all([
    getClient().from('projects_task_comments').select('id', { count: 'exact', head: true }).eq('task_id', id),
    getClient().from('projects_task_attachments').select('id', { count: 'exact', head: true }).eq('task_id', id),
  ])

  return {
    ...task,
    status: status || null,
    assignees,
    checklistItems,
    subtasks,
    commentsCount: commentsCount || 0,
    attachmentsCount: attachmentsCount || 0,
  }
}

// ===========================================
// GET SUBTASKS
// ===========================================

export async function getSubtasks(parentTaskId: string): Promise<Task[]> {
  const { data, error } = await getClient()
    .from('projects_tasks')
    .select('*')
    .eq('parent_id', parentTaskId)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map(mapTaskFromDb)
}

// ===========================================
// CREATE TASK
// ===========================================

export async function createTask(input: CreateTaskInput, userId?: string): Promise<Task> {
  // Get first status if not provided (is_default doesn't exist in schema)
  let statusId = input.statusId
  if (!statusId) {
    const { data: firstStatus } = await getClient()
      .from('projects_task_statuses')
      .select('id')
      .eq('project_id', input.projectId)
      .order('position', { ascending: true })
      .limit(1)
      .single()
    statusId = firstStatus?.id
  }

  // Get next position
  let positionQuery = getClient()
    .from('projects_tasks')
    .select('position')
    .eq('project_id', input.projectId)

  if (statusId) {
    positionQuery = positionQuery.eq('status_id', statusId)
  }
  if (input.parentTaskId) {
    positionQuery = positionQuery.eq('parent_id', input.parentTaskId)
  } else {
    positionQuery = positionQuery.is('parent_id', null)
  }

  const { data: maxPosition } = await positionQuery
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = input.position ?? ((maxPosition?.position || 0) + 1)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    project_id: input.projectId,
    parent_id: input.parentTaskId,
    title: input.title,
    description: input.description,
    status_id: statusId,
    priority: input.priority || 'medium',
    start_date: input.startDate,
    due_date: input.dueDate,
    estimated_hours: input.estimatedHours,
    position,
    custom_fields: input.customFields || {},
    created_by: userId,
  }

  const { data, error } = await getClient()
    .from('projects_tasks')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  return mapTaskFromDb(data)
}

// ===========================================
// UPDATE TASK
// ===========================================

export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (input.parentTaskId !== undefined) updateData.parent_id = input.parentTaskId // DB uses 'parent_id'
  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description
  if (input.statusId !== undefined) updateData.status_id = input.statusId
  if (input.priority !== undefined) updateData.priority = input.priority
  if (input.startDate !== undefined) updateData.start_date = input.startDate
  if (input.dueDate !== undefined) updateData.due_date = input.dueDate
  if (input.estimatedHours !== undefined) updateData.estimated_hours = input.estimatedHours
  if (input.position !== undefined) updateData.position = input.position
  if (input.customFields !== undefined) updateData.custom_fields = input.customFields

  const { data, error } = await getClient()
    .from('projects_tasks')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapTaskFromDb(data)
}

// ===========================================
// DELETE TASK
// ===========================================

export async function deleteTask(id: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// MOVE TASK (for drag & drop)
// ===========================================

export async function moveTask(
  taskId: string,
  newStatusId: string,
  newPosition: number
): Promise<Task> {
  const { data, error } = await getClient()
    .from('projects_tasks')
    .update({
      status_id: newStatusId,
      position: newPosition,
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error

  return mapTaskFromDb(data)
}

// ===========================================
// TASK STATUSES
// ===========================================

export async function getTaskStatuses(projectId: string): Promise<TaskStatus[]> {
  const { data, error } = await getClient()
    .from('projects_task_statuses')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map(mapStatusFromDb)
}

export async function createTaskStatus(input: CreateTaskStatusInput): Promise<TaskStatus> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    project_id: input.projectId,
    name: input.name,
    color: input.color || '#6B7280',
    position: input.position ?? 0,
    // Note: 'is_default' doesn't exist in DB schema
    is_completed: input.isCompleted ?? false,
  }

  const { data, error } = await getClient()
    .from('projects_task_statuses')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  return mapStatusFromDb(data)
}

export async function updateTaskStatus(input: UpdateTaskStatusInput): Promise<TaskStatus> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.color !== undefined) updateData.color = input.color
  if (input.position !== undefined) updateData.position = input.position
  // Note: 'is_default' doesn't exist in DB schema
  if (input.isCompleted !== undefined) updateData.is_completed = input.isCompleted

  const { data, error } = await getClient()
    .from('projects_task_statuses')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapStatusFromDb(data)
}

export async function deleteTaskStatus(id: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_task_statuses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// TASK ASSIGNEES HELPERS
// ===========================================

async function getTaskAssigneesForTasks(taskIds: string[]) {
  if (taskIds.length === 0) return []

  const { data, error } = await getClient()
    .from('projects_task_assignees')
    .select('*')
    .in('task_id', taskIds)

  if (error) throw error

  // Get user details
  const userIds = (data || []).map((a: any) => a.user_id)
  const { data: users } = await getSupabaseClient()
    .from('users')
    .select('id, email, first_name, last_name, avatar_url')
    .in('id', userIds)

  const userMap: Record<string, any> = {}
  users?.forEach((u: any) => { userMap[u.id] = u })

  return (data || []).map((a: any) => ({
    id: a.id,
    taskId: a.task_id,
    userId: a.user_id,
    assignedAt: a.assigned_at,
    assignedBy: a.assigned_by,
    user: userMap[a.user_id] ? {
      id: userMap[a.user_id].id,
      email: userMap[a.user_id].email,
      fullName: [userMap[a.user_id].first_name, userMap[a.user_id].last_name].filter(Boolean).join(' ') || null,
      avatarUrl: userMap[a.user_id].avatar_url,
    } : undefined,
  }))
}

async function getChecklistItemsForTasks(taskIds: string[]) {
  if (taskIds.length === 0) return []

  const { data, error } = await getClient()
    .from('projects_task_checklist_items')
    .select('*')
    .in('task_id', taskIds)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map((c: any) => ({
    id: c.id,
    taskId: c.task_id,
    title: c.title,
    isCompleted: c.is_completed || false,
    position: c.position || 0,
    completedAt: c.completed_at,
    completedBy: c.completed_by,
    createdAt: c.created_at,
  }))
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTaskFromDb(data: any): Task {
  return {
    id: data['id'] as string,
    projectId: data['project_id'] as string,
    parentTaskId: data['parent_id'] as string | null, // DB uses 'parent_id' not 'parent_id'
    title: data['title'] as string,
    description: data['description'] as string | null,
    statusId: data['status_id'] as string | null,
    priority: (data['priority'] as Task['priority']) || 'medium',
    startDate: data['start_date'] as string | null,
    dueDate: data['due_date'] as string | null,
    completedAt: data['completed_at'] as string | null,
    estimatedHours: data['estimated_hours'] ? Number(data['estimated_hours']) : null,
    position: (data['position'] as number) || 0,
    customFields: (data['custom_fields'] as Record<string, unknown>) || {},
    createdBy: data['created_by'] as string | null,
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStatusFromDb(data: any): TaskStatus {
  return {
    id: data['id'] as string,
    projectId: data['project_id'] as string,
    name: data['name'] as string,
    color: (data['color'] as string) || '#6B7280',
    position: (data['position'] as number) || 0,
    isDefault: false, // Not in DB schema
    isCompleted: (data['is_completed'] as boolean) || false,
    createdAt: data['created_at'] as string,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
