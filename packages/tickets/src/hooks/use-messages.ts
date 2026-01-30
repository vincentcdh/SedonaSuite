// ===========================================
// TICKET MESSAGES HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  TicketMessage,
  CreateMessageInput,
  UpdateMessageInput,
  MessageFilters,
} from '../types'
import {
  getTicketMessages,
  createTicketMessage,
  updateTicketMessage,
  deleteTicketMessage,
  addInternalNote,
} from '../server'
import { ticketKeys } from './use-tickets'

// ===========================================
// QUERY KEYS
// ===========================================

export const messageKeys = {
  all: ['ticket-messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (ticketId: string, filters?: MessageFilters) =>
    [...messageKeys.lists(), ticketId, filters] as const,
}

// ===========================================
// USE TICKET MESSAGES
// ===========================================

export function useTicketMessages(ticketId: string, filters: MessageFilters = {}) {
  return useQuery({
    queryKey: messageKeys.list(ticketId, filters),
    queryFn: () => getTicketMessages(ticketId, filters),
    enabled: !!ticketId,
  })
}

// ===========================================
// USE CREATE MESSAGE
// ===========================================

export function useCreateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      input,
      userId,
      authorType,
    }: {
      input: CreateMessageInput
      userId?: string
      authorType?: 'agent' | 'customer'
    }) => createTicketMessage(input, userId, authorType),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(data.ticketId) })
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(data.ticketId) })
    },
  })
}

// ===========================================
// USE UPDATE MESSAGE
// ===========================================

export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMessageInput) => updateTicketMessage(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(data.ticketId) })
    },
  })
}

// ===========================================
// USE DELETE MESSAGE
// ===========================================

export function useDeleteMessage(ticketId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTicketMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(ticketId) })
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) })
    },
  })
}

// ===========================================
// USE ADD INTERNAL NOTE
// ===========================================

export function useAddInternalNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ticketId,
      content,
      userId,
    }: {
      ticketId: string
      content: string
      userId: string
    }) => addInternalNote(ticketId, content, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(data.ticketId) })
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(data.ticketId) })
    },
  })
}
