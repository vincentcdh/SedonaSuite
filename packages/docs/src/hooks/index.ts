// ===========================================
// @SEDONA/DOCS HOOKS EXPORTS
// ===========================================

// Folders
export {
  folderKeys,
  useFolders,
  useFolderTree,
  useFolder,
  useFolderBreadcrumbs,
  useDeletedFolders,
  useFolderCount,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useRestoreFolder,
  useDeleteFolderPermanently,
} from './use-folders'

// Files
export {
  fileKeys,
  useFiles,
  useFile,
  useDeletedFiles,
  useRecentFiles,
  useFilesByEntity,
  useSearchFiles,
  useStorageUsage,
  useCreateFile,
  useUpdateFile,
  useDeleteFile,
  useRestoreFile,
  useDeleteFilePermanently,
  useEmptyTrash,
  useLockFile,
  useUnlockFile,
  useIncrementDownloadCount,
} from './use-files'

// Favorites
export {
  favoriteKeys,
  useFavorites,
  useIsFileFavorite,
  useIsFolderFavorite,
  useAddFileToFavorites,
  useAddFolderToFavorites,
  useRemoveFileFromFavorites,
  useRemoveFolderFromFavorites,
  useToggleFileFavorite,
  useToggleFolderFavorite,
} from './use-favorites'

// Activity
export {
  activityKeys,
  useActivityLog,
  useFileActivity,
  useLogDownload,
} from './use-activity'

// Settings
export {
  docsSettingsKeys,
  useDocsSettings,
  useUpdateDocsSettings,
} from './use-settings'
