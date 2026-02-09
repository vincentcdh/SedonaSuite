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
  getOrganizationTimeStats,
  getEmployeesTimeStatus,
  getBadges,
  getBadgesByEmployee,
  getEmployeeBadgeStatus,
  getAllEmployeesBadgeStatus,
  getDailyWorkSummary,
  createBadge,
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  deleteBadge,
} from '../server/time-entries'
import type {
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimeEntryFilters,
  PaginationParams,
  CreateBadgeInput,
  BadgeFilters,
} from '../types'

// Helper function to get today's date in ISO format
function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

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
  organizationStats: (organizationId: string) =>
    [...timeEntryKeys.all, 'orgStats', organizationId] as const,
  employeesStatus: (organizationId: string) =>
    [...timeEntryKeys.all, 'employeesStatus', organizationId] as const,
  badges: (employeeId: string, date: string) =>
    [...timeEntryKeys.all, 'badges', employeeId, date] as const,
  badgeStatus: (employeeId: string, date: string) =>
    [...timeEntryKeys.all, 'badgeStatus', employeeId, date] as const,
  allBadgeStatus: (organizationId: string, date: string) =>
    [...timeEntryKeys.all, 'allBadgeStatus', organizationId, date] as const,
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

export function useOrganizationTimeStats(organizationId: string) {
  return useQuery({
    queryKey: timeEntryKeys.organizationStats(organizationId),
    queryFn: () => getOrganizationTimeStats(organizationId),
    enabled: !!organizationId,
  })
}

export function useEmployeesTimeStatus(organizationId: string) {
  return useQuery({
    queryKey: timeEntryKeys.employeesStatus(organizationId),
    queryFn: () => getEmployeesTimeStatus(organizationId),
    enabled: !!organizationId,
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

// ===========================================
// BADGE / CLOCK IN-OUT
// ===========================================

export function useBadgesByEmployee(employeeId: string, date: string) {
  return useQuery({
    queryKey: timeEntryKeys.badges(employeeId, date),
    queryFn: () => getBadgesByEmployee(employeeId, date),
    enabled: !!employeeId && !!date,
  })
}

export function useEmployeeBadgeStatus(employeeId: string, date: string) {
  return useQuery({
    queryKey: timeEntryKeys.badgeStatus(employeeId, date),
    queryFn: () => getEmployeeBadgeStatus(employeeId, date),
    enabled: !!employeeId && !!date,
  })
}

export function useAllEmployeesBadgeStatus(organizationId: string, date: string) {
  return useQuery({
    queryKey: timeEntryKeys.allBadgeStatus(organizationId, date),
    queryFn: () => getAllEmployeesBadgeStatus(organizationId, date),
    enabled: !!organizationId && !!date,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  })
}

export function useClockIn(organizationId: string) {
  const queryClient = useQueryClient()
  const today = getTodayIsoDate()

  return useMutation({
    mutationFn: ({ employeeId, notes }: { employeeId: string; notes?: string }) =>
      clockIn(organizationId, employeeId, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badges(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badgeStatus(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.allBadgeStatus(organizationId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.employeesStatus(organizationId) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.organizationStats(organizationId) })
    },
  })
}

export function useClockOut(organizationId: string) {
  const queryClient = useQueryClient()
  const today = getTodayIsoDate()

  return useMutation({
    mutationFn: ({ employeeId, notes }: { employeeId: string; notes?: string }) =>
      clockOut(organizationId, employeeId, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badges(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badgeStatus(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.allBadgeStatus(organizationId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.employeesStatus(organizationId) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.organizationStats(organizationId) })
    },
  })
}

export function useStartBreak(organizationId: string) {
  const queryClient = useQueryClient()
  const today = getTodayIsoDate()

  return useMutation({
    mutationFn: ({ employeeId, notes }: { employeeId: string; notes?: string }) =>
      startBreak(organizationId, employeeId, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badges(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badgeStatus(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.allBadgeStatus(organizationId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.employeesStatus(organizationId) })
    },
  })
}

export function useEndBreak(organizationId: string) {
  const queryClient = useQueryClient()
  const today = getTodayIsoDate()

  return useMutation({
    mutationFn: ({ employeeId, notes }: { employeeId: string; notes?: string }) =>
      endBreak(organizationId, employeeId, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badges(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badgeStatus(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.allBadgeStatus(organizationId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.employeesStatus(organizationId) })
    },
  })
}

export function useCreateBadge(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateBadgeInput) => createBadge(organizationId, input),
    onSuccess: (data) => {
      const today = getTodayIsoDate()
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badges(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.badgeStatus(data.employeeId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.allBadgeStatus(organizationId, today) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.employeesStatus(organizationId) })
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.organizationStats(organizationId) })
    },
  })
}

export function useDeleteBadge(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBadge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all })
    },
  })
}

export function useDailyWorkSummary(employeeId: string, date: string) {
  return useQuery({
    queryKey: [...timeEntryKeys.all, 'dailySummary', employeeId, date] as const,
    queryFn: () => getDailyWorkSummary(employeeId, date),
    enabled: !!employeeId && !!date,
  })
}

export function useBadges(organizationId: string, filters?: BadgeFilters) {
  return useQuery({
    queryKey: [...timeEntryKeys.all, 'allBadges', organizationId, filters] as const,
    queryFn: () => getBadges(organizationId, filters),
    enabled: !!organizationId,
  })
}
