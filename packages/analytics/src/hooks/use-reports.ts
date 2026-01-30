// ===========================================
// SCHEDULED REPORTS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getScheduledReports,
  getScheduledReportById,
  createScheduledReport,
  updateScheduledReport,
  toggleScheduledReportActive,
  deleteScheduledReport,
  getReportHistory,
  triggerReportManually,
} from '../server/reports'
import type {
  CreateScheduledReportInput,
  UpdateScheduledReportInput,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const reportKeys = {
  all: ['scheduled-reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (organizationId: string) => [...reportKeys.lists(), organizationId] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  history: (reportId: string) => [...reportKeys.all, 'history', reportId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useScheduledReports(organizationId: string) {
  return useQuery({
    queryKey: reportKeys.list(organizationId),
    queryFn: () => getScheduledReports(organizationId),
    enabled: !!organizationId,
  })
}

export function useScheduledReport(reportId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.detail(reportId || ''),
    queryFn: () => getScheduledReportById(reportId!),
    enabled: !!reportId,
  })
}

export function useReportHistory(reportId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: reportKeys.history(reportId || ''),
    queryFn: () => getReportHistory(reportId!, limit),
    enabled: !!reportId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateScheduledReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      data,
    }: {
      organizationId: string
      userId: string
      data: CreateScheduledReportInput
    }) => createScheduledReport(organizationId, userId, data),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.list(organizationId) })
    },
  })
}

export function useUpdateScheduledReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: string
      data: UpdateScheduledReportInput
    }) => updateScheduledReport(reportId, data),
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(report.id) })
    },
  })
}

export function useToggleScheduledReportActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reportId,
      isActive,
    }: {
      reportId: string
      isActive: boolean
    }) => toggleScheduledReportActive(reportId, isActive),
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(report.id) })
    },
  })
}

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reportId: string) => deleteScheduledReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}

export function useTriggerReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reportId: string) => triggerReportManually(reportId),
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.history(reportId) })
    },
  })
}
