// ===========================================
// WIDGETS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWidgetsByDashboard,
  getWidgetById,
  createWidget,
  updateWidget,
  deleteWidget,
  getWidgetData,
} from '../server/widgets'
import type {
  Widget,
  CreateWidgetInput,
  UpdateWidgetInput,
  MetricFilters,
} from '../types'
import { dashboardKeys } from './use-dashboards'

// ===========================================
// QUERY KEYS
// ===========================================

export const widgetKeys = {
  all: ['widgets'] as const,
  lists: () => [...widgetKeys.all, 'list'] as const,
  list: (dashboardId: string) => [...widgetKeys.lists(), dashboardId] as const,
  details: () => [...widgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...widgetKeys.details(), id] as const,
  data: (id: string, filters: MetricFilters) =>
    [...widgetKeys.all, 'data', id, filters] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useWidgetsByDashboard(dashboardId: string | undefined) {
  return useQuery({
    queryKey: widgetKeys.list(dashboardId || ''),
    queryFn: () => getWidgetsByDashboard(dashboardId!),
    enabled: !!dashboardId,
  })
}

export function useWidget(widgetId: string | undefined) {
  return useQuery({
    queryKey: widgetKeys.detail(widgetId || ''),
    queryFn: () => getWidgetById(widgetId!),
    enabled: !!widgetId,
  })
}

export function useWidgetData(
  widget: Widget | undefined,
  organizationId: string,
  filters: MetricFilters
) {
  return useQuery({
    queryKey: widgetKeys.data(widget?.id || '', filters),
    queryFn: () => getWidgetData(widget!, organizationId, filters),
    enabled: !!widget && !!organizationId,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateWidget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWidgetInput) => createWidget(data),
    onSuccess: (widget) => {
      queryClient.invalidateQueries({ queryKey: widgetKeys.list(widget.dashboardId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(widget.dashboardId) })
    },
  })
}

export function useUpdateWidget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      widgetId,
      data,
    }: {
      widgetId: string
      data: UpdateWidgetInput
    }) => updateWidget(widgetId, data),
    onSuccess: (widget) => {
      queryClient.invalidateQueries({ queryKey: widgetKeys.detail(widget.id) })
      queryClient.invalidateQueries({ queryKey: widgetKeys.list(widget.dashboardId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(widget.dashboardId) })
    },
  })
}

export function useDeleteWidget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      widgetId,
      dashboardId,
    }: {
      widgetId: string
      dashboardId: string
    }) => deleteWidget(widgetId).then(() => ({ dashboardId })),
    onSuccess: (_, { dashboardId }) => {
      queryClient.invalidateQueries({ queryKey: widgetKeys.list(dashboardId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(dashboardId) })
    },
  })
}
