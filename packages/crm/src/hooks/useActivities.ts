import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateActivityInput,
  UpdateActivityInput,
  ActivityFilters,
  PaginationParams,
} from '../types'
import {
  getActivities,
  getContactActivities,
  getDealActivities,
  getOverdueTasks as fetchOverdueTasks,
  getUpcomingTasks as fetchUpcomingTasks,
  getActivity as getActivityById,
  createActivity,
  updateActivity,
  completeActivity,
  uncompleteActivity,
  deleteActivity,
} from '../server/activities'

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
    queryFn: () => getActivities(organizationId, filters, pagination),
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
    queryFn: () => getContactActivities(contactId, pagination),
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
    queryFn: () => getDealActivities(dealId, pagination),
    enabled: options?.enabled !== false && !!dealId,
  })
}

/**
 * Hook to fetch overdue tasks
 */
export function useOverdueTasks(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: activityKeys.overdue(organizationId),
    queryFn: () => fetchOverdueTasks(organizationId),
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
    queryFn: () => fetchUpcomingTasks(organizationId, days),
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single activity
 */
export function useActivity(activityId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: activityKeys.detail(activityId),
    queryFn: () => getActivityById(activityId),
    enabled: options?.enabled !== false && !!activityId,
  })
}

/**
 * Hook to create an activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      data,
    }: {
      organizationId: string
      userId: string
      data: CreateActivityInput
    }) => createActivity(organizationId, userId, data),
    onSuccess: (data) => {
      // Invalidate all activity-related queries
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
      if (data?.contactId) {
        queryClient.invalidateQueries({ queryKey: activityKeys.contact(data.contactId) })
      }
      if (data?.dealId) {
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
    mutationFn: (data: UpdateActivityInput) => updateActivity(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: activityKeys.detail(data.id) })
        if (data.contactId) {
          queryClient.invalidateQueries({ queryKey: activityKeys.contact(data.contactId) })
        }
        if (data.dealId) {
          queryClient.invalidateQueries({ queryKey: activityKeys.deal(data.dealId) })
        }
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
    mutationFn: (activityId: string) => completeActivity(activityId),
    onSuccess: () => {
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
    mutationFn: (activityId: string) => uncompleteActivity(activityId),
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
    mutationFn: (activityId: string) => deleteActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}
