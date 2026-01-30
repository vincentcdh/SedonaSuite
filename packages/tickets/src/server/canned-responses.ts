// ===========================================
// CANNED RESPONSES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  CannedResponse,
  CreateCannedResponseInput,
  UpdateCannedResponseInput,
} from '../types'

function getTicketsClient() {
  return getSupabaseClient().schema('tickets' as any) as any
}

// ===========================================
// GET ALL CANNED RESPONSES
// ===========================================

export async function getCannedResponses(
  organizationId: string,
  userId?: string
): Promise<CannedResponse[]> {
  let query = getTicketsClient()
    .from('canned_responses')
    .select('*')
    .eq('organization_id', organizationId)
    .order('category', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  // If userId provided, filter to show only shared + user's personal responses
  if (userId) {
    query = query.or(`is_personal.eq.false,created_by.eq.${userId}`)
  } else {
    // Only show shared responses
    query = query.eq('is_personal', false)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(mapCannedResponseFromDb)
}

// ===========================================
// GET CANNED RESPONSES BY CATEGORY
// ===========================================

export async function getCannedResponsesByCategory(
  organizationId: string,
  category: string,
  userId?: string
): Promise<CannedResponse[]> {
  let query = getTicketsClient()
    .from('canned_responses')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('category', category)
    .order('name', { ascending: true })

  if (userId) {
    query = query.or(`is_personal.eq.false,created_by.eq.${userId}`)
  } else {
    query = query.eq('is_personal', false)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(mapCannedResponseFromDb)
}

// ===========================================
// GET CANNED RESPONSE BY ID
// ===========================================

export async function getCannedResponseById(id: string): Promise<CannedResponse | null> {
  const { data, error } = await getTicketsClient()
    .from('canned_responses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapCannedResponseFromDb(data)
}

// ===========================================
// GET CANNED RESPONSE BY SHORTCUT
// ===========================================

export async function getCannedResponseByShortcut(
  organizationId: string,
  shortcut: string,
  userId?: string
): Promise<CannedResponse | null> {
  let query = getTicketsClient()
    .from('canned_responses')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('shortcut', shortcut)

  if (userId) {
    query = query.or(`is_personal.eq.false,created_by.eq.${userId}`)
  }

  const { data, error } = await query.limit(1).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapCannedResponseFromDb(data)
}

// ===========================================
// SEARCH CANNED RESPONSES
// ===========================================

export async function searchCannedResponses(
  organizationId: string,
  searchTerm: string,
  userId?: string
): Promise<CannedResponse[]> {
  let query = getTicketsClient()
    .from('canned_responses')
    .select('*')
    .eq('organization_id', organizationId)
    .or(`name.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,shortcut.ilike.%${searchTerm}%`)
    .order('name', { ascending: true })
    .limit(20)

  if (userId) {
    query = query.or(`is_personal.eq.false,created_by.eq.${userId}`)
  } else {
    query = query.eq('is_personal', false)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(mapCannedResponseFromDb)
}

// ===========================================
// CREATE CANNED RESPONSE
// ===========================================

export async function createCannedResponse(
  organizationId: string,
  input: CreateCannedResponseInput,
  userId?: string
): Promise<CannedResponse> {
  const { data, error } = await getTicketsClient()
    .from('canned_responses')
    .insert({
      organization_id: organizationId,
      name: input.name,
      content: input.content,
      category: input.category,
      is_personal: input.isPersonal ?? false,
      created_by: userId,
      shortcut: input.shortcut,
    })
    .select()
    .single()

  if (error) throw error

  return mapCannedResponseFromDb(data)
}

// ===========================================
// UPDATE CANNED RESPONSE
// ===========================================

export async function updateCannedResponse(
  input: UpdateCannedResponseInput
): Promise<CannedResponse> {
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.content !== undefined) updateData.content = input.content
  if (input.category !== undefined) updateData.category = input.category
  if (input.isPersonal !== undefined) updateData.is_personal = input.isPersonal
  if (input.shortcut !== undefined) updateData.shortcut = input.shortcut

  const { data, error } = await getTicketsClient()
    .from('canned_responses')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapCannedResponseFromDb(data)
}

// ===========================================
// DELETE CANNED RESPONSE
// ===========================================

export async function deleteCannedResponse(id: string): Promise<void> {
  const { error } = await getTicketsClient()
    .from('canned_responses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET CATEGORIES LIST
// ===========================================

export async function getCannedResponseCategories(
  organizationId: string
): Promise<string[]> {
  const { data, error } = await getTicketsClient()
    .from('canned_responses')
    .select('category')
    .eq('organization_id', organizationId)
    .not('category', 'is', null)

  if (error) throw error

  // Get unique categories
  const categories = [...new Set((data || []).map((d: any) => d.category))] as string[]
  return categories.sort()
}

// ===========================================
// RENDER CANNED RESPONSE WITH VARIABLES
// ===========================================

export function renderCannedResponse(
  content: string,
  variables: Record<string, string>
): string {
  let rendered = content

  // Replace variables in format {{variable_name}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi')
    rendered = rendered.replace(regex, value)
  })

  return rendered
}

// ===========================================
// HELPERS
// ===========================================

function mapCannedResponseFromDb(data: any): CannedResponse {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    content: data.content as string,
    category: data.category as string | null,
    isPersonal: data.is_personal as boolean,
    createdBy: data.created_by as string | null,
    shortcut: data.shortcut as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
