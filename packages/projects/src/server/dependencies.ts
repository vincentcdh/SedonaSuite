// ===========================================
// TASK DEPENDENCIES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TaskDependency,
  CreateTaskDependencyInput,
} from '../types'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET DEPENDENCIES FOR TASK
// ===========================================

export async function getTaskDependencies(taskId: string): Promise<TaskDependency[]> {
  const { data, error } = await getClient()
    .from('projects_task_dependencies')
    .select('*')
    .eq('task_id', taskId)

  if (error) throw error

  return (data || []).map(mapDependencyFromDb)
}

// ===========================================
// GET DEPENDENTS (tasks that depend on this task)
// ===========================================

export async function getTaskDependents(taskId: string): Promise<TaskDependency[]> {
  const { data, error } = await getClient()
    .from('projects_task_dependencies')
    .select('*')
    .eq('depends_on_task_id', taskId)

  if (error) throw error

  return (data || []).map(mapDependencyFromDb)
}

// ===========================================
// CREATE DEPENDENCY
// ===========================================

export async function createTaskDependency(input: CreateTaskDependencyInput): Promise<TaskDependency> {
  const { data, error } = await getClient()
    .from('projects_task_dependencies')
    .insert({
      task_id: input.taskId,
      depends_on_task_id: input.dependsOnTaskId,
      dependency_type: input.dependencyType || 'finish_to_start',
    })
    .select()
    .single()

  if (error) throw error

  return mapDependencyFromDb(data)
}

// ===========================================
// DELETE DEPENDENCY
// ===========================================

export async function deleteTaskDependency(id: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_task_dependencies')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// REMOVE DEPENDENCY BY TASKS
// ===========================================

export async function removeDependency(taskId: string, dependsOnTaskId: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_task_dependencies')
    .delete()
    .eq('task_id', taskId)
    .eq('depends_on_task_id', dependsOnTaskId)

  if (error) throw error
}

// ===========================================
// GET ALL DEPENDENCIES FOR PROJECT (for Gantt)
// ===========================================

export async function getProjectDependencies(projectId: string): Promise<TaskDependency[]> {
  const { data: tasks } = await getClient()
    .from('projects_tasks')
    .select('id')
    .eq('project_id', projectId)

  if (!tasks || tasks.length === 0) return []

  const taskIds = tasks.map((t: any) => t.id)

  const { data, error } = await getClient()
    .from('projects_task_dependencies')
    .select('*')
    .in('task_id', taskIds)

  if (error) throw error

  return (data || []).map(mapDependencyFromDb)
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDependencyFromDb(data: any): TaskDependency {
  return {
    id: data['id'] as string,
    taskId: data['task_id'] as string,
    dependsOnTaskId: data['depends_on_task_id'] as string,
    dependencyType: (data['dependency_type'] as TaskDependency['dependencyType']) || 'finish_to_start',
    createdAt: data['created_at'] as string,
  }
}
