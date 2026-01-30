// ===========================================
// CHECKLIST HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  TaskChecklistItem,
  CreateTaskChecklistItemInput,
  UpdateTaskChecklistItemInput,
} from '../types'
import {
  getTaskChecklistItems,
  createTaskChecklistItem,
  updateTaskChecklistItem,
  deleteTaskChecklistItem,
  toggleTaskChecklistItem,
} from '../server'
import { taskKeys } from './useTasks'

// ===========================================
// QUERY KEYS
// ===========================================

export const checklistKeys = {
  all: ['checklist'] as const,
  lists: () => [...checklistKeys.all, 'list'] as const,
  list: (taskId: string) => [...checklistKeys.lists(), taskId] as const,
}

// ===========================================
// GET CHECKLIST ITEMS
// ===========================================

export function useTaskChecklistItems(taskId: string) {
  return useQuery<TaskChecklistItem[]>({
    queryKey: checklistKeys.list(taskId),
    queryFn: () => getTaskChecklistItems(taskId),
    enabled: !!taskId,
  })
}

// ===========================================
// CREATE CHECKLIST ITEM
// ===========================================

export function useCreateChecklistItem(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<CreateTaskChecklistItemInput, 'taskId'>) =>
      createTaskChecklistItem({ ...input, taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
    },
  })
}

// ===========================================
// UPDATE CHECKLIST ITEM
// ===========================================

export function useUpdateChecklistItem(taskId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTaskChecklistItemInput) => updateTaskChecklistItem(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) })
    },
  })
}

// ===========================================
// DELETE CHECKLIST ITEM
// ===========================================

export function useDeleteChecklistItem(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTaskChecklistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
    },
  })
}

// ===========================================
// TOGGLE CHECKLIST ITEM
// ===========================================

export function useToggleChecklistItem(taskId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleTaskChecklistItem(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.list(taskId) })
    },
  })
}
