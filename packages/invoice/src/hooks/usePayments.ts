// ===========================================
// PAYMENT HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
  PaginationParams,
} from '../types'
import {
  getPayments,
  getPaymentsByInvoice,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from '../server/payments'

// Query keys
const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (organizationId: string, pagination?: PaginationParams) =>
    [...paymentKeys.lists(), organizationId, pagination] as const,
  byInvoice: (invoiceId: string) => [...paymentKeys.all, 'invoice', invoiceId] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
}

// ===========================================
// LIST PAYMENTS
// ===========================================

export function usePayments(
  organizationId: string,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: paymentKeys.list(organizationId, pagination),
    queryFn: () => getPayments(organizationId, pagination),
    enabled: !!organizationId,
  })
}

// ===========================================
// GET PAYMENTS BY INVOICE
// ===========================================

export function usePaymentsByInvoice(invoiceId: string) {
  return useQuery({
    queryKey: paymentKeys.byInvoice(invoiceId),
    queryFn: () => getPaymentsByInvoice(invoiceId),
    enabled: !!invoiceId,
  })
}

// ===========================================
// GET PAYMENT BY ID
// ===========================================

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.detail(id || ''),
    queryFn: () => getPaymentById(id!),
    enabled: !!id,
  })
}

// ===========================================
// CREATE PAYMENT
// ===========================================

export function useCreatePayment(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePaymentInput) => createPayment(organizationId, input, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.byInvoice(data.invoiceId) })
      // Also invalidate the invoice as its status may have changed
      queryClient.invalidateQueries({ queryKey: ['invoices', 'detail', data.invoiceId] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] })
    },
  })
}

// ===========================================
// UPDATE PAYMENT
// ===========================================

export function useUpdatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdatePaymentInput) => updatePayment(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.byInvoice(data.invoiceId) })
      queryClient.setQueryData(paymentKeys.detail(data.id), data)
      // Also invalidate the invoice
      queryClient.invalidateQueries({ queryKey: ['invoices', 'detail', data.invoiceId] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] })
    },
  })
}

// ===========================================
// DELETE PAYMENT
// ===========================================

export function useDeletePayment(invoiceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.byInvoice(invoiceId) })
      // Also invalidate the invoice
      queryClient.invalidateQueries({ queryKey: ['invoices', 'detail', invoiceId] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] })
    },
  })
}
