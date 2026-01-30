import { getSupabaseClient } from '@sedona/database'
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// COMPANIES SERVER FUNCTIONS
// ===========================================

// Helper to get CRM schema client
function getCrmClient() {
  return getSupabaseClient().schema('crm')
}

/**
 * Get paginated companies for an organization
 */
export async function getCompanies(
  organizationId: string,
  filters: CompanyFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Company>> {
  const crm = getCrmClient()
  const { page = 1, pageSize = 25, sortBy = 'created_at', sortOrder = 'desc' } = pagination

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = crm
    .from('companies')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null) as any

  // Apply filters
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  if (filters.industry) {
    query = query.eq('industry', filters.industry)
  }

  if (filters.size) {
    query = query.eq('size', filters.size)
  }

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  // Apply sorting
  const columnMap: Record<string, string> = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    name: 'name',
  }
  const column = columnMap[sortBy] || sortBy
  query = query.order(column, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch companies: ${error.message}`)
  }

  return {
    data: (data || []).map(mapCompanyFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get a single company by ID
 */
export async function getCompany(companyId: string): Promise<Company | null> {
  const crm = getCrmClient()

  const { data, error } = await crm
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch company: ${error.message}`)
  }

  return data ? mapCompanyFromDb(data) : null
}

/**
 * Get company with related counts
 */
export async function getCompanyWithCounts(companyId: string): Promise<Company | null> {
  const crm = getCrmClient()

  const { data, error } = await crm
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch company: ${error.message}`)
  }

  if (!data) return null

  // Get contacts count
  const { count: contactsCount } = await crm
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)

  // Get deals count
  const { count: dealsCount } = await crm
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)

  return {
    ...mapCompanyFromDb(data),
    contactsCount: contactsCount || 0,
    dealsCount: dealsCount || 0,
  }
}

/**
 * Create a new company
 */
export async function createCompany(
  organizationId: string,
  input: CreateCompanyInput
): Promise<Company> {
  const crm = getCrmClient()

  const { data, error } = await crm
    .from('companies')
    .insert({
      organization_id: organizationId,
      name: input.name,
      siret: input.siret,
      website: input.website,
      industry: input.industry,
      size: input.size,
      address_line1: input.addressLine1,
      address_line2: input.addressLine2,
      city: input.city,
      postal_code: input.postalCode,
      country: input.country || 'France',
      phone: input.phone,
      email: input.email,
      custom_fields: input.customFields || {},
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create company: ${error.message}`)
  }

  return mapCompanyFromDb(data)
}

/**
 * Update a company
 */
export async function updateCompany(input: UpdateCompanyInput): Promise<Company> {
  const crm = getCrmClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (input.name !== undefined) updateData['name'] = input.name
  if (input.siret !== undefined) updateData['siret'] = input.siret
  if (input.website !== undefined) updateData['website'] = input.website
  if (input.industry !== undefined) updateData['industry'] = input.industry
  if (input.size !== undefined) updateData['size'] = input.size
  if (input.addressLine1 !== undefined) updateData['address_line1'] = input.addressLine1
  if (input.addressLine2 !== undefined) updateData['address_line2'] = input.addressLine2
  if (input.city !== undefined) updateData['city'] = input.city
  if (input.postalCode !== undefined) updateData['postal_code'] = input.postalCode
  if (input.country !== undefined) updateData['country'] = input.country
  if (input.phone !== undefined) updateData['phone'] = input.phone
  if (input.email !== undefined) updateData['email'] = input.email
  if (input.customFields !== undefined) updateData['custom_fields'] = input.customFields

  const { data, error } = await crm
    .from('companies')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update company: ${error.message}`)
  }

  return mapCompanyFromDb(data)
}

/**
 * Delete a company (soft delete)
 */
export async function deleteCompany(companyId: string): Promise<void> {
  const crm = getCrmClient()

  const { error } = await crm
    .from('companies')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', companyId)

  if (error) {
    throw new Error(`Failed to delete company: ${error.message}`)
  }
}

/**
 * Get company count for an organization
 */
export async function getCompanyCount(organizationId: string): Promise<number> {
  const crm = getCrmClient()

  const { count, error } = await crm
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (error) {
    throw new Error(`Failed to count companies: ${error.message}`)
  }

  return count || 0
}

/**
 * Get contacts for a company
 */
export async function getCompanyContacts(
  companyId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<{ id: string; firstName: string | null; lastName: string | null; email: string | null; jobTitle: string | null }>> {
  const crm = getCrmClient()
  const { page = 1, pageSize = 25 } = pagination

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await crm
    .from('contacts')
    .select('id, first_name, last_name, email, job_title', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(`Failed to fetch company contacts: ${error.message}`)
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: (data || []).map((c: any) => ({
      id: c['id'] as string,
      firstName: c['first_name'] as string | null,
      lastName: c['last_name'] as string | null,
      email: c['email'] as string | null,
      jobTitle: c['job_title'] as string | null,
    })),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCompanyFromDb(data: any): Company {
  return {
    id: data['id'] as string,
    organizationId: data['organization_id'] as string,
    name: data['name'] as string,
    siret: data['siret'] as string | null,
    website: data['website'] as string | null,
    industry: data['industry'] as string | null,
    size: data['size'] as Company['size'],
    addressLine1: data['address_line1'] as string | null,
    addressLine2: data['address_line2'] as string | null,
    city: data['city'] as string | null,
    postalCode: data['postal_code'] as string | null,
    country: (data['country'] as string) || 'France',
    phone: data['phone'] as string | null,
    email: data['email'] as string | null,
    customFields: (data['custom_fields'] as Record<string, unknown>) || {},
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
    deletedAt: data['deleted_at'] as string | null,
  }
}
