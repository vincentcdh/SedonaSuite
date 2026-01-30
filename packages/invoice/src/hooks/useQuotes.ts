// ===========================================
// QUOTE HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Quote,
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteFilters,
  PaginationParams,
  CreateLineItemInput,
} from '../types'
import {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  sendQuote,
  acceptQuote,
  rejectQuote,
  convertQuoteToInvoice,
  addQuoteLineItem,
  deleteQuoteLineItem,
} from '../server/quotes'

// Query keys
const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: QuoteFilters, pagination?: PaginationParams) =>
    [...quoteKeys.lists(), organizationId, filters, pagination] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
}

// ===========================================
// LIST QUOTES
// ===========================================

export function useQuotes(
  organizationId: string,
  filters?: QuoteFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: quoteKeys.list(organizationId, filters, pagination),
    queryFn: () => getQuotes(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

// ===========================================
// GET QUOTE BY ID
// ===========================================

export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: quoteKeys.detail(id || ''),
    queryFn: () => getQuoteById(id!),
    enabled: !!id,
  })
}

// ===========================================
// CREATE QUOTE
// ===========================================

export function useCreateQuote(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateQuoteInput) => createQuote(organizationId, input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
    },
  })
}

// ===========================================
// UPDATE QUOTE
// ===========================================

export function useUpdateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateQuoteInput) => updateQuote(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      queryClient.setQueryData(quoteKeys.detail(data.id), data)
    },
  })
}

// ===========================================
// DELETE QUOTE
// ===========================================

export function useDeleteQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
    },
  })
}

// ===========================================
// SEND QUOTE
// ===========================================

export function useSendQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sendQuote(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      queryClient.setQueryData(quoteKeys.detail(data.id), data)
    },
  })
}

// ===========================================
// ACCEPT QUOTE
// ===========================================

export function useAcceptQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => acceptQuote(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      queryClient.setQueryData(quoteKeys.detail(data.id), data)
    },
  })
}

// ===========================================
// REJECT QUOTE
// ===========================================

export function useRejectQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => rejectQuote(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      queryClient.setQueryData(quoteKeys.detail(data.id), data)
    },
  })
}

// ===========================================
// CONVERT TO INVOICE
// ===========================================

export function useConvertQuoteToInvoice(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (quoteId: string) => convertQuoteToInvoice(quoteId, userId),
    onSuccess: ({ quote }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      queryClient.setQueryData(quoteKeys.detail(quote.id), quote)
      queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] })
    },
  })
}

// ===========================================
// ADD LINE ITEM
// ===========================================

export function useAddQuoteLineItem(quoteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLineItemInput) => addQuoteLineItem(quoteId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) })
    },
  })
}

// ===========================================
// DELETE LINE ITEM
// ===========================================

export function useDeleteQuoteLineItem(quoteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lineItemId: string) => deleteQuoteLineItem(lineItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) })
    },
  })
}
