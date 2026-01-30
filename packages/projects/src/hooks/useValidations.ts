// ===========================================
// CLIENT VALIDATIONS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClientValidations,
  getClientValidationById,
  getPendingValidations,
  createClientValidation,
  deleteClientValidation,
  getPendingValidationsCount,
} from '../server'
import type { CreateValidationInput } from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const validationsKeys = {
  all: ['client-validations'] as const,
  lists: () => [...validationsKeys.all, 'list'] as const,
  list: (projectId: string) => [...validationsKeys.lists(), projectId] as const,
  pending: (projectId: string) => [...validationsKeys.all, 'pending', projectId] as const,
  details: () => [...validationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...validationsKeys.details(), id] as const,
  count: (projectId: string) => [...validationsKeys.all, 'count', projectId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useClientValidations(projectId: string) {
  return useQuery({
    queryKey: validationsKeys.list(projectId),
    queryFn: () => getClientValidations(projectId),
    enabled: !!projectId,
  })
}

export function usePendingValidations(projectId: string) {
  return useQuery({
    queryKey: validationsKeys.pending(projectId),
    queryFn: () => getPendingValidations(projectId),
    enabled: !!projectId,
  })
}

export function useClientValidationById(id: string) {
  return useQuery({
    queryKey: validationsKeys.detail(id),
    queryFn: () => getClientValidationById(id),
    enabled: !!id,
  })
}

export function usePendingValidationsCount(projectId: string) {
  return useQuery({
    queryKey: validationsKeys.count(projectId),
    queryFn: () => getPendingValidationsCount(projectId),
    enabled: !!projectId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateClientValidation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateValidationInput) => createClientValidation(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: validationsKeys.list(data.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: validationsKeys.pending(data.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: validationsKeys.count(data.projectId),
      })
    },
  })
}

export function useDeleteClientValidation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      deleteClientValidation(id).then(() => ({ id, projectId })),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: validationsKeys.list(data.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: validationsKeys.pending(data.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: validationsKeys.count(data.projectId),
      })
    },
  })
}
