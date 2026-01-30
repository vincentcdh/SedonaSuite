// ===========================================
// FILE SIZE UTILITIES
// ===========================================

// ===========================================
// FORMAT FILE SIZE
// ===========================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0))} ${units[i]}`
}

// ===========================================
// PARSE FILE SIZE
// ===========================================

export function parseFileSize(sizeStr: string): number {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i)
  if (!match || !match[1] || !match[2]) return 0

  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  }

  return Math.round(value * (units[unit] || 1))
}

// ===========================================
// SIZE CONSTANTS
// ===========================================

export const SIZE_CONSTANTS = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
} as const

// ===========================================
// PLAN LIMITS
// ===========================================

export const PLAN_LIMITS = {
  FREE: {
    maxStorageBytes: 1 * SIZE_CONSTANTS.GB, // 1 GB
    maxFileSizeBytes: 10 * SIZE_CONSTANTS.MB, // 10 MB
    maxFolders: 10,
    versioning: false,
    externalShares: false,
    comments: false,
    ocr: false,
  },
  PRO: {
    maxStorageBytes: 50 * SIZE_CONSTANTS.GB, // 50 GB
    maxFileSizeBytes: 100 * SIZE_CONSTANTS.MB, // 100 MB
    maxFolders: -1, // unlimited
    versioning: true,
    externalShares: true,
    comments: true,
    ocr: true,
  },
} as const

// ===========================================
// CHECK FILE SIZE LIMIT
// ===========================================

export function isFileSizeAllowed(bytes: number, isPro: boolean = false): boolean {
  const limit = isPro ? PLAN_LIMITS.PRO.maxFileSizeBytes : PLAN_LIMITS.FREE.maxFileSizeBytes
  return bytes <= limit
}

// ===========================================
// GET REMAINING STORAGE
// ===========================================

export function getRemainingStorage(usedBytes: number, limitBytes: number): number {
  return Math.max(0, limitBytes - usedBytes)
}

// ===========================================
// CHECK STORAGE LIMIT
// ===========================================

export function isStorageLimitReached(usedBytes: number, limitBytes: number): boolean {
  return usedBytes >= limitBytes
}

// ===========================================
// GET STORAGE PERCENTAGE
// ===========================================

export function getStoragePercentage(usedBytes: number, limitBytes: number): number {
  if (limitBytes === 0) return 0
  return Math.min(100, Math.round((usedBytes / limitBytes) * 100))
}

// ===========================================
// STORAGE STATUS
// ===========================================

export type StorageStatus = 'ok' | 'warning' | 'critical' | 'full'

export function getStorageStatus(percentage: number): StorageStatus {
  if (percentage >= 100) return 'full'
  if (percentage >= 90) return 'critical'
  if (percentage >= 70) return 'warning'
  return 'ok'
}

export const storageStatusColors: Record<StorageStatus, string> = {
  ok: '#10b981', // green
  warning: '#f59e0b', // amber
  critical: '#ef4444', // red
  full: '#7f1d1d', // dark red
}
