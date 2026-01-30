// ===========================================
// FILE HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFiles,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  restoreFile,
  deleteFilePermanently,
  getDeletedFiles,
  emptyTrash,
  getRecentFiles,
  getFilesByEntity,
  lockFile,
  unlockFile,
  incrementDownloadCount,
  getStorageUsage,
  searchFiles,
} from '../server/files'
import type {
  CreateFileInput,
  UpdateFileInput,
  FileFilters,
  PaginationParams,
} from '../types'
import { folderKeys } from './use-folders'

// ===========================================
// QUERY KEYS
// ===========================================

export const fileKeys = {
  all: ['docs', 'files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: FileFilters, pagination?: PaginationParams) =>
    [...fileKeys.lists(), organizationId, filters, pagination] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (id: string) => [...fileKeys.details(), id] as const,
  deleted: (organizationId: string, pagination?: PaginationParams) =>
    [...fileKeys.all, 'deleted', organizationId, pagination] as const,
  recent: (organizationId: string, limit?: number) =>
    [...fileKeys.all, 'recent', organizationId, limit] as const,
  byEntity: (entityType: string, entityId: string) =>
    [...fileKeys.all, 'byEntity', entityType, entityId] as const,
  search: (organizationId: string, query: string, pagination?: PaginationParams) =>
    [...fileKeys.all, 'search', organizationId, query, pagination] as const,
  storage: (organizationId: string) => [...fileKeys.all, 'storage', organizationId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useFiles(
  organizationId: string,
  filters?: FileFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: fileKeys.list(organizationId, filters, pagination),
    queryFn: () => getFiles(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

export function useFile(id: string, userId?: string) {
  return useQuery({
    queryKey: fileKeys.detail(id),
    queryFn: () => getFileById(id, userId),
    enabled: !!id,
  })
}

export function useDeletedFiles(organizationId: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: fileKeys.deleted(organizationId, pagination),
    queryFn: () => getDeletedFiles(organizationId, pagination),
    enabled: !!organizationId,
  })
}

export function useRecentFiles(organizationId: string, limit?: number) {
  return useQuery({
    queryKey: fileKeys.recent(organizationId, limit),
    queryFn: () => getRecentFiles(organizationId, limit),
    enabled: !!organizationId,
  })
}

export function useFilesByEntity(entityType: string, entityId: string) {
  return useQuery({
    queryKey: fileKeys.byEntity(entityType, entityId),
    queryFn: () => getFilesByEntity(entityType, entityId),
    enabled: !!entityType && !!entityId,
  })
}

export function useSearchFiles(
  organizationId: string,
  query: string,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: fileKeys.search(organizationId, query, pagination),
    queryFn: () => searchFiles(organizationId, query, pagination),
    enabled: !!organizationId && !!query && query.length >= 2,
  })
}

export function useStorageUsage(organizationId: string) {
  return useQuery({
    queryKey: fileKeys.storage(organizationId),
    queryFn: () => getStorageUsage(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateFile(organizationId: string, userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateFileInput) => createFile(organizationId, input, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fileKeys.recent(organizationId) })
      queryClient.invalidateQueries({ queryKey: fileKeys.storage(organizationId) })
      if (data.folderId) {
        queryClient.invalidateQueries({ queryKey: folderKeys.detail(data.folderId) })
      }
      if (data.linkedEntityType && data.linkedEntityId) {
        queryClient.invalidateQueries({
          queryKey: fileKeys.byEntity(data.linkedEntityType, data.linkedEntityId),
        })
      }
    },
  })
}

export function useUpdateFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateFileInput) => updateFile(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fileKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: fileKeys.recent(data.organizationId) })
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all })
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export function useRestoreFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => restoreFile(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all })
      queryClient.invalidateQueries({ queryKey: fileKeys.storage(data.organizationId) })
    },
  })
}

export function useDeleteFilePermanently() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFilePermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all })
    },
  })
}

export function useEmptyTrash(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => emptyTrash(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all })
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export function useLockFile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => lockFile(fileId, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
    },
  })
}

export function useUnlockFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => unlockFile(fileId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
    },
  })
}

export function useIncrementDownloadCount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => incrementDownloadCount(fileId),
    onSuccess: () => {
      // Optionally invalidate the file detail
    },
  })
}
