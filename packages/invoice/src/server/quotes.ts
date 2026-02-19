// ===========================================
// QUOTE SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient, validateOrganizationId } from '@sedona/database'
import { assertQuoteLimit } from '@sedona/billing/server'
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
    .eq('quote_id', id)
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
  // Validate organization ID
  const validOrgId = validateOrganizationId(organizationId)

  // Check module limit before creating
  await assertQuoteLimit(validOrgId)

  const client = getClient()

  // Generate quote number by querying existing quotes
  const { data: lastQuote } = await client
    .from('invoice_quotes')
    .select('quote_number')
    .eq('organization_id', validOrgId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let nextNumber = 1
  if ((lastQuote as any)?.quote_number) {
    const match = ((lastQuote as any).quote_number as string).match(/(\d+)$/)
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }
  const quoteNumber = `DEV-${String(nextNumber).padStart(4, '0')}`

  const issueDate = input.issueDate || new Date().toISOString().split('T')[0] as string

  // Calculate valid_until (default 30 days)
  let validUntil = input.validUntil
  if (!validUntil) {
    const validUntilDate = new Date(issueDate)
    validUntilDate.setDate(validUntilDate.getDate() + 30)
    validUntil = validUntilDate.toISOString().split('T')[0] as string
  }

  const { data, error } = await client
    .from('invoice_quotes')
    .insert({
      organization_id: validOrgId,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (input.clientId !== undefined) updateData['client_id'] = input.clientId
  if (input.issueDate !== undefined) updateData['issue_date'] = input.issueDate
  if (input.validUntil !== undefined) updateData['valid_until'] = input.validUntil
  if (input.status !== undefined) updateData['status'] = input.status
  if (input.subject !== undefined) updateData['subject'] = input.subject
  if (input.introduction !== undefined) updateData['introduction'] = input.introduction
  if (input.terms !== undefined) updateData['terms'] = input.terms
  if (input.notes !== undefined) updateData['notes'] = input.notes
  if (input.footer !== undefined) updateData['footer'] = input.footer
  if (input.discountAmount !== undefined) updateData['discount_amount'] = input.discountAmount
  if (input.discountPercent !== undefined) updateData['discount_percent'] = input.discountPercent
  if (input.customFields !== undefined) updateData['custom_fields'] = input.customFields

  // Handle status changes
  if (input.status === 'accepted') {
    updateData['accepted_at'] = new Date().toISOString()
  }
  if (input.status === 'rejected') {
    updateData['rejected_at'] = new Date().toISOString()
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
    invoice_id: documentType === 'invoice' ? documentId : null,
    quote_id: documentType === 'quote' ? documentId : null,
    position: index,
    product_id: item.productId,
    description: item.description,
    quantity: item.quantity || 1,
    unit: item.unit || 'unite',
    unit_price: item.unitPrice,
    discount_percent: item.discountPercent,
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
  const idColumn = documentType === 'invoice' ? 'invoice_id' : 'quote_id'

  const { data: lineItems } = await client
    .from('invoice_line_items')
    .select('subtotal, vat_amount')
    .eq('document_type', documentType)
    .eq(idColumn, documentId)

  if (!lineItems) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subtotal = lineItems.reduce((sum, item: any) => sum + Number(item.subtotal || 0), 0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vatAmount = lineItems.reduce((sum, item: any) => sum + Number(item.vat_amount || 0), 0)

  // Get discount and update totals based on document type
  if (documentType === 'quote') {
    const { data: doc } = await client
      .from('invoice_quotes')
      .select('discount_amount')
      .eq('id', documentId)
      .single()

    const discountAmount = (doc as any)?.discount_amount || 0
    const total = subtotal + vatAmount - discountAmount

    await client
      .from('invoice_quotes')
      .update({ subtotal, vat_amount: vatAmount, total })
      .eq('id', documentId)
  } else if (documentType === 'invoice') {
    const { data: doc } = await client
      .from('invoice_invoices')
      .select('discount_amount')
      .eq('id', documentId)
      .single()

    const discountAmount = (doc as any)?.discount_amount || 0
    const total = subtotal + vatAmount - discountAmount

    await client
      .from('invoice_invoices')
      .update({ subtotal, vat_amount: vatAmount, total })
      .eq('id', documentId)
  }
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
    .eq('quote_id', quoteId)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing && existing.length > 0 ? ((existing[0] as any).position as number) + 1 : 0

  const { data, error } = await client
    .from('invoice_line_items')
    .insert({
      document_type: 'quote',
      quote_id: quoteId,
      position,
      product_id: input.productId,
      description: input.description,
      quantity: input.quantity || 1,
      unit: input.unit || 'unite',
      unit_price: input.unitPrice,
      discount_percent: input.discountPercent,
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
    .select('quote_id')
    .eq('id', lineItemId)
    .single()

  const { error } = await client
    .from('invoice_line_items')
    .delete()
    .eq('id', lineItemId)

  if (error) throw error

  if (lineItem?.quote_id) {
    await recalculateDocumentTotals('quote', lineItem.quote_id)
  }
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapQuoteFromDb(row: any): Quote {
  return {
    id: row.id,
    organizationId: row.organization_id,
    clientId: row.client_id,
    client: row.client ? mapClientFromDb(row.client) : undefined,
    quoteNumber: row.quote_number,
    status: row.status,
    issueDate: row.issue_date,
    validUntil: row.valid_until,
    acceptedAt: row.accepted_at,
    rejectedAt: row.rejected_at,
    subtotal: Number(row.subtotal) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    discountPercent: row.discount_percent ? Number(row.discount_percent) : null,
    vatAmount: Number(row.vat_amount) || 0,
    total: Number(row.total) || 0,
    currency: row.currency || 'EUR',
    subject: row.subject,
    introduction: row.introduction,
    terms: row.terms,
    notes: row.notes,
    footer: row.footer,
    convertedToInvoiceId: row.converted_to_invoice_id,
    dealId: row.deal_id,
    customFields: row.custom_fields || {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapClientFromDb(row: any) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    legalName: row.legal_name,
    siret: row.siret,
    vatNumber: row.vat_number,
    legalForm: row.legal_form,
    billingAddressLine1: row.billing_address_line1,
    billingAddressLine2: row.billing_address_line2,
    billingCity: row.billing_city,
    billingPostalCode: row.billing_postal_code,
    billingCountry: row.billing_country || 'France',
    billingEmail: row.billing_email,
    billingPhone: row.billing_phone,
    contactName: row.contact_name,
    paymentTerms: row.payment_terms || 30,
    paymentMethod: row.payment_method || 'transfer',
    defaultCurrency: row.default_currency || 'EUR',
    crmCompanyId: row.crm_company_id,
    crmContactId: row.crm_contact_id,
    notes: row.notes,
    customFields: row.custom_fields || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLineItemFromDb(row: any): LineItem {
  return {
    id: row.id,
    documentType: row.document_type,
    documentId: row.invoice_id || row.quote_id,
    position: row.position,
    productId: row.product_id,
    description: row.description,
    quantity: Number(row.quantity),
    unit: row.unit || 'unite',
    unitPrice: Number(row.unit_price),
    discountPercent: row.discount_percent ? Number(row.discount_percent) : null,
    discountAmount: null,
    vatRate: Number(row.vat_rate) || 0,
    vatAmount: Number(row.vat_amount) || 0,
    lineTotal: Number(row.subtotal) || 0,
    lineTotalWithVat: Number(row.total) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
