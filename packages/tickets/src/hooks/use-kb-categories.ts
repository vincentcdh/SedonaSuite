// ===========================================
// KB CATEGORIES HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getKbCategories,
  getKbCategoryById,
  createKbCategory,
  updateKbCategory,
  deleteKbCategory,
  type KbCategory,
  type CreateKbCategoryInput,
  type UpdateKbCategoryInput,
} from '../server/kb-categories'

// ===========================================
// QUERY KEYS
// ===========================================

export const kbCategoryKeys = {
  all: ['kb-categories'] as const,
  lists: () => [...kbCategoryKeys.all, 'list'] as const,
  list: (organizationId: string) => [...kbCategoryKeys.lists(), organizationId] as const,
  details: () => [...kbCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...kbCategoryKeys.details(), id] as const,
}

// ===========================================
// USE KB CATEGORIES
// ===========================================

export function useKbCategories(organizationId: string) {
  return useQuery<KbCategory[]>({
    queryKey: kbCategoryKeys.list(organizationId),
    queryFn: () => getKbCategories(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE KB CATEGORY
// ===========================================

export function useKbCategory(id: string) {
  return useQuery<KbCategory | null>({
    queryKey: kbCategoryKeys.detail(id),
    queryFn: () => getKbCategoryById(id),
    enabled: !!id,
  })
}

// ===========================================
// USE CREATE KB CATEGORY
// ===========================================

export function useCreateKbCategory(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateKbCategoryInput) => createKbCategory(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kbCategoryKeys.list(organizationId) })
    },
  })
}

// ===========================================
// USE UPDATE KB CATEGORY
// ===========================================

export function useUpdateKbCategory(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateKbCategoryInput) => updateKbCategory(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: kbCategoryKeys.list(organizationId) })
      queryClient.invalidateQueries({ queryKey: kbCategoryKeys.detail(data.id) })
    },
  })
}

// ===========================================
// USE DELETE KB CATEGORY
// ===========================================

export function useDeleteKbCategory(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteKbCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kbCategoryKeys.list(organizationId) })
    },
  })
}
