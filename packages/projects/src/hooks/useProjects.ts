// ===========================================
// PROJECT HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ProjectWithStats,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters,
  PaginationParams,
  PaginatedResult,
} from '../types'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: ProjectFilters, pagination?: PaginationParams) =>
    [...projectKeys.lists(), organizationId, filters, pagination] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

// ===========================================
// GET PROJECTS
// ===========================================

export function useProjects(
  organizationId: string,
  filters?: ProjectFilters,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<ProjectWithStats>>({
    queryKey: projectKeys.list(organizationId, filters, pagination),
    queryFn: () => getProjects(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

// ===========================================
// GET PROJECT BY ID
// ===========================================

export function useProject(id: string) {
  return useQuery<ProjectWithStats | null>({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProjectById(id),
    enabled: !!id,
  })
}

// ===========================================
// CREATE PROJECT
// ===========================================

export function useCreateProject(organizationId: string, userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(organizationId, input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

// ===========================================
// UPDATE PROJECT
// ===========================================

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) })
    },
  })
}

// ===========================================
// DELETE PROJECT
// ===========================================

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}
