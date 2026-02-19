// ===========================================
// PRODUCT SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient, validateOrganizationId } from '@sedona/database'
import { assertInvoiceProductLimit } from '@sedona/billing/server'
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

// Helper to get Supabase client (public schema)
function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET PRODUCTS
// ===========================================

export async function getProducts(
  organizationId: string,
  filters: ProductFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Product>> {
  const { page = 1, pageSize = 50, sortBy = 'name', sortOrder = 'asc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getClient()
    .from('invoice_products')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters.type) {
    query = query.eq('type', filters.type)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: (data || []).map(mapProductFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET PRODUCT BY ID
// ===========================================

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await getClient()
    .from('invoice_products')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapProductFromDb(data)
}

// ===========================================
// CREATE PRODUCT
// ===========================================

export async function createProduct(
  organizationId: string,
  input: CreateProductInput
): Promise<Product> {
  // Validate organization ID
  const validOrgId = validateOrganizationId(organizationId)

  // Check module limit before creating
  await assertInvoiceProductLimit(validOrgId)

  const { data, error } = await getClient()
    .from('invoice_products')
    .insert({
      organization_id: validOrgId,
      name: input.name,
      description: input.description,
      sku: input.sku,
      type: input.type || 'service',
      unit_price: input.unitPrice,
      currency: input.currency || 'EUR',
      unit: input.unit || 'unite',
      vat_rate: input.vatRate ?? 20.00,
      vat_exempt: input.vatExempt || false,
      category: input.category,
      accounting_code: input.accountingCode,
      is_active: input.isActive ?? true,
      custom_fields: input.customFields || {},
    })
    .select()
    .single()

  if (error) throw error

  return mapProductFromDb(data)
}

// ===========================================
// UPDATE PRODUCT
// ===========================================

export async function updateProduct(input: UpdateProductInput): Promise<Product> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (input.name !== undefined) updateData['name'] = input.name
  if (input.description !== undefined) updateData['description'] = input.description
  if (input.sku !== undefined) updateData['sku'] = input.sku
  if (input.type !== undefined) updateData['type'] = input.type
  if (input.unitPrice !== undefined) updateData['unit_price'] = input.unitPrice
  if (input.currency !== undefined) updateData['currency'] = input.currency
  if (input.unit !== undefined) updateData['unit'] = input.unit
  if (input.vatRate !== undefined) updateData['vat_rate'] = input.vatRate
  if (input.vatExempt !== undefined) updateData['vat_exempt'] = input.vatExempt
  if (input.category !== undefined) updateData['category'] = input.category
  if (input.accountingCode !== undefined) updateData['accounting_code'] = input.accountingCode
  if (input.isActive !== undefined) updateData['is_active'] = input.isActive
  if (input.customFields !== undefined) updateData['custom_fields'] = input.customFields

  const { data, error } = await getClient()
    .from('invoice_products')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapProductFromDb(data)
}

// ===========================================
// DELETE PRODUCT (soft delete)
// ===========================================

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await getClient()
    .from('invoice_products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET PRODUCT CATEGORIES
// ===========================================

export async function getProductCategories(organizationId: string): Promise<string[]> {
  const { data, error } = await getClient()
    .from('invoice_products')
    .select('category')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('category', 'is', null)

  if (error) throw error

  const categories = new Set<string>()
  data?.forEach(item => {
    if (item.category) categories.add(item.category as string)
  })

  return Array.from(categories).sort()
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProductFromDb(row: any): Product {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    sku: row.sku,
    type: row.type || 'service',
    unitPrice: Number(row.unit_price),
    currency: row.currency || 'EUR',
    unit: row.unit || 'unite',
    vatRate: Number(row.vat_rate) || 20,
    vatExempt: row.vat_exempt || false,
    category: row.category,
    accountingCode: row.accounting_code,
    isActive: row.is_active ?? true,
    customFields: row.custom_fields || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
