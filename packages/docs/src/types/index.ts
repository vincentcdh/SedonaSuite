// ===========================================
// @SEDONA/DOCS TYPES
// ===========================================

import { z } from 'zod'

// ===========================================
// ENUMS
// ===========================================

export const FileType = {
  DOCUMENT: 'document',
  SPREADSHEET: 'spreadsheet',
  PRESENTATION: 'presentation',
  PDF: 'pdf',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  OTHER: 'other',
} as const

export type FileType = (typeof FileType)[keyof typeof FileType]

// ===========================================
// FOLDER TYPES
// ===========================================

export interface Folder {
  id: string
  organizationId: string
  name: string
  parentId: string | null
  path: string
  depth: number
  color: string | null
  icon: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[]
  fileCount?: number
}

export interface FolderBreadcrumb {
  id: string
  name: string
}

// ===========================================
// FILE TYPES
// ===========================================

export interface DocFile {
  id: string
  organizationId: string
  folderId: string | null
  name: string
  originalName: string
  extension: string | null
  mimeType: string | null
  fileType: FileType
  storagePath: string
  sizeBytes: number
  currentVersion: number
  isLocked: boolean
  lockedBy: string | null
  lockedAt: string | null
  description: string | null
  tags: string[]
  contentText: string | null
  linkedEntityType: string | null
  linkedEntityId: string | null
  downloadCount: number
  lastAccessedAt: string | null
  uploadedBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface DocFileWithRelations extends DocFile {
  folder?: {
    id: string
    name: string
    path: string
  }
  uploader?: {
    id: string
    email: string
    fullName: string | null
  }
  isFavorite?: boolean
}

// ===========================================
// FILE VERSION TYPES (PRO)
// ===========================================

export interface FileVersion {
  id: string
  fileId: string
  versionNumber: number
  storagePath: string
  sizeBytes: number
  changeSummary: string | null
  createdBy: string | null
  createdAt: string
}

export interface FileVersionWithCreator extends FileVersion {
  creator?: {
    id: string
    email: string
    fullName: string | null
  }
}

// ===========================================
// EXTERNAL SHARE TYPES (PRO)
// ===========================================

export interface ExternalShare {
  id: string
  organizationId: string
  fileId: string | null
  folderId: string | null
  shareToken: string
  passwordHash: string | null
  expiresAt: string | null
  maxDownloads: number | null
  downloadCount: number
  allowDownload: boolean
  allowPreview: boolean
  createdBy: string | null
  createdAt: string
  lastAccessedAt: string | null
}

export interface ExternalShareWithTarget extends ExternalShare {
  file?: {
    id: string
    name: string
    fileType: FileType
    sizeBytes: number
  }
  folder?: {
    id: string
    name: string
  }
}

// ===========================================
// COMMENT TYPES (PRO)
// ===========================================

export interface Comment {
  id: string
  organizationId: string
  fileId: string
  content: string
  parentId: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CommentWithAuthor extends Comment {
  author?: {
    id: string
    email: string
    fullName: string | null
  }
  replies?: CommentWithAuthor[]
}

// ===========================================
// FAVORITE TYPES
// ===========================================

export interface Favorite {
  id: string
  userId: string
  fileId: string | null
  folderId: string | null
  createdAt: string
}

// ===========================================
// ACTIVITY TYPES
// ===========================================

export type ActivityAction =
  | 'uploaded'
  | 'downloaded'
  | 'renamed'
  | 'moved'
  | 'deleted'
  | 'restored'
  | 'shared'
  | 'commented'

export interface ActivityLog {
  id: string
  organizationId: string
  action: ActivityAction
  fileId: string | null
  folderId: string | null
  details: Record<string, unknown> | null
  userId: string | null
  createdAt: string
}

export interface ActivityLogWithRelations extends ActivityLog {
  user?: {
    id: string
    email: string
    fullName: string | null
  }
  file?: {
    id: string
    name: string
    fileType: FileType
  }
  folder?: {
    id: string
    name: string
  }
}

// ===========================================
// SETTINGS TYPES
// ===========================================

export interface DocsSettings {
  id: string
  organizationId: string
  maxStorageBytes: number | null
  maxFileSizeBytes: number | null
  autoOcrEnabled: boolean
  versionRetentionDays: number
  createdAt: string
  updatedAt: string
}

// ===========================================
// STORAGE USAGE TYPES
// ===========================================

export interface StorageUsage {
  usedBytes: number
  limitBytes: number
  percentage: number
  fileCount: number
  folderCount: number
}

// ===========================================
// INPUT TYPES
// ===========================================

// Folder inputs
export const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().nullable().optional(),
  color: z.string().max(7).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
})

export type CreateFolderInput = z.infer<typeof createFolderSchema>

export const updateFolderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  parentId: z.string().uuid().nullable().optional(),
  color: z.string().max(7).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
})

export type UpdateFolderInput = z.infer<typeof updateFolderSchema>

// File inputs
export const createFileSchema = z.object({
  folderId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255),
  originalName: z.string().min(1).max(255),
  extension: z.string().max(20).nullable().optional(),
  mimeType: z.string().max(100).nullable().optional(),
  fileType: z.enum(['document', 'spreadsheet', 'presentation', 'pdf', 'image', 'video', 'audio', 'archive', 'other']).optional(),
  storagePath: z.string(),
  sizeBytes: z.number().int().positive(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  linkedEntityType: z.string().max(50).nullable().optional(),
  linkedEntityId: z.string().uuid().nullable().optional(),
})

export type CreateFileInput = z.infer<typeof createFileSchema>

export const updateFileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  folderId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  linkedEntityType: z.string().max(50).nullable().optional(),
  linkedEntityId: z.string().uuid().nullable().optional(),
})

export type UpdateFileInput = z.infer<typeof updateFileSchema>

// External share inputs (PRO)
export const createExternalShareSchema = z.object({
  fileId: z.string().uuid().nullable().optional(),
  folderId: z.string().uuid().nullable().optional(),
  password: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  maxDownloads: z.number().int().positive().nullable().optional(),
  allowDownload: z.boolean().optional(),
  allowPreview: z.boolean().optional(),
})

export type CreateExternalShareInput = z.infer<typeof createExternalShareSchema>

// Comment inputs (PRO)
export const createCommentSchema = z.object({
  fileId: z.string().uuid(),
  content: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

export const updateCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1),
})

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>

// ===========================================
// FILTER TYPES
// ===========================================

export interface FileFilters {
  search?: string
  folderId?: string | null
  fileType?: FileType | FileType[]
  tags?: string[]
  linkedEntityType?: string
  linkedEntityId?: string
  uploadedBy?: string
  includeDeleted?: boolean
}

export interface ActivityFilters {
  action?: ActivityAction | ActivityAction[]
  fileId?: string
  folderId?: string
  userId?: string
  startDate?: string
  endDate?: string
}

// ===========================================
// PAGINATION
// ===========================================

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
