import { getSupabaseClient } from '@sedona/database'
import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  ContactFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// CONTACTS SERVER FUNCTIONS
// ===========================================

// Helper to get Supabase client
function getClient() {
  return getSupabaseClient()
}

/**
 * Get paginated contacts for an organization
 */
export async function getContacts(
  organizationId: string,
  filters: ContactFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Contact>> {
  const client = getClient()
  const { page = 1, pageSize = 25, sortBy = 'created_at', sortOrder = 'desc' } = pagination

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = client
    .from('crm_contacts')
    .select('*, company:crm_companies(*)', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null) as any

  // Apply filters
  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    )
  }

  if (filters.companyId) {
    query = query.eq('company_id', filters.companyId)
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  if (filters.source) {
    query = query.eq('source', filters.source)
  }

  if (filters.ownerId) {
    query = query.eq('owner_id', filters.ownerId)
  }

  if (filters.createdAfter) {
    query = query.gte('created_at', filters.createdAfter)
  }

  if (filters.createdBefore) {
    query = query.lte('created_at', filters.createdBefore)
  }

  // Apply sorting
  const columnMap: Record<string, string> = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
  }
  const column = columnMap[sortBy] || sortBy
  query = query.order(column, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch contacts: ${error.message}`)
  }

  return {
    data: (data || []).map(mapContactFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get a single contact by ID
 */
export async function getContact(contactId: string): Promise<Contact | null> {
  const client = getClient()

  const { data, error } = await client
    .from('crm_contacts')
    .select('*, company:crm_companies(*)')
    .eq('id', contactId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch contact: ${error.message}`)
  }

  return data ? mapContactFromDb(data) : null
}

/**
 * Create a new contact
 */
export async function createContact(
  organizationId: string,
  input: CreateContactInput
): Promise<Contact> {
  const client = getClient()

  const { data, error } = await client
    .from('crm_contacts')
    .insert({
      organization_id: organizationId,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      mobile: input.mobile,
      job_title: input.jobTitle,
      company_id: input.companyId,
      source: input.source,
      source_details: input.sourceDetails,
      address_line1: input.addressLine1,
      address_line2: input.addressLine2,
      city: input.city,
      postal_code: input.postalCode,
      country: input.country || 'France',
      custom_fields: input.customFields || {},
      tags: input.tags || [],
      owner_id: input.ownerId,
    })
    .select('*, company:crm_companies(*)')
    .single()

  if (error) {
    throw new Error(`Failed to create contact: ${error.message}`)
  }

  return mapContactFromDb(data)
}

/**
 * Update a contact
 */
export async function updateContact(input: UpdateContactInput): Promise<Contact> {
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (input.firstName !== undefined) updateData['first_name'] = input.firstName
  if (input.lastName !== undefined) updateData['last_name'] = input.lastName
  if (input.email !== undefined) updateData['email'] = input.email
  if (input.phone !== undefined) updateData['phone'] = input.phone
  if (input.mobile !== undefined) updateData['mobile'] = input.mobile
  if (input.jobTitle !== undefined) updateData['job_title'] = input.jobTitle
  if (input.companyId !== undefined) updateData['company_id'] = input.companyId
  if (input.source !== undefined) updateData['source'] = input.source
  if (input.sourceDetails !== undefined) updateData['source_details'] = input.sourceDetails
  if (input.addressLine1 !== undefined) updateData['address_line1'] = input.addressLine1
  if (input.addressLine2 !== undefined) updateData['address_line2'] = input.addressLine2
  if (input.city !== undefined) updateData['city'] = input.city
  if (input.postalCode !== undefined) updateData['postal_code'] = input.postalCode
  if (input.country !== undefined) updateData['country'] = input.country
  if (input.customFields !== undefined) updateData['custom_fields'] = input.customFields
  if (input.tags !== undefined) updateData['tags'] = input.tags
  if (input.ownerId !== undefined) updateData['owner_id'] = input.ownerId

  const { data, error } = await client
    .from('crm_contacts')
    .update(updateData)
    .eq('id', input.id)
    .select('*, company:crm_companies(*)')
    .single()

  if (error) {
    throw new Error(`Failed to update contact: ${error.message}`)
  }

  return mapContactFromDb(data)
}

/**
 * Delete a contact (soft delete)
 */
export async function deleteContact(contactId: string): Promise<void> {
  const client = getClient()

  const { error } = await client
    .from('crm_contacts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', contactId)

  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`)
  }
}

/**
 * Bulk delete contacts
 */
export async function bulkDeleteContacts(contactIds: string[]): Promise<void> {
  const client = getClient()

  const { error } = await client
    .from('crm_contacts')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', contactIds)

  if (error) {
    throw new Error(`Failed to delete contacts: ${error.message}`)
  }
}

/**
 * Add tags to a contact
 */
export async function addContactTags(contactId: string, tags: string[]): Promise<Contact> {
  const client = getClient()

  // Get current tags
  const { data: contact } = await client
    .from('crm_contacts')
    .select('tags')
    .eq('id', contactId)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentTags = ((contact as any)?.tags as string[]) || []
  const newTags = [...new Set([...currentTags, ...tags])]

  const { data, error } = await client
    .from('crm_contacts')
    .update({ tags: newTags })
    .eq('id', contactId)
    .select('*, company:crm_companies(*)')
    .single()

  if (error) {
    throw new Error(`Failed to add tags: ${error.message}`)
  }

  return mapContactFromDb(data)
}

/**
 * Remove tags from a contact
 */
export async function removeContactTags(contactId: string, tags: string[]): Promise<Contact> {
  const client = getClient()

  // Get current tags
  const { data: contact } = await client
    .from('crm_contacts')
    .select('tags')
    .eq('id', contactId)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentTags = ((contact as any)?.tags as string[]) || []
  const newTags = currentTags.filter((t) => !tags.includes(t))

  const { data, error } = await client
    .from('crm_contacts')
    .update({ tags: newTags })
    .eq('id', contactId)
    .select('*, company:crm_companies(*)')
    .single()

  if (error) {
    throw new Error(`Failed to remove tags: ${error.message}`)
  }

  return mapContactFromDb(data)
}

/**
 * Get contact count for an organization
 */
export async function getContactCount(organizationId: string): Promise<number> {
  const client = getClient()

  const { count, error } = await client
    .from('crm_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (error) {
    throw new Error(`Failed to count contacts: ${error.message}`)
  }

  return count || 0
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapContactFromDb(data: any): Contact {
  return {
    id: data['id'] as string,
    organizationId: data['organization_id'] as string,
    firstName: data['first_name'] as string | null,
    lastName: data['last_name'] as string | null,
    email: data['email'] as string | null,
    phone: data['phone'] as string | null,
    mobile: data['mobile'] as string | null,
    jobTitle: data['job_title'] as string | null,
    companyId: data['company_id'] as string | null,
    company: data['company'] ? mapCompanyFromDb(data['company']) : null,
    source: data['source'] as Contact['source'],
    sourceDetails: data['source_details'] as string | null,
    addressLine1: data['address_line1'] as string | null,
    addressLine2: data['address_line2'] as string | null,
    city: data['city'] as string | null,
    postalCode: data['postal_code'] as string | null,
    country: data['country'] as string,
    customFields: (data['custom_fields'] as Record<string, unknown>) || {},
    tags: (data['tags'] as string[]) || [],
    ownerId: data['owner_id'] as string | null,
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
    deletedAt: data['deleted_at'] as string | null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCompanyFromDb(data: any): Contact['company'] {
  return {
    id: data['id'] as string,
    organizationId: data['organization_id'] as string,
    name: data['name'] as string,
    siret: data['siret'] as string | null,
    website: data['website'] as string | null,
    industry: data['industry'] as string | null,
    size: data['size'],
    addressLine1: data['address_line1'] as string | null,
    addressLine2: data['address_line2'] as string | null,
    city: data['city'] as string | null,
    postalCode: data['postal_code'] as string | null,
    country: data['country'] as string,
    phone: data['phone'] as string | null,
    email: data['email'] as string | null,
    customFields: (data['custom_fields'] as Record<string, unknown>) || {},
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
    deletedAt: data['deleted_at'] as string | null,
  }
}
