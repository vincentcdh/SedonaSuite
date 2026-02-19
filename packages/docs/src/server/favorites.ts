// ===========================================
// FAVORITES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  DocFile,
  Folder,
  Favorite,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// GET FAVORITES
// ===========================================

export async function getFavorites(
  userId: string,
  pagination: PaginationParams = {}
): Promise<{ files: DocFile[]; folders: Folder[] }> {
  // Get favorite file IDs
  const { data: fileFavorites } = await getSupabaseClient()
    .from('docs_favorites')
    .select('file_id')
    .eq('user_id', userId)
    .not('file_id', 'is', null)
    .order('created_at', { ascending: false })

  // Get favorite folder IDs
  const { data: folderFavorites } = await getSupabaseClient()
    .from('docs_favorites')
    .select('folder_id')
    .eq('user_id', userId)
    .not('folder_id', 'is', null)
    .order('created_at', { ascending: false })

  const fileIds = (fileFavorites || []).map((f: any) => f.file_id)
  const folderIds = (folderFavorites || []).map((f: any) => f.folder_id)

  let files: DocFile[] = []
  let folders: Folder[] = []

  if (fileIds.length > 0) {
    const { data: filesData } = await getSupabaseClient()
      .from('docs_files')
      .select('*')
      .in('id', fileIds)
      .is('deleted_at', null)

    files = (filesData || []).map(mapFileFromDb)
  }

  if (folderIds.length > 0) {
    const { data: foldersData } = await getSupabaseClient()
      .from('docs_folders')
      .select('*')
      .in('id', folderIds)
      .is('deleted_at', null)

    folders = (foldersData || []).map(mapFolderFromDb)
  }

  return { files, folders }
}

// ===========================================
// ADD TO FAVORITES
// ===========================================

export async function addFileToFavorites(userId: string, fileId: string): Promise<Favorite> {
  const { data, error } = await getSupabaseClient()
    .from('docs_favorites')
    .insert({
      user_id: userId,
      file_id: fileId,
    })
    .select()
    .single()

  if (error) throw error

  return mapFavoriteFromDb(data)
}

export async function addFolderToFavorites(userId: string, folderId: string): Promise<Favorite> {
  const { data, error } = await getSupabaseClient()
    .from('docs_favorites')
    .insert({
      user_id: userId,
      folder_id: folderId,
    })
    .select()
    .single()

  if (error) throw error

  return mapFavoriteFromDb(data)
}

// ===========================================
// REMOVE FROM FAVORITES
// ===========================================

export async function removeFileFromFavorites(userId: string, fileId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('docs_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('file_id', fileId)

  if (error) throw error
}

export async function removeFolderFromFavorites(userId: string, folderId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('docs_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('folder_id', folderId)

  if (error) throw error
}

// ===========================================
// CHECK IF FAVORITE
// ===========================================

export async function isFileFavorite(userId: string, fileId: string): Promise<boolean> {
  const { count } = await getSupabaseClient()
    .from('docs_favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('file_id', fileId)

  return (count || 0) > 0
}

export async function isFolderFavorite(userId: string, folderId: string): Promise<boolean> {
  const { count } = await getSupabaseClient()
    .from('docs_favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('folder_id', folderId)

  return (count || 0) > 0
}

// ===========================================
// HELPERS
// ===========================================

function mapFavoriteFromDb(data: any): Favorite {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    fileId: data.file_id as string | null,
    folderId: data.folder_id as string | null,
    createdAt: data.created_at as string,
  }
}

function mapFileFromDb(data: any): DocFile {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    folderId: data.folder_id as string | null,
    name: data.name as string,
    originalName: (data.original_name as string) ?? (data.name as string),
    extension: data.extension as string | null,
    mimeType: data.mime_type as string | null,
    fileType: data.file_type as DocFile['fileType'],
    storagePath: data.storage_path as string,
    sizeBytes: (data.file_size as number) ?? (data.size_bytes as number) ?? 0,
    currentVersion: (data.current_version as number) ?? 1,
    isLocked: (data.is_locked as boolean) ?? false,
    lockedBy: data.locked_by as string | null,
    lockedAt: data.locked_at as string | null,
    description: data.description as string | null,
    tags: (data.tags as string[]) || [],
    contentText: data.content_text as string | null,
    linkedEntityType: data.linked_entity_type as string | null,
    linkedEntityId: data.linked_entity_id as string | null,
    downloadCount: (data.download_count as number) ?? 0,
    lastAccessedAt: data.last_accessed_at as string | null,
    uploadedBy: data.uploaded_by as string | null,
    checksum: data.checksum as string | null,
    width: data.width as number | null,
    height: data.height as number | null,
    durationSeconds: data.duration_seconds as number | null,
    pageCount: data.page_count as number | null,
    previewUrl: data.preview_url as string | null,
    canPreview: (data.can_preview as boolean) ?? false,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function mapFolderFromDb(data: any): Folder {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    parentId: data.parent_id as string | null,
    path: (data.path as string) ?? '',
    depth: (data.depth as number) ?? 0,
    color: data.color as string | null,
    icon: data.icon as string | null,
    totalSizeBytes: (data.total_size_bytes as number) ?? 0,
    fileCount: (data.file_count as number) ?? 0,
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}
