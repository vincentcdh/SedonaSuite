// ===========================================
// TASK COLUMNS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTaskColumns,
  getTaskColumnById,
  createTaskColumn,
  updateTaskColumn,
  deleteTaskColumn,
  reorderTaskColumns,
  type TaskColumn,
  type CreateColumnInput,
  type UpdateColumnInput,
} from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const columnsKeys = {
  all: ['task-columns'] as const,
  lists: () => [...columnsKeys.all, 'list'] as const,
  list: (projectId: string) => [...columnsKeys.lists(), projectId] as const,
  details: () => [...columnsKeys.all, 'detail'] as const,
  detail: (id: string) => [...columnsKeys.details(), id] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useTaskColumns(projectId: string) {
  return useQuery({
    queryKey: columnsKeys.list(projectId),
    queryFn: () => getTaskColumns(projectId),
    enabled: !!projectId,
  })
}

export function useTaskColumnById(id: string) {
  return useQuery({
    queryKey: columnsKeys.detail(id),
    queryFn: () => getTaskColumnById(id),
    enabled: !!id,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateTaskColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateColumnInput) => createTaskColumn(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: columnsKeys.list(data.projectId),
      })
    },
  })
}

export function useUpdateTaskColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateColumnInput) => updateTaskColumn(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: columnsKeys.list(data.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: columnsKeys.detail(data.id),
      })
    },
  })
}

export function useDeleteTaskColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      deleteTaskColumn(id).then(() => ({ id, projectId })),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: columnsKeys.list(data.projectId),
      })
    },
  })
}

export function useReorderTaskColumns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, columnIds }: { projectId: string; columnIds: string[] }) =>
      reorderTaskColumns(projectId, columnIds),
    onMutate: async ({ projectId, columnIds }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: columnsKeys.list(projectId) })

      // Snapshot the previous value
      const previousColumns = queryClient.getQueryData<TaskColumn[]>(columnsKeys.list(projectId))

      // Optimistically update
      if (previousColumns) {
        const reorderedColumns = columnIds
          .map((id, index) => {
            const column = previousColumns.find((c) => c.id === id)
            return column ? { ...column, position: index } : null
          })
          .filter(Boolean) as TaskColumn[]

        queryClient.setQueryData(columnsKeys.list(projectId), reorderedColumns)
      }

      return { previousColumns }
    },
    onError: (err, { projectId }, context) => {
      // Rollback on error
      if (context?.previousColumns) {
        queryClient.setQueryData(columnsKeys.list(projectId), context.previousColumns)
      }
    },
    onSettled: (data, err, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: columnsKeys.list(projectId) })
    },
  })
}
