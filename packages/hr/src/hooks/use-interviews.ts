// ===========================================
// INTERVIEW HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getInterviews,
  getInterviewsByEmployee,
  getInterviewById,
  createInterview,
  updateInterview,
  completeInterview,
  cancelInterview,
  deleteInterview,
  getUpcomingInterviews,
  getEmployeesNeedingProfessionalInterview,
} from '../server/interviews'
import type {
  CreateInterviewInput,
  UpdateInterviewInput,
  InterviewFilters,
  PaginationParams,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const interviewKeys = {
  all: ['hr', 'interviews'] as const,
  lists: () => [...interviewKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: InterviewFilters, pagination?: PaginationParams) =>
    [...interviewKeys.lists(), organizationId, filters, pagination] as const,
  byEmployee: (employeeId: string) => [...interviewKeys.all, 'byEmployee', employeeId] as const,
  details: () => [...interviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...interviewKeys.details(), id] as const,
  upcoming: (organizationId: string, daysAhead?: number) =>
    [...interviewKeys.all, 'upcoming', organizationId, daysAhead] as const,
  needingProfessional: (organizationId: string) =>
    [...interviewKeys.all, 'needingProfessional', organizationId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useInterviews(
  organizationId: string,
  filters?: InterviewFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: interviewKeys.list(organizationId, filters, pagination),
    queryFn: () => getInterviews(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

export function useInterviewsByEmployee(employeeId: string) {
  return useQuery({
    queryKey: interviewKeys.byEmployee(employeeId),
    queryFn: () => getInterviewsByEmployee(employeeId),
    enabled: !!employeeId,
  })
}

export function useInterview(id: string) {
  return useQuery({
    queryKey: interviewKeys.detail(id),
    queryFn: () => getInterviewById(id),
    enabled: !!id,
  })
}

export function useUpcomingInterviews(organizationId: string, daysAhead: number = 30) {
  return useQuery({
    queryKey: interviewKeys.upcoming(organizationId, daysAhead),
    queryFn: () => getUpcomingInterviews(organizationId, daysAhead),
    enabled: !!organizationId,
  })
}

export function useEmployeesNeedingProfessionalInterview(organizationId: string) {
  return useQuery({
    queryKey: interviewKeys.needingProfessional(organizationId),
    queryFn: () => getEmployeesNeedingProfessionalInterview(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateInterview(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateInterviewInput) => createInterview(organizationId, input, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
      queryClient.invalidateQueries({ queryKey: interviewKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: interviewKeys.all })
    },
  })
}

export function useUpdateInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateInterviewInput) => updateInterview(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: interviewKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: interviewKeys.all })
    },
  })
}

export function useCompleteInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      report,
    }: {
      id: string
      report: {
        achievements?: string
        feedback?: string
        developmentPlan?: string
        employeeComments?: string
        documentUrl?: string
      }
    }) => completeInterview(id, report),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: interviewKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: interviewKeys.all })
    },
  })
}

export function useCancelInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cancelInterview(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() })
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: interviewKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: interviewKeys.all })
    },
  })
}

export function useDeleteInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.all })
    },
  })
}
