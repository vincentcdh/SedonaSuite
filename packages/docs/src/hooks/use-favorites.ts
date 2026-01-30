// ===========================================
// FAVORITES HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFavorites,
  addFileToFavorites,
  addFolderToFavorites,
  removeFileFromFavorites,
  removeFolderFromFavorites,
  isFileFavorite,
  isFolderFavorite,
} from '../server/favorites'
import { fileKeys } from './use-files'

// ===========================================
// QUERY KEYS
// ===========================================

export const favoriteKeys = {
  all: ['docs', 'favorites'] as const,
  list: (userId: string) => [...favoriteKeys.all, 'list', userId] as const,
  isFileFavorite: (userId: string, fileId: string) =>
    [...favoriteKeys.all, 'isFile', userId, fileId] as const,
  isFolderFavorite: (userId: string, folderId: string) =>
    [...favoriteKeys.all, 'isFolder', userId, folderId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useFavorites(userId: string) {
  return useQuery({
    queryKey: favoriteKeys.list(userId),
    queryFn: () => getFavorites(userId),
    enabled: !!userId,
  })
}

export function useIsFileFavorite(userId: string, fileId: string) {
  return useQuery({
    queryKey: favoriteKeys.isFileFavorite(userId, fileId),
    queryFn: () => isFileFavorite(userId, fileId),
    enabled: !!userId && !!fileId,
  })
}

export function useIsFolderFavorite(userId: string, folderId: string) {
  return useQuery({
    queryKey: favoriteKeys.isFolderFavorite(userId, folderId),
    queryFn: () => isFolderFavorite(userId, folderId),
    enabled: !!userId && !!folderId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useAddFileToFavorites(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => addFileToFavorites(userId, fileId),
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list(userId) })
      queryClient.invalidateQueries({ queryKey: favoriteKeys.isFileFavorite(userId, fileId) })
      queryClient.invalidateQueries({ queryKey: fileKeys.detail(fileId) })
    },
  })
}

export function useAddFolderToFavorites(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: string) => addFolderToFavorites(userId, folderId),
    onSuccess: (_, folderId) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list(userId) })
      queryClient.invalidateQueries({ queryKey: favoriteKeys.isFolderFavorite(userId, folderId) })
    },
  })
}

export function useRemoveFileFromFavorites(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => removeFileFromFavorites(userId, fileId),
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list(userId) })
      queryClient.invalidateQueries({ queryKey: favoriteKeys.isFileFavorite(userId, fileId) })
      queryClient.invalidateQueries({ queryKey: fileKeys.detail(fileId) })
    },
  })
}

export function useRemoveFolderFromFavorites(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: string) => removeFolderFromFavorites(userId, folderId),
    onSuccess: (_, folderId) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list(userId) })
      queryClient.invalidateQueries({ queryKey: favoriteKeys.isFolderFavorite(userId, folderId) })
    },
  })
}

// ===========================================
// TOGGLE FAVORITE HELPER
// ===========================================

export function useToggleFileFavorite(userId: string) {
  const addMutation = useAddFileToFavorites(userId)
  const removeMutation = useRemoveFileFromFavorites(userId)

  return {
    toggle: async (fileId: string, isFavorite: boolean) => {
      if (isFavorite) {
        return removeMutation.mutateAsync(fileId)
      } else {
        return addMutation.mutateAsync(fileId)
      }
    },
    isLoading: addMutation.isPending || removeMutation.isPending,
  }
}

export function useToggleFolderFavorite(userId: string) {
  const addMutation = useAddFolderToFavorites(userId)
  const removeMutation = useRemoveFolderFromFavorites(userId)

  return {
    toggle: async (folderId: string, isFavorite: boolean) => {
      if (isFavorite) {
        return removeMutation.mutateAsync(folderId)
      } else {
        return addMutation.mutateAsync(folderId)
      }
    },
    isLoading: addMutation.isPending || removeMutation.isPending,
  }
}
