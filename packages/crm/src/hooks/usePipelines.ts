import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Pipeline,
  PipelineStage,
  CreatePipelineInput,
  UpdatePipelineInput,
  CreatePipelineStageInput,
  UpdatePipelineStageInput,
} from '../types'

// ===========================================
// PIPELINES HOOKS
// ===========================================

// Query keys
export const pipelineKeys = {
  all: ['pipelines'] as const,
  lists: () => [...pipelineKeys.all, 'list'] as const,
  list: (orgId: string) => [...pipelineKeys.lists(), orgId] as const,
  details: () => [...pipelineKeys.all, 'detail'] as const,
  detail: (id: string) => [...pipelineKeys.details(), id] as const,
  withDeals: (id: string) => [...pipelineKeys.detail(id), 'deals'] as const,
  default: (orgId: string) => [...pipelineKeys.all, 'default', orgId] as const,
}

/**
 * Hook to fetch all pipelines for an organization
 */
export function usePipelines(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: pipelineKeys.list(organizationId),
    queryFn: async (): Promise<Pipeline[]> => {
      const response = await fetch(`/api/crm/pipelines?organizationId=${organizationId}`)
      if (!response.ok) throw new Error('Failed to fetch pipelines')
      return response.json()
    },
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single pipeline with stages
 */
export function usePipeline(pipelineId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: pipelineKeys.detail(pipelineId),
    queryFn: async (): Promise<Pipeline> => {
      const response = await fetch(`/api/crm/pipelines/${pipelineId}`)
      if (!response.ok) throw new Error('Failed to fetch pipeline')
      return response.json()
    },
    enabled: options?.enabled !== false && !!pipelineId,
  })
}

/**
 * Hook to fetch a pipeline with stages and deals (for Kanban view)
 */
export function usePipelineWithDeals(pipelineId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: pipelineKeys.withDeals(pipelineId),
    queryFn: async (): Promise<Pipeline> => {
      const response = await fetch(`/api/crm/pipelines/${pipelineId}/deals`)
      if (!response.ok) throw new Error('Failed to fetch pipeline with deals')
      return response.json()
    },
    enabled: options?.enabled !== false && !!pipelineId,
  })
}

/**
 * Hook to fetch the default pipeline
 */
export function useDefaultPipeline(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: pipelineKeys.default(organizationId),
    queryFn: async (): Promise<Pipeline | null> => {
      const response = await fetch(`/api/crm/pipelines/default?organizationId=${organizationId}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch default pipeline')
      }
      return response.json()
    },
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to create a pipeline
 */
export function useCreatePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreatePipelineInput
    }): Promise<Pipeline> => {
      const response = await fetch('/api/crm/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, ...data }),
      })
      if (!response.ok) throw new Error('Failed to create pipeline')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() })
    },
  })
}

/**
 * Hook to update a pipeline
 */
export function useUpdatePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdatePipelineInput): Promise<Pipeline> => {
      const response = await fetch(`/api/crm/pipelines/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update pipeline')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(data.id) })
    },
  })
}

/**
 * Hook to delete a pipeline
 */
export function useDeletePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pipelineId: string): Promise<void> => {
      const response = await fetch(`/api/crm/pipelines/${pipelineId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete pipeline')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() })
    },
  })
}

// ===========================================
// PIPELINE STAGES HOOKS
// ===========================================

/**
 * Hook to create a pipeline stage
 */
export function useCreatePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pipelineId,
      data,
    }: {
      pipelineId: string
      data: CreatePipelineStageInput
    }): Promise<PipelineStage> => {
      const response = await fetch(`/api/crm/pipelines/${pipelineId}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create stage')
      return response.json()
    },
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(pipelineId) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(pipelineId) })
    },
  })
}

/**
 * Hook to update a pipeline stage
 */
export function useUpdatePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pipelineId,
      data,
    }: {
      pipelineId: string
      data: UpdatePipelineStageInput
    }): Promise<PipelineStage> => {
      const response = await fetch(`/api/crm/pipelines/${pipelineId}/stages/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update stage')
      return response.json()
    },
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(pipelineId) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(pipelineId) })
    },
  })
}

/**
 * Hook to delete a pipeline stage
 */
export function useDeletePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pipelineId,
      stageId,
    }: {
      pipelineId: string
      stageId: string
    }): Promise<void> => {
      const response = await fetch(`/api/crm/pipelines/${pipelineId}/stages/${stageId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete stage')
    },
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(pipelineId) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(pipelineId) })
    },
  })
}

/**
 * Hook to reorder pipeline stages
 */
export function useReorderPipelineStages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pipelineId,
      stageIds,
    }: {
      pipelineId: string
      stageIds: string[]
    }): Promise<PipelineStage[]> => {
      const response = await fetch(`/api/crm/pipelines/${pipelineId}/stages/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageIds }),
      })
      if (!response.ok) throw new Error('Failed to reorder stages')
      return response.json()
    },
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(pipelineId) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(pipelineId) })
    },
  })
}
