// ===========================================
// TASK COLUMNS (KANBAN) SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'

function getProjectsClient() {
  return getSupabaseClient().schema('projects' as any) as any
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
  const { data, error } = await getProjectsClient()
    .from('task_columns')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map(mapColumnFromDb)
}

export async function getTaskColumnById(id: string): Promise<TaskColumn | null> {
  const { data, error } = await getProjectsClient()
    .from('task_columns')
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
    const { data: columns } = await getProjectsClient()
      .from('task_columns')
      .select('position')
      .eq('project_id', input.projectId)
      .order('position', { ascending: false })
      .limit(1)

    position = columns && columns.length > 0 ? columns[0].position + 1 : 0
  }

  const { data, error } = await getProjectsClient()
    .from('task_columns')
    .insert({
      project_id: input.projectId,
      name: input.name,
      color: input.color || '#6b7280',
      position,
      is_system: false,
    })
    .select()
    .single()

  if (error) throw error

  return mapColumnFromDb(data)
}

export async function updateTaskColumn(input: UpdateColumnInput): Promise<TaskColumn> {
  const updateData: Record<string, any> = {}
  if (input.name !== undefined) updateData['name'] = input.name
  if (input.color !== undefined) updateData['color'] = input.color
  if (input.position !== undefined) updateData['position'] = input.position

  const { data, error } = await getProjectsClient()
    .from('task_columns')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapColumnFromDb(data)
}

export async function deleteTaskColumn(id: string): Promise<void> {
  // Check if column is system column
  const { data: column } = await getProjectsClient()
    .from('task_columns')
    .select('is_system')
    .eq('id', id)
    .single()

  if (column?.is_system) {
    throw new Error('Cannot delete system column')
  }

  // Check if column has tasks
  const { count } = await getProjectsClient()
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('column_id', id)
    .is('deleted_at', null)

  if (count && count > 0) {
    throw new Error('Cannot delete column with tasks')
  }

  const { error } = await getProjectsClient()
    .from('task_columns')
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
    await getProjectsClient()
      .from('task_columns')
      .update({ position: update.position })
      .eq('id', update.id)
  }

  // Return updated columns
  return getTaskColumns(projectId)
}

// ===========================================
// HELPERS
// ===========================================

function mapColumnFromDb(data: any): TaskColumn {
  return {
    id: data.id,
    projectId: data.project_id,
    name: data.name,
    color: data.color,
    position: data.position,
    isSystem: data.is_system,
    systemStatus: data.system_status,
    createdAt: data.created_at,
  }
}
