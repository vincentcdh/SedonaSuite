// ===========================================
// TICKET CATEGORIES HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  TicketCategory,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types'
import {
  getCategories,
  getActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const categoryKeys = {
  all: ['ticket-categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (organizationId: string) => [...categoryKeys.lists(), organizationId] as const,
  active: (organizationId: string) => [...categoryKeys.all, 'active', organizationId] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

// ===========================================
// USE CATEGORIES
// ===========================================

export function useCategories(organizationId: string) {
  return useQuery({
    queryKey: categoryKeys.list(organizationId),
    queryFn: () => getCategories(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE ACTIVE CATEGORIES
// ===========================================

export function useActiveCategories(organizationId: string) {
  return useQuery({
    queryKey: categoryKeys.active(organizationId),
    queryFn: () => getActiveCategories(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE CATEGORY
// ===========================================

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id || ''),
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
  })
}

// ===========================================
// USE CREATE CATEGORY
// ===========================================

export function useCreateCategory(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

// ===========================================
// USE UPDATE CATEGORY
// ===========================================

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => updateCategory(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(data.id) })
    },
  })
}

// ===========================================
// USE DELETE CATEGORY
// ===========================================

export function useDeleteCategory(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list(organizationId) })
    },
  })
}

// ===========================================
// USE REORDER CATEGORIES
// ===========================================

export function useReorderCategories(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderCategories(organizationId, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list(organizationId) })
    },
  })
}
