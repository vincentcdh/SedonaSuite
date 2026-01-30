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
    query = query.or(`name.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%,billing_email.ilike.%${filters.search}%`)
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
  const { data, error } = await getClient()
    .from('invoice_clients')
    .insert({
      organization_id: organizationId,
      name: input.name,
      legal_name: input.legalName,
      siret: input.siret,
      vat_number: input.vatNumber,
      legal_form: input.legalForm,
      billing_address_line1: input.billingAddressLine1,
      billing_address_line2: input.billingAddressLine2,
      billing_city: input.billingCity,
      billing_postal_code: input.billingPostalCode,
      billing_country: input.billingCountry || 'France',
      billing_email: input.billingEmail,
      billing_phone: input.billingPhone,
      contact_name: input.contactName,
      payment_terms: input.paymentTerms || 30,
      payment_method: input.paymentMethod || 'transfer',
      default_currency: input.defaultCurrency || 'EUR',
      crm_company_id: input.crmCompanyId,
      crm_contact_id: input.crmContactId,
      notes: input.notes,
      custom_fields: input.customFields || {},
    })
    .select()
    .single()

  if (error) throw error

  return mapClientFromDb(data)
}

// ===========================================
// UPDATE CLIENT
// ===========================================

export async function updateClient(input: UpdateClientInput): Promise<InvoiceClient> {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.legalName !== undefined) updateData.legal_name = input.legalName
  if (input.siret !== undefined) updateData.siret = input.siret
  if (input.vatNumber !== undefined) updateData.vat_number = input.vatNumber
  if (input.legalForm !== undefined) updateData.legal_form = input.legalForm
  if (input.billingAddressLine1 !== undefined) updateData.billing_address_line1 = input.billingAddressLine1
  if (input.billingAddressLine2 !== undefined) updateData.billing_address_line2 = input.billingAddressLine2
  if (input.billingCity !== undefined) updateData.billing_city = input.billingCity
  if (input.billingPostalCode !== undefined) updateData.billing_postal_code = input.billingPostalCode
  if (input.billingCountry !== undefined) updateData.billing_country = input.billingCountry
  if (input.billingEmail !== undefined) updateData.billing_email = input.billingEmail
  if (input.billingPhone !== undefined) updateData.billing_phone = input.billingPhone
  if (input.contactName !== undefined) updateData.contact_name = input.contactName
  if (input.paymentTerms !== undefined) updateData.payment_terms = input.paymentTerms
  if (input.paymentMethod !== undefined) updateData.payment_method = input.paymentMethod
  if (input.defaultCurrency !== undefined) updateData.default_currency = input.defaultCurrency
  if (input.crmCompanyId !== undefined) updateData.crm_company_id = input.crmCompanyId
  if (input.crmContactId !== undefined) updateData.crm_contact_id = input.crmContactId
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.customFields !== undefined) updateData.custom_fields = input.customFields

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

function mapClientFromDb(data: Record<string, unknown>): InvoiceClient {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    legalName: data.legal_name as string | null,
    siret: data.siret as string | null,
    vatNumber: data.vat_number as string | null,
    legalForm: data.legal_form as string | null,
    billingAddressLine1: data.billing_address_line1 as string | null,
    billingAddressLine2: data.billing_address_line2 as string | null,
    billingCity: data.billing_city as string | null,
    billingPostalCode: data.billing_postal_code as string | null,
    billingCountry: (data.billing_country as string) || 'France',
    billingEmail: data.billing_email as string | null,
    billingPhone: data.billing_phone as string | null,
    contactName: data.contact_name as string | null,
    paymentTerms: (data.payment_terms as number) || 30,
    paymentMethod: (data.payment_method as InvoiceClient['paymentMethod']) || 'transfer',
    defaultCurrency: (data.default_currency as string) || 'EUR',
    crmCompanyId: data.crm_company_id as string | null,
    crmContactId: data.crm_contact_id as string | null,
    notes: data.notes as string | null,
    customFields: (data.custom_fields as Record<string, unknown>) || {},
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
