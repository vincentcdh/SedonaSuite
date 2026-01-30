// ===========================================
// QUOTE SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Quote,
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteFilters,
  PaginatedResult,
  PaginationParams,
  LineItem,
  CreateLineItemInput,
} from '../types'

// Helper to get Supabase client (public schema)
function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET QUOTES
// ===========================================

export async function getQuotes(
  organizationId: string,
  filters: QuoteFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Quote>> {
  const { page = 1, pageSize = 20, sortBy = 'issueDate', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getClient()
    .from('invoice_quotes')
    .select(`
      *,
      client:invoice_clients(*)
    `, { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filters.search) {
    query = query.or(`quote_number.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`)
  }
  if (filters.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.issueDateAfter) {
    query = query.gte('issue_date', filters.issueDateAfter)
  }
  if (filters.issueDateBefore) {
    query = query.lte('issue_date', filters.issueDateBefore)
  }

  // Sorting
  const sortColumn = toSnakeCase(sortBy)
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: (data || []).map(mapQuoteFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET QUOTE BY ID
// ===========================================

export async function getQuoteById(id: string): Promise<Quote | null> {
  const { data, error } = await getClient()
    .from('invoice_quotes')
    .select(`
      *,
      client:invoice_clients(*)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Get line items
  const { data: lineItems } = await getClient()
    .from('invoice_line_items')
    .select('*')
    .eq('document_type', 'quote')
    .eq('document_id', id)
    .order('position')

  const quote = mapQuoteFromDb(data)
  quote.lineItems = (lineItems || []).map(mapLineItemFromDb)

  return quote
}

// ===========================================
// CREATE QUOTE
// ===========================================

export async function createQuote(
  organizationId: string,
  input: CreateQuoteInput,
  userId?: string
): Promise<Quote> {
  const client = getClient()

  // Generate quote number by querying existing quotes
  const { data: lastQuote } = await client
    .from('invoice_quotes')
    .select('quote_number')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let nextNumber = 1
  if (lastQuote?.quote_number) {
    const match = (lastQuote.quote_number as string).match(/(\d+)$/)
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }
  const quoteNumber = `DEV-${String(nextNumber).padStart(4, '0')}`

  const issueDate = input.issueDate || new Date().toISOString().split('T')[0]

  // Calculate valid_until (default 30 days)
  let validUntil = input.validUntil
  if (!validUntil) {
    const validUntilDate = new Date(issueDate)
    validUntilDate.setDate(validUntilDate.getDate() + 30)
    validUntil = validUntilDate.toISOString().split('T')[0]
  }

  const { data, error } = await client
    .from('invoice_quotes')
    .insert({
      organization_id: organizationId,
      client_id: input.clientId,
      quote_number: quoteNumber,
      status: 'draft',
      issue_date: issueDate,
      valid_until: validUntil,
      subject: input.subject,
      introduction: input.introduction,
      terms: input.terms,
      notes: input.notes,
      footer: input.footer,
      discount_amount: input.discountAmount || 0,
      discount_percent: input.discountPercent,
      deal_id: input.dealId,
      custom_fields: input.customFields || {},
      created_by: userId,
    })
    .select(`
      *,
      client:invoice_clients(*)
    `)
    .single()

  if (error) throw error

  // Create line items if provided
  if (input.lineItems && input.lineItems.length > 0) {
    await createLineItems('quote', data.id, input.lineItems)
    await recalculateDocumentTotals('quote', data.id)
  }

  return getQuoteById(data.id) as Promise<Quote>
}

// ===========================================
// UPDATE QUOTE
// ===========================================

export async function updateQuote(input: UpdateQuoteInput): Promise<Quote> {
  const updateData: Record<string, unknown> = {}

  if (input.clientId !== undefined) updateData.client_id = input.clientId
  if (input.issueDate !== undefined) updateData.issue_date = input.issueDate
  if (input.validUntil !== undefined) updateData.valid_until = input.validUntil
  if (input.status !== undefined) updateData.status = input.status
  if (input.subject !== undefined) updateData.subject = input.subject
  if (input.introduction !== undefined) updateData.introduction = input.introduction
  if (input.terms !== undefined) updateData.terms = input.terms
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.footer !== undefined) updateData.footer = input.footer
  if (input.discountAmount !== undefined) updateData.discount_amount = input.discountAmount
  if (input.discountPercent !== undefined) updateData.discount_percent = input.discountPercent
  if (input.customFields !== undefined) updateData.custom_fields = input.customFields

  // Handle status changes
  if (input.status === 'accepted') {
    updateData.accepted_at = new Date().toISOString()
  }
  if (input.status === 'rejected') {
    updateData.rejected_at = new Date().toISOString()
  }

  const { error } = await getClient()
    .from('invoice_quotes')
    .update(updateData)
    .eq('id', input.id)

  if (error) throw error

  return getQuoteById(input.id) as Promise<Quote>
}

// ===========================================
// DELETE QUOTE (soft delete)
// ===========================================

export async function deleteQuote(id: string): Promise<void> {
  const { error } = await getClient()
    .from('invoice_quotes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// SEND QUOTE
// ===========================================

export async function sendQuote(id: string): Promise<Quote> {
  return updateQuote({ id, status: 'sent' })
}

// ===========================================
// ACCEPT QUOTE
// ===========================================

export async function acceptQuote(id: string): Promise<Quote> {
  return updateQuote({ id, status: 'accepted' })
}

// ===========================================
// REJECT QUOTE
// ===========================================

export async function rejectQuote(id: string): Promise<Quote> {
  return updateQuote({ id, status: 'rejected' })
}

// ===========================================
// CONVERT QUOTE TO INVOICE
// ===========================================

export async function convertQuoteToInvoice(
  quoteId: string,
  userId?: string
): Promise<{ quote: Quote; invoiceId: string }> {
  const quote = await getQuoteById(quoteId)
  if (!quote) throw new Error('Quote not found')

  // Import createInvoice dynamically to avoid circular deps
  const { createInvoice } = await import('./invoices')

  // Create invoice from quote data
  const invoice = await createInvoice(
    quote.organizationId,
    {
      clientId: quote.clientId,
      subject: quote.subject || undefined,
      introduction: quote.introduction || undefined,
      terms: quote.terms || undefined,
      notes: quote.notes || undefined,
      footer: quote.footer || undefined,
      discountAmount: quote.discountAmount,
      discountPercent: quote.discountPercent || undefined,
      quoteId: quote.id,
      dealId: quote.dealId || undefined,
      lineItems: quote.lineItems?.map(item => ({
        productId: item.productId || undefined,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent || undefined,
        vatRate: item.vatRate,
      })),
    },
    userId
  )

  // Update quote status
  const { error } = await getClient()
    .from('invoice_quotes')
    .update({
      status: 'converted',
      converted_to_invoice_id: invoice.id,
    })
    .eq('id', quoteId)

  if (error) throw error

  const updatedQuote = await getQuoteById(quoteId)

  return {
    quote: updatedQuote!,
    invoiceId: invoice.id,
  }
}

// ===========================================
// LINE ITEMS HELPERS
// ===========================================

async function createLineItems(
  documentType: 'quote' | 'invoice' | 'credit_note',
  documentId: string,
  items: CreateLineItemInput[]
): Promise<void> {
  const lineItems = items.map((item, index) => ({
    document_type: documentType,
    document_id: documentId,
    position: index,
    product_id: item.productId,
    description: item.description,
    quantity: item.quantity || 1,
    unit: item.unit || 'unite',
    unit_price: item.unitPrice,
    discount_percent: item.discountPercent,
    discount_amount: item.discountAmount,
    vat_rate: item.vatRate ?? 20,
  }))

  const { error } = await getClient()
    .from('invoice_line_items')
    .insert(lineItems)

  if (error) throw error
}

async function recalculateDocumentTotals(
  documentType: 'quote' | 'invoice' | 'credit_note',
  documentId: string
): Promise<void> {
  const client = getClient()

  const { data: lineItems } = await client
    .from('invoice_line_items')
    .select('line_total, vat_amount')
    .eq('document_type', documentType)
    .eq('document_id', documentId)

  if (!lineItems) return

  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.line_total), 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + Number(item.vat_amount), 0)

  // Get the table name based on document type
  const tableMap: Record<string, string> = {
    invoice: 'invoice_invoices',
    quote: 'invoice_quotes',
    credit_note: 'invoice_credit_notes',
  }
  const tableName = tableMap[documentType]

  const { data: doc } = await client
    .from(tableName)
    .select('discount_amount')
    .eq('id', documentId)
    .single()

  const discountAmount = doc?.discount_amount || 0
  const total = subtotal + vatAmount - discountAmount

  await client
    .from(tableName)
    .update({ subtotal, vat_amount: vatAmount, total })
    .eq('id', documentId)
}

// ===========================================
// ADD LINE ITEM TO QUOTE
// ===========================================

export async function addQuoteLineItem(
  quoteId: string,
  input: CreateLineItemInput
): Promise<LineItem> {
  const client = getClient()

  const { data: existing } = await client
    .from('invoice_line_items')
    .select('position')
    .eq('document_type', 'quote')
    .eq('document_id', quoteId)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing && existing.length > 0 ? (existing[0].position as number) + 1 : 0

  const { data, error } = await client
    .from('invoice_line_items')
    .insert({
      document_type: 'quote',
      document_id: quoteId,
      position,
      product_id: input.productId,
      description: input.description,
      quantity: input.quantity || 1,
      unit: input.unit || 'unite',
      unit_price: input.unitPrice,
      discount_percent: input.discountPercent,
      discount_amount: input.discountAmount,
      vat_rate: input.vatRate ?? 20,
    })
    .select()
    .single()

  if (error) throw error

  await recalculateDocumentTotals('quote', quoteId)

  return mapLineItemFromDb(data)
}

// ===========================================
// DELETE QUOTE LINE ITEM
// ===========================================

export async function deleteQuoteLineItem(lineItemId: string): Promise<void> {
  const client = getClient()

  const { data: lineItem } = await client
    .from('invoice_line_items')
    .select('document_id')
    .eq('id', lineItemId)
    .single()

  const { error } = await client
    .from('invoice_line_items')
    .delete()
    .eq('id', lineItemId)

  if (error) throw error

  if (lineItem) {
    await recalculateDocumentTotals('quote', lineItem.document_id as string)
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapQuoteFromDb(data: Record<string, unknown>): Quote {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    clientId: data.client_id as string,
    client: data.client ? mapClientFromDb(data.client as Record<string, unknown>) : undefined,
    quoteNumber: data.quote_number as string,
    status: data.status as Quote['status'],
    issueDate: data.issue_date as string,
    validUntil: data.valid_until as string | null,
    acceptedAt: data.accepted_at as string | null,
    rejectedAt: data.rejected_at as string | null,
    subtotal: Number(data.subtotal) || 0,
    discountAmount: Number(data.discount_amount) || 0,
    discountPercent: data.discount_percent ? Number(data.discount_percent) : null,
    vatAmount: Number(data.vat_amount) || 0,
    total: Number(data.total) || 0,
    currency: (data.currency as string) || 'EUR',
    subject: data.subject as string | null,
    introduction: data.introduction as string | null,
    terms: data.terms as string | null,
    notes: data.notes as string | null,
    footer: data.footer as string | null,
    convertedToInvoiceId: data.converted_to_invoice_id as string | null,
    dealId: data.deal_id as string | null,
    customFields: (data.custom_fields as Record<string, unknown>) || {},
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function mapClientFromDb(data: Record<string, unknown>) {
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
    paymentMethod: (data.payment_method as 'transfer' | 'card' | 'check' | 'cash' | 'direct_debit') || 'transfer',
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

function mapLineItemFromDb(data: Record<string, unknown>): LineItem {
  return {
    id: data.id as string,
    documentType: data.document_type as LineItem['documentType'],
    documentId: data.document_id as string,
    position: data.position as number,
    productId: data.product_id as string | null,
    description: data.description as string,
    quantity: Number(data.quantity),
    unit: (data.unit as string) || 'unite',
    unitPrice: Number(data.unit_price),
    discountPercent: data.discount_percent ? Number(data.discount_percent) : null,
    discountAmount: data.discount_amount ? Number(data.discount_amount) : null,
    vatRate: Number(data.vat_rate) || 0,
    vatAmount: Number(data.vat_amount) || 0,
    lineTotal: Number(data.line_total) || 0,
    lineTotalWithVat: Number(data.line_total_with_vat) || 0,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
