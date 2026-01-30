// ===========================================
// ACTIVITY HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActivityLog,
  getFileActivity,
  logDownload,
} from '../server/activity'
import type {
  ActivityFilters,
  PaginationParams,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const activityKeys = {
  all: ['docs', 'activity'] as const,
  list: (organizationId: string, filters?: ActivityFilters, pagination?: PaginationParams) =>
    [...activityKeys.all, 'list', organizationId, filters, pagination] as const,
  file: (fileId: string, pagination?: PaginationParams) =>
    [...activityKeys.all, 'file', fileId, pagination] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useActivityLog(
  organizationId: string,
  filters?: ActivityFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: activityKeys.list(organizationId, filters, pagination),
    queryFn: () => getActivityLog(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

export function useFileActivity(fileId: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: activityKeys.file(fileId, pagination),
    queryFn: () => getFileActivity(fileId, pagination),
    enabled: !!fileId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useLogDownload(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => logDownload(organizationId, fileId, userId),
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.file(fileId) })
      queryClient.invalidateQueries({ queryKey: activityKeys.list(organizationId) })
    },
  })
}
