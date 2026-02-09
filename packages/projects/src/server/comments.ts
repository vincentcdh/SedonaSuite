// ===========================================
// TASK COMMENTS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TaskComment,
  CreateTaskCommentInput,
  UpdateTaskCommentInput,
} from '../types'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET COMMENTS FOR TASK
// ===========================================

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const { data, error } = await getClient()
    .from('projects_task_comments')
    .select('*')
    .eq('task_id', taskId)
    .is('parent_comment_id', null) // Top-level comments only
    .order('created_at', { ascending: true })

  if (error) throw error

  // Get user details
  const userIds = (data || []).map((c: any) => c.user_id)
  const { data: users } = await getSupabaseClient()
    .from('users')
    .select('id, email, first_name, last_name, avatar_url')
    .in('id', userIds)

  const userMap: Record<string, any> = {}
  users?.forEach((u: any) => { userMap[u.id] = u })

  // Get replies
  const commentIds = (data || []).map((c: any) => c.id)
  const { data: replies } = await getClient()
    .from('projects_task_comments')
    .select('*')
    .in('parent_comment_id', commentIds)
    .order('created_at', { ascending: true })

  // Get user details for replies
  const replyUserIds = (replies || []).map((r: any) => r.user_id)
  const { data: replyUsers } = await getSupabaseClient()
    .from('users')
    .select('id, email, first_name, last_name, avatar_url')
    .in('id', replyUserIds)

  replyUsers?.forEach((u: any) => { userMap[u.id] = u })

  const repliesMap: Record<string, TaskComment[]> = {}
  ;(replies || []).forEach((r: any) => {
    const parentId = r.parent_comment_id as string
    if (parentId) {
      const comment = mapCommentFromDb(r, userMap)
      if (!repliesMap[parentId]) {
        repliesMap[parentId] = []
      }
      repliesMap[parentId].push(comment)
    }
  })

  return (data || []).map((c: any) => ({
    ...mapCommentFromDb(c, userMap),
    replies: repliesMap[c.id] || [],
  }))
}

// ===========================================
// CREATE COMMENT
// ===========================================

export async function createTaskComment(
  input: CreateTaskCommentInput,
  userId: string
): Promise<TaskComment> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    task_id: input.taskId,
    user_id: userId,
    content: input.content,
    parent_comment_id: input.parentCommentId,
  }

  const { data, error } = await getClient()
    .from('projects_task_comments')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  // Get user details
  const { data: user } = await getSupabaseClient()
    .from('users')
    .select('id, email, first_name, last_name, avatar_url')
    .eq('id', userId)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMap: Record<string, any> = {}
  if (user) userMap[(user as any).id] = user

  return mapCommentFromDb(data, userMap)
}

// ===========================================
// UPDATE COMMENT
// ===========================================

export async function updateTaskComment(input: UpdateTaskCommentInput): Promise<TaskComment> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    content: input.content,
    edited_at: new Date().toISOString(),
  }

  const { data, error } = await getClient()
    .from('projects_task_comments')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  // Get user details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commentData = data as any
  const { data: user } = await getSupabaseClient()
    .from('users')
    .select('id, email, first_name, last_name, avatar_url')
    .eq('id', commentData.user_id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMap: Record<string, any> = {}
  if (user) userMap[(user as any).id] = user

  return mapCommentFromDb(commentData, userMap)
}

// ===========================================
// DELETE COMMENT
// ===========================================

export async function deleteTaskComment(id: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_task_comments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCommentFromDb(data: any, userMap: Record<string, any>): TaskComment {
  const user = userMap[data['user_id'] as string]
  return {
    id: data['id'] as string,
    taskId: data['task_id'] as string,
    userId: data['user_id'] as string,
    content: data['content'] as string,
    parentCommentId: data['parent_comment_id'] as string | null,
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
    editedAt: data['edited_at'] as string | null,
    user: user ? {
      id: user.id,
      email: user.email,
      fullName: [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
      avatarUrl: user.avatar_url,
    } : undefined,
  }
}
