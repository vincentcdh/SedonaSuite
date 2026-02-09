// ===========================================
// TICKET SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Ticket,
  TicketWithRelations,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
  PaginatedResult,
  PaginationParams,
  TicketStats,
} from '../types'

// ===========================================
// GET TICKETS
// ===========================================

export async function getTickets(
  organizationId: string,
  filters: TicketFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<TicketWithRelations>> {
  const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getSupabaseClient()
    .from('tickets_tickets')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)

  // Apply filters
  if (filters.search) {
    query = query.or(`subject.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%,requester_email.ilike.%${filters.search}%`)
  }
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }
  if (filters.priority) {
    if (Array.isArray(filters.priority)) {
      query = query.in('priority', filters.priority)
    } else {
      query = query.eq('priority', filters.priority)
    }
  }
  if (filters.assignedTo !== undefined) {
    if (filters.assignedTo === null) {
      query = query.is('assigned_to', null)
    } else {
      query = query.eq('assigned_to', filters.assignedTo)
    }
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }
  if (filters.slaBreached !== undefined) {
    query = query.eq('sla_breached', filters.slaBreached)
  }
  if (filters.source) {
    query = query.eq('source', filters.source)
  }
  if (filters.createdFrom) {
    query = query.gte('created_at', filters.createdFrom)
  }
  if (filters.createdTo) {
    query = query.lte('created_at', filters.createdTo)
  }
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get categories and assignees
  const categoryIds = [...new Set((data || []).filter((t: any) => t.category_id).map((t: any) => t.category_id))]
  const assigneeIds = [...new Set((data || []).filter((t: any) => t.assigned_to).map((t: any) => t.assigned_to))]

  const [categories, assignees] = await Promise.all([
    categoryIds.length > 0 ? getSupabaseClient().from('tickets_categories').select('*').in('id', categoryIds) : { data: [] },
    assigneeIds.length > 0 ? getSupabaseClient().from('users').select('id, email, full_name, avatar_url').in('id', assigneeIds) : { data: [] },
  ])

  const categoryMap: Record<string, any> = {}
  categories.data?.forEach((c: any) => { categoryMap[c.id] = c })

  const assigneeMap: Record<string, any> = {}
  assignees.data?.forEach((a: any) => { assigneeMap[a.id] = a })

  return {
    data: (data || []).map((t: any) => ({
      ...mapTicketFromDb(t),
      category: t.category_id ? mapCategoryFromDb(categoryMap[t.category_id]) : null,
      assignee: t.assigned_to && assigneeMap[t.assigned_to] ? {
        id: assigneeMap[t.assigned_to].id,
        email: assigneeMap[t.assigned_to].email,
        fullName: assigneeMap[t.assigned_to].full_name,
        avatarUrl: assigneeMap[t.assigned_to].avatar_url,
      } : null,
    })),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET TICKET BY ID
// ===========================================

export async function getTicketById(id: string): Promise<TicketWithRelations | null> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const ticket = mapTicketFromDb(data)

  // Get related data
  const [categoryResult, assigneeResult, messagesCount] = await Promise.all([
    ticket.categoryId ? getSupabaseClient().from('tickets_categories').select('*').eq('id', ticket.categoryId).single() : { data: null },
    ticket.assignedTo ? getSupabaseClient().from('users').select('id, email, full_name, avatar_url').eq('id', ticket.assignedTo).single() : { data: null },
    getSupabaseClient().from('tickets_messages').select('id', { count: 'exact', head: true }).eq('ticket_id', id),
  ]) as any[]

  return {
    ...ticket,
    category: categoryResult.data ? mapCategoryFromDb(categoryResult.data) : null,
    assignee: assigneeResult.data ? {
      id: assigneeResult.data.id,
      email: assigneeResult.data.email,
      fullName: assigneeResult.data.full_name,
      avatarUrl: assigneeResult.data.avatar_url,
    } : null,
    messagesCount: messagesCount.count || 0,
  }
}

// ===========================================
// GET TICKET BY NUMBER
// ===========================================

export async function getTicketByNumber(ticketNumber: string): Promise<TicketWithRelations | null> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_tickets')
    .select('*')
    .eq('ticket_number', ticketNumber)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return getTicketById(data.id)
}

// ===========================================
// CREATE TICKET
// ===========================================

export async function createTicket(
  organizationId: string,
  input: CreateTicketInput,
  userId?: string
): Promise<Ticket> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    organization_id: organizationId,
    subject: input.subject,
    description: input.description,
    priority: input.priority || 'normal',
    category_id: input.categoryId,
    assigned_to: input.assignedTo,
    source: input.source || 'web',
    requester_name: input.requesterName,
    requester_email: input.requesterEmail,
    requester_phone: input.requesterPhone,
    contact_id: input.contactId,
    company_id: input.companyId,
    tags: input.tags || [],
    custom_fields: input.customFields || {},
    created_by: userId,
  }

  const { data, error } = await getSupabaseClient()
    .from('tickets_tickets')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await getSupabaseClient()
    .from('tickets_activity_log')
    .insert({
      ticket_id: data.id,
      activity_type: 'created',
      description: 'Ticket cree',
      actor_id: userId,
      actor_type: 'user',
    })

  return mapTicketFromDb(data)
}

// ===========================================
// UPDATE TICKET
// ===========================================

export async function updateTicket(input: UpdateTicketInput): Promise<Ticket> {
  const updateData: any = {}

  if (input.subject !== undefined) updateData.subject = input.subject
  if (input.description !== undefined) updateData.description = input.description
  if (input.status !== undefined) updateData.status = input.status
  if (input.priority !== undefined) updateData.priority = input.priority
  if (input.categoryId !== undefined) updateData.category_id = input.categoryId
  if (input.assignedTo !== undefined) updateData.assigned_to = input.assignedTo
  if (input.requesterName !== undefined) updateData.requester_name = input.requesterName
  if (input.requesterEmail !== undefined) updateData.requester_email = input.requesterEmail
  if (input.requesterPhone !== undefined) updateData.requester_phone = input.requesterPhone
  if (input.tags !== undefined) updateData.tags = input.tags
  if (input.customFields !== undefined) updateData.custom_fields = input.customFields

  const { data, error } = await getSupabaseClient()
    .from('tickets_tickets')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapTicketFromDb(data)
}

// ===========================================
// DELETE TICKET
// ===========================================

export async function deleteTicket(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('tickets_tickets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// ASSIGN TICKET
// ===========================================

export async function assignTicket(ticketId: string, assigneeId: string | null): Promise<Ticket> {
  return updateTicket({ id: ticketId, assignedTo: assigneeId || undefined })
}

// ===========================================
// CHANGE TICKET STATUS
// ===========================================

export async function changeTicketStatus(ticketId: string, status: Ticket['status']): Promise<Ticket> {
  return updateTicket({ id: ticketId, status })
}

// ===========================================
// GET TICKET STATS
// ===========================================

export async function getTicketStats(organizationId: string): Promise<TicketStats> {
  const client = getSupabaseClient()

  // Count tickets by status directly from the table
  const [
    { count: totalTickets },
    { count: openTickets },
    { count: inProgressTickets },
    { count: waitingTickets },
    { count: resolvedTickets },
    { count: closedTickets },
    { count: slaBreachedTickets },
  ] = await Promise.all([
    client.from('tickets_tickets').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).is('deleted_at', null),
    client.from('tickets_tickets').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'open').is('deleted_at', null),
    client.from('tickets_tickets').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'in_progress').is('deleted_at', null),
    client.from('tickets_tickets').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'waiting').is('deleted_at', null),
    client.from('tickets_tickets').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'resolved').is('deleted_at', null),
    client.from('tickets_tickets').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'closed').is('deleted_at', null),
    client.from('tickets_tickets').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).or('sla_response_breached.eq.true,sla_resolution_breached.eq.true').is('deleted_at', null),
  ])

  // Count tickets created in last 24h
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: createdLast24h } = await client
    .from('tickets_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('created_at', twentyFourHoursAgo)
    .is('deleted_at', null)

  const { count: resolvedLast24h } = await client
    .from('tickets_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('resolved_at', twentyFourHoursAgo)
    .is('deleted_at', null)

  return {
    totalTickets: totalTickets || 0,
    openTickets: openTickets || 0,
    inProgressTickets: inProgressTickets || 0,
    waitingTickets: waitingTickets || 0,
    resolvedTickets: resolvedTickets || 0,
    closedTickets: closedTickets || 0,
    slaBreachedTickets: slaBreachedTickets || 0,
    createdLast24h: createdLast24h || 0,
    resolvedLast24h: resolvedLast24h || 0,
    avgFirstResponseMinutes: null, // Could be computed with more complex query
    avgResolutionMinutes: null,
    avgSatisfaction: null,
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapTicketFromDb(data: any): Ticket {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    ticketNumber: data.ticket_number as string,
    subject: data.subject as string,
    description: data.description as string | null,
    status: data.status as Ticket['status'],
    priority: data.priority as Ticket['priority'],
    assignedTo: data.assigned_to as string | null,
    assignedAt: data.assigned_at as string | null,
    categoryId: data.category_id as string | null,
    slaPolicyId: data.sla_policy_id as string | null,
    slaFirstResponseDue: data.sla_first_response_due as string | null,
    slaResolutionDue: data.sla_resolution_due as string | null,
    slaFirstResponseAt: data.sla_first_response_at as string | null,
    slaResolvedAt: data.sla_resolved_at as string | null,
    slaBreached: (data.sla_breached as boolean) || false,
    source: (data.source as Ticket['source']) || 'web',
    sourceEmail: data.source_email as string | null,
    sourceMessageId: data.source_message_id as string | null,
    requesterName: data.requester_name as string | null,
    requesterEmail: data.requester_email as string | null,
    requesterPhone: data.requester_phone as string | null,
    contactId: data.contact_id as string | null,
    companyId: data.company_id as string | null,
    satisfactionRating: data.satisfaction_rating as number | null,
    satisfactionComment: data.satisfaction_comment as string | null,
    satisfactionRatedAt: data.satisfaction_rated_at as string | null,
    customFields: (data.custom_fields as Record<string, unknown>) || {},
    tags: (data.tags as string[]) || [],
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    firstResponseAt: data.first_response_at as string | null,
    resolvedAt: data.resolved_at as string | null,
    closedAt: data.closed_at as string | null,
  }
}

function mapCategoryFromDb(data: any) {
  if (!data) return null
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    description: data.description as string | null,
    color: (data.color as string) || '#6B7280',
    icon: (data.icon as string) || 'tag',
    parentId: data.parent_id as string | null,
    isActive: (data.is_active as boolean) ?? true,
    position: (data.position as number) || 0,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
