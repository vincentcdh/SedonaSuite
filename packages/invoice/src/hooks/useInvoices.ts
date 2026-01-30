// ===========================================
// INVOICE HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceFilters,
  PaginationParams,
  CreateLineItemInput,
} from '../types'
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  markInvoiceAsPaid,
  addInvoiceLineItem,
  deleteInvoiceLineItem,
} from '../server/invoices'

// Query keys
const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: InvoiceFilters, pagination?: PaginationParams) =>
    [...invoiceKeys.lists(), organizationId, filters, pagination] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
}

// ===========================================
// LIST INVOICES
// ===========================================

export function useInvoices(
  organizationId: string,
  filters?: InvoiceFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: invoiceKeys.list(organizationId, filters, pagination),
    queryFn: () => getInvoices(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

// ===========================================
// GET INVOICE BY ID
// ===========================================

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.detail(id || ''),
    queryFn: () => getInvoiceById(id!),
    enabled: !!id,
  })
}

// ===========================================
// CREATE INVOICE
// ===========================================

export function useCreateInvoice(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => createInvoice(organizationId, input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
    },
  })
}

// ===========================================
// UPDATE INVOICE
// ===========================================

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateInvoiceInput) => updateInvoice(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.setQueryData(invoiceKeys.detail(data.id), data)
    },
  })
}

// ===========================================
// DELETE INVOICE
// ===========================================

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
    },
  })
}

// ===========================================
// SEND INVOICE
// ===========================================

export function useSendInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sendInvoice(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.setQueryData(invoiceKeys.detail(data.id), data)
    },
  })
}

// ===========================================
// MARK AS PAID
// ===========================================

export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markInvoiceAsPaid(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.setQueryData(invoiceKeys.detail(data.id), data)
    },
  })
}

// ===========================================
// ADD LINE ITEM
// ===========================================

export function useAddInvoiceLineItem(invoiceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLineItemInput) => addInvoiceLineItem(invoiceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) })
    },
  })
}

// ===========================================
// DELETE LINE ITEM
// ===========================================

export function useDeleteInvoiceLineItem(invoiceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lineItemId: string) => deleteInvoiceLineItem(lineItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) })
    },
  })
}
