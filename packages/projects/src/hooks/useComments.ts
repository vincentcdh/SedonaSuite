// ===========================================
// TASK COMMENTS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  TaskComment,
  CreateTaskCommentInput,
  UpdateTaskCommentInput,
} from '../types'
import {
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
} from '../server'
import { taskKeys } from './useTasks'

// ===========================================
// QUERY KEYS
// ===========================================

export const commentKeys = {
  all: ['task-comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (taskId: string) => [...commentKeys.lists(), taskId] as const,
}

// ===========================================
// GET COMMENTS
// ===========================================

export function useTaskComments(taskId: string) {
  return useQuery<TaskComment[]>({
    queryKey: commentKeys.list(taskId),
    queryFn: () => getTaskComments(taskId),
    enabled: !!taskId,
  })
}

// ===========================================
// CREATE COMMENT
// ===========================================

export function useCreateTaskComment(taskId: string, userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<CreateTaskCommentInput, 'taskId'>) =>
      createTaskComment({ ...input, taskId }, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
    },
  })
}

// ===========================================
// UPDATE COMMENT
// ===========================================

export function useUpdateTaskComment(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTaskCommentInput) => updateTaskComment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) })
    },
  })
}

// ===========================================
// DELETE COMMENT
// ===========================================

export function useDeleteTaskComment(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTaskComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
    },
  })
}
