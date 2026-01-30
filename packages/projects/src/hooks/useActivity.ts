// ===========================================
// ACTIVITY LOG HOOKS
// ===========================================

import { useQuery } from '@tanstack/react-query'
import { getProjectActivity } from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const activityKeys = {
  all: ['project-activity'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (projectId: string, options?: { limit?: number; visibleToClientOnly?: boolean }) =>
    [...activityKeys.lists(), projectId, options] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useProjectActivity(
  projectId: string,
  options?: {
    limit?: number
    visibleToClientOnly?: boolean
  }
) {
  return useQuery({
    queryKey: activityKeys.list(projectId, options),
    queryFn: () => getProjectActivity(projectId, options),
    enabled: !!projectId,
  })
}

export function useRecentActivity(projectId: string, limit: number = 10) {
  return useProjectActivity(projectId, { limit })
}

export function useClientVisibleActivity(projectId: string, limit?: number) {
  return useProjectActivity(projectId, { limit, visibleToClientOnly: true })
}
