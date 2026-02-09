// ===========================================
// INVOICE SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceFilters,
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
// GET INVOICES
// ===========================================

export async function getInvoices(
  organizationId: string,
  filters: InvoiceFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Invoice>> {
  const { page = 1, pageSize = 20, sortBy = 'issueDate', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getClient()
    .from('invoice_invoices')
    .select(`
      *,
      client:invoice_clients(*)
    `, { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filters.search) {
    query = query.or(`invoice_number.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`)
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
  if (filters.dueDateAfter) {
    query = query.gte('due_date', filters.dueDateAfter)
  }
  if (filters.dueDateBefore) {
    query = query.lte('due_date', filters.dueDateBefore)
  }
  if (filters.isOverdue) {
    const today = new Date().toISOString().split('T')[0]
    query = query.lt('due_date', today).not('status', 'in', '("paid","cancelled")')
  }

  // Sorting
  const sortColumn = toSnakeCase(sortBy)
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: (data || []).map(mapInvoiceFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET INVOICE BY ID
// ===========================================

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await getClient()
    .from('invoice_invoices')
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
    .eq('document_type', 'invoice')
    .eq('invoice_id', id)
    .order('position')

  const invoice = mapInvoiceFromDb(data)
  invoice.lineItems = (lineItems || []).map(mapLineItemFromDb)

  return invoice
}

// ===========================================
// CREATE INVOICE
// ===========================================

export async function createInvoice(
  organizationId: string,
  input: CreateInvoiceInput,
  userId?: string
): Promise<Invoice> {
  // Generate invoice number (simple generation without RPC)
  const { data: lastInvoice } = await getClient()
    .from('invoice_invoices')
    .select('invoice_number')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1)

  let nextNumber = 1
  if (lastInvoice && lastInvoice.length > 0) {
    const lastNum = lastInvoice[0]?.invoice_number
    const match = lastNum?.match(/(\d+)$/)
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }
  const year = new Date().getFullYear()
  const invoiceNumber = `FAC-${year}-${String(nextNumber).padStart(4, '0')}`

  // Calculate due date
  const issueDate = input.issueDate || new Date().toISOString().split('T')[0]
  let dueDate = input.dueDate

  if (!dueDate) {
    // Get client payment terms or default to 30 days
    const { data: client } = await getClient()
      .from('invoice_clients')
      .select('payment_terms')
      .eq('id', input.clientId)
      .single()

    const paymentTerms = client?.payment_terms || 30
    const dueDateObj = new Date(issueDate!)
    dueDateObj.setDate(dueDateObj.getDate() + paymentTerms)
    dueDate = dueDateObj.toISOString().split('T')[0]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    organization_id: organizationId,
    client_id: input.clientId,
    invoice_number: invoiceNumber,
    status: 'draft',
    issue_date: issueDate,
    due_date: dueDate,
    terms: input.terms,
    notes: input.notes,
    discount_amount: input.discountAmount || 0,
    discount_percent: input.discountPercent,
    quote_id: input.quoteId,
    deal_id: input.dealId,
    created_by: userId,
  }

  const { data, error } = await getClient()
    .from('invoice_invoices')
    .insert(insertData)
    .select(`
      *,
      client:invoice_clients(*)
    `)
    .single()

  if (error) throw error

  // Create line items if provided
  if (input.lineItems && input.lineItems.length > 0) {
    await createLineItems('invoice', data.id, input.lineItems)
    await recalculateDocumentTotals('invoice', data.id)
  }

  return getInvoiceById(data.id) as Promise<Invoice>
}

// ===========================================
// UPDATE INVOICE
// ===========================================

export async function updateInvoice(input: UpdateInvoiceInput): Promise<Invoice> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (input.clientId !== undefined) updateData['client_id'] = input.clientId
  if (input.issueDate !== undefined) updateData['issue_date'] = input.issueDate
  if (input.dueDate !== undefined) updateData['due_date'] = input.dueDate
  if (input.status !== undefined) updateData['status'] = input.status
  if (input.subject !== undefined) updateData['subject'] = input.subject
  if (input.introduction !== undefined) updateData['introduction'] = input.introduction
  if (input.terms !== undefined) updateData['terms'] = input.terms
  if (input.notes !== undefined) updateData['notes'] = input.notes
  if (input.footer !== undefined) updateData['footer'] = input.footer
  if (input.paymentInstructions !== undefined) updateData['payment_instructions'] = input.paymentInstructions
  if (input.discountAmount !== undefined) updateData['discount_amount'] = input.discountAmount
  if (input.discountPercent !== undefined) updateData['discount_percent'] = input.discountPercent
  if (input.customFields !== undefined) updateData['custom_fields'] = input.customFields

  // Handle status changes
  if (input.status === 'sent' && !updateData['sent_at']) {
    updateData['sent_at'] = new Date().toISOString()
  }
  if (input.status === 'paid' && !updateData['paid_at']) {
    updateData['paid_at'] = new Date().toISOString()
  }

  const { error } = await getClient()
    .from('invoice_invoices')
    .update(updateData)
    .eq('id', input.id)

  if (error) throw error

  return getInvoiceById(input.id) as Promise<Invoice>
}

// ===========================================
// DELETE INVOICE (soft delete)
// ===========================================

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await getClient()
    .from('invoice_invoices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// SEND INVOICE
// ===========================================

export async function sendInvoice(id: string): Promise<Invoice> {
  return updateInvoice({ id, status: 'sent' })
}

// ===========================================
// MARK AS PAID
// ===========================================

export async function markInvoiceAsPaid(id: string): Promise<Invoice> {
  const invoice = await getInvoiceById(id)
  if (!invoice) throw new Error('Invoice not found')

  const { error } = await getClient()
    .from('invoice_invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      amount_paid: invoice.total,
    })
    .eq('id', id)

  if (error) throw error

  return getInvoiceById(id) as Promise<Invoice>
}

// ===========================================
// LINE ITEMS HELPERS
// ===========================================

async function createLineItems(
  documentType: 'invoice' | 'quote' | 'credit_note',
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
  documentType: 'invoice' | 'quote' | 'credit_note',
  documentId: string
): Promise<void> {
  // Get all line items based on document type
  const idColumn = documentType === 'invoice' ? 'invoice_id' : 'quote_id'
  const { data: lineItems } = await getClient()
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
  if (documentType === 'invoice') {
    const { data: doc } = await getClient()
      .from('invoice_invoices')
      .select('discount_amount')
      .eq('id', documentId)
      .single()

    const discountAmount = (doc as any)?.discount_amount || 0
    const total = subtotal + vatAmount - discountAmount

    await getClient()
      .from('invoice_invoices')
      .update({ subtotal, vat_amount: vatAmount, total })
      .eq('id', documentId)
  } else if (documentType === 'quote') {
    const { data: doc } = await getClient()
      .from('invoice_quotes')
      .select('discount_amount')
      .eq('id', documentId)
      .single()

    const discountAmount = (doc as any)?.discount_amount || 0
    const total = subtotal + vatAmount - discountAmount

    await getClient()
      .from('invoice_quotes')
      .update({ subtotal, vat_amount: vatAmount, total })
      .eq('id', documentId)
  }
}

// ===========================================
// ADD LINE ITEM TO INVOICE
// ===========================================

export async function addInvoiceLineItem(
  invoiceId: string,
  input: CreateLineItemInput
): Promise<LineItem> {
  // Get current max position
  const { data: existing } = await getClient()
    .from('invoice_line_items')
    .select('position')
    .eq('document_type', 'invoice')
    .eq('invoice_id', invoiceId)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing && existing.length > 0 ? ((existing[0] as any).position as number) + 1 : 0

  const { data, error } = await getClient()
    .from('invoice_line_items')
    .insert({
      document_type: 'invoice',
      invoice_id: invoiceId,
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

  // Recalculate totals
  await recalculateDocumentTotals('invoice', invoiceId)

  return mapLineItemFromDb(data)
}

// ===========================================
// DELETE LINE ITEM
// ===========================================

export async function deleteInvoiceLineItem(lineItemId: string): Promise<void> {
  // Get document info first
  const { data: lineItem } = await getClient()
    .from('invoice_line_items')
    .select('invoice_id')
    .eq('id', lineItemId)
    .single()

  const { error } = await getClient()
    .from('invoice_line_items')
    .delete()
    .eq('id', lineItemId)

  if (error) throw error

  // Recalculate totals
  if (lineItem?.invoice_id) {
    await recalculateDocumentTotals('invoice', lineItem.invoice_id)
  }
}

// ===========================================
// HELPERS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvoiceFromDb(row: any): Invoice {
  return {
    id: row.id,
    organizationId: row.organization_id,
    clientId: row.client_id,
    client: row.client ? mapClientFromDb(row.client) : undefined,
    invoiceNumber: row.invoice_number,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    sentAt: row.sent_at,
    paidAt: row.paid_at,
    subtotal: Number(row.subtotal) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    discountPercent: row.discount_percent ? Number(row.discount_percent) : null,
    vatAmount: Number(row.vat_amount) || 0,
    total: Number(row.total) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    amountDue: Number(row.amount_due) || 0,
    currency: row.currency || 'EUR',
    subject: row.subject,
    introduction: row.introduction,
    terms: row.terms,
    notes: row.notes,
    footer: row.footer,
    paymentInstructions: row.payment_instructions,
    quoteId: row.quote_id,
    reminderCount: row.reminder_count || 0,
    lastReminderAt: row.last_reminder_at,
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
