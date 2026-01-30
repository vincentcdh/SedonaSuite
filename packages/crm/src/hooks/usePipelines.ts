import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Pipeline,
  CreatePipelineInput,
  UpdatePipelineInput,
  CreatePipelineStageInput,
  UpdatePipelineStageInput,
} from '../types'
import {
  getPipelines,
  getPipeline as getPipelineById,
  getPipelineWithDeals,
  getDefaultPipeline as fetchDefaultPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  createPipelineStage,
  updatePipelineStage,
  deletePipelineStage,
  reorderPipelineStages,
} from '../server/pipelines'

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
    queryFn: () => getPipelines(organizationId),
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single pipeline with stages
 */
export function usePipeline(pipelineId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: pipelineKeys.detail(pipelineId),
    queryFn: () => getPipelineById(pipelineId),
    enabled: options?.enabled !== false && !!pipelineId,
  })
}

/**
 * Hook to fetch a pipeline with stages and deals (for Kanban view)
 */
export function usePipelineWithDeals(pipelineId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: pipelineKeys.withDeals(pipelineId),
    queryFn: () => getPipelineWithDeals(pipelineId),
    enabled: options?.enabled !== false && !!pipelineId,
  })
}

/**
 * Hook to fetch the default pipeline
 */
export function useDefaultPipeline(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: pipelineKeys.default(organizationId),
    queryFn: () => fetchDefaultPipeline(organizationId),
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to create a pipeline
 */
export function useCreatePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreatePipelineInput
    }) => createPipeline(organizationId, data),
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
    mutationFn: (data: UpdatePipelineInput) => updatePipeline(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(data.id) })
      }
    },
  })
}

/**
 * Hook to delete a pipeline
 */
export function useDeletePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pipelineId: string) => deletePipeline(pipelineId),
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
    mutationFn: ({
      pipelineId,
      data,
    }: {
      pipelineId: string
      data: CreatePipelineStageInput
    }) => createPipelineStage(pipelineId, data),
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
    mutationFn: ({
      pipelineId,
      data,
    }: {
      pipelineId: string
      data: UpdatePipelineStageInput
    }) => updatePipelineStage(data),
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
    mutationFn: ({
      pipelineId,
      stageId,
    }: {
      pipelineId: string
      stageId: string
    }) => deletePipelineStage(stageId),
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
    mutationFn: ({
      pipelineId,
      stageIds,
    }: {
      pipelineId: string
      stageIds: string[]
    }) => reorderPipelineStages(pipelineId, stageIds),
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(pipelineId) })
      queryClient.invalidateQueries({ queryKey: pipelineKeys.withDeals(pipelineId) })
    },
  })
}
