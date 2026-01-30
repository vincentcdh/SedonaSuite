// ===========================================
// EMPLOYEE HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEmployees,
  getEmployeeById,
  getEmployeeByUserId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  restoreEmployee,
  getDepartments,
  getEmployeeCount,
} from '../server/employees'
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeFilters,
  PaginationParams,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const employeeKeys = {
  all: ['hr', 'employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: EmployeeFilters, pagination?: PaginationParams) =>
    [...employeeKeys.lists(), organizationId, filters, pagination] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  byUserId: (userId: string) => [...employeeKeys.all, 'byUserId', userId] as const,
  departments: (organizationId: string) => [...employeeKeys.all, 'departments', organizationId] as const,
  count: (organizationId: string) => [...employeeKeys.all, 'count', organizationId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useEmployees(
  organizationId: string,
  filters?: EmployeeFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: employeeKeys.list(organizationId, filters, pagination),
    queryFn: () => getEmployees(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => getEmployeeById(id),
    enabled: !!id,
  })
}

export function useEmployeeByUserId(userId: string) {
  return useQuery({
    queryKey: employeeKeys.byUserId(userId),
    queryFn: () => getEmployeeByUserId(userId),
    enabled: !!userId,
  })
}

export function useDepartments(organizationId: string) {
  return useQuery({
    queryKey: employeeKeys.departments(organizationId),
    queryFn: () => getDepartments(organizationId),
    enabled: !!organizationId,
  })
}

export function useEmployeeCount(organizationId: string) {
  return useQuery({
    queryKey: employeeKeys.count(organizationId),
    queryFn: () => getEmployeeCount(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateEmployee(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => createEmployee(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeKeys.count(organizationId) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.departments(organizationId) })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) => updateEmployee(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.departments(data.organizationId) })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useRestoreEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => restoreEmployee(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.id) })
    },
  })
}
