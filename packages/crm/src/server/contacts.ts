import {
  getSupabaseClient,
  validateOrganizationId,
  validateResourceId,
  safeTextSchema,
  emailSchema,
  phoneSchema,
  postalCodeSchema,
  z,
} from '@sedona/database'
import { assertCrmContactLimit } from '@sedona/billing/server'
import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  ContactFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const createContactSchema = z.object({
  firstName: safeTextSchema.optional(),
  lastName: safeTextSchema.optional(),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema,
  mobile: phoneSchema,
  jobTitle: safeTextSchema.optional(),
  companyId: z.string().uuid().optional().nullable(),
  source: z.enum(['website', 'referral', 'linkedin', 'cold_call', 'event', 'other']).optional(),
  sourceDetails: safeTextSchema.optional(),
  addressLine1: safeTextSchema.optional(),
  addressLine2: safeTextSchema.optional(),
  city: safeTextSchema.optional(),
  postalCode: postalCodeSchema,
  country: z.string().max(100).default('France'),
  customFields: z.record(z.unknown()).optional(),
  tags: z.array(safeTextSchema).max(50).optional(),
  ownerId: z.string().uuid().optional().nullable(),
})

const updateContactSchema = z.object({
  id: z.string().uuid(),
}).merge(createContactSchema.partial())

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
  // SECURITY: Validate organization ID
  const validOrgId = validateOrganizationId(organizationId)

  const client = getClient()
  const { page = 1, pageSize = 25, sortBy = 'created_at', sortOrder = 'desc' } = pagination

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = client
    .from('crm_contacts')
    .select('*, company:crm_companies(*)', { count: 'exact' })
    .eq('organization_id', validOrgId)
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
  // SECURITY: Validate contact ID
  const validId = validateResourceId(contactId, 'Contact')

  const client = getClient()

  const { data, error } = await client
    .from('crm_contacts')
    .select('*, company:crm_companies(*)')
    .eq('id', validId)
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
  // SECURITY: Validate inputs
  const validOrgId = validateOrganizationId(organizationId)
  const validInput = createContactSchema.parse(input)

  // Check module limit before creating
  await assertCrmContactLimit(validOrgId)

  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client
    .from('crm_contacts') as any)
    .insert({
      organization_id: validOrgId,
      first_name: validInput.firstName,
      last_name: validInput.lastName,
      email: validInput.email,
      phone: validInput.phone,
      mobile: validInput.mobile,
      job_title: validInput.jobTitle,
      company_id: validInput.companyId,
      source: validInput.source,
      source_details: validInput.sourceDetails,
      address_line1: validInput.addressLine1,
      address_line2: validInput.addressLine2,
      city: validInput.city,
      postal_code: validInput.postalCode,
      country: validInput.country || 'France',
      custom_fields: validInput.customFields || {},
      tags: validInput.tags || [],
      owner_id: validInput.ownerId,
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
  // SECURITY: Validate inputs
  const validInput = updateContactSchema.parse(input)

  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (validInput.firstName !== undefined) updateData['first_name'] = validInput.firstName
  if (validInput.lastName !== undefined) updateData['last_name'] = validInput.lastName
  if (validInput.email !== undefined) updateData['email'] = validInput.email
  if (validInput.phone !== undefined) updateData['phone'] = validInput.phone
  if (validInput.mobile !== undefined) updateData['mobile'] = validInput.mobile
  if (validInput.jobTitle !== undefined) updateData['job_title'] = validInput.jobTitle
  if (validInput.companyId !== undefined) updateData['company_id'] = validInput.companyId
  if (validInput.source !== undefined) updateData['source'] = validInput.source
  if (validInput.sourceDetails !== undefined) updateData['source_details'] = validInput.sourceDetails
  if (validInput.addressLine1 !== undefined) updateData['address_line1'] = validInput.addressLine1
  if (validInput.addressLine2 !== undefined) updateData['address_line2'] = validInput.addressLine2
  if (validInput.city !== undefined) updateData['city'] = validInput.city
  if (validInput.postalCode !== undefined) updateData['postal_code'] = validInput.postalCode
  if (validInput.country !== undefined) updateData['country'] = validInput.country
  if (validInput.customFields !== undefined) updateData['custom_fields'] = validInput.customFields
  if (validInput.tags !== undefined) updateData['tags'] = validInput.tags
  if (validInput.ownerId !== undefined) updateData['owner_id'] = validInput.ownerId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client
    .from('crm_contacts') as any)
    .update(updateData)
    .eq('id', validInput.id)
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
  // SECURITY: Validate input
  const validId = validateResourceId(contactId, 'Contact')

  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client
    .from('crm_contacts') as any)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', validId)

  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`)
  }
}

/**
 * Bulk delete contacts
 */
export async function bulkDeleteContacts(contactIds: string[]): Promise<void> {
  // SECURITY: Validate all IDs
  const validIds = z.array(z.string().uuid()).parse(contactIds)

  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client
    .from('crm_contacts') as any)
    .update({ deleted_at: new Date().toISOString() })
    .in('id', validIds)

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client
    .from('crm_contacts') as any)
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client
    .from('crm_contacts') as any)
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
