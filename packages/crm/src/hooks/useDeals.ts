import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateDealInput,
  UpdateDealInput,
  MoveDealInput,
  DealFilters,
  PaginationParams,
} from '../types'
import { pipelineKeys } from './usePipelines'
import {
  getDeals,
  getDeal as getDealById,
  getDealStats as fetchDealStats,
  createDeal,
  updateDeal,
  moveDeal,
  markDealAsWon,
  markDealAsLost,
  reopenDeal,
  deleteDeal,
} from '../server/deals'

// ===========================================
// DEALS HOOKS
// ===========================================

// Query keys
export const dealKeys = {
  all: ['deals'] as const,
  lists: () => [...dealKeys.all, 'list'] as const,
  list: (orgId: string, filters?: DealFilters, pagination?: PaginationParams) =>
    [...dealKeys.lists(), orgId, filters, pagination] as const,
  details: () => [...dealKeys.all, 'detail'] as const,
  detail: (id: string) => [...dealKeys.details(), id] as const,
  stats: (orgId: string, pipelineId?: string) => [...dealKeys.all, 'stats', orgId, pipelineId] as const,
}

/**
 * Hook to fetch paginated deals
 */
export function useDeals(
  organizationId: string,
  filters: DealFilters = {},
  pagination: PaginationParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: dealKeys.list(organizationId, filters, pagination),
    queryFn: () => getDeals(organizationId, filters, pagination),
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single deal
 */
export function useDeal(dealId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: dealKeys.detail(dealId),
    queryFn: () => getDealById(dealId),
    enabled: options?.enabled !== false && !!dealId,
  })
}

/**
 * Hook to fetch deal statistics
 */
export function useDealStats(organizationId: string, pipelineId?: string) {
  return useQuery({
    queryKey: dealKeys.stats(organizationId, pipelineId),
    queryFn: () => fetchDealStats(organizationId, pipelineId),
    enabled: !!organizationId,
  })
}

/**
 * Hook to create a deal
 */
export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreateDealInput
    }) => createDeal(organizationId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
      }
    },
  })
}

/**
 * Hook to update a deal
 */
export function useUpdateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateDealInput) => updateDeal(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
      }
    },
  })
}

/**
 * Hook to move a deal to a different stage
 */
export function useMoveDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MoveDealInput) => moveDeal(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
      }
    },
  })
}

/**
 * Hook to mark a deal as won
 */
export function useMarkDealAsWon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dealId: string) => markDealAsWon(dealId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
      }
    },
  })
}

/**
 * Hook to mark a deal as lost
 */
export function useMarkDealAsLost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      dealId,
      lostReason,
    }: {
      dealId: string
      lostReason?: string
    }) => markDealAsLost(dealId, lostReason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
      }
    },
  })
}

/**
 * Hook to reopen a deal
 */
export function useReopenDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dealId: string) => reopenDeal(dealId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
      }
    },
  })
}

/**
 * Hook to delete a deal
 */
export function useDeleteDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dealId: string) => deleteDeal(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all })
    },
  })
}
