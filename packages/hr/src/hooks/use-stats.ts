// ===========================================
// HR STATISTICS HOOKS
// ===========================================

import { useQuery } from '@tanstack/react-query'
import {
  getHrStats,
  getEmployeeCountByDepartment,
  getEmployeeCountByContractType,
  getHrAlerts,
  getHeadcountHistory,
} from '../server/stats'

// ===========================================
// QUERY KEYS
// ===========================================

export const statsKeys = {
  all: ['hr', 'stats'] as const,
  overview: (organizationId: string) => [...statsKeys.all, 'overview', organizationId] as const,
  byDepartment: (organizationId: string) => [...statsKeys.all, 'byDepartment', organizationId] as const,
  byContractType: (organizationId: string) => [...statsKeys.all, 'byContractType', organizationId] as const,
  alerts: (organizationId: string) => [...statsKeys.all, 'alerts', organizationId] as const,
  headcountHistory: (organizationId: string, months?: number) =>
    [...statsKeys.all, 'headcountHistory', organizationId, months] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useHrStats(organizationId: string) {
  return useQuery({
    queryKey: statsKeys.overview(organizationId),
    queryFn: () => getHrStats(organizationId),
    enabled: !!organizationId,
  })
}

export function useEmployeeCountByDepartment(organizationId: string) {
  return useQuery({
    queryKey: statsKeys.byDepartment(organizationId),
    queryFn: () => getEmployeeCountByDepartment(organizationId),
    enabled: !!organizationId,
  })
}

export function useEmployeeCountByContractType(organizationId: string) {
  return useQuery({
    queryKey: statsKeys.byContractType(organizationId),
    queryFn: () => getEmployeeCountByContractType(organizationId),
    enabled: !!organizationId,
  })
}

export function useHrAlerts(organizationId: string) {
  return useQuery({
    queryKey: statsKeys.alerts(organizationId),
    queryFn: () => getHrAlerts(organizationId),
    enabled: !!organizationId,
  })
}

export function useHeadcountHistory(organizationId: string, months: number = 12) {
  return useQuery({
    queryKey: statsKeys.headcountHistory(organizationId, months),
    queryFn: () => getHeadcountHistory(organizationId, months),
    enabled: !!organizationId,
  })
}
