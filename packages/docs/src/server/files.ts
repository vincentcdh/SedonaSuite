// ===========================================
// FILE SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient, validateOrganizationId } from '@sedona/database'
import {
  assertDocsStorageLimit,
  assertDocsFileSizeLimit,
  isFileLockingEnabled,
} from '@sedona/billing/server'
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = any

// ===========================================
// GET FILES
// ===========================================

export async function getFiles(
  organizationId: string,
  filters: FileFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<DocFileWithRelations>> {
  const validOrgId = validateOrganizationId(organizationId)
  const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  const supabase = getSupabaseClient() as SupabaseClientAny
  let query = supabase
    .from('docs_files')
    .select('*', { count: 'exact' })
    .eq('organization_id', validOrgId)

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
  const sortColumn = sortBy.replace(/([A-Z])/g, '_$1').toLowerCase()
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw new Error(`Failed to fetch files: ${error.message}`)

  return {
    data: (data ?? []).map(mapFileFromDb),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

// ===========================================
// GET FILE BY ID
// ===========================================

export async function getFileById(id: string, userId?: string): Promise<DocFileWithRelations | null> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('docs_files')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch file: ${error.message}`)
  }

  const file = mapFileFromDb(data)

  // Check if favorite
  let isFavorite = false
  if (userId) {
    const { count } = await supabase
      .from('docs_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('file_id', id)

    isFavorite = (count ?? 0) > 0
  }

  return {
    ...file,
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
  const validOrgId = validateOrganizationId(organizationId)

  // IMPORTANT: Check storage limit BEFORE upload
  // This should be called after file is uploaded to storage but before DB record
  // In the UI, call checkDocsStorageLimit BEFORE initiating upload
  await assertDocsStorageLimit(validOrgId, input.sizeBytes)

  // Check file size limit
  await assertDocsFileSizeLimit(validOrgId, input.sizeBytes)

  const supabase = getSupabaseClient() as SupabaseClientAny
  const insertData: Record<string, unknown> = {
    organization_id: validOrgId,
    folder_id: input.folderId ?? null,
    name: input.name,
    original_name: input.originalName ?? input.name,
    mime_type: input.mimeType ?? null,
    file_type: input.fileType ?? 'other',
    storage_path: input.storagePath,
    file_size: input.sizeBytes,
    tags: input.tags ?? [],
    linked_entity_type: input.linkedEntityType ?? null,
    linked_entity_id: input.linkedEntityId ?? null,
    uploaded_by: userId ?? null,
  }

  const { data, error } = await supabase
    .from('docs_files')
    .insert(insertData)
    .select()
    .single()

  if (error) throw new Error(`Failed to create file: ${error.message}`)

  return mapFileFromDb(data)
}

// ===========================================
// UPDATE FILE
// ===========================================

export async function updateFile(input: UpdateFileInput): Promise<DocFile> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (input.name !== undefined) updateData['name'] = input.name
  if (input.folderId !== undefined) updateData['folder_id'] = input.folderId
  if (input.description !== undefined) updateData['description'] = input.description
  if (input.tags !== undefined) updateData['tags'] = input.tags
  if (input.linkedEntityType !== undefined) updateData['linked_entity_type'] = input.linkedEntityType
  if (input.linkedEntityId !== undefined) updateData['linked_entity_id'] = input.linkedEntityId

  const { data, error } = await supabase
    .from('docs_files')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update file: ${error.message}`)

  return mapFileFromDb(data)
}

// ===========================================
// DELETE FILE (SOFT)
// ===========================================

export async function deleteFile(id: string): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { error } = await supabase
    .from('docs_files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`Failed to delete file: ${error.message}`)
}

// ===========================================
// RESTORE FILE
// ===========================================

export async function restoreFile(id: string): Promise<DocFile> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('docs_files')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to restore file: ${error.message}`)

  return mapFileFromDb(data)
}

// ===========================================
// DELETE FILE PERMANENTLY
// ===========================================

export async function deleteFilePermanently(id: string): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClientAny

  // First get the storage path to delete from storage
  const { data: file } = await supabase
    .from('docs_files')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (file) {
    // Delete from storage
    await supabase.storage.from('documents').remove([file['storage_path']])
  }

  // Delete from database
  const { error } = await supabase.from('docs_files').delete().eq('id', id)

  if (error) throw new Error(`Failed to permanently delete file: ${error.message}`)
}

// ===========================================
// GET DELETED FILES (TRASH)
// ===========================================

export async function getDeletedFiles(
  organizationId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<DocFile>> {
  const validOrgId = validateOrganizationId(organizationId)
  const { page = 1, pageSize = 20, sortBy = 'deletedAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  const supabase = getSupabaseClient() as SupabaseClientAny
  const sortColumn = sortBy.replace(/([A-Z])/g, '_$1').toLowerCase()

  const { data, error, count } = await supabase
    .from('docs_files')
    .select('*', { count: 'exact' })
    .eq('organization_id', validOrgId)
    .not('deleted_at', 'is', null)
    .order(sortColumn, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  if (error) throw new Error(`Failed to fetch deleted files: ${error.message}`)

  return {
    data: (data ?? []).map(mapFileFromDb),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

// ===========================================
// EMPTY TRASH
// ===========================================

export async function emptyTrash(organizationId: string): Promise<void> {
  const validOrgId = validateOrganizationId(organizationId)
  const supabase = getSupabaseClient() as SupabaseClientAny

  // Get all files to delete from storage
  const { data: files } = await supabase
    .from('docs_files')
    .select('storage_path')
    .eq('organization_id', validOrgId)
    .not('deleted_at', 'is', null)

  if (files && files.length > 0) {
    // Delete from storage
    const paths = files.map((f: Record<string, unknown>) => f['storage_path'] as string)
    await supabase.storage.from('documents').remove(paths)
  }

  // Delete files from database
  const { error: fileError } = await supabase
    .from('docs_files')
    .delete()
    .eq('organization_id', validOrgId)
    .not('deleted_at', 'is', null)

  if (fileError) throw new Error(`Failed to empty trash: ${fileError.message}`)

  // Delete folders from database
  const { error: folderError } = await supabase
    .from('docs_folders')
    .delete()
    .eq('organization_id', validOrgId)
    .not('deleted_at', 'is', null)

  if (folderError) throw new Error(`Failed to delete trashed folders: ${folderError.message}`)
}

// ===========================================
// GET RECENT FILES
// ===========================================

export async function getRecentFiles(
  organizationId: string,
  limit: number = 10
): Promise<DocFile[]> {
  const validOrgId = validateOrganizationId(organizationId)
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { data, error } = await supabase
    .from('docs_files')
    .select('*')
    .eq('organization_id', validOrgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to fetch recent files: ${error.message}`)

  return (data ?? []).map(mapFileFromDb)
}

// ===========================================
// GET FILES BY ENTITY
// ===========================================

export async function getFilesByEntity(
  entityType: string,
  entityId: string
): Promise<DocFile[]> {
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { data, error } = await supabase
    .from('docs_files')
    .select('*')
    .eq('linked_entity_type', entityType)
    .eq('linked_entity_id', entityId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch files by entity: ${error.message}`)

  return (data ?? []).map(mapFileFromDb)
}

// ===========================================
// LOCK/UNLOCK FILE (PRO)
// ===========================================

export async function lockFile(fileId: string, userId: string, organizationId: string): Promise<DocFile> {
  const validOrgId = validateOrganizationId(organizationId)

  // Check if file locking is enabled (paid feature)
  const enabled = await isFileLockingEnabled(validOrgId)
  if (!enabled) {
    throw new Error('Le verrouillage de fichiers est disponible avec le plan Pro')
  }

  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('docs_files')
    .update({
      is_locked: true,
      locked_by: userId,
      locked_at: new Date().toISOString(),
    })
    .eq('id', fileId)
    .select()
    .single()

  if (error) throw new Error(`Failed to lock file: ${error.message}`)

  return mapFileFromDb(data)
}

export async function unlockFile(fileId: string): Promise<DocFile> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('docs_files')
    .update({
      is_locked: false,
      locked_by: null,
      locked_at: null,
    })
    .eq('id', fileId)
    .select()
    .single()

  if (error) throw new Error(`Failed to unlock file: ${error.message}`)

  return mapFileFromDb(data)
}

// ===========================================
// INCREMENT DOWNLOAD COUNT
// ===========================================

export async function incrementDownloadCount(fileId: string): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClientAny

  // Fetch current count and increment
  const { data: file } = await supabase
    .from('docs_files')
    .select('download_count')
    .eq('id', fileId)
    .single()

  if (file) {
    await supabase
      .from('docs_files')
      .update({
        download_count: ((file['download_count'] as number) ?? 0) + 1,
      })
      .eq('id', fileId)
  }
}

// ===========================================
// GET STORAGE USAGE
// ===========================================

export async function getStorageUsage(organizationId: string): Promise<StorageUsage> {
  const validOrgId = validateOrganizationId(organizationId)
  const supabase = getSupabaseClient() as SupabaseClientAny

  // Get all files with their types and sizes
  const { data: filesData, error: filesError } = await supabase
    .from('docs_files')
    .select('file_size, file_type')
    .eq('organization_id', validOrgId)
    .is('deleted_at', null)

  if (filesError) throw new Error(`Failed to get storage usage: ${filesError.message}`)

  const files = filesData ?? []
  const usedBytes = files.reduce((sum: number, f: Record<string, unknown>) => sum + ((f['file_size'] as number) ?? 0), 0)

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

  files.forEach((f: Record<string, unknown>) => {
    const type = f['file_type'] as string
    if (type && typeCounts[type] !== undefined) {
      typeCounts[type]++
    }
  })

  // Get folder count
  const { count: folderCount } = await supabase
    .from('docs_folders')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', validOrgId)
    .is('deleted_at', null)

  // Default limit: 500MB for free tier
  const defaultLimitBytes = 500 * 1024 * 1024

  const limitBytes = defaultLimitBytes // This should come from module limits
  const percentage = limitBytes > 0 ? Math.round((usedBytes / limitBytes) * 100) : 0

  return {
    usedBytes,
    limitBytes,
    percentage,
    fileCount: files.length,
    folderCount: folderCount ?? 0,
    documentCount: typeCounts['document'] ?? 0,
    imageCount: typeCounts['image'] ?? 0,
    pdfCount: typeCounts['pdf'] ?? 0,
    videoCount: typeCounts['video'] ?? 0,
    audioCount: typeCounts['audio'] ?? 0,
    archiveCount: typeCounts['archive'] ?? 0,
    spreadsheetCount: typeCounts['spreadsheet'] ?? 0,
    presentationCount: typeCounts['presentation'] ?? 0,
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
  const validOrgId = validateOrganizationId(organizationId)
  const { page = 1, pageSize = 20 } = pagination
  const offset = (page - 1) * pageSize

  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error, count } = await supabase
    .from('docs_files')
    .select('*', { count: 'exact' })
    .eq('organization_id', validOrgId)
    .is('deleted_at', null)
    .or(`name.ilike.%${query}%,original_name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw new Error(`Failed to search files: ${error.message}`)

  return {
    data: (data ?? []).map(mapFileFromDb),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapFileFromDb(row: Record<string, unknown>): DocFile {
  return {
    id: row['id'] as string,
    organizationId: row['organization_id'] as string,
    folderId: row['folder_id'] as string | null,
    name: row['name'] as string,
    originalName: (row['original_name'] as string) ?? (row['name'] as string),
    extension: row['extension'] as string | null,
    mimeType: row['mime_type'] as string | null,
    fileType: row['file_type'] as DocFile['fileType'],
    storagePath: row['storage_path'] as string,
    sizeBytes: row['file_size'] as number,
    currentVersion: (row['current_version'] as number) ?? 1,
    isLocked: (row['is_locked'] as boolean) ?? false,
    lockedBy: row['locked_by'] as string | null,
    lockedAt: row['locked_at'] as string | null,
    description: row['description'] as string | null,
    tags: (row['tags'] as string[]) ?? [],
    contentText: row['content_text'] as string | null,
    linkedEntityType: row['linked_entity_type'] as string | null,
    linkedEntityId: row['linked_entity_id'] as string | null,
    downloadCount: (row['download_count'] as number) ?? 0,
    lastAccessedAt: row['last_accessed_at'] as string | null,
    uploadedBy: row['uploaded_by'] as string | null,
    checksum: row['checksum'] as string | null,
    width: row['width'] as number | null,
    height: row['height'] as number | null,
    durationSeconds: row['duration_seconds'] as number | null,
    pageCount: row['page_count'] as number | null,
    previewUrl: row['preview_url'] as string | null,
    canPreview: (row['can_preview'] as boolean) ?? false,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
    deletedAt: row['deleted_at'] as string | null,
  }
}
