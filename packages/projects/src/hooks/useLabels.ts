// ===========================================
// LABELS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Label,
  CreateLabelInput,
  UpdateLabelInput,
} from '../types'
import {
  getProjectLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToTask,
  removeLabelFromTask,
  getTaskLabels,
} from '../server'
import { taskKeys } from './useTasks'

// ===========================================
// QUERY KEYS
// ===========================================

export const labelKeys = {
  all: ['labels'] as const,
  lists: () => [...labelKeys.all, 'list'] as const,
  list: (projectId: string) => [...labelKeys.lists(), projectId] as const,
  task: (taskId: string) => [...labelKeys.all, 'task', taskId] as const,
}

// ===========================================
// GET PROJECT LABELS
// ===========================================

export function useProjectLabels(projectId: string) {
  return useQuery<Label[]>({
    queryKey: labelKeys.list(projectId),
    queryFn: () => getProjectLabels(projectId),
    enabled: !!projectId,
  })
}

// ===========================================
// GET TASK LABELS
// ===========================================

export function useTaskLabels(taskId: string) {
  return useQuery<Label[]>({
    queryKey: labelKeys.task(taskId),
    queryFn: () => getTaskLabels(taskId),
    enabled: !!taskId,
  })
}

// ===========================================
// CREATE LABEL
// ===========================================

export function useCreateLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLabelInput) => createLabel(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: labelKeys.list(data.projectId) })
    },
  })
}

// ===========================================
// UPDATE LABEL
// ===========================================

export function useUpdateLabel(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateLabelInput) => updateLabel(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.list(projectId) })
    },
  })
}

// ===========================================
// DELETE LABEL
// ===========================================

export function useDeleteLabel(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.list(projectId) })
    },
  })
}

// ===========================================
// ADD LABEL TO TASK
// ===========================================

export function useAddLabelToTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      addLabelToTask(taskId, labelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: labelKeys.task(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(projectId) })
    },
  })
}

// ===========================================
// REMOVE LABEL FROM TASK
// ===========================================

export function useRemoveLabelFromTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      removeLabelFromTask(taskId, labelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: labelKeys.task(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(projectId) })
    },
  })
}
