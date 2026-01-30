// ===========================================
// @SEDONA/DOCS UTILS EXPORTS
// ===========================================

export {
  getFileType,
  getExtension,
  fileTypeLabels,
  fileTypeIcons,
  fileTypeColors,
  isPreviewable,
  getPreviewType,
  type PreviewType,
} from './file-types'

export {
  formatFileSize,
  parseFileSize,
  SIZE_CONSTANTS,
  PLAN_LIMITS,
  isFileSizeAllowed,
  getRemainingStorage,
  isStorageLimitReached,
  getStoragePercentage,
  getStorageStatus,
  storageStatusColors,
  type StorageStatus,
} from './file-size'
