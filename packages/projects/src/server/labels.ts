// ===========================================
// LABELS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Label,
  CreateLabelInput,
  UpdateLabelInput,
} from '../types'

function getProjectsClient() {
  return getSupabaseClient().schema('projects' as any) as any
}

// ===========================================
// GET LABELS FOR PROJECT
// ===========================================

export async function getProjectLabels(projectId: string): Promise<Label[]> {
  const { data, error } = await getProjectsClient()
    .from('labels')
    .select('*')
    .eq('project_id', projectId)
    .order('name', { ascending: true })

  if (error) throw error

  return (data || []).map(mapLabelFromDb)
}

// ===========================================
// CREATE LABEL
// ===========================================

export async function createLabel(input: CreateLabelInput): Promise<Label> {
  const { data, error } = await getProjectsClient()
    .from('labels')
    .insert({
      project_id: input.projectId,
      name: input.name,
      color: input.color || '#6B7280',
    })
    .select()
    .single()

  if (error) throw error

  return mapLabelFromDb(data)
}

// ===========================================
// UPDATE LABEL
// ===========================================

export async function updateLabel(input: UpdateLabelInput): Promise<Label> {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.color !== undefined) updateData.color = input.color

  const { data, error } = await getProjectsClient()
    .from('labels')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapLabelFromDb(data)
}

// ===========================================
// DELETE LABEL
// ===========================================

export async function deleteLabel(id: string): Promise<void> {
  const { error } = await getProjectsClient()
    .from('labels')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// ADD LABEL TO TASK
// ===========================================

export async function addLabelToTask(taskId: string, labelId: string): Promise<void> {
  const { error } = await getProjectsClient()
    .from('task_labels')
    .insert({
      task_id: taskId,
      label_id: labelId,
    })

  if (error && error.code !== '23505') throw error // Ignore duplicate
}

// ===========================================
// REMOVE LABEL FROM TASK
// ===========================================

export async function removeLabelFromTask(taskId: string, labelId: string): Promise<void> {
  const { error } = await getProjectsClient()
    .from('task_labels')
    .delete()
    .eq('task_id', taskId)
    .eq('label_id', labelId)

  if (error) throw error
}

// ===========================================
// GET LABELS FOR TASK
// ===========================================

export async function getTaskLabels(taskId: string): Promise<Label[]> {
  const { data, error } = await getProjectsClient()
    .from('task_labels')
    .select('label_id')
    .eq('task_id', taskId)

  if (error) throw error

  if (!data || data.length === 0) return []

  const labelIds = data.map((tl: any) => tl.label_id)
  const { data: labels } = await getProjectsClient()
    .from('labels')
    .select('*')
    .in('id', labelIds)

  return (labels || []).map(mapLabelFromDb)
}

// ===========================================
// HELPERS
// ===========================================

function mapLabelFromDb(data: Record<string, unknown>): Label {
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    name: data.name as string,
    color: (data.color as string) || '#6B7280',
    createdAt: data.created_at as string,
  }
}
