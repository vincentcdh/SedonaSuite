import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  ContactFilters,
  PaginationParams,
  PaginatedResult,
} from '../types'

// ===========================================
// CONTACTS HOOKS
// ===========================================

// Query keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (orgId: string, filters?: ContactFilters, pagination?: PaginationParams) =>
    [...contactKeys.lists(), orgId, filters, pagination] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  count: (orgId: string) => [...contactKeys.all, 'count', orgId] as const,
}

/**
 * Hook to fetch paginated contacts
 */
export function useContacts(
  organizationId: string,
  filters: ContactFilters = {},
  pagination: PaginationParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: contactKeys.list(organizationId, filters, pagination),
    queryFn: async (): Promise<PaginatedResult<Contact>> => {
      const params = new URLSearchParams()
      params.set('organizationId', organizationId)

      if (filters.search) params.set('search', filters.search)
      if (filters.companyId) params.set('companyId', filters.companyId)
      if (filters.tags?.length) params.set('tags', filters.tags.join(','))
      if (filters.source) params.set('source', filters.source)
      if (filters.ownerId) params.set('ownerId', filters.ownerId)

      if (pagination.page) params.set('page', String(pagination.page))
      if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize))
      if (pagination.sortBy) params.set('sortBy', pagination.sortBy)
      if (pagination.sortOrder) params.set('sortOrder', pagination.sortOrder)

      const response = await fetch(`/api/crm/contacts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch contacts')
      return response.json()
    },
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single contact
 */
export function useContact(contactId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: contactKeys.detail(contactId),
    queryFn: async (): Promise<Contact> => {
      const response = await fetch(`/api/crm/contacts/${contactId}`)
      if (!response.ok) throw new Error('Failed to fetch contact')
      return response.json()
    },
    enabled: options?.enabled !== false && !!contactId,
  })
}

/**
 * Hook to create a contact
 */
export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreateContactInput
    }): Promise<Contact> => {
      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, ...data }),
      })
      if (!response.ok) throw new Error('Failed to create contact')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
    },
  })
}

/**
 * Hook to update a contact
 */
export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateContactInput): Promise<Contact> => {
      const response = await fetch(`/api/crm/contacts/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update contact')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(data.id) })
    },
  })
}

/**
 * Hook to delete a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contactId: string): Promise<void> => {
      const response = await fetch(`/api/crm/contacts/${contactId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete contact')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
    },
  })
}

/**
 * Hook to bulk delete contacts
 */
export function useBulkDeleteContacts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contactIds: string[]): Promise<void> => {
      const response = await fetch('/api/crm/contacts/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: contactIds }),
      })
      if (!response.ok) throw new Error('Failed to delete contacts')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
    },
  })
}

/**
 * Hook to add tags to a contact
 */
export function useAddContactTags() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      contactId,
      tags,
    }: {
      contactId: string
      tags: string[]
    }): Promise<Contact> => {
      const response = await fetch(`/api/crm/contacts/${contactId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      })
      if (!response.ok) throw new Error('Failed to add tags')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(data.id) })
    },
  })
}

/**
 * Hook to get contact count
 */
export function useContactCount(organizationId: string) {
  return useQuery({
    queryKey: contactKeys.count(organizationId),
    queryFn: async (): Promise<number> => {
      const response = await fetch(`/api/crm/contacts/count?organizationId=${organizationId}`)
      if (!response.ok) throw new Error('Failed to fetch contact count')
      const data = await response.json()
      return data.count
    },
    enabled: !!organizationId,
  })
}
