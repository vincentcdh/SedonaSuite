// ===========================================
// CLIENT QUESTIONS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  ClientQuestion,
  CreateClientQuestionInput,
  AnswerClientQuestionInput,
} from '../types'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// CLIENT QUESTIONS CRUD
// ===========================================

export async function getClientQuestions(projectId: string): Promise<ClientQuestion[]> {
  const { data, error } = await getClient()
    .from('projects_client_questions')
    .select(`
      *,
      client_access:client_access_id (
        id,
        client_name,
        client_email
      ),
      answered_by_user:answered_by (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapClientQuestionFromDb)
}

export async function getClientQuestionById(id: string): Promise<ClientQuestion | null> {
  const { data, error } = await getClient()
    .from('projects_client_questions')
    .select(`
      *,
      client_access:client_access_id (
        id,
        client_name,
        client_email
      ),
      answered_by_user:answered_by (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data ? mapClientQuestionFromDb(data) : null
}

export async function createClientQuestion(
  input: CreateClientQuestionInput,
  clientAccessId: string
): Promise<ClientQuestion> {
  const { data, error } = await getClient()
    .from('projects_client_questions')
    .insert({
      project_id: input.projectId,
      client_access_id: clientAccessId,
      subject: input.subject,
      message: input.message,
      status: 'open',
    })
    .select(`
      *,
      client_access:client_access_id (
        id,
        client_name,
        client_email
      )
    `)
    .single()

  if (error) throw error

  // TODO: Notify team about new question

  return mapClientQuestionFromDb(data)
}

export async function answerClientQuestion(input: AnswerClientQuestionInput): Promise<ClientQuestion> {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await getClient()
    .from('projects_client_questions')
    .update({
      answer: input.answer,
      answered_by: user?.id,
      answered_at: new Date().toISOString(),
      status: 'answered',
    })
    .eq('id', input.id)
    .select(`
      *,
      client_access:client_access_id (
        id,
        client_name,
        client_email
      ),
      answered_by_user:answered_by (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .single()

  if (error) throw error

  // TODO: Notify client about answer

  return mapClientQuestionFromDb(data)
}

export async function closeClientQuestion(id: string): Promise<ClientQuestion> {
  const { data, error } = await getClient()
    .from('projects_client_questions')
    .update({ status: 'closed' })
    .eq('id', id)
    .select(`
      *,
      client_access:client_access_id (
        id,
        client_name,
        client_email
      ),
      answered_by_user:answered_by (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .single()

  if (error) throw error

  return mapClientQuestionFromDb(data)
}

export async function reopenClientQuestion(id: string): Promise<ClientQuestion> {
  const { data, error } = await getClient()
    .from('projects_client_questions')
    .update({ status: 'open' })
    .eq('id', id)
    .select(`
      *,
      client_access:client_access_id (
        id,
        client_name,
        client_email
      ),
      answered_by_user:answered_by (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .single()

  if (error) throw error

  return mapClientQuestionFromDb(data)
}

export async function getOpenQuestionsCount(projectId: string): Promise<number> {
  const { count, error } = await getClient()
    .from('projects_client_questions')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('status', 'open')

  if (error) throw error

  return count || 0
}

// ===========================================
// HELPERS
// ===========================================

function mapClientQuestionFromDb(data: any): ClientQuestion {
  return {
    id: data.id,
    projectId: data.project_id,
    clientAccessId: data.client_access_id,
    subject: data.subject,
    message: data.message,
    status: data.status,
    answeredBy: data.answered_by,
    answeredAt: data.answered_at,
    answer: data.answer,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    clientAccess: data.client_access ? {
      id: data.client_access.id,
      clientName: data.client_access.client_name,
      clientEmail: data.client_access.client_email,
    } : null,
    answeredByUser: data.answered_by_user ? {
      id: data.answered_by_user.id,
      email: data.answered_by_user.email,
      fullName: data.answered_by_user.raw_user_meta_data?.full_name || null,
    } : null,
  }
}
