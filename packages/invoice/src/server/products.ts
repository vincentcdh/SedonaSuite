// ===========================================
// PRODUCT SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

function getInvoiceClient() {
  return getSupabaseClient().schema('invoice' as any) as any
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

  let query = getInvoiceClient()
    .from('products')
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
  const { data, error } = await getInvoiceClient()
    .from('products')
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
  const { data, error } = await getInvoiceClient()
    .from('products')
    .insert({
      organization_id: organizationId,
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
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.sku !== undefined) updateData.sku = input.sku
  if (input.type !== undefined) updateData.type = input.type
  if (input.unitPrice !== undefined) updateData.unit_price = input.unitPrice
  if (input.currency !== undefined) updateData.currency = input.currency
  if (input.unit !== undefined) updateData.unit = input.unit
  if (input.vatRate !== undefined) updateData.vat_rate = input.vatRate
  if (input.vatExempt !== undefined) updateData.vat_exempt = input.vatExempt
  if (input.category !== undefined) updateData.category = input.category
  if (input.accountingCode !== undefined) updateData.accounting_code = input.accountingCode
  if (input.isActive !== undefined) updateData.is_active = input.isActive
  if (input.customFields !== undefined) updateData.custom_fields = input.customFields

  const { data, error } = await getInvoiceClient()
    .from('products')
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
  const { error } = await getInvoiceClient()
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET PRODUCT CATEGORIES
// ===========================================

export async function getProductCategories(organizationId: string): Promise<string[]> {
  const { data, error } = await getInvoiceClient()
    .from('products')
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

function mapProductFromDb(data: Record<string, unknown>): Product {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    description: data.description as string | null,
    sku: data.sku as string | null,
    type: (data.type as Product['type']) || 'service',
    unitPrice: Number(data.unit_price),
    currency: (data.currency as string) || 'EUR',
    unit: (data.unit as string) || 'unite',
    vatRate: Number(data.vat_rate) || 20,
    vatExempt: (data.vat_exempt as boolean) || false,
    category: data.category as string | null,
    accountingCode: data.accounting_code as string | null,
    isActive: (data.is_active as boolean) ?? true,
    customFields: (data.custom_fields as Record<string, unknown>) || {},
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
