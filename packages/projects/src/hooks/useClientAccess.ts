// ===========================================
// CLIENT ACCESS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClientAccess,
  getClientAccessById,
  inviteClient,
  createShareLink,
  updateClientAccess,
  revokeClientAccess,
  deleteClientAccess,
} from '../server'
import type {
  ClientAccess,
  ClientPermissions,
  InviteClientInput,
  CreateShareLinkInput,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const clientAccessKeys = {
  all: ['client-access'] as const,
  lists: () => [...clientAccessKeys.all, 'list'] as const,
  list: (projectId: string) => [...clientAccessKeys.lists(), projectId] as const,
  details: () => [...clientAccessKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientAccessKeys.details(), id] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useClientAccess(projectId: string) {
  return useQuery({
    queryKey: clientAccessKeys.list(projectId),
    queryFn: () => getClientAccess(projectId),
    enabled: !!projectId,
  })
}

export function useClientAccessById(id: string) {
  return useQuery({
    queryKey: clientAccessKeys.detail(id),
    queryFn: () => getClientAccessById(id),
    enabled: !!id,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useInviteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InviteClientInput) => inviteClient(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: clientAccessKeys.list(data.projectId),
      })
    },
  })
}

export function useCreateShareLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateShareLinkInput) => createShareLink(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: clientAccessKeys.list(data.projectId),
      })
    },
  })
}

export function useUpdateClientAccess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<ClientPermissions> & { isActive?: boolean; expiresAt?: string | null }
    }) => updateClientAccess(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: clientAccessKeys.list(data.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: clientAccessKeys.detail(data.id),
      })
    },
  })
}

export function useRevokeClientAccess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      revokeClientAccess(id).then(() => ({ id, projectId })),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: clientAccessKeys.list(data.projectId),
      })
    },
  })
}

export function useDeleteClientAccess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      deleteClientAccess(id).then(() => ({ id, projectId })),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: clientAccessKeys.list(data.projectId),
      })
    },
  })
}
