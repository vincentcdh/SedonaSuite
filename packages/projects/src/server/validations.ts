// ===========================================
// CLIENT VALIDATIONS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  ClientValidation,
  CreateValidationInput,
  RespondToValidationInput,
} from '../types'

function getProjectsClient() {
  return getSupabaseClient().schema('projects' as any) as any
}

// ===========================================
// VALIDATIONS CRUD
// ===========================================

export async function getClientValidations(projectId: string): Promise<ClientValidation[]> {
  const { data, error } = await getProjectsClient()
    .from('client_validations')
    .select(`
      *,
      validated_by_client:validated_by_client_id (
        id,
        client_name,
        client_email
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapValidationFromDb)
}

export async function getClientValidationById(id: string): Promise<ClientValidation | null> {
  const { data, error } = await getProjectsClient()
    .from('client_validations')
    .select(`
      *,
      validated_by_client:validated_by_client_id (
        id,
        client_name,
        client_email
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data ? mapValidationFromDb(data) : null
}

export async function getPendingValidations(projectId: string): Promise<ClientValidation[]> {
  const { data, error } = await getProjectsClient()
    .from('client_validations')
    .select(`
      *,
      validated_by_client:validated_by_client_id (
        id,
        client_name,
        client_email
      )
    `)
    .eq('project_id', projectId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapValidationFromDb)
}

export async function createClientValidation(input: CreateValidationInput): Promise<ClientValidation> {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await getProjectsClient()
    .from('client_validations')
    .insert({
      project_id: input.projectId,
      title: input.title,
      description: input.description || null,
      task_ids: input.taskIds,
      status: 'pending',
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  await getProjectsClient()
    .from('activity_log')
    .insert({
      project_id: input.projectId,
      action: 'validation_requested',
      user_id: user?.id,
      visible_to_client: true,
      details: { title: input.title },
    })

  // TODO: Notify clients about new validation request

  return mapValidationFromDb(data)
}

export async function respondToValidation(
  input: RespondToValidationInput,
  clientAccessId: string
): Promise<ClientValidation> {
  const updateData: Record<string, any> = {
    status: input.status,
    validated_by_client_id: clientAccessId,
    validated_at: new Date().toISOString(),
  }

  if (input.feedback) {
    updateData['client_feedback'] = input.feedback
  }

  if (input.changeRequests) {
    updateData['change_requests'] = input.changeRequests
  }

  const { data, error } = await getProjectsClient()
    .from('client_validations')
    .update(updateData)
    .eq('id', input.id)
    .select(`
      *,
      validated_by_client:validated_by_client_id (
        id,
        client_name,
        client_email
      )
    `)
    .single()

  if (error) throw error

  // Log activity
  await getProjectsClient()
    .from('activity_log')
    .insert({
      project_id: data.project_id,
      action: `validation_${input.status}`,
      client_access_id: clientAccessId,
      visible_to_client: true,
      details: { title: data.title, status: input.status },
    })

  // TODO: Notify team about validation response

  return mapValidationFromDb(data)
}

export async function deleteClientValidation(id: string): Promise<void> {
  const { error } = await getProjectsClient()
    .from('client_validations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getPendingValidationsCount(projectId: string): Promise<number> {
  const { count, error } = await getProjectsClient()
    .from('client_validations')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('status', 'pending')

  if (error) throw error

  return count || 0
}

// ===========================================
// HELPERS
// ===========================================

function mapValidationFromDb(data: any): ClientValidation {
  return {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    description: data.description,
    taskIds: data.task_ids || [],
    status: data.status,
    validatedByClientId: data.validated_by_client_id,
    validatedAt: data.validated_at,
    clientFeedback: data.client_feedback,
    changeRequests: data.change_requests,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    validatedByClient: data.validated_by_client ? {
      id: data.validated_by_client.id,
      clientName: data.validated_by_client.client_name,
      clientEmail: data.validated_by_client.client_email,
    } : null,
  }
}
