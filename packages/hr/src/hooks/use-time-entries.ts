// ===========================================
// TIME ENTRY HOOKS (PRO)
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTimeEntries,
  getTimeEntriesByEmployee,
  getTimeEntryById,
  getTimeEntryByDate,
  createTimeEntry,
  updateTimeEntry,
  validateTimeEntry,
  unvalidateTimeEntry,
  deleteTimeEntry,
  getWeeklySummary,
  getMonthlySummary,
} from '../server/time-entries'
import type {
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimeEntryFilters,
  PaginationParams,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const timeEntryKeys = {
  all: ['hr', 'timeEntries'] as const,
  lists: () => [...timeEntryKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: TimeEntryFilters, pagination?: PaginationParams) =>
    [...timeEntryKeys.lists(), organizationId, filters, pagination] as const,
  byEmployee: (employeeId: string, dateFrom?: string, dateTo?: string) =>
    [...timeEntryKeys.all, 'byEmployee', employeeId, dateFrom, dateTo] as const,
  details: () => [...timeEntryKeys.all, 'detail'] as const,
  detail: (id: string) => [...timeEntryKeys.details(), id] as const,
  byDate: (employeeId: string, date: string) =>
    [...timeEntryKeys.all, 'byDate', employeeId, date] as const,
  weeklySummary: (employeeId: string, weekStartDate: string) =>
    [...timeEntryKeys.all, 'weekly', employeeId, weekStartDate] as const,
  monthlySummary: (employeeId: string, year: number, month: number) =>
    [...timeEntryKeys.all, 'monthly', employeeId, year, month] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useTimeEntries(
  organizationId: string,
  filters?: TimeEntryFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: timeEntryKeys.list(organizationId, filters, pagination),
    queryFn: () => getTimeEntries(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

export function useTimeEntriesByEmployee(
  employeeId: string,
  dateFrom?: string,
  dateTo?: string
) {
  return useQuery({
    queryKey: timeEntryKeys.byEmployee(employeeId, dateFrom, dateTo),
    queryFn: () => getTimeEntriesByEmployee(employeeId, dateFrom, dateTo),
    enabled: !!employeeId,
  })
}

export function useTimeEntry(id: string) {
  return useQuery({
    queryKey: timeEntryKeys.detail(id),
    queryFn: () => getTimeEntryById(id),
    enabled: !!id,
  })
}

export function useTimeEntryByDate(employeeId: string, date: string) {
  return useQuery({
    queryKey: timeEntryKeys.byDate(employeeId, date),
    queryFn: () => getTimeEntryByDate(employeeId, date),
    enabled: !!employeeId && !!date,
  })
}

export function useWeeklySummary(employeeId: string, weekStartDate: string) {
  return useQuery({
    queryKey: timeEntryKeys.weeklySummary(employeeId, weekStartDate),
    queryFn: () => getWeeklySummary(employeeId, weekStartDate),
    enabled: !!employeeId && !!weekStartDate,
  })
}

export function useMonthlySummary(employeeId: string, year: number, month: number) {
  return useQuery({
    queryKey: timeEntryKeys.monthlySummary(employeeId, year, month),
    queryFn: () => getMonthlySummary(employeeId, year, month),
    enabled: !!employeeId && !!year && !!month,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateTimeEntry(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTimeEntryInput) => createTimeEntry(organizationId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.byDate(data.employeeId, data.date) })
    },
  })
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTimeEntryInput) => updateTimeEntry(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.byDate(data.employeeId, data.date) })
    },
  })
}

export function useValidateTimeEntry(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => validateTimeEntry(id, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.byEmployee(data.employeeId) })
    },
  })
}

export function useUnvalidateTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unvalidateTimeEntry(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.byEmployee(data.employeeId) })
    },
  })
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all })
    },
  })
}
