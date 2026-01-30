// ===========================================
// TIME ENTRIES HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  TimeEntry,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimeEntryFilters,
  PaginationParams,
  PaginatedResult,
} from '../types'
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  startTimer,
  stopTimer,
  getRunningTimer,
  getProjectTimeSummary,
} from '../server'
import { projectKeys } from './useProjects'

// ===========================================
// QUERY KEYS
// ===========================================

export const timeEntryKeys = {
  all: ['time-entries'] as const,
  lists: () => [...timeEntryKeys.all, 'list'] as const,
  list: (projectId: string, filters?: TimeEntryFilters, pagination?: PaginationParams) =>
    [...timeEntryKeys.lists(), projectId, filters, pagination] as const,
  running: (userId: string) => [...timeEntryKeys.all, 'running', userId] as const,
  summary: (projectId: string) => [...timeEntryKeys.all, 'summary', projectId] as const,
}

// ===========================================
// GET TIME ENTRIES
// ===========================================

export function useTimeEntries(
  projectId: string,
  filters?: TimeEntryFilters,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<TimeEntry>>({
    queryKey: timeEntryKeys.list(projectId, filters, pagination),
    queryFn: () => getTimeEntries(projectId, filters, pagination),
    enabled: !!projectId,
  })
}

// ===========================================
// GET RUNNING TIMER
// ===========================================

export function useRunningTimer(userId: string) {
  return useQuery<TimeEntry | null>({
    queryKey: timeEntryKeys.running(userId),
    queryFn: () => getRunningTimer(userId),
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every minute
  })
}

// ===========================================
// GET PROJECT TIME SUMMARY
// ===========================================

export function useProjectTimeSummary(projectId: string) {
  return useQuery({
    queryKey: timeEntryKeys.summary(projectId),
    queryFn: () => getProjectTimeSummary(projectId),
    enabled: !!projectId,
  })
}

// ===========================================
// CREATE TIME ENTRY
// ===========================================

export function useCreateTimeEntry(projectId: string, userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<CreateTimeEntryInput, 'projectId'>) =>
      createTimeEntry({ ...input, projectId }, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.summary(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

// ===========================================
// UPDATE TIME ENTRY
// ===========================================

export function useUpdateTimeEntry(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTimeEntryInput) => updateTimeEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.summary(projectId) })
    },
  })
}

// ===========================================
// DELETE TIME ENTRY
// ===========================================

export function useDeleteTimeEntry(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.summary(projectId) })
    },
  })
}

// ===========================================
// START TIMER
// ===========================================

export function useStartTimer(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, taskId, description }: { projectId: string; taskId?: string; description?: string }) =>
      startTimer(projectId, userId, taskId, description),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.running(userId) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.list(data.projectId) })
    },
  })
}

// ===========================================
// STOP TIMER
// ===========================================

export function useStopTimer(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => stopTimer(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.running(userId) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.summary(data.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.projectId) })
    },
  })
}
