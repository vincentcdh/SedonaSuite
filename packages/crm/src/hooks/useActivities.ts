import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Activity,
  CreateActivityInput,
  UpdateActivityInput,
  ActivityFilters,
  PaginationParams,
  PaginatedResult,
} from '../types'

// ===========================================
// ACTIVITIES HOOKS
// ===========================================

// Query keys
export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (orgId: string, filters?: ActivityFilters, pagination?: PaginationParams) =>
    [...activityKeys.lists(), orgId, filters, pagination] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
  contact: (contactId: string) => [...activityKeys.all, 'contact', contactId] as const,
  deal: (dealId: string) => [...activityKeys.all, 'deal', dealId] as const,
  overdue: (orgId: string) => [...activityKeys.all, 'overdue', orgId] as const,
  upcoming: (orgId: string) => [...activityKeys.all, 'upcoming', orgId] as const,
}

/**
 * Hook to fetch paginated activities
 */
export function useActivities(
  organizationId: string,
  filters: ActivityFilters = {},
  pagination: PaginationParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: activityKeys.list(organizationId, filters, pagination),
    queryFn: async (): Promise<PaginatedResult<Activity>> => {
      const params = new URLSearchParams()
      params.set('organizationId', organizationId)

      if (filters.type) params.set('type', filters.type)
      if (filters.contactId) params.set('contactId', filters.contactId)
      if (filters.companyId) params.set('companyId', filters.companyId)
      if (filters.dealId) params.set('dealId', filters.dealId)
      if (filters.createdBy) params.set('createdBy', filters.createdBy)
      if (filters.completed !== undefined) params.set('completed', String(filters.completed))

      if (pagination.page) params.set('page', String(pagination.page))
      if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize))
      if (pagination.sortBy) params.set('sortBy', pagination.sortBy)
      if (pagination.sortOrder) params.set('sortOrder', pagination.sortOrder)

      const response = await fetch(`/api/crm/activities?${params}`)
      if (!response.ok) throw new Error('Failed to fetch activities')
      return response.json()
    },
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch activities for a contact (timeline)
 */
export function useContactActivities(
  contactId: string,
  pagination: PaginationParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: activityKeys.contact(contactId),
    queryFn: async (): Promise<PaginatedResult<Activity>> => {
      const params = new URLSearchParams()
      if (pagination.page) params.set('page', String(pagination.page))
      if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize))

      const response = await fetch(`/api/crm/contacts/${contactId}/activities?${params}`)
      if (!response.ok) throw new Error('Failed to fetch contact activities')
      return response.json()
    },
    enabled: options?.enabled !== false && !!contactId,
  })
}

/**
 * Hook to fetch activities for a deal
 */
export function useDealActivities(
  dealId: string,
  pagination: PaginationParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: activityKeys.deal(dealId),
    queryFn: async (): Promise<PaginatedResult<Activity>> => {
      const params = new URLSearchParams()
      if (pagination.page) params.set('page', String(pagination.page))
      if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize))

      const response = await fetch(`/api/crm/deals/${dealId}/activities?${params}`)
      if (!response.ok) throw new Error('Failed to fetch deal activities')
      return response.json()
    },
    enabled: options?.enabled !== false && !!dealId,
  })
}

/**
 * Hook to fetch overdue tasks
 */
export function useOverdueTasks(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: activityKeys.overdue(organizationId),
    queryFn: async (): Promise<Activity[]> => {
      const response = await fetch(`/api/crm/activities/overdue?organizationId=${organizationId}`)
      if (!response.ok) throw new Error('Failed to fetch overdue tasks')
      return response.json()
    },
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch upcoming tasks
 */
export function useUpcomingTasks(
  organizationId: string,
  days: number = 7,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: activityKeys.upcoming(organizationId),
    queryFn: async (): Promise<Activity[]> => {
      const response = await fetch(
        `/api/crm/activities/upcoming?organizationId=${organizationId}&days=${days}`
      )
      if (!response.ok) throw new Error('Failed to fetch upcoming tasks')
      return response.json()
    },
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single activity
 */
export function useActivity(activityId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: activityKeys.detail(activityId),
    queryFn: async (): Promise<Activity> => {
      const response = await fetch(`/api/crm/activities/${activityId}`)
      if (!response.ok) throw new Error('Failed to fetch activity')
      return response.json()
    },
    enabled: options?.enabled !== false && !!activityId,
  })
}

/**
 * Hook to create an activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreateActivityInput
    }): Promise<Activity> => {
      const response = await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, ...data }),
      })
      if (!response.ok) throw new Error('Failed to create activity')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() })
      if (data.contactId) {
        queryClient.invalidateQueries({ queryKey: activityKeys.contact(data.contactId) })
      }
      if (data.dealId) {
        queryClient.invalidateQueries({ queryKey: activityKeys.deal(data.dealId) })
      }
    },
  })
}

/**
 * Hook to update an activity
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateActivityInput): Promise<Activity> => {
      const response = await fetch(`/api/crm/activities/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update activity')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(data.id) })
      if (data.contactId) {
        queryClient.invalidateQueries({ queryKey: activityKeys.contact(data.contactId) })
      }
      if (data.dealId) {
        queryClient.invalidateQueries({ queryKey: activityKeys.deal(data.dealId) })
      }
    },
  })
}

/**
 * Hook to complete an activity
 */
export function useCompleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string): Promise<Activity> => {
      const response = await fetch(`/api/crm/activities/${activityId}/complete`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to complete activity')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

/**
 * Hook to uncomplete an activity
 */
export function useUncompleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string): Promise<Activity> => {
      const response = await fetch(`/api/crm/activities/${activityId}/uncomplete`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to uncomplete activity')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

/**
 * Hook to delete an activity
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string): Promise<void> => {
      const response = await fetch(`/api/crm/activities/${activityId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete activity')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}
