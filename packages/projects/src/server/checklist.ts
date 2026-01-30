// ===========================================
// TASK CHECKLIST SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TaskChecklistItem,
  CreateTaskChecklistItemInput,
  UpdateTaskChecklistItemInput,
} from '../types'

function getProjectsClient() {
  return getSupabaseClient().schema('projects' as any) as any
}

// ===========================================
// GET CHECKLIST ITEMS FOR TASK
// ===========================================

export async function getTaskChecklistItems(taskId: string): Promise<TaskChecklistItem[]> {
  const { data, error } = await getProjectsClient()
    .from('task_checklist_items')
    .select('*')
    .eq('task_id', taskId)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map(mapChecklistItemFromDb)
}

// ===========================================
// CREATE CHECKLIST ITEM
// ===========================================

export async function createTaskChecklistItem(input: CreateTaskChecklistItemInput): Promise<TaskChecklistItem> {
  // Get next position
  const { data: maxPosition } = await getProjectsClient()
    .from('task_checklist_items')
    .select('position')
    .eq('task_id', input.taskId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = input.position ?? ((maxPosition?.position || 0) + 1)

  const { data, error } = await getProjectsClient()
    .from('task_checklist_items')
    .insert({
      task_id: input.taskId,
      title: input.title,
      position,
    })
    .select()
    .single()

  if (error) throw error

  return mapChecklistItemFromDb(data)
}

// ===========================================
// UPDATE CHECKLIST ITEM
// ===========================================

export async function updateTaskChecklistItem(
  input: UpdateTaskChecklistItemInput,
  userId?: string
): Promise<TaskChecklistItem> {
  const updateData: Record<string, unknown> = {}

  if (input.title !== undefined) updateData.title = input.title
  if (input.position !== undefined) updateData.position = input.position
  if (input.isCompleted !== undefined) {
    updateData.is_completed = input.isCompleted
    if (input.isCompleted) {
      updateData.completed_at = new Date().toISOString()
      updateData.completed_by = userId
    } else {
      updateData.completed_at = null
      updateData.completed_by = null
    }
  }

  const { data, error } = await getProjectsClient()
    .from('task_checklist_items')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapChecklistItemFromDb(data)
}

// ===========================================
// DELETE CHECKLIST ITEM
// ===========================================

export async function deleteTaskChecklistItem(id: string): Promise<void> {
  const { error } = await getProjectsClient()
    .from('task_checklist_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// TOGGLE CHECKLIST ITEM
// ===========================================

export async function toggleTaskChecklistItem(id: string, userId?: string): Promise<TaskChecklistItem> {
  // Get current state
  const { data: current } = await getProjectsClient()
    .from('task_checklist_items')
    .select('is_completed')
    .eq('id', id)
    .single()

  const isCompleted = !current?.is_completed

  return updateTaskChecklistItem({
    id,
    isCompleted,
  }, userId)
}

// ===========================================
// HELPERS
// ===========================================

function mapChecklistItemFromDb(data: Record<string, unknown>): TaskChecklistItem {
  return {
    id: data.id as string,
    taskId: data.task_id as string,
    title: data.title as string,
    isCompleted: (data.is_completed as boolean) || false,
    position: (data.position as number) || 0,
    completedAt: data.completed_at as string | null,
    completedBy: data.completed_by as string | null,
    createdAt: data.created_at as string,
  }
}
