// ===========================================
// ACTIVITY LOG SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type { ActivityLogEntry } from '../types'

function getProjectsClient() {
  return getSupabaseClient().schema('projects' as any) as any
}

// ===========================================
// ACTIVITY LOG
// ===========================================

export async function getProjectActivity(
  projectId: string,
  options?: {
    limit?: number
    visibleToClientOnly?: boolean
  }
): Promise<ActivityLogEntry[]> {
  let query = getProjectsClient()
    .from('activity_log')
    .select(`
      *,
      user:user_id (
        id,
        email,
        raw_user_meta_data
      ),
      client_access:client_access_id (
        id,
        client_name
      ),
      task:task_id (
        id,
        title
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (options?.visibleToClientOnly) {
    query = query.eq('visible_to_client', true)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(mapActivityLogFromDb)
}

export async function logActivity(
  projectId: string,
  action: string,
  options?: {
    taskId?: string
    details?: Record<string, unknown>
    visibleToClient?: boolean
  }
): Promise<ActivityLogEntry> {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await getProjectsClient()
    .from('activity_log')
    .insert({
      project_id: projectId,
      action,
      task_id: options?.taskId || null,
      user_id: user?.id,
      details: options?.details || {},
      visible_to_client: options?.visibleToClient ?? true,
    })
    .select(`
      *,
      user:user_id (
        id,
        email,
        raw_user_meta_data
      ),
      task:task_id (
        id,
        title
      )
    `)
    .single()

  if (error) throw error

  return mapActivityLogFromDb(data)
}

export async function logClientActivity(
  projectId: string,
  clientAccessId: string,
  action: string,
  options?: {
    taskId?: string
    details?: Record<string, unknown>
  }
): Promise<ActivityLogEntry> {
  const { data, error } = await getProjectsClient()
    .from('activity_log')
    .insert({
      project_id: projectId,
      action,
      task_id: options?.taskId || null,
      client_access_id: clientAccessId,
      details: options?.details || {},
      visible_to_client: true,
    })
    .select(`
      *,
      client_access:client_access_id (
        id,
        client_name
      ),
      task:task_id (
        id,
        title
      )
    `)
    .single()

  if (error) throw error

  return mapActivityLogFromDb(data)
}

// ===========================================
// ACTIVITY FEED HELPERS
// ===========================================

export function getActivityMessage(entry: ActivityLogEntry): string {
  const actorName = entry.user?.fullName || entry.clientAccess?.clientName || 'Quelqu\'un'
  const taskTitle = entry.task?.title || ''
  const details = entry.details as Record<string, any>

  switch (entry.action) {
    case 'task_created':
      return `${actorName} a cree la tache "${details['title'] || taskTitle}"`
    case 'task_completed':
      return `${actorName} a termine la tache "${details['title'] || taskTitle}"`
    case 'task_status_changed':
      return `${actorName} a change le statut de "${details['title'] || taskTitle}"`
    case 'comment_added':
      return `${actorName} a ajoute un commentaire${taskTitle ? ` sur "${taskTitle}"` : ''}`
    case 'file_uploaded':
      return `${actorName} a ajoute un fichier "${details['fileName'] || ''}"`
    case 'validation_requested':
      return `${actorName} a demande une validation: "${details['title'] || ''}"`
    case 'validation_approved':
      return `${actorName} a approuve "${details['title'] || ''}"`
    case 'validation_rejected':
      return `${actorName} a rejete "${details['title'] || ''}"`
    case 'validation_changes_requested':
      return `${actorName} a demande des modifications sur "${details['title'] || ''}"`
    case 'question_asked':
      return `${actorName} a pose une question: "${details['subject'] || ''}"`
    case 'question_answered':
      return `${actorName} a repondu a la question: "${details['subject'] || ''}"`
    case 'member_added':
      return `${actorName} a ajoute un membre a l'equipe`
    case 'member_removed':
      return `${actorName} a retire un membre de l'equipe`
    case 'project_updated':
      return `${actorName} a mis a jour le projet`
    default:
      return `${actorName} a effectue une action`
  }
}

export function getActivityIcon(action: string): string {
  switch (action) {
    case 'task_created':
      return 'plus'
    case 'task_completed':
      return 'check-circle'
    case 'task_status_changed':
      return 'arrow-right'
    case 'comment_added':
      return 'message-square'
    case 'file_uploaded':
      return 'file'
    case 'validation_requested':
      return 'clipboard-check'
    case 'validation_approved':
      return 'check'
    case 'validation_rejected':
      return 'x'
    case 'validation_changes_requested':
      return 'edit'
    case 'question_asked':
      return 'help-circle'
    case 'question_answered':
      return 'message-circle'
    case 'member_added':
      return 'user-plus'
    case 'member_removed':
      return 'user-minus'
    case 'project_updated':
      return 'settings'
    default:
      return 'activity'
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapActivityLogFromDb(data: any): ActivityLogEntry {
  return {
    id: data.id,
    projectId: data.project_id,
    action: data.action,
    taskId: data.task_id,
    userId: data.user_id,
    clientAccessId: data.client_access_id,
    details: data.details || {},
    visibleToClient: data.visible_to_client,
    createdAt: data.created_at,
    user: data.user ? {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.raw_user_meta_data?.full_name || null,
    } : null,
    clientAccess: data.client_access ? {
      id: data.client_access.id,
      clientName: data.client_access.client_name,
    } : null,
    task: data.task ? {
      id: data.task.id,
      title: data.task.title,
    } : null,
  }
}
