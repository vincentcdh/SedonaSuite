// ===========================================
// @SEDONA/DOCS SERVER EXPORTS
// ===========================================

// Folders
export {
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
} from './folders'

// Files
export {
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
} from './files'

// Favorites
export {
  getFavorites,
  addFileToFavorites,
  addFolderToFavorites,
  removeFileFromFavorites,
  removeFolderFromFavorites,
  isFileFavorite,
  isFolderFavorite,
} from './favorites'

// Activity
export {
  getActivityLog,
  getFileActivity,
  logDownload,
} from './activity'

// Settings
export {
  getDocsSettings,
  createDocsSettings,
  getOrCreateDocsSettings,
  updateDocsSettings,
} from './settings'
