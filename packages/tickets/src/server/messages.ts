// ===========================================
// TICKET MESSAGES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TicketMessage,
  CreateMessageInput,
  UpdateMessageInput,
  MessageFilters,
} from '../types'

// ===========================================
// GET MESSAGES FOR TICKET
// ===========================================

export async function getTicketMessages(
  ticketId: string,
  filters: MessageFilters = {}
): Promise<TicketMessage[]> {
  let query = getSupabaseClient()
    .from('tickets_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (filters.isInternal !== undefined) {
    query = query.eq('is_internal', filters.isInternal)
  }
  if (filters.authorType) {
    query = query.eq('author_type', filters.authorType)
  }

  const { data, error } = await query

  if (error) throw error

  // Get author details
  const authorIds = [...new Set((data || []).filter((m: any) => m.author_id).map((m: any) => m.author_id))]
  const { data: authors } = authorIds.length > 0
    ? await getSupabaseClient().from('users').select('id, email, full_name, avatar_url').in('id', authorIds)
    : { data: [] }

  const authorMap: Record<string, any> = {}
  authors?.forEach((a: any) => { authorMap[a.id] = a })

  // Get attachments
  const messageIds = (data || []).map((m: any) => m.id)
  let attachments: any[] = []
  if (messageIds.length > 0) {
    const result = await getSupabaseClient().from('tickets_attachments').select('*').in('message_id', messageIds)
    attachments = result.data || []
  }

  const attachmentMap: Record<string, any[]> = {}
  for (const a of attachments) {
    if (!attachmentMap[a.message_id]) attachmentMap[a.message_id] = []
    attachmentMap[a.message_id]!.push({
      id: a.id,
      ticketId: a.ticket_id,
      messageId: a.message_id,
      fileName: a.file_name,
      fileSize: a.file_size,
      fileType: a.file_type,
      storagePath: a.storage_path,
      uploadedBy: a.uploaded_by,
      uploadedAt: a.uploaded_at,
    })
  }

  return (data || []).map((m: any) => ({
    ...mapMessageFromDb(m),
    author: m.author_id && authorMap[m.author_id] ? {
      id: authorMap[m.author_id].id,
      email: authorMap[m.author_id].email,
      fullName: authorMap[m.author_id].full_name,
      avatarUrl: authorMap[m.author_id].avatar_url,
    } : null,
    attachments: attachmentMap[m.id] || [],
  }))
}

// ===========================================
// CREATE MESSAGE
// ===========================================

export async function createTicketMessage(
  input: CreateMessageInput,
  userId?: string,
  authorType: 'agent' | 'customer' = 'agent'
): Promise<TicketMessage> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_messages')
    .insert({
      ticket_id: input.ticketId,
      author_type: authorType,
      author_id: userId,
      author_name: input.authorName,
      author_email: input.authorEmail,
      content: input.content,
      content_type: input.contentType || 'text',
      message_type: input.messageType || 'reply',
      is_internal: input.isInternal ?? false,
    })
    .select()
    .single()

  if (error) throw error

  return mapMessageFromDb(data)
}

// ===========================================
// UPDATE MESSAGE
// ===========================================

export async function updateTicketMessage(input: UpdateMessageInput): Promise<TicketMessage> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_messages')
    .update({
      content: input.content,
      edited_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapMessageFromDb(data)
}

// ===========================================
// DELETE MESSAGE
// ===========================================

export async function deleteTicketMessage(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('tickets_messages')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// ADD INTERNAL NOTE
// ===========================================

export async function addInternalNote(
  ticketId: string,
  content: string,
  userId: string
): Promise<TicketMessage> {
  return createTicketMessage({
    ticketId,
    content,
    messageType: 'note',
    isInternal: true,
  }, userId, 'agent')
}

// ===========================================
// HELPERS
// ===========================================

function mapMessageFromDb(data: any): TicketMessage {
  return {
    id: data.id as string,
    ticketId: data.ticket_id as string,
    authorType: data.author_type as TicketMessage['authorType'],
    authorId: data.author_id as string | null,
    authorName: data.author_name as string | null,
    authorEmail: data.author_email as string | null,
    content: data.content as string,
    contentType: (data.content_type as 'text' | 'html') || 'text',
    messageType: (data.message_type as TicketMessage['messageType']) || 'reply',
    isInternal: (data.is_internal as boolean) || false,
    emailMessageId: data.email_message_id as string | null,
    emailInReplyTo: data.email_in_reply_to as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    editedAt: data.edited_at as string | null,
  }
}
