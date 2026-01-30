// ===========================================
// CONTRACT HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getContracts,
  getContractsByEmployee,
  getContractById,
  getCurrentContract,
  createContract,
  updateContract,
  deleteContract,
  getExpiringContracts,
  getTrialPeriodsEndingSoon,
} from '../server/contracts'
import type {
  CreateContractInput,
  UpdateContractInput,
  PaginationParams,
} from '../types'
import { employeeKeys } from './use-employees'

// ===========================================
// QUERY KEYS
// ===========================================

export const contractKeys = {
  all: ['hr', 'contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (organizationId: string, pagination?: PaginationParams) =>
    [...contractKeys.lists(), organizationId, pagination] as const,
  byEmployee: (employeeId: string) => [...contractKeys.all, 'byEmployee', employeeId] as const,
  current: (employeeId: string) => [...contractKeys.all, 'current', employeeId] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
  expiring: (organizationId: string, daysAhead?: number) =>
    [...contractKeys.all, 'expiring', organizationId, daysAhead] as const,
  trialsEnding: (organizationId: string, daysAhead?: number) =>
    [...contractKeys.all, 'trialsEnding', organizationId, daysAhead] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useContracts(organizationId: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: contractKeys.list(organizationId, pagination),
    queryFn: () => getContracts(organizationId, pagination),
    enabled: !!organizationId,
  })
}

export function useContractsByEmployee(employeeId: string) {
  return useQuery({
    queryKey: contractKeys.byEmployee(employeeId),
    queryFn: () => getContractsByEmployee(employeeId),
    enabled: !!employeeId,
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => getContractById(id),
    enabled: !!id,
  })
}

export function useCurrentContract(employeeId: string) {
  return useQuery({
    queryKey: contractKeys.current(employeeId),
    queryFn: () => getCurrentContract(employeeId),
    enabled: !!employeeId,
  })
}

export function useExpiringContracts(organizationId: string, daysAhead: number = 30) {
  return useQuery({
    queryKey: contractKeys.expiring(organizationId, daysAhead),
    queryFn: () => getExpiringContracts(organizationId, daysAhead),
    enabled: !!organizationId,
  })
}

export function useTrialPeriodsEndingSoon(organizationId: string, daysAhead: number = 15) {
  return useQuery({
    queryKey: contractKeys.trialsEnding(organizationId, daysAhead),
    queryFn: () => getTrialPeriodsEndingSoon(organizationId, daysAhead),
    enabled: !!organizationId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateContract(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateContractInput) => createContract(organizationId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contractKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: contractKeys.current(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.employeeId) })
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateContractInput) => updateContract(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: contractKeys.byEmployee(data.employeeId) })
      queryClient.invalidateQueries({ queryKey: contractKeys.current(data.employeeId) })
    },
  })
}

export function useDeleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all })
    },
  })
}
