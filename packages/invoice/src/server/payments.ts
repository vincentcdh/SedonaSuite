// ===========================================
// PAYMENT SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
  PaginatedResult,
  PaginationParams,
} from '../types'

function getInvoiceClient() {
  return getSupabaseClient().schema('invoice' as any) as any
}

// ===========================================
// GET PAYMENTS FOR INVOICE
// ===========================================

export async function getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
  const { data, error } = await getInvoiceClient()
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('payment_date', { ascending: false })

  if (error) throw error

  return (data || []).map(mapPaymentFromDb)
}

// ===========================================
// GET ALL PAYMENTS (for organization)
// ===========================================

export async function getPayments(
  organizationId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Payment>> {
  const { page = 1, pageSize = 50, sortBy = 'paymentDate', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  const { data, error, count } = await getInvoiceClient()
    .from('payments')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  return {
    data: (data || []).map(mapPaymentFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET PAYMENT BY ID
// ===========================================

export async function getPaymentById(id: string): Promise<Payment | null> {
  const { data, error } = await getInvoiceClient()
    .from('payments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapPaymentFromDb(data)
}

// ===========================================
// CREATE PAYMENT
// ===========================================

export async function createPayment(
  organizationId: string,
  input: CreatePaymentInput,
  userId?: string
): Promise<Payment> {
  const { data, error } = await getInvoiceClient()
    .from('payments')
    .insert({
      organization_id: organizationId,
      invoice_id: input.invoiceId,
      amount: input.amount,
      currency: 'EUR',
      payment_date: input.paymentDate || new Date().toISOString().split('T')[0],
      payment_method: input.paymentMethod,
      reference: input.reference,
      notes: input.notes,
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  return mapPaymentFromDb(data)
}

// ===========================================
// UPDATE PAYMENT
// ===========================================

export async function updatePayment(input: UpdatePaymentInput): Promise<Payment> {
  const updateData: Record<string, unknown> = {}

  if (input.amount !== undefined) updateData.amount = input.amount
  if (input.paymentDate !== undefined) updateData.payment_date = input.paymentDate
  if (input.paymentMethod !== undefined) updateData.payment_method = input.paymentMethod
  if (input.reference !== undefined) updateData.reference = input.reference
  if (input.notes !== undefined) updateData.notes = input.notes

  const { data, error } = await getInvoiceClient()
    .from('payments')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapPaymentFromDb(data)
}

// ===========================================
// DELETE PAYMENT
// ===========================================

export async function deletePayment(id: string): Promise<void> {
  const { error } = await getInvoiceClient()
    .from('payments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// HELPERS
// ===========================================

function mapPaymentFromDb(data: Record<string, unknown>): Payment {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    invoiceId: data.invoice_id as string,
    amount: Number(data.amount),
    currency: (data.currency as string) || 'EUR',
    paymentDate: data.payment_date as string,
    paymentMethod: data.payment_method as Payment['paymentMethod'],
    reference: data.reference as string | null,
    notes: data.notes as string | null,
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
