import { getSupabaseClient } from '@sedona/database'
import type { Tag, CreateTagInput, UpdateTagInput } from '../types'

// ===========================================
// TAGS SERVER FUNCTIONS
// ===========================================

// Helper to get CRM schema client
function getCrmClient() {
  return getSupabaseClient().schema('crm')
}

/**
 * Get all tags for an organization
 */
export async function getTags(organizationId: string): Promise<Tag[]> {
  const crm = getCrmClient()

  const { data, error } = await crm
    .from('tags')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`)
  }

  return (data || []).map(mapTagFromDb)
}

/**
 * Get a single tag by ID
 */
export async function getTag(tagId: string): Promise<Tag | null> {
  const crm = getCrmClient()

  const { data, error } = await crm
    .from('tags')
    .select('*')
    .eq('id', tagId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch tag: ${error.message}`)
  }

  return data ? mapTagFromDb(data) : null
}

/**
 * Create a new tag
 */
export async function createTag(
  organizationId: string,
  input: CreateTagInput
): Promise<Tag> {
  const crm = getCrmClient()

  const { data, error } = await crm
    .from('tags')
    .insert({
      organization_id: organizationId,
      name: input.name,
      color: input.color || '#0c82d6',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Un tag avec ce nom existe deja')
    }
    throw new Error(`Failed to create tag: ${error.message}`)
  }

  return mapTagFromDb(data)
}

/**
 * Update a tag
 */
export async function updateTag(input: UpdateTagInput): Promise<Tag> {
  const crm = getCrmClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (input.name !== undefined) updateData['name'] = input.name
  if (input.color !== undefined) updateData['color'] = input.color

  const { data, error } = await crm
    .from('tags')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Un tag avec ce nom existe deja')
    }
    throw new Error(`Failed to update tag: ${error.message}`)
  }

  return mapTagFromDb(data)
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: string): Promise<void> {
  const crm = getCrmClient()

  // First, remove the tag from all contacts
  const { data: tag } = await crm
    .from('tags')
    .select('name, organization_id')
    .eq('id', tagId)
    .single()

  if (tag) {
    // Get all contacts with this tag
    const { data: contacts } = await crm
      .from('contacts')
      .select('id, tags')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('organization_id', (tag as any)['organization_id'])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .contains('tags', [(tag as any)['name']])

    // Remove the tag from each contact
    if (contacts) {
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contacts.map((contact: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tags = (contact['tags'] as string[]).filter((t) => t !== (tag as any)['name'])
          return crm.from('contacts').update({ tags }).eq('id', contact['id'])
        })
      )
    }
  }

  // Delete the tag
  const { error } = await crm.from('tags').delete().eq('id', tagId)

  if (error) {
    throw new Error(`Failed to delete tag: ${error.message}`)
  }
}

/**
 * Get tag usage count
 */
export async function getTagUsageCount(tagName: string, organizationId: string): Promise<number> {
  const crm = getCrmClient()

  const { count, error } = await crm
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .contains('tags', [tagName])

  if (error) {
    throw new Error(`Failed to count tag usage: ${error.message}`)
  }

  return count || 0
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTagFromDb(data: any): Tag {
  return {
    id: data['id'] as string,
    organizationId: data['organization_id'] as string,
    name: data['name'] as string,
    color: data['color'] as string,
    createdAt: data['created_at'] as string,
  }
}
