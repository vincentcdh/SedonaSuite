// ===========================================
// TASK ATTACHMENTS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TaskAttachment,
  CreateTaskAttachmentInput,
} from '../types'

function getProjectsClient() {
  return getSupabaseClient().schema('projects' as any) as any
}

// ===========================================
// GET ATTACHMENTS FOR TASK
// ===========================================

export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  const { data, error } = await getProjectsClient()
    .from('task_attachments')
    .select('*')
    .eq('task_id', taskId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapAttachmentFromDb)
}

// ===========================================
// CREATE ATTACHMENT
// ===========================================

export async function createTaskAttachment(
  input: CreateTaskAttachmentInput,
  userId?: string
): Promise<TaskAttachment> {
  const { data, error } = await getProjectsClient()
    .from('task_attachments')
    .insert({
      task_id: input.taskId,
      file_name: input.fileName,
      file_size: input.fileSize,
      file_type: input.fileType,
      storage_path: input.storagePath,
      uploaded_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  return mapAttachmentFromDb(data)
}

// ===========================================
// DELETE ATTACHMENT
// ===========================================

export async function deleteTaskAttachment(id: string): Promise<void> {
  // Get attachment to delete from storage
  const { data: attachment } = await getProjectsClient()
    .from('task_attachments')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (attachment?.storage_path) {
    // Delete from Supabase Storage
    await getSupabaseClient()
      .storage
      .from('project-attachments')
      .remove([attachment.storage_path])
  }

  const { error } = await getProjectsClient()
    .from('task_attachments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET ATTACHMENT URL
// ===========================================

export async function getAttachmentUrl(storagePath: string): Promise<string> {
  const { data } = await getSupabaseClient()
    .storage
    .from('project-attachments')
    .createSignedUrl(storagePath, 3600) // 1 hour expiry

  return data?.signedUrl || ''
}

// ===========================================
// HELPERS
// ===========================================

function mapAttachmentFromDb(data: Record<string, unknown>): TaskAttachment {
  return {
    id: data.id as string,
    taskId: data.task_id as string,
    fileName: data.file_name as string,
    fileSize: data.file_size as number,
    fileType: data.file_type as string | null,
    storagePath: data.storage_path as string,
    uploadedBy: data.uploaded_by as string | null,
    uploadedAt: data.uploaded_at as string,
  }
}
