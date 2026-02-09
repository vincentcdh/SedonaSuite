// ===========================================
// TASK COLUMNS (KANBAN) SERVER FUNCTIONS
// Uses projects_task_statuses table
// ===========================================

import { getSupabaseClient } from '@sedona/database'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// TYPES
// ===========================================

export interface TaskColumn {
  id: string
  projectId: string
  name: string
  color: string
  position: number
  isSystem: boolean
  systemStatus: string | null
  createdAt: string
}

export interface CreateColumnInput {
  projectId: string
  name: string
  color?: string
  position?: number
}

export interface UpdateColumnInput {
  id: string
  name?: string
  color?: string
  position?: number
}

// ===========================================
// COLUMNS CRUD
// ===========================================

export async function getTaskColumns(projectId: string): Promise<TaskColumn[]> {
  const { data, error } = await getClient()
    .from('projects_task_statuses')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map(mapColumnFromDb)
}

export async function getTaskColumnById(id: string): Promise<TaskColumn | null> {
  const { data, error } = await getClient()
    .from('projects_task_statuses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data ? mapColumnFromDb(data) : null
}

export async function createTaskColumn(input: CreateColumnInput): Promise<TaskColumn> {
  // Get max position if not provided
  let position = input.position
  if (position === undefined) {
    const { data: columns } = await getClient()
      .from('projects_task_statuses')
      .select('position')
      .eq('project_id', input.projectId)
      .order('position', { ascending: false })
      .limit(1)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    position = columns && columns.length > 0 ? (columns[0] as any).position + 1 : 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    project_id: input.projectId,
    name: input.name,
    color: input.color || '#6b7280',
    position,
    is_completed: false,
  }

  const { data, error } = await getClient()
    .from('projects_task_statuses')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  return mapColumnFromDb(data)
}

export async function updateTaskColumn(input: UpdateColumnInput): Promise<TaskColumn> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}
  if (input.name !== undefined) updateData['name'] = input.name
  if (input.color !== undefined) updateData['color'] = input.color
  if (input.position !== undefined) updateData['position'] = input.position

  const { data, error } = await getClient()
    .from('projects_task_statuses')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapColumnFromDb(data)
}

export async function deleteTaskColumn(id: string): Promise<void> {
  // Check if column has tasks
  const { count } = await getClient()
    .from('projects_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status_id', id)

  if (count && count > 0) {
    throw new Error('Cannot delete column with tasks')
  }

  const { error } = await getClient()
    .from('projects_task_statuses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function reorderTaskColumns(
  projectId: string,
  columnIds: string[]
): Promise<TaskColumn[]> {
  // Update positions for each column
  const updates = columnIds.map((id, index) => ({
    id,
    position: index,
  }))

  for (const update of updates) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { position: update.position }
    await getClient()
      .from('projects_task_statuses')
      .update(updateData)
      .eq('id', update.id)
  }

  // Return updated columns
  return getTaskColumns(projectId)
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapColumnFromDb(data: any): TaskColumn {
  return {
    id: data['id'],
    projectId: data['project_id'],
    name: data['name'],
    color: data['color'] || '#6B7280',
    position: data['position'] || 0,
    isSystem: false, // Not in DB schema
    systemStatus: null, // Not in DB schema
    createdAt: data['created_at'],
  }
}
