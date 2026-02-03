// ===========================================
// KB CATEGORIES SERVER FUNCTIONS
// ===========================================
// KB categories are stored in a dedicated table (tickets_kb_categories)
// separate from ticket categories

import { getSupabaseClient } from '@sedona/database'

// ===========================================
// TYPES
// ===========================================

export interface KbCategory {
  id: string
  organizationId: string
  name: string
  description: string | null
  color: string
  icon: string | null
  position: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateKbCategoryInput {
  name: string
  description?: string
  color?: string
  icon?: string
}

export interface UpdateKbCategoryInput {
  id: string
  name?: string
  description?: string
  color?: string
  icon?: string
  isActive?: boolean
}

// ===========================================
// GET KB CATEGORIES
// ===========================================

export async function getKbCategories(organizationId: string): Promise<KbCategory[]> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_categories')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map(mapKbCategoryFromDb)
}

// ===========================================
// GET ALL KB CATEGORIES (including inactive)
// ===========================================

export async function getAllKbCategories(organizationId: string): Promise<KbCategory[]> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_categories')
    .select('*')
    .eq('organization_id', organizationId)
    .order('position', { ascending: true })

  if (error) throw error

  return (data || []).map(mapKbCategoryFromDb)
}

// ===========================================
// GET KB CATEGORY BY ID
// ===========================================

export async function getKbCategoryById(id: string): Promise<KbCategory | null> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapKbCategoryFromDb(data)
}

// ===========================================
// CREATE KB CATEGORY
// ===========================================

export async function createKbCategory(
  organizationId: string,
  input: CreateKbCategoryInput
): Promise<KbCategory> {
  // Get the highest position to add at the end
  const { data: existingCategories } = await getSupabaseClient()
    .from('tickets_kb_categories')
    .select('position')
    .eq('organization_id', organizationId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = (existingCategories?.[0]?.position ?? -1) + 1

  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_categories')
    .insert({
      organization_id: organizationId,
      name: input.name,
      description: input.description || null,
      color: input.color || '#6B7280',
      icon: input.icon || 'folder',
      position: nextPosition,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  return mapKbCategoryFromDb(data)
}

// ===========================================
// UPDATE KB CATEGORY
// ===========================================

export async function updateKbCategory(input: UpdateKbCategoryInput): Promise<KbCategory> {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData['name'] = input.name
  if (input.description !== undefined) updateData['description'] = input.description
  if (input.color !== undefined) updateData['color'] = input.color
  if (input.icon !== undefined) updateData['icon'] = input.icon
  if (input.isActive !== undefined) updateData['is_active'] = input.isActive

  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_categories')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapKbCategoryFromDb(data)
}

// ===========================================
// DELETE KB CATEGORY
// ===========================================

export async function deleteKbCategory(id: string): Promise<void> {
  // First, unset category from all articles using this category
  await getSupabaseClient()
    .from('tickets_kb_articles')
    .update({ kb_category_id: null })
    .eq('kb_category_id', id)

  const { error } = await getSupabaseClient()
    .from('tickets_kb_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// REORDER KB CATEGORIES
// ===========================================

export async function reorderKbCategories(
  organizationId: string,
  orderedIds: string[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]
    if (!id) continue

    const { error } = await getSupabaseClient()
      .from('tickets_kb_categories')
      .update({ position: i })
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) throw error
  }
}

// ===========================================
// MAPPING
// ===========================================

function mapKbCategoryFromDb(row: {
  id: string
  organization_id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  position: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}): KbCategory {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    color: row.color || '#6B7280',
    icon: row.icon,
    position: row.position ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  }
}
