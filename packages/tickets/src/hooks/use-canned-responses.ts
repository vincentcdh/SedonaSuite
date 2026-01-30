// ===========================================
// CANNED RESPONSES HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CannedResponse,
  CreateCannedResponseInput,
  UpdateCannedResponseInput,
} from '../types'
import {
  getCannedResponses,
  getCannedResponsesByCategory,
  getCannedResponseById,
  getCannedResponseByShortcut,
  searchCannedResponses,
  createCannedResponse,
  updateCannedResponse,
  deleteCannedResponse,
  getCannedResponseCategories,
} from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const cannedResponseKeys = {
  all: ['canned-responses'] as const,
  lists: () => [...cannedResponseKeys.all, 'list'] as const,
  list: (organizationId: string, userId?: string) =>
    [...cannedResponseKeys.lists(), organizationId, userId] as const,
  byCategory: (organizationId: string, category: string, userId?: string) =>
    [...cannedResponseKeys.all, 'category', organizationId, category, userId] as const,
  search: (organizationId: string, searchTerm: string, userId?: string) =>
    [...cannedResponseKeys.all, 'search', organizationId, searchTerm, userId] as const,
  categories: (organizationId: string) =>
    [...cannedResponseKeys.all, 'categories', organizationId] as const,
  details: () => [...cannedResponseKeys.all, 'detail'] as const,
  detail: (id: string) => [...cannedResponseKeys.details(), id] as const,
  byShortcut: (organizationId: string, shortcut: string, userId?: string) =>
    [...cannedResponseKeys.all, 'shortcut', organizationId, shortcut, userId] as const,
}

// ===========================================
// USE CANNED RESPONSES
// ===========================================

export function useCannedResponses(organizationId: string, userId?: string) {
  return useQuery({
    queryKey: cannedResponseKeys.list(organizationId, userId),
    queryFn: () => getCannedResponses(organizationId, userId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE CANNED RESPONSES BY CATEGORY
// ===========================================

export function useCannedResponsesByCategory(
  organizationId: string,
  category: string,
  userId?: string
) {
  return useQuery({
    queryKey: cannedResponseKeys.byCategory(organizationId, category, userId),
    queryFn: () => getCannedResponsesByCategory(organizationId, category, userId),
    enabled: !!organizationId && !!category,
  })
}

// ===========================================
// USE SEARCH CANNED RESPONSES
// ===========================================

export function useSearchCannedResponses(
  organizationId: string,
  searchTerm: string,
  userId?: string
) {
  return useQuery({
    queryKey: cannedResponseKeys.search(organizationId, searchTerm, userId),
    queryFn: () => searchCannedResponses(organizationId, searchTerm, userId),
    enabled: !!organizationId && searchTerm.length >= 2,
  })
}

// ===========================================
// USE CANNED RESPONSE CATEGORIES
// ===========================================

export function useCannedResponseCategories(organizationId: string) {
  return useQuery({
    queryKey: cannedResponseKeys.categories(organizationId),
    queryFn: () => getCannedResponseCategories(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE CANNED RESPONSE
// ===========================================

export function useCannedResponse(id: string | undefined) {
  return useQuery({
    queryKey: cannedResponseKeys.detail(id || ''),
    queryFn: () => getCannedResponseById(id!),
    enabled: !!id,
  })
}

// ===========================================
// USE CANNED RESPONSE BY SHORTCUT
// ===========================================

export function useCannedResponseByShortcut(
  organizationId: string,
  shortcut: string,
  userId?: string
) {
  return useQuery({
    queryKey: cannedResponseKeys.byShortcut(organizationId, shortcut, userId),
    queryFn: () => getCannedResponseByShortcut(organizationId, shortcut, userId),
    enabled: !!organizationId && !!shortcut,
  })
}

// ===========================================
// USE CREATE CANNED RESPONSE
// ===========================================

export function useCreateCannedResponse(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, userId }: { input: CreateCannedResponseInput; userId?: string }) =>
      createCannedResponse(organizationId, input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cannedResponseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cannedResponseKeys.categories(organizationId) })
    },
  })
}

// ===========================================
// USE UPDATE CANNED RESPONSE
// ===========================================

export function useUpdateCannedResponse(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCannedResponseInput) => updateCannedResponse(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cannedResponseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cannedResponseKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: cannedResponseKeys.categories(organizationId) })
    },
  })
}

// ===========================================
// USE DELETE CANNED RESPONSE
// ===========================================

export function useDeleteCannedResponse(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCannedResponse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cannedResponseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cannedResponseKeys.categories(organizationId) })
    },
  })
}
