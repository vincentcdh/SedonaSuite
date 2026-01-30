// ===========================================
// TICKET CATEGORIES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TicketCategory,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types'

function getTicketsClient() {
  return getSupabaseClient().schema('tickets' as any) as any
}

// ===========================================
// GET ALL CATEGORIES
// ===========================================

export async function getCategories(organizationId: string): Promise<TicketCategory[]> {
  const { data, error } = await getTicketsClient()
    .from('categories')
    .select('*')
    .eq('organization_id', organizationId)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map(mapCategoryFromDb)
}

// ===========================================
// GET ACTIVE CATEGORIES
// ===========================================

export async function getActiveCategories(organizationId: string): Promise<TicketCategory[]> {
  const { data, error } = await getTicketsClient()
    .from('categories')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map(mapCategoryFromDb)
}

// ===========================================
// GET CATEGORY BY ID
// ===========================================

export async function getCategoryById(id: string): Promise<TicketCategory | null> {
  const { data, error } = await getTicketsClient()
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapCategoryFromDb(data)
}

// ===========================================
// CREATE CATEGORY
// ===========================================

export async function createCategory(
  organizationId: string,
  input: CreateCategoryInput
): Promise<TicketCategory> {
  const { data, error } = await getTicketsClient()
    .from('categories')
    .insert({
      organization_id: organizationId,
      name: input.name,
      description: input.description,
      color: input.color || '#6B7280',
      icon: input.icon || 'tag',
      parent_id: input.parentId,
      is_active: input.isActive ?? true,
      position: input.position ?? 0,
    })
    .select()
    .single()

  if (error) throw error

  return mapCategoryFromDb(data)
}

// ===========================================
// UPDATE CATEGORY
// ===========================================

export async function updateCategory(input: UpdateCategoryInput): Promise<TicketCategory> {
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.color !== undefined) updateData.color = input.color
  if (input.icon !== undefined) updateData.icon = input.icon
  if (input.parentId !== undefined) updateData.parent_id = input.parentId
  if (input.isActive !== undefined) updateData.is_active = input.isActive
  if (input.position !== undefined) updateData.position = input.position

  const { data, error } = await getTicketsClient()
    .from('categories')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapCategoryFromDb(data)
}

// ===========================================
// DELETE CATEGORY
// ===========================================

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await getTicketsClient()
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// REORDER CATEGORIES
// ===========================================

export async function reorderCategories(
  organizationId: string,
  orderedIds: string[]
): Promise<void> {
  // Update positions in order
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await getTicketsClient()
      .from('categories')
      .update({ position: i })
      .eq('id', orderedIds[i])
      .eq('organization_id', organizationId)

    if (error) throw error
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapCategoryFromDb(data: any): TicketCategory {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    description: data.description as string | null,
    color: data.color as string,
    icon: data.icon as string,
    parentId: data.parent_id as string | null,
    isActive: data.is_active as boolean,
    position: data.position as number,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
