// ===========================================
// LEAVE HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  deleteLeaveRequest,
  getAbsences,
  getAbsenceById,
  createAbsence,
  updateAbsence,
  deleteAbsence,
  getLeaveBalance,
  getLeaveCalendarData,
} from '../server/leaves'
import type {
  CreateLeaveTypeInput,
  UpdateLeaveTypeInput,
  CreateLeaveRequestInput,
  UpdateLeaveRequestInput,
  ApproveLeaveRequestInput,
  RejectLeaveRequestInput,
  CreateAbsenceInput,
  UpdateAbsenceInput,
  LeaveRequestFilters,
  AbsenceFilters,
  PaginationParams,
} from '../types'
import { employeeKeys } from './use-employees'

// ===========================================
// QUERY KEYS
// ===========================================

export const leaveKeys = {
  // Leave Types
  types: ['hr', 'leaveTypes'] as const,
  typeList: (organizationId: string) => [...leaveKeys.types, 'list', organizationId] as const,
  typeDetail: (id: string) => [...leaveKeys.types, 'detail', id] as const,

  // Leave Requests
  requests: ['hr', 'leaveRequests'] as const,
  requestLists: () => [...leaveKeys.requests, 'list'] as const,
  requestList: (organizationId: string, filters?: LeaveRequestFilters, pagination?: PaginationParams) =>
    [...leaveKeys.requestLists(), organizationId, filters, pagination] as const,
  requestDetail: (id: string) => [...leaveKeys.requests, 'detail', id] as const,

  // Absences
  absences: ['hr', 'absences'] as const,
  absenceLists: () => [...leaveKeys.absences, 'list'] as const,
  absenceList: (organizationId: string, filters?: AbsenceFilters, pagination?: PaginationParams) =>
    [...leaveKeys.absenceLists(), organizationId, filters, pagination] as const,
  absenceDetail: (id: string) => [...leaveKeys.absences, 'detail', id] as const,

  // Balance
  balance: (employeeId: string) => ['hr', 'leaveBalance', employeeId] as const,

  // Calendar
  calendarAll: ['hr', 'leaveCalendar'] as const,
  calendar: (organizationId: string, startDate: string, endDate: string) =>
    [...leaveKeys.calendarAll, organizationId, startDate, endDate] as const,
}

// ===========================================
// LEAVE TYPE QUERIES & MUTATIONS
// ===========================================

export function useLeaveTypes(organizationId: string) {
  return useQuery({
    queryKey: leaveKeys.typeList(organizationId),
    queryFn: () => getLeaveTypes(organizationId),
    enabled: !!organizationId,
  })
}

export function useLeaveType(id: string) {
  return useQuery({
    queryKey: leaveKeys.typeDetail(id),
    queryFn: () => getLeaveTypeById(id),
    enabled: !!id,
  })
}

export function useCreateLeaveType(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLeaveTypeInput) => createLeaveType(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.typeList(organizationId) })
    },
  })
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateLeaveTypeInput) => updateLeaveType(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types })
    },
  })
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types })
    },
  })
}

// ===========================================
// LEAVE REQUEST QUERIES & MUTATIONS
// ===========================================

export function useLeaveRequests(
  organizationId: string,
  filters?: LeaveRequestFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: leaveKeys.requestList(organizationId, filters, pagination),
    queryFn: () => getLeaveRequests(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: leaveKeys.requestDetail(id),
    queryFn: () => getLeaveRequestById(id),
    enabled: !!id,
  })
}

export function useCreateLeaveRequest(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLeaveRequestInput) => createLeaveRequest(organizationId, input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requestLists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.calendarAll })
    },
  })
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateLeaveRequestInput) => updateLeaveRequest(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requestLists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.requestDetail(data.id) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.calendarAll })
    },
  })
}

export function useApproveLeaveRequest(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ApproveLeaveRequestInput) => approveLeaveRequest(input, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requestLists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.requestDetail(data.id) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.calendarAll })
    },
  })
}

export function useRejectLeaveRequest(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RejectLeaveRequestInput) => rejectLeaveRequest(input, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requestLists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.requestDetail(data.id) })
    },
  })
}

export function useCancelLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cancelLeaveRequest(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requestLists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.requestDetail(data.id) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.calendarAll })
    },
  })
}

export function useDeleteLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests })
    },
  })
}

// ===========================================
// ABSENCE QUERIES & MUTATIONS
// ===========================================

export function useAbsences(
  organizationId: string,
  filters?: AbsenceFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: leaveKeys.absenceList(organizationId, filters, pagination),
    queryFn: () => getAbsences(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

export function useAbsence(id: string) {
  return useQuery({
    queryKey: leaveKeys.absenceDetail(id),
    queryFn: () => getAbsenceById(id),
    enabled: !!id,
  })
}

export function useCreateAbsence(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAbsenceInput) => createAbsence(organizationId, input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.absenceLists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.calendarAll })
    },
  })
}

export function useUpdateAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateAbsenceInput) => updateAbsence(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.absenceLists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.absenceDetail(data.id) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.calendarAll })
    },
  })
}

export function useDeleteAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAbsence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.absences })
      queryClient.invalidateQueries({ queryKey: leaveKeys.calendarAll })
    },
  })
}

// ===========================================
// LEAVE BALANCE & CALENDAR QUERIES
// ===========================================

export function useLeaveBalance(employeeId: string) {
  return useQuery({
    queryKey: leaveKeys.balance(employeeId),
    queryFn: () => getLeaveBalance(employeeId),
    enabled: !!employeeId,
  })
}

export function useLeaveCalendar(organizationId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: leaveKeys.calendar(organizationId, startDate, endDate),
    queryFn: () => getLeaveCalendarData(organizationId, startDate, endDate),
    enabled: !!organizationId && !!startDate && !!endDate,
  })
}
