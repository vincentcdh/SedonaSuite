// ===========================================
// CLIENT HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  InvoiceClient,
  CreateClientInput,
  UpdateClientInput,
  ClientFilters,
  PaginationParams,
} from '../types'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../server/clients'

// Query keys
const clientKeys = {
  all: ['invoice-clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: ClientFilters, pagination?: PaginationParams) =>
    [...clientKeys.lists(), organizationId, filters, pagination] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}

// ===========================================
// LIST CLIENTS
// ===========================================

export function useClients(
  organizationId: string,
  filters?: ClientFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: clientKeys.list(organizationId, filters, pagination),
    queryFn: () => getClients(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

// ===========================================
// GET CLIENT BY ID
// ===========================================

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: clientKeys.detail(id || ''),
    queryFn: () => getClientById(id!),
    enabled: !!id,
  })
}

// ===========================================
// CREATE CLIENT
// ===========================================

export function useCreateClient(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
    },
  })
}

// ===========================================
// UPDATE CLIENT
// ===========================================

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateClientInput) => updateClient(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      queryClient.setQueryData(clientKeys.detail(data.id), data)
    },
  })
}

// ===========================================
// DELETE CLIENT
// ===========================================

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
    },
  })
}
