import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Deal,
  CreateDealInput,
  UpdateDealInput,
  MoveDealInput,
  DealFilters,
  PaginationParams,
  PaginatedResult,
} from '../types'
import { pipelineKeys } from './usePipelines'

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
    queryFn: async (): Promise<PaginatedResult<Deal>> => {
      const params = new URLSearchParams()
      params.set('organizationId', organizationId)

      if (filters.pipelineId) params.set('pipelineId', filters.pipelineId)
      if (filters.stageId) params.set('stageId', filters.stageId)
      if (filters.status) params.set('status', filters.status)
      if (filters.contactId) params.set('contactId', filters.contactId)
      if (filters.companyId) params.set('companyId', filters.companyId)
      if (filters.ownerId) params.set('ownerId', filters.ownerId)

      if (pagination.page) params.set('page', String(pagination.page))
      if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize))
      if (pagination.sortBy) params.set('sortBy', pagination.sortBy)
      if (pagination.sortOrder) params.set('sortOrder', pagination.sortOrder)

      const response = await fetch(`/api/crm/deals?${params}`)
      if (!response.ok) throw new Error('Failed to fetch deals')
      return response.json()
    },
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single deal
 */
export function useDeal(dealId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: dealKeys.detail(dealId),
    queryFn: async (): Promise<Deal> => {
      const response = await fetch(`/api/crm/deals/${dealId}`)
      if (!response.ok) throw new Error('Failed to fetch deal')
      return response.json()
    },
    enabled: options?.enabled !== false && !!dealId,
  })
}

/**
 * Hook to fetch deal statistics
 */
export function useDealStats(organizationId: string, pipelineId?: string) {
  return useQuery({
    queryKey: dealKeys.stats(organizationId, pipelineId),
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('organizationId', organizationId)
      if (pipelineId) params.set('pipelineId', pipelineId)

      const response = await fetch(`/api/crm/deals/stats?${params}`)
      if (!response.ok) throw new Error('Failed to fetch deal stats')
      return response.json()
    },
    enabled: !!organizationId,
  })
}

/**
 * Hook to create a deal
 */
export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreateDealInput
    }): Promise<Deal> => {
      const response = await fetch('/api/crm/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, ...data }),
      })
      if (!response.ok) throw new Error('Failed to create deal')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
    },
  })
}

/**
 * Hook to update a deal
 */
export function useUpdateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateDealInput): Promise<Deal> => {
      const response = await fetch(`/api/crm/deals/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update deal')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
    },
  })
}

/**
 * Hook to move a deal to a different stage
 */
export function useMoveDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MoveDealInput): Promise<Deal> => {
      const response = await fetch(`/api/crm/deals/${data.id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: data.stageId }),
      })
      if (!response.ok) throw new Error('Failed to move deal')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
    },
  })
}

/**
 * Hook to mark a deal as won
 */
export function useMarkDealAsWon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dealId: string): Promise<Deal> => {
      const response = await fetch(`/api/crm/deals/${dealId}/win`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to mark deal as won')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
    },
  })
}

/**
 * Hook to mark a deal as lost
 */
export function useMarkDealAsLost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      dealId,
      lostReason,
    }: {
      dealId: string
      lostReason?: string
    }): Promise<Deal> => {
      const response = await fetch(`/api/crm/deals/${dealId}/lose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lostReason }),
      })
      if (!response.ok) throw new Error('Failed to mark deal as lost')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
    },
  })
}

/**
 * Hook to reopen a deal
 */
export function useReopenDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dealId: string): Promise<Deal> => {
      const response = await fetch(`/api/crm/deals/${dealId}/reopen`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to reopen deal')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(data.pipelineId) })
    },
  })
}

/**
 * Hook to delete a deal
 */
export function useDeleteDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dealId: string): Promise<void> => {
      const response = await fetch(`/api/crm/deals/${dealId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete deal')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all })
    },
  })
}
