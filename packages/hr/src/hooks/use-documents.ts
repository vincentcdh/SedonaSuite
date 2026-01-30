// ===========================================
// DOCUMENT HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDocumentsByEmployee,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getExpiringDocuments,
} from '../server/documents'
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
  PaginationParams,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const documentKeys = {
  all: ['hr', 'documents'] as const,
  byEmployee: (employeeId: string, pagination?: PaginationParams) =>
    [...documentKeys.all, 'byEmployee', employeeId, pagination] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  expiring: (organizationId: string, daysAhead?: number) =>
    [...documentKeys.all, 'expiring', organizationId, daysAhead] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useDocumentsByEmployee(employeeId: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: documentKeys.byEmployee(employeeId, pagination),
    queryFn: () => getDocumentsByEmployee(employeeId, pagination),
    enabled: !!employeeId,
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => getDocumentById(id),
    enabled: !!id,
  })
}

export function useExpiringDocuments(organizationId: string, daysAhead: number = 30) {
  return useQuery({
    queryKey: documentKeys.expiring(organizationId, daysAhead),
    queryFn: () => getExpiringDocuments(organizationId, daysAhead),
    enabled: !!organizationId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateDocument(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDocumentInput) => createDocument(organizationId, input, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateDocumentInput) => updateDocument(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}
