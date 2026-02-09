// ===========================================
// DASHBOARD STATS HOOKS
// ===========================================

import { useQuery } from '@tanstack/react-query'
import {
  getDashboardStats,
  getRecentActivity,
  getWeeklyActivity,
  getKPIData,
  type DashboardStats,
  type RecentActivity,
  type WeeklyActivityData,
  type KPIData,
} from '../server/stats'

// ===========================================
// QUERY KEYS
// ===========================================

export const statsKeys = {
  all: ['analytics', 'stats'] as const,
  dashboard: (organizationId: string) => [...statsKeys.all, 'dashboard', organizationId] as const,
  recentActivity: (organizationId: string) => [...statsKeys.all, 'activity', organizationId] as const,
  weeklyActivity: (organizationId: string) => [...statsKeys.all, 'weekly', organizationId] as const,
  kpis: (organizationId: string) => [...statsKeys.all, 'kpis', organizationId] as const,
}

// ===========================================
// HOOKS
// ===========================================

/**
 * Get dashboard stats (contacts, revenue, projects, tickets)
 */
export function useDashboardStats(organizationId: string) {
  return useQuery<DashboardStats>({
    queryKey: statsKeys.dashboard(organizationId),
    queryFn: () => getDashboardStats(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

/**
 * Get recent activity across all modules
 */
export function useRecentActivity(organizationId: string, limit: number = 10) {
  return useQuery<RecentActivity[]>({
    queryKey: [...statsKeys.recentActivity(organizationId), limit],
    queryFn: () => getRecentActivity(organizationId, limit),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  })
}

/**
 * Get weekly activity data for charts
 */
export function useWeeklyActivity(organizationId: string) {
  return useQuery<WeeklyActivityData[]>({
    queryKey: statsKeys.weeklyActivity(organizationId),
    queryFn: () => getWeeklyActivity(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Get KPI data for analytics page
 */
export function useKPIData(organizationId: string) {
  return useQuery<KPIData[]>({
    queryKey: statsKeys.kpis(organizationId),
    queryFn: () => getKPIData(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}
