// ===========================================
// TICKET TAGS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  TicketTag,
  CreateTagInput,
  UpdateTagInput,
} from '../types'
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getOrCreateTag,
  getTagsWithUsageCount,
} from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const tagKeys = {
  all: ['ticket-tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (organizationId: string) => [...tagKeys.lists(), organizationId] as const,
  withCount: (organizationId: string) => [...tagKeys.all, 'withCount', organizationId] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
}

// ===========================================
// USE TAGS
// ===========================================

export function useTags(organizationId: string) {
  return useQuery({
    queryKey: tagKeys.list(organizationId),
    queryFn: () => getTags(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE TAGS WITH USAGE COUNT
// ===========================================

export function useTagsWithUsageCount(organizationId: string) {
  return useQuery({
    queryKey: tagKeys.withCount(organizationId),
    queryFn: () => getTagsWithUsageCount(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE TAG
// ===========================================

export function useTag(id: string | undefined) {
  return useQuery({
    queryKey: tagKeys.detail(id || ''),
    queryFn: () => getTagById(id!),
    enabled: !!id,
  })
}

// ===========================================
// USE CREATE TAG
// ===========================================

export function useCreateTag(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
  })
}

// ===========================================
// USE UPDATE TAG
// ===========================================

export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTagInput) => updateTag(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(data.id) })
    },
  })
}

// ===========================================
// USE DELETE TAG
// ===========================================

export function useDeleteTag(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list(organizationId) })
    },
  })
}

// ===========================================
// USE GET OR CREATE TAG
// ===========================================

export function useGetOrCreateTag(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) =>
      getOrCreateTag(organizationId, name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
  })
}
