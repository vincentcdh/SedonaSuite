import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  ContactFilters,
  PaginationParams,
  PaginatedResult,
} from '../types'
import {
  getContacts,
  getContact as getContactById,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  addContactTags,
  getContactCount,
} from '../server/contacts'

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
    queryFn: () => getContacts(organizationId, filters, pagination),
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single contact
 */
export function useContact(contactId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: contactKeys.detail(contactId),
    queryFn: () => getContactById(contactId),
    enabled: options?.enabled !== false && !!contactId,
  })
}

/**
 * Hook to create a contact
 */
export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreateContactInput
    }) => createContact(organizationId, data),
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
    mutationFn: (data: UpdateContactInput) => updateContact(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: contactKeys.detail(data.id) })
      }
    },
  })
}

/**
 * Hook to delete a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: string) => deleteContact(contactId),
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
    mutationFn: (contactIds: string[]) => bulkDeleteContacts(contactIds),
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
    mutationFn: ({
      contactId,
      tags,
    }: {
      contactId: string
      tags: string[]
    }) => addContactTags(contactId, tags),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: contactKeys.detail(data.id) })
      }
    },
  })
}

/**
 * Hook to get contact count
 */
export function useContactCount(organizationId: string) {
  return useQuery({
    queryKey: contactKeys.count(organizationId),
    queryFn: () => getContactCount(organizationId),
    enabled: !!organizationId,
  })
}
