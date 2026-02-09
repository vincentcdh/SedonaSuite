// ===========================================
// CLIENT SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  InvoiceClient,
  CreateClientInput,
  UpdateClientInput,
  ClientFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

// Helper to get Supabase client (public schema)
function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET CLIENTS (with pagination)
// ===========================================

export async function getClients(
  organizationId: string,
  filters: ClientFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<InvoiceClient>> {
  const { page = 1, pageSize = 20, sortBy = 'name', sortOrder = 'asc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getClient()
    .from('invoice_clients')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: (data || []).map(mapClientFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET CLIENT BY ID
// ===========================================

export async function getClientById(id: string): Promise<InvoiceClient | null> {
  const { data, error } = await getClient()
    .from('invoice_clients')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapClientFromDb(data)
}

// ===========================================
// CREATE CLIENT
// ===========================================

export async function createClient(
  organizationId: string,
  input: CreateClientInput
): Promise<InvoiceClient> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    organization_id: organizationId,
    name: input.name,
    legal_name: input.legalName,
    siret: input.siret,
    vat_number: input.vatNumber,
    address_line1: input.billingAddressLine1,
    address_line2: input.billingAddressLine2,
    city: input.billingCity,
    postal_code: input.billingPostalCode,
    country: input.billingCountry || 'France',
    email: input.billingEmail,
    phone: input.billingPhone,
    contact_name: input.contactName,
    payment_terms: input.paymentTerms || 30,
    default_payment_method: input.paymentMethod || 'transfer',
    crm_company_id: input.crmCompanyId,
    crm_contact_id: input.crmContactId,
    notes: input.notes,
    custom_fields: input.customFields || {},
  }

  const { data, error } = await getClient()
    .from('invoice_clients')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  return mapClientFromDb(data)
}

// ===========================================
// UPDATE CLIENT
// ===========================================

export async function updateClient(input: UpdateClientInput): Promise<InvoiceClient> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (input.name !== undefined) updateData['name'] = input.name
  if (input.legalName !== undefined) updateData['legal_name'] = input.legalName
  if (input.siret !== undefined) updateData['siret'] = input.siret
  if (input.vatNumber !== undefined) updateData['vat_number'] = input.vatNumber
  if (input.billingAddressLine1 !== undefined) updateData['address_line1'] = input.billingAddressLine1
  if (input.billingAddressLine2 !== undefined) updateData['address_line2'] = input.billingAddressLine2
  if (input.billingCity !== undefined) updateData['city'] = input.billingCity
  if (input.billingPostalCode !== undefined) updateData['postal_code'] = input.billingPostalCode
  if (input.billingCountry !== undefined) updateData['country'] = input.billingCountry
  if (input.billingEmail !== undefined) updateData['email'] = input.billingEmail
  if (input.billingPhone !== undefined) updateData['phone'] = input.billingPhone
  if (input.contactName !== undefined) updateData['contact_name'] = input.contactName
  if (input.paymentTerms !== undefined) updateData['payment_terms'] = input.paymentTerms
  if (input.paymentMethod !== undefined) updateData['default_payment_method'] = input.paymentMethod
  if (input.crmCompanyId !== undefined) updateData['crm_company_id'] = input.crmCompanyId
  if (input.crmContactId !== undefined) updateData['crm_contact_id'] = input.crmContactId
  if (input.notes !== undefined) updateData['notes'] = input.notes
  if (input.customFields !== undefined) updateData['custom_fields'] = input.customFields

  const { data, error } = await getClient()
    .from('invoice_clients')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapClientFromDb(data)
}

// ===========================================
// DELETE CLIENT (soft delete)
// ===========================================

export async function deleteClient(id: string): Promise<void> {
  const { error } = await getClient()
    .from('invoice_clients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapClientFromDb(row: any): InvoiceClient {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    legalName: row.legal_name,
    siret: row.siret,
    vatNumber: row.vat_number,
    legalForm: null, // Not in database schema
    billingAddressLine1: row.address_line1,
    billingAddressLine2: row.address_line2,
    billingCity: row.city,
    billingPostalCode: row.postal_code,
    billingCountry: row.country || 'France',
    billingEmail: row.email,
    billingPhone: row.phone,
    contactName: row.contact_name,
    paymentTerms: row.payment_terms || 30,
    paymentMethod: row.default_payment_method || 'transfer',
    defaultCurrency: 'EUR', // Not in database schema
    crmCompanyId: row.crm_company_id,
    crmContactId: row.crm_contact_id,
    notes: row.notes,
    customFields: row.custom_fields || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
