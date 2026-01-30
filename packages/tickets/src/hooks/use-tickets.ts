// ===========================================
// TICKETS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Ticket,
  TicketWithRelations,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
  PaginationParams,
  PaginatedResult,
  TicketStats,
} from '../types'
import {
  getTickets,
  getTicketById,
  getTicketByNumber,
  createTicket,
  updateTicket,
  deleteTicket,
  assignTicket,
  changeTicketStatus,
  getTicketStats,
} from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: TicketFilters, pagination?: PaginationParams) =>
    [...ticketKeys.lists(), organizationId, filters, pagination] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  byNumber: (ticketNumber: string) => [...ticketKeys.all, 'number', ticketNumber] as const,
  stats: (organizationId: string) => [...ticketKeys.all, 'stats', organizationId] as const,
}

// ===========================================
// USE TICKETS LIST
// ===========================================

export function useTickets(
  organizationId: string,
  filters: TicketFilters = {},
  pagination: PaginationParams = {}
) {
  return useQuery({
    queryKey: ticketKeys.list(organizationId, filters, pagination),
    queryFn: () => getTickets(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE TICKET DETAIL
// ===========================================

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ticketKeys.detail(id || ''),
    queryFn: () => getTicketById(id!),
    enabled: !!id,
  })
}

// ===========================================
// USE TICKET BY NUMBER
// ===========================================

export function useTicketByNumber(ticketNumber: string | undefined) {
  return useQuery({
    queryKey: ticketKeys.byNumber(ticketNumber || ''),
    queryFn: () => getTicketByNumber(ticketNumber!),
    enabled: !!ticketNumber,
  })
}

// ===========================================
// USE TICKET STATS
// ===========================================

export function useTicketStats(organizationId: string) {
  return useQuery({
    queryKey: ticketKeys.stats(organizationId),
    queryFn: () => getTicketStats(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE CREATE TICKET
// ===========================================

export function useCreateTicket(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, userId }: { input: CreateTicketInput; userId?: string }) =>
      createTicket(organizationId, input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats(organizationId) })
    },
  })
}

// ===========================================
// USE UPDATE TICKET
// ===========================================

export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTicketInput) => updateTicket(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats(data.organizationId) })
    },
  })
}

// ===========================================
// USE DELETE TICKET
// ===========================================

export function useDeleteTicket(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats(organizationId) })
    },
  })
}

// ===========================================
// USE ASSIGN TICKET
// ===========================================

export function useAssignTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, assigneeId }: { ticketId: string; assigneeId: string | null }) =>
      assignTicket(ticketId, assigneeId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(data.id) })
    },
  })
}

// ===========================================
// USE CHANGE TICKET STATUS
// ===========================================

export function useChangeTicketStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: Ticket['status'] }) =>
      changeTicketStatus(ticketId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats(data.organizationId) })
    },
  })
}
