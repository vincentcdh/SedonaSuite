import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Tag, CreateTagInput, UpdateTagInput } from '../types'
import { contactKeys } from './useContacts'

// ===========================================
// TAGS HOOKS
// ===========================================

// Query keys
export const tagKeys = {
  all: ['tags'] as const,
  list: (orgId: string) => [...tagKeys.all, 'list', orgId] as const,
  detail: (id: string) => [...tagKeys.all, 'detail', id] as const,
}

/**
 * Hook to fetch all tags for an organization
 */
export function useTags(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: tagKeys.list(organizationId),
    queryFn: async (): Promise<Tag[]> => {
      const response = await fetch(`/api/crm/tags?organizationId=${organizationId}`)
      if (!response.ok) throw new Error('Failed to fetch tags')
      return response.json()
    },
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to create a tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreateTagInput
    }): Promise<Tag> => {
      const response = await fetch('/api/crm/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, ...data }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create tag')
      }
      return response.json()
    },
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list(organizationId) })
    },
  })
}

/**
 * Hook to update a tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: UpdateTagInput
    }): Promise<Tag> => {
      const response = await fetch(`/api/crm/tags/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update tag')
      }
      return response.json()
    },
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list(organizationId) })
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
    },
  })
}

/**
 * Hook to delete a tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organizationId,
      tagId,
    }: {
      organizationId: string
      tagId: string
    }): Promise<void> => {
      const response = await fetch(`/api/crm/tags/${tagId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete tag')
    },
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list(organizationId) })
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
    },
  })
}
