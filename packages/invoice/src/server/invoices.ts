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

function getInvoiceClient() {
  return getSupabaseClient().schema('invoice' as any) as any
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

  let query = getInvoiceClient()
    .from('invoices')
    .select(`
      *,
      client:clients(*)
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
  const { data, error } = await getInvoiceClient()
    .from('invoices')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Get line items
  const { data: lineItems } = await getInvoiceClient()
    .from('line_items')
    .select('*')
    .eq('document_type', 'invoice')
    .eq('document_id', id)
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
  // Generate invoice number
  const { data: numberData } = await getSupabaseClient()
    .rpc('invoice.get_next_number', {
      p_organization_id: organizationId,
      p_type: 'invoice'
    })

  const invoiceNumber = numberData || `FAC-${Date.now()}`

  // Calculate due date
  const issueDate = input.issueDate || new Date().toISOString().split('T')[0]
  let dueDate = input.dueDate

  if (!dueDate) {
    // Get client payment terms or default to 30 days
    const { data: client } = await getInvoiceClient()
      .from('clients')
      .select('payment_terms')
      .eq('id', input.clientId)
      .single()

    const paymentTerms = client?.payment_terms || 30
    const dueDateObj = new Date(issueDate)
    dueDateObj.setDate(dueDateObj.getDate() + paymentTerms)
    dueDate = dueDateObj.toISOString().split('T')[0]
  }

  const { data, error } = await getInvoiceClient()
    .from('invoices')
    .insert({
      organization_id: organizationId,
      client_id: input.clientId,
      invoice_number: invoiceNumber,
      status: 'draft',
      issue_date: issueDate,
      due_date: dueDate,
      subject: input.subject,
      introduction: input.introduction,
      terms: input.terms,
      notes: input.notes,
      footer: input.footer,
      payment_instructions: input.paymentInstructions,
      discount_amount: input.discountAmount || 0,
      discount_percent: input.discountPercent,
      quote_id: input.quoteId,
      deal_id: input.dealId,
      custom_fields: input.customFields || {},
      created_by: userId,
    })
    .select(`
      *,
      client:clients(*)
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
  const updateData: Record<string, unknown> = {}

  if (input.clientId !== undefined) updateData.client_id = input.clientId
  if (input.issueDate !== undefined) updateData.issue_date = input.issueDate
  if (input.dueDate !== undefined) updateData.due_date = input.dueDate
  if (input.status !== undefined) updateData.status = input.status
  if (input.subject !== undefined) updateData.subject = input.subject
  if (input.introduction !== undefined) updateData.introduction = input.introduction
  if (input.terms !== undefined) updateData.terms = input.terms
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.footer !== undefined) updateData.footer = input.footer
  if (input.paymentInstructions !== undefined) updateData.payment_instructions = input.paymentInstructions
  if (input.discountAmount !== undefined) updateData.discount_amount = input.discountAmount
  if (input.discountPercent !== undefined) updateData.discount_percent = input.discountPercent
  if (input.customFields !== undefined) updateData.custom_fields = input.customFields

  // Handle status changes
  if (input.status === 'sent' && !updateData.sent_at) {
    updateData.sent_at = new Date().toISOString()
  }
  if (input.status === 'paid' && !updateData.paid_at) {
    updateData.paid_at = new Date().toISOString()
  }

  const { error } = await getInvoiceClient()
    .from('invoices')
    .update(updateData)
    .eq('id', input.id)

  if (error) throw error

  return getInvoiceById(input.id) as Promise<Invoice>
}

// ===========================================
// DELETE INVOICE (soft delete)
// ===========================================

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await getInvoiceClient()
    .from('invoices')
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

  const { error } = await getInvoiceClient()
    .from('invoices')
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

  const { error } = await getInvoiceClient()
    .from('line_items')
    .insert(lineItems)

  if (error) throw error
}

async function recalculateDocumentTotals(
  documentType: 'invoice' | 'quote' | 'credit_note',
  documentId: string
): Promise<void> {
  // Get all line items
  const { data: lineItems } = await getInvoiceClient()
    .from('line_items')
    .select('line_total, vat_amount')
    .eq('document_type', documentType)
    .eq('document_id', documentId)

  if (!lineItems) return

  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.line_total), 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + Number(item.vat_amount), 0)

  // Get current discount
  const tableName = documentType === 'credit_note' ? 'credit_notes' : documentType + 's'
  const { data: doc } = await getInvoiceClient()
    .from(tableName)
    .select('discount_amount')
    .eq('id', documentId)
    .single()

  const discountAmount = doc?.discount_amount || 0
  const total = subtotal + vatAmount - discountAmount

  await getInvoiceClient()
    .from(tableName)
    .update({ subtotal, vat_amount: vatAmount, total })
    .eq('id', documentId)
}

// ===========================================
// ADD LINE ITEM TO INVOICE
// ===========================================

export async function addInvoiceLineItem(
  invoiceId: string,
  input: CreateLineItemInput
): Promise<LineItem> {
  // Get current max position
  const { data: existing } = await getInvoiceClient()
    .from('line_items')
    .select('position')
    .eq('document_type', 'invoice')
    .eq('document_id', invoiceId)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing && existing.length > 0 ? (existing[0].position as number) + 1 : 0

  const { data, error } = await getInvoiceClient()
    .from('line_items')
    .insert({
      document_type: 'invoice',
      document_id: invoiceId,
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

  // Recalculate totals
  await recalculateDocumentTotals('invoice', invoiceId)

  return mapLineItemFromDb(data)
}

// ===========================================
// DELETE LINE ITEM
// ===========================================

export async function deleteInvoiceLineItem(lineItemId: string): Promise<void> {
  // Get document info first
  const { data: lineItem } = await getInvoiceClient()
    .from('line_items')
    .select('document_id')
    .eq('id', lineItemId)
    .single()

  const { error } = await getInvoiceClient()
    .from('line_items')
    .delete()
    .eq('id', lineItemId)

  if (error) throw error

  // Recalculate totals
  if (lineItem) {
    await recalculateDocumentTotals('invoice', lineItem.document_id as string)
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapInvoiceFromDb(data: Record<string, unknown>): Invoice {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    clientId: data.client_id as string,
    client: data.client ? mapClientFromDb(data.client as Record<string, unknown>) : undefined,
    invoiceNumber: data.invoice_number as string,
    status: data.status as Invoice['status'],
    issueDate: data.issue_date as string,
    dueDate: data.due_date as string,
    sentAt: data.sent_at as string | null,
    paidAt: data.paid_at as string | null,
    subtotal: Number(data.subtotal) || 0,
    discountAmount: Number(data.discount_amount) || 0,
    discountPercent: data.discount_percent ? Number(data.discount_percent) : null,
    vatAmount: Number(data.vat_amount) || 0,
    total: Number(data.total) || 0,
    amountPaid: Number(data.amount_paid) || 0,
    amountDue: Number(data.amount_due) || 0,
    currency: (data.currency as string) || 'EUR',
    subject: data.subject as string | null,
    introduction: data.introduction as string | null,
    terms: data.terms as string | null,
    notes: data.notes as string | null,
    footer: data.footer as string | null,
    paymentInstructions: data.payment_instructions as string | null,
    quoteId: data.quote_id as string | null,
    reminderCount: (data.reminder_count as number) || 0,
    lastReminderAt: data.last_reminder_at as string | null,
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
