// ===========================================
// TASK HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  TaskWithRelations,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskStatus,
  CreateTaskStatusInput,
  UpdateTaskStatusInput,
  PaginationParams,
  PaginatedResult,
} from '../types'
import {
  getTasks,
  getTasksByStatus,
  getTaskById,
  getSubtasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTaskStatuses,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
} from '../server'
import { projectKeys } from './useProjects'

// ===========================================
// QUERY KEYS
// ===========================================

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (projectId: string, filters?: TaskFilters, pagination?: PaginationParams) =>
    [...taskKeys.lists(), projectId, filters, pagination] as const,
  kanban: (projectId: string) => [...taskKeys.all, 'kanban', projectId] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  subtasks: (parentId: string) => [...taskKeys.all, 'subtasks', parentId] as const,
  statuses: (projectId: string) => [...taskKeys.all, 'statuses', projectId] as const,
}

// ===========================================
// GET TASKS
// ===========================================

export function useTasks(
  projectId: string,
  filters?: TaskFilters,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<TaskWithRelations>>({
    queryKey: taskKeys.list(projectId, filters, pagination),
    queryFn: () => getTasks(projectId, filters, pagination),
    enabled: !!projectId,
  })
}

// ===========================================
// GET TASKS BY STATUS (Kanban)
// ===========================================

export function useTasksByStatus(projectId: string) {
  return useQuery<Record<string, TaskWithRelations[]>>({
    queryKey: taskKeys.kanban(projectId),
    queryFn: () => getTasksByStatus(projectId),
    enabled: !!projectId,
  })
}

// ===========================================
// GET TASK BY ID
// ===========================================

export function useTask(id: string) {
  return useQuery<TaskWithRelations | null>({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTaskById(id),
    enabled: !!id,
  })
}

// ===========================================
// GET SUBTASKS
// ===========================================

export function useSubtasks(parentTaskId: string) {
  return useQuery({
    queryKey: taskKeys.subtasks(parentTaskId),
    queryFn: () => getSubtasks(parentTaskId),
    enabled: !!parentTaskId,
  })
}

// ===========================================
// CREATE TASK
// ===========================================

export function useCreateTask(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(data.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.projectId) })
      if (data.parentTaskId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(data.parentTaskId) })
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.parentTaskId) })
      }
    },
  })
}

// ===========================================
// UPDATE TASK
// ===========================================

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTask(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(projectId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

// ===========================================
// DELETE TASK
// ===========================================

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

// ===========================================
// MOVE TASK (Drag & Drop)
// ===========================================

export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, statusId, position }: { taskId: string; statusId: string; position: number }) =>
      moveTask(taskId, statusId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(projectId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// ===========================================
// TASK STATUSES
// ===========================================

export function useTaskStatuses(projectId: string) {
  return useQuery<TaskStatus[]>({
    queryKey: taskKeys.statuses(projectId),
    queryFn: () => getTaskStatuses(projectId),
    enabled: !!projectId,
  })
}

export function useCreateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskStatusInput) => createTaskStatus(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.statuses(data.projectId) })
    },
  })
}

export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTaskStatusInput) => updateTaskStatus(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.statuses(projectId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(projectId) })
    },
  })
}

export function useDeleteTaskStatus(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTaskStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.statuses(projectId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(projectId) })
    },
  })
}
