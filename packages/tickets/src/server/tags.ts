// ===========================================
// TICKET TAGS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TicketTag,
  CreateTagInput,
  UpdateTagInput,
} from '../types'

// ===========================================
// GET ALL TAGS
// ===========================================

export async function getTags(organizationId: string): Promise<TicketTag[]> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_tags')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) throw error

  return (data || []).map(mapTagFromDb)
}

// ===========================================
// GET TAG BY ID
// ===========================================

export async function getTagById(id: string): Promise<TicketTag | null> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_tags')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapTagFromDb(data)
}

// ===========================================
// GET TAG BY NAME
// ===========================================

export async function getTagByName(
  organizationId: string,
  name: string
): Promise<TicketTag | null> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_tags')
    .select('*')
    .eq('organization_id', organizationId)
    .ilike('name', name)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapTagFromDb(data)
}

// ===========================================
// CREATE TAG
// ===========================================

export async function createTag(
  organizationId: string,
  input: CreateTagInput
): Promise<TicketTag> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_tags')
    .insert({
      organization_id: organizationId,
      name: input.name,
      color: input.color || '#6B7280',
    })
    .select()
    .single()

  if (error) throw error

  return mapTagFromDb(data)
}

// ===========================================
// UPDATE TAG
// ===========================================

export async function updateTag(input: UpdateTagInput): Promise<TicketTag> {
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.color !== undefined) updateData.color = input.color

  const { data, error } = await getSupabaseClient()
    .from('tickets_tags')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapTagFromDb(data)
}

// ===========================================
// DELETE TAG
// ===========================================

export async function deleteTag(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('tickets_tags')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET OR CREATE TAG
// ===========================================

export async function getOrCreateTag(
  organizationId: string,
  name: string,
  color?: string
): Promise<TicketTag> {
  // Try to find existing tag
  const existing = await getTagByName(organizationId, name)
  if (existing) return existing

  // Create new tag
  return createTag(organizationId, { name, color })
}

// ===========================================
// GET TAGS USAGE COUNT
// ===========================================

export async function getTagsWithUsageCount(
  organizationId: string
): Promise<(TicketTag & { ticketCount: number })[]> {
  // Get all tags
  const tags = await getTags(organizationId)

  // Get all tickets with tags
  const { data: tickets, error } = await getSupabaseClient()
    .from('tickets_tickets')
    .select('tags')
    .eq('organization_id', organizationId)

  if (error) throw error

  // Count tag usage
  const tagCountMap: Record<string, number> = {}
  tickets?.forEach((ticket: { tags: string[] | null }) => {
    ticket.tags?.forEach((tag: string) => {
      tagCountMap[tag] = (tagCountMap[tag] || 0) + 1
    })
  })

  return tags.map(tag => ({
    ...tag,
    ticketCount: tagCountMap[tag.name] || 0,
  }))
}

// ===========================================
// HELPERS
// ===========================================

function mapTagFromDb(data: any): TicketTag {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    color: data.color as string,
    createdAt: data.created_at as string,
  }
}
