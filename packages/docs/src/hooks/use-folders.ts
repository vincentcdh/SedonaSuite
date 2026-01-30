// ===========================================
// FOLDER HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFolders,
  getFolderTree,
  getFolderById,
  getFolderBreadcrumbs,
  createFolder,
  updateFolder,
  deleteFolder,
  restoreFolder,
  deleteFolderPermanently,
  getDeletedFolders,
  getFolderCount,
} from '../server/folders'
import type {
  CreateFolderInput,
  UpdateFolderInput,
  PaginationParams,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const folderKeys = {
  all: ['docs', 'folders'] as const,
  lists: () => [...folderKeys.all, 'list'] as const,
  list: (organizationId: string, parentId: string | null, pagination?: PaginationParams) =>
    [...folderKeys.lists(), organizationId, parentId, pagination] as const,
  tree: (organizationId: string) => [...folderKeys.all, 'tree', organizationId] as const,
  details: () => [...folderKeys.all, 'detail'] as const,
  detail: (id: string) => [...folderKeys.details(), id] as const,
  breadcrumbs: (id: string) => [...folderKeys.all, 'breadcrumbs', id] as const,
  deleted: (organizationId: string, pagination?: PaginationParams) =>
    [...folderKeys.all, 'deleted', organizationId, pagination] as const,
  count: (organizationId: string) => [...folderKeys.all, 'count', organizationId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useFolders(
  organizationId: string,
  parentId: string | null = null,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: folderKeys.list(organizationId, parentId, pagination),
    queryFn: () => getFolders(organizationId, parentId, pagination),
    enabled: !!organizationId,
  })
}

export function useFolderTree(organizationId: string) {
  return useQuery({
    queryKey: folderKeys.tree(organizationId),
    queryFn: () => getFolderTree(organizationId),
    enabled: !!organizationId,
  })
}

export function useFolder(id: string) {
  return useQuery({
    queryKey: folderKeys.detail(id),
    queryFn: () => getFolderById(id),
    enabled: !!id,
  })
}

export function useFolderBreadcrumbs(folderId: string) {
  return useQuery({
    queryKey: folderKeys.breadcrumbs(folderId),
    queryFn: () => getFolderBreadcrumbs(folderId),
    enabled: !!folderId,
  })
}

export function useDeletedFolders(organizationId: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: folderKeys.deleted(organizationId, pagination),
    queryFn: () => getDeletedFolders(organizationId, pagination),
    enabled: !!organizationId,
  })
}

export function useFolderCount(organizationId: string) {
  return useQuery({
    queryKey: folderKeys.count(organizationId),
    queryFn: () => getFolderCount(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateFolder(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateFolderInput) => createFolder(organizationId, input, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: folderKeys.tree(organizationId) })
      queryClient.invalidateQueries({ queryKey: folderKeys.count(organizationId) })
      if (data.parentId) {
        queryClient.invalidateQueries({ queryKey: folderKeys.detail(data.parentId) })
      }
    },
  })
}

export function useUpdateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateFolderInput) => updateFolder(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: folderKeys.tree(data.organizationId) })
      queryClient.invalidateQueries({ queryKey: folderKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: folderKeys.breadcrumbs(data.id) })
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export function useRestoreFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => restoreFolder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export function useDeleteFolderPermanently() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFolderPermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}
