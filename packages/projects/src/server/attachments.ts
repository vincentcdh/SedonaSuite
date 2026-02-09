// ===========================================
// TASK ATTACHMENTS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TaskAttachment,
  CreateTaskAttachmentInput,
} from '../types'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET ATTACHMENTS FOR TASK
// ===========================================

export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  const { data, error } = await getClient()
    .from('projects_task_attachments')
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    task_id: input.taskId,
    file_name: input.fileName,
    file_size: input.fileSize,
    file_type: input.fileType,
    storage_path: input.storagePath,
    uploaded_by: userId,
  }

  const { data, error } = await getClient()
    .from('projects_task_attachments')
    .insert(insertData)
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
  const { data: attachment } = await getClient()
    .from('projects_task_attachments')
    .select('*')
    .eq('id', id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attachmentData = attachment as any
  if (attachmentData?.storage_path) {
    // Delete from Supabase Storage
    await getSupabaseClient()
      .storage
      .from('project-attachments')
      .remove([attachmentData.storage_path])
  }

  const { error } = await getClient()
    .from('projects_task_attachments')
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAttachmentFromDb(data: any): TaskAttachment {
  return {
    id: data['id'] as string,
    taskId: data['task_id'] as string,
    fileName: data['file_name'] as string,
    fileSize: data['file_size'] as number,
    fileType: data['file_type'] as string | null,
    storagePath: data['storage_path'] as string,
    uploadedBy: data['uploaded_by'] as string | null,
    uploadedAt: data['uploaded_at'] as string,
  }
}
