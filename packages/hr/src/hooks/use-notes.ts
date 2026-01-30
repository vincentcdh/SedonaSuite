// ===========================================
// EMPLOYEE NOTES HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotesByEmployee,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../server/notes'
import type {
  CreateEmployeeNoteInput,
  UpdateEmployeeNoteInput,
  PaginationParams,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const noteKeys = {
  all: ['hr', 'notes'] as const,
  byEmployee: (employeeId: string, pagination?: PaginationParams) =>
    [...noteKeys.all, 'byEmployee', employeeId, pagination] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useNotesByEmployee(employeeId: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: noteKeys.byEmployee(employeeId, pagination),
    queryFn: () => getNotesByEmployee(employeeId, pagination),
    enabled: !!employeeId,
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => getNoteById(id),
    enabled: !!id,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateNote(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEmployeeNoteInput) => createNote(organizationId, input, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.byEmployee(data.employeeId) })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateEmployeeNoteInput) => updateNote(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(data.id) })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}
