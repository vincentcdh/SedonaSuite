// ===========================================
// FILE SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  DocFile,
  DocFileWithRelations,
  CreateFileInput,
  UpdateFileInput,
  FileFilters,
  PaginatedResult,
  PaginationParams,
  StorageUsage,
} from '../types'

// ===========================================
// GET FILES
// ===========================================

export async function getFiles(
  organizationId: string,
  filters: FileFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<DocFileWithRelations>> {
  const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getSupabaseClient()
    .from('docs.files')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)

  // Apply filters
  if (!filters.includeDeleted) {
    query = query.is('deleted_at', null)
  }

  if (filters.folderId !== undefined) {
    if (filters.folderId === null) {
      query = query.is('folder_id', null)
    } else {
      query = query.eq('folder_id', filters.folderId)
    }
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,original_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }

  if (filters.fileType) {
    if (Array.isArray(filters.fileType)) {
      query = query.in('file_type', filters.fileType)
    } else {
      query = query.eq('file_type', filters.fileType)
    }
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  if (filters.linkedEntityType) {
    query = query.eq('linked_entity_type', filters.linkedEntityType)
  }

  if (filters.linkedEntityId) {
    query = query.eq('linked_entity_id', filters.linkedEntityId)
  }

  if (filters.uploadedBy) {
    query = query.eq('uploaded_by', filters.uploadedBy)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get folders
  const folderIds = [...new Set((data || []).filter((f: any) => f.folder_id).map((f: any) => f.folder_id))]

  let folders: any[] = []
  if (folderIds.length > 0) {
    const { data: folderData } = await getSupabaseClient()
      .from('docs.folders')
      .select('id, name, path')
      .in('id', folderIds)
    folders = folderData || []
  }

  const folderMap: Record<string, any> = {}
  folders.forEach((f: any) => {
    folderMap[f.id] = f
  })

  // Get uploaders
  const uploaderIds = [...new Set((data || []).filter((f: any) => f.uploaded_by).map((f: any) => f.uploaded_by))]

  let uploaders: any[] = []
  if (uploaderIds.length > 0) {
    const { data: uploaderData } = await getSupabaseClient()
      .from('users')
      .select('id, email, full_name')
      .in('id', uploaderIds)
    uploaders = (uploaderData || []) as any[]
  }

  const uploaderMap: Record<string, any> = {}
  uploaders.forEach((u: any) => {
    uploaderMap[u.id] = u
  })

  return {
    data: (data || []).map((f: any) => ({
      ...mapFileFromDb(f),
      folder: f.folder_id && folderMap[f.folder_id]
        ? {
            id: folderMap[f.folder_id].id,
            name: folderMap[f.folder_id].name,
            path: folderMap[f.folder_id].path,
          }
        : undefined,
      uploader: f.uploaded_by && uploaderMap[f.uploaded_by]
        ? {
            id: uploaderMap[f.uploaded_by].id,
            email: uploaderMap[f.uploaded_by].email,
            fullName: uploaderMap[f.uploaded_by].full_name,
          }
        : undefined,
    })),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET FILE BY ID
// ===========================================

export async function getFileById(id: string, userId?: string): Promise<DocFileWithRelations | null> {
  const { data, error } = await getSupabaseClient()
    .from('docs.files')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const file = mapFileFromDb(data)

  // Get folder
  let folder = undefined
  if (file.folderId) {
    const { data: folderData } = await getSupabaseClient()
      .from('docs.folders')
      .select('id, name, path')
      .eq('id', file.folderId)
      .single()

    if (folderData) {
      folder = {
        id: folderData.id,
        name: folderData.name,
        path: folderData.path,
      }
    }
  }

  // Get uploader
  let uploader = undefined
  if (file.uploadedBy) {
    const { data: uploaderData } = await getSupabaseClient()
      .from('users')
      .select('id, email, full_name')
      .eq('id', file.uploadedBy)
      .single()

    const userData = uploaderData as { id: string; email: string; full_name: string | null } | null
    if (userData) {
      uploader = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
      }
    }
  }

  // Check if favorite
  let isFavorite = false
  if (userId) {
    const { count } = await getSupabaseClient()
      .from('docs.favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('file_id', id)

    isFavorite = (count || 0) > 0
  }

  return {
    ...file,
    folder,
    uploader,
    isFavorite,
  }
}

// ===========================================
// CREATE FILE
// ===========================================

export async function createFile(
  organizationId: string,
  input: CreateFileInput,
  userId?: string
): Promise<DocFile> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    organization_id: organizationId,
    folder_id: input.folderId || null,
    name: input.name,
    mime_type: input.mimeType || null,
    file_type: input.fileType || 'other',
    storage_path: input.storagePath,
    file_size: input.sizeBytes,
    tags: input.tags || [],
    entity_type: input.linkedEntityType || null,
    entity_id: input.linkedEntityId || null,
    uploaded_by: userId || null,
  }

  const { data, error } = await getSupabaseClient()
    .from('docs.files')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  return mapFileFromDb(data)
}

// ===========================================
// UPDATE FILE
// ===========================================

export async function updateFile(input: UpdateFileInput): Promise<DocFile> {
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.folderId !== undefined) updateData.folder_id = input.folderId
  if (input.description !== undefined) updateData.description = input.description
  if (input.tags !== undefined) updateData.tags = input.tags
  if (input.linkedEntityType !== undefined) updateData.linked_entity_type = input.linkedEntityType
  if (input.linkedEntityId !== undefined) updateData.linked_entity_id = input.linkedEntityId

  const { data, error } = await getSupabaseClient()
    .from('docs.files')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapFileFromDb(data)
}

// ===========================================
// DELETE FILE (SOFT)
// ===========================================

export async function deleteFile(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('docs.files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// RESTORE FILE
// ===========================================

export async function restoreFile(id: string): Promise<DocFile> {
  const { data, error } = await getSupabaseClient()
    .from('docs.files')
    .update({ deleted_at: null })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapFileFromDb(data)
}

// ===========================================
// DELETE FILE PERMANENTLY
// ===========================================

export async function deleteFilePermanently(id: string): Promise<void> {
  // First get the storage path to delete from storage
  const { data: file } = await getSupabaseClient()
    .from('docs.files')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (file) {
    // Delete from storage
    await getSupabaseClient().storage.from('documents').remove([file.storage_path])
  }

  // Delete from database
  const { error } = await getSupabaseClient()
    .from('docs.files')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET DELETED FILES (TRASH)
// ===========================================

export async function getDeletedFiles(
  organizationId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<DocFile>> {
  const { page = 1, pageSize = 20, sortBy = 'deletedAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  const { data, error, count } = await getSupabaseClient()
    .from('docs.files')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .not('deleted_at', 'is', null)
    .order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  return {
    data: (data || []).map(mapFileFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// EMPTY TRASH
// ===========================================

export async function emptyTrash(organizationId: string): Promise<void> {
  // Get all files to delete from storage
  const { data: files } = await getSupabaseClient()
    .from('docs.files')
    .select('storage_path')
    .eq('organization_id', organizationId)
    .not('deleted_at', 'is', null)

  if (files && files.length > 0) {
    // Delete from storage
    const paths = files.map((f: any) => f.storage_path)
    await getSupabaseClient().storage.from('documents').remove(paths)
  }

  // Delete files from database
  const { error: fileError } = await getSupabaseClient()
    .from('docs.files')
    .delete()
    .eq('organization_id', organizationId)
    .not('deleted_at', 'is', null)

  if (fileError) throw fileError

  // Delete folders from database
  const { error: folderError } = await getSupabaseClient()
    .from('docs.folders')
    .delete()
    .eq('organization_id', organizationId)
    .not('deleted_at', 'is', null)

  if (folderError) throw folderError
}

// ===========================================
// GET RECENT FILES
// ===========================================

export async function getRecentFiles(
  organizationId: string,
  limit: number = 10
): Promise<DocFile[]> {
  const { data, error } = await getSupabaseClient()
    .from('docs.files')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map(mapFileFromDb)
}

// ===========================================
// GET FILES BY ENTITY
// ===========================================

export async function getFilesByEntity(
  entityType: string,
  entityId: string
): Promise<DocFile[]> {
  const { data, error } = await getSupabaseClient()
    .from('docs.files')
    .select('*')
    .eq('linked_entity_type', entityType)
    .eq('linked_entity_id', entityId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapFileFromDb)
}

// ===========================================
// LOCK/UNLOCK FILE (PRO)
// ===========================================

export async function lockFile(fileId: string, userId: string): Promise<DocFile> {
  const { data, error } = await getSupabaseClient()
    .from('docs.files')
    .update({
      is_locked: true,
      locked_by: userId,
      locked_at: new Date().toISOString(),
    })
    .eq('id', fileId)
    .select()
    .single()

  if (error) throw error

  return mapFileFromDb(data)
}

export async function unlockFile(fileId: string): Promise<DocFile> {
  const { data, error } = await getSupabaseClient()
    .from('docs.files')
    .update({
      is_locked: false,
      locked_by: null,
      locked_at: null,
    })
    .eq('id', fileId)
    .select()
    .single()

  if (error) throw error

  return mapFileFromDb(data)
}

// ===========================================
// INCREMENT DOWNLOAD COUNT
// ===========================================

export async function incrementDownloadCount(fileId: string): Promise<void> {
  // Fetch current count and increment
  const { data: file } = await getSupabaseClient()
    .from('docs.files')
    .select('download_count')
    .eq('id', fileId)
    .single()

  if (file) {
    await getSupabaseClient()
      .from('docs.files')
      .update({
        download_count: (file.download_count || 0) + 1,
      })
      .eq('id', fileId)
  }
}

// ===========================================
// GET STORAGE USAGE
// ===========================================

export async function getStorageUsage(organizationId: string): Promise<StorageUsage> {
  // Get all files with their types and sizes
  const { data: filesData, error: filesError } = await getSupabaseClient()
    .from('docs.files')
    .select('size_bytes, file_type')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (filesError) throw filesError

  const files = filesData || []
  const usedBytes = files.reduce((sum: number, f: any) => sum + (f.size_bytes || 0), 0)

  // Count by file type
  const typeCounts: Record<string, number> = {
    document: 0,
    image: 0,
    pdf: 0,
    video: 0,
    audio: 0,
    archive: 0,
    spreadsheet: 0,
    presentation: 0,
  }

  files.forEach((f: any) => {
    const type = f.file_type as string
    if (type && typeCounts[type] !== undefined) {
      typeCounts[type]++
    }
  })

  // Get folder count
  const { count: folderCount } = await getSupabaseClient()
    .from('docs.folders')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Default limit: 5GB, can be overridden in settings
  const defaultLimitBytes = 5 * 1024 * 1024 * 1024 // 5 GB

  const { data: settings } = await getSupabaseClient()
    .from('docs.settings')
    .select('max_storage_bytes')
    .eq('organization_id', organizationId)
    .single()

  const limitBytes = settings?.max_storage_bytes || defaultLimitBytes
  const percentage = limitBytes > 0 ? Math.round((usedBytes / limitBytes) * 100) : 0

  return {
    usedBytes,
    limitBytes,
    percentage,
    fileCount: files.length,
    folderCount: folderCount || 0,
    documentCount: typeCounts.document,
    imageCount: typeCounts.image,
    pdfCount: typeCounts.pdf,
    videoCount: typeCounts.video,
    audioCount: typeCounts.audio,
    archiveCount: typeCounts.archive,
    spreadsheetCount: typeCounts.spreadsheet,
    presentationCount: typeCounts.presentation,
  }
}

// ===========================================
// SEARCH FILES
// ===========================================

export async function searchFiles(
  organizationId: string,
  query: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<DocFile>> {
  const { page = 1, pageSize = 20 } = pagination
  const offset = (page - 1) * pageSize

  const { data, error, count } = await getSupabaseClient()
    .from('docs.files')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .or(`name.ilike.%${query}%,original_name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  return {
    data: (data || []).map(mapFileFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapFileFromDb(data: any): DocFile {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    folderId: data.folder_id as string | null,
    name: data.name as string,
    originalName: data.original_name as string,
    extension: data.extension as string | null,
    mimeType: data.mime_type as string | null,
    fileType: data.file_type as DocFile['fileType'],
    storagePath: data.storage_path as string,
    sizeBytes: data.size_bytes as number,
    currentVersion: data.current_version as number,
    isLocked: data.is_locked as boolean,
    lockedBy: data.locked_by as string | null,
    lockedAt: data.locked_at as string | null,
    description: data.description as string | null,
    tags: (data.tags as string[]) || [],
    contentText: data.content_text as string | null,
    linkedEntityType: data.linked_entity_type as string | null,
    linkedEntityId: data.linked_entity_id as string | null,
    downloadCount: data.download_count as number,
    lastAccessedAt: data.last_accessed_at as string | null,
    uploadedBy: data.uploaded_by as string | null,
    // Enhanced metadata
    checksum: data.checksum as string | null,
    width: data.width as number | null,
    height: data.height as number | null,
    durationSeconds: data.duration_seconds as number | null,
    pageCount: data.page_count as number | null,
    previewUrl: data.preview_url as string | null,
    canPreview: (data.can_preview as boolean) || false,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
