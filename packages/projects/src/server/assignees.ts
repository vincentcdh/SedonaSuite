// ===========================================
// TASK ASSIGNEES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type { TaskAssignee } from '../types'

function getProjectsClient() {
  return getSupabaseClient().schema('projects' as any) as any
}

// ===========================================
// GET ASSIGNEES FOR TASK
// ===========================================

export async function getTaskAssignees(taskId: string): Promise<TaskAssignee[]> {
  const { data, error } = await getProjectsClient()
    .from('task_assignees')
    .select('*')
    .eq('task_id', taskId)

  if (error) throw error

  // Get user details
  const userIds = (data || []).map((a: any) => a.user_id)
  if (userIds.length === 0) return []

  const { data: users } = await getSupabaseClient()
    .from('users')
    .select('id, email, full_name, avatar_url')
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
      fullName: userMap[a.user_id].full_name,
      avatarUrl: userMap[a.user_id].avatar_url,
    } : undefined,
  }))
}

// ===========================================
// ASSIGN USER TO TASK
// ===========================================

export async function assignUserToTask(
  taskId: string,
  userId: string,
  assignedBy?: string
): Promise<TaskAssignee> {
  const { data, error } = await getProjectsClient()
    .from('task_assignees')
    .insert({
      task_id: taskId,
      user_id: userId,
      assigned_by: assignedBy,
    })
    .select()
    .single()

  if (error) throw error

  // Get user details
  const { data: user } = await getSupabaseClient()
    .from('users')
    .select('id, email, full_name, avatar_url')
    .eq('id', userId)
    .single()

  return {
    id: data.id,
    taskId: data.task_id,
    userId: data.user_id,
    assignedAt: data.assigned_at,
    assignedBy: data.assigned_by,
    user: user ? {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
    } : undefined,
  }
}

// ===========================================
// UNASSIGN USER FROM TASK
// ===========================================

export async function unassignUserFromTask(taskId: string, userId: string): Promise<void> {
  const { error } = await getProjectsClient()
    .from('task_assignees')
    .delete()
    .eq('task_id', taskId)
    .eq('user_id', userId)

  if (error) throw error
}

// ===========================================
// SET TASK ASSIGNEES (replace all)
// ===========================================

export async function setTaskAssignees(
  taskId: string,
  userIds: string[],
  assignedBy?: string
): Promise<TaskAssignee[]> {
  // Remove existing assignees
  await getProjectsClient()
    .from('task_assignees')
    .delete()
    .eq('task_id', taskId)

  if (userIds.length === 0) return []

  // Add new assignees
  const { data, error } = await getProjectsClient()
    .from('task_assignees')
    .insert(
      userIds.map(userId => ({
        task_id: taskId,
        user_id: userId,
        assigned_by: assignedBy,
      }))
    )
    .select()

  if (error) throw error

  // Get user details
  const { data: users } = await getSupabaseClient()
    .from('users')
    .select('id, email, full_name, avatar_url')
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
      fullName: userMap[a.user_id].full_name,
      avatarUrl: userMap[a.user_id].avatar_url,
    } : undefined,
  }))
}
