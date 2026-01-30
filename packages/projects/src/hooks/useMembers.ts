// ===========================================
// PROJECT MEMBERS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ProjectMember,
  AddProjectMemberInput,
  UpdateProjectMemberInput,
} from '../types'
import {
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
} from '../server'
import { projectKeys } from './useProjects'

// ===========================================
// QUERY KEYS
// ===========================================

export const memberKeys = {
  all: ['project-members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (projectId: string) => [...memberKeys.lists(), projectId] as const,
}

// ===========================================
// GET PROJECT MEMBERS
// ===========================================

export function useProjectMembers(projectId: string) {
  return useQuery<ProjectMember[]>({
    queryKey: memberKeys.list(projectId),
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  })
}

// ===========================================
// ADD PROJECT MEMBER
// ===========================================

export function useAddProjectMember(invitedBy?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddProjectMemberInput) => addProjectMember(input, invitedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}

// ===========================================
// UPDATE PROJECT MEMBER
// ===========================================

export function useUpdateProjectMember(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProjectMemberInput) => updateProjectMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.list(projectId) })
    },
  })
}

// ===========================================
// REMOVE PROJECT MEMBER
// ===========================================

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: string) => removeProjectMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.list(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}
