// ===========================================
// DASHBOARDS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDashboards,
  getDashboardById,
  getDefaultDashboard,
  createDashboard,
  updateDashboard,
  updateDashboardLayout,
  deleteDashboard,
  duplicateDashboard,
} from '../server/dashboards'
import type {
  DashboardFilters,
  CreateDashboardInput,
  UpdateDashboardInput,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const dashboardKeys = {
  all: ['dashboards'] as const,
  lists: () => [...dashboardKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: DashboardFilters) =>
    [...dashboardKeys.lists(), organizationId, filters] as const,
  details: () => [...dashboardKeys.all, 'detail'] as const,
  detail: (id: string) => [...dashboardKeys.details(), id] as const,
  default: (organizationId: string) =>
    [...dashboardKeys.all, 'default', organizationId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useDashboards(organizationId: string, filters?: DashboardFilters) {
  return useQuery({
    queryKey: dashboardKeys.list(organizationId, filters),
    queryFn: () => getDashboards(organizationId, filters),
    enabled: !!organizationId,
  })
}

export function useDashboard(dashboardId: string | undefined) {
  return useQuery({
    queryKey: dashboardKeys.detail(dashboardId || ''),
    queryFn: () => getDashboardById(dashboardId!),
    enabled: !!dashboardId,
  })
}

export function useDefaultDashboard(organizationId: string) {
  return useQuery({
    queryKey: dashboardKeys.default(organizationId),
    queryFn: () => getDefaultDashboard(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      data,
    }: {
      organizationId: string
      userId: string
      data: CreateDashboardInput
    }) => createDashboard(organizationId, userId, data),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.default(organizationId) })
    },
  })
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      dashboardId,
      data,
    }: {
      dashboardId: string
      data: UpdateDashboardInput
    }) => updateDashboard(dashboardId, data),
    onSuccess: (dashboard) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(dashboard.id) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.default(dashboard.organizationId) })
    },
  })
}

export function useUpdateDashboardLayout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      dashboardId,
      layout,
    }: {
      dashboardId: string
      layout: Array<{ widgetId: string; x: number; y: number; w: number; h: number }>
    }) => updateDashboardLayout(dashboardId, layout),
    onSuccess: (dashboard) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(dashboard.id) })
    },
  })
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dashboardId: string) => deleteDashboard(dashboardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}

export function useDuplicateDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      dashboardId,
      userId,
      newName,
    }: {
      dashboardId: string
      userId: string
      newName?: string
    }) => duplicateDashboard(dashboardId, userId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() })
    },
  })
}
