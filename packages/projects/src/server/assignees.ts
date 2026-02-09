// ===========================================
// TASK ASSIGNEES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type { TaskAssignee } from '../types'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET ASSIGNEES FOR TASK
// ===========================================

export async function getTaskAssignees(taskId: string): Promise<TaskAssignee[]> {
  const { data, error } = await getClient()
    .from('projects_task_assignees')
    .select('*')
    .eq('task_id', taskId)

  if (error) throw error

  // Get user details
  const userIds = (data || []).map((a: any) => a.user_id)
  if (userIds.length === 0) return []

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

// ===========================================
// ASSIGN USER TO TASK
// ===========================================

export async function assignUserToTask(
  taskId: string,
  userId: string,
  assignedBy?: string
): Promise<TaskAssignee> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    task_id: taskId,
    user_id: userId,
    assigned_by: assignedBy,
  }

  const { data, error } = await getClient()
    .from('projects_task_assignees')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assigneeData = data as any

  // Get user details
  const { data: user } = await getSupabaseClient()
    .from('users')
    .select('id, email, first_name, last_name, avatar_url')
    .eq('id', userId)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userData = user as any

  return {
    id: assigneeData.id,
    taskId: assigneeData.task_id,
    userId: assigneeData.user_id,
    assignedAt: assigneeData.assigned_at,
    assignedBy: assigneeData.assigned_by || null,
    user: userData ? {
      id: userData.id,
      email: userData.email,
      fullName: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || null,
      avatarUrl: userData.avatar_url,
    } : undefined,
  }
}

// ===========================================
// UNASSIGN USER FROM TASK
// ===========================================

export async function unassignUserFromTask(taskId: string, userId: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_task_assignees')
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
  await getClient()
    .from('projects_task_assignees')
    .delete()
    .eq('task_id', taskId)

  if (userIds.length === 0) return []

  // Add new assignees
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any[] = userIds.map(userId => ({
    task_id: taskId,
    user_id: userId,
    assigned_by: assignedBy,
  }))

  const { data, error } = await getClient()
    .from('projects_task_assignees')
    .insert(insertData)
    .select()

  if (error) throw error

  // Get user details
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
