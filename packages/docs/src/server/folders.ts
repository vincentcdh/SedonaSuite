// ===========================================
// FOLDER SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Folder,
  FolderWithChildren,
  FolderBreadcrumb,
  CreateFolderInput,
  UpdateFolderInput,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// GET FOLDERS
// ===========================================

export async function getFolders(
  organizationId: string,
  parentId: string | null = null,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Folder>> {
  const { page = 1, pageSize = 50, sortBy = 'name', sortOrder = 'asc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getSupabaseClient()
    .from('docs_folders')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (parentId === null) {
    query = query.is('parent_id', null)
  } else {
    query = query.eq('parent_id', parentId)
  }

  query = query
    .order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: (data || []).map(mapFolderFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET ALL FOLDERS (TREE)
// ===========================================

export async function getFolderTree(organizationId: string): Promise<FolderWithChildren[]> {
  const { data, error } = await getSupabaseClient()
    .from('docs_folders')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error

  const folders = (data || []).map(mapFolderFromDb)
  return buildFolderTree(folders)
}

function buildFolderTree(folders: Folder[]): FolderWithChildren[] {
  const folderMap = new Map<string, FolderWithChildren>()
  const rootFolders: FolderWithChildren[] = []

  // First pass: create all folder nodes
  folders.forEach((folder) => {
    folderMap.set(folder.id, { ...folder, children: [] })
  })

  // Second pass: build tree structure
  folders.forEach((folder) => {
    const node = folderMap.get(folder.id)!
    if (folder.parentId === null) {
      rootFolders.push(node)
    } else {
      const parent = folderMap.get(folder.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  return rootFolders
}

// ===========================================
// GET FOLDER BY ID
// ===========================================

export async function getFolderById(id: string): Promise<Folder | null> {
  const { data, error } = await getSupabaseClient()
    .from('docs_folders')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapFolderFromDb(data)
}

// ===========================================
// GET FOLDER BREADCRUMBS
// ===========================================

export async function getFolderBreadcrumbs(folderId: string): Promise<FolderBreadcrumb[]> {
  const folder = await getFolderById(folderId)
  if (!folder) return []

  const pathIds = folder.path.split('/').filter(Boolean)
  if (pathIds.length === 0) return []

  const { data, error } = await getSupabaseClient()
    .from('docs_folders')
    .select('id, name')
    .in('id', pathIds)

  if (error) throw error

  // Sort by path order
  const folderMap = new Map((data || []).map((f: any) => [f.id, f.name]))
  return pathIds.map((id) => ({
    id,
    name: folderMap.get(id) || 'Unknown',
  }))
}

// ===========================================
// CREATE FOLDER
// ===========================================

export async function createFolder(
  organizationId: string,
  input: CreateFolderInput,
  userId?: string
): Promise<Folder> {
  const { data, error } = await getSupabaseClient()
    .from('docs_folders')
    .insert({
      organization_id: organizationId,
      name: input.name,
      parent_id: input.parentId || null,
      color: input.color || null,
      icon: input.icon || null,
      created_by: userId || null,
    })
    .select()
    .single()

  if (error) throw error

  return mapFolderFromDb(data)
}

// ===========================================
// UPDATE FOLDER
// ===========================================

export async function updateFolder(input: UpdateFolderInput): Promise<Folder> {
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.parentId !== undefined) updateData.parent_id = input.parentId
  if (input.color !== undefined) updateData.color = input.color
  if (input.icon !== undefined) updateData.icon = input.icon

  const { data, error } = await getSupabaseClient()
    .from('docs_folders')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapFolderFromDb(data)
}

// ===========================================
// DELETE FOLDER (SOFT)
// ===========================================

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('docs_folders')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// RESTORE FOLDER
// ===========================================

export async function restoreFolder(id: string): Promise<Folder> {
  const { data, error } = await getSupabaseClient()
    .from('docs_folders')
    .update({ deleted_at: null })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapFolderFromDb(data)
}

// ===========================================
// DELETE FOLDER PERMANENTLY
// ===========================================

export async function deleteFolderPermanently(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('docs_folders')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET DELETED FOLDERS (TRASH)
// ===========================================

export async function getDeletedFolders(
  organizationId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Folder>> {
  const { page = 1, pageSize = 20, sortBy = 'deletedAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  const { data, error, count } = await getSupabaseClient()
    .from('docs_folders')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .not('deleted_at', 'is', null)
    .order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  return {
    data: (data || []).map(mapFolderFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET FOLDER COUNT
// ===========================================

export async function getFolderCount(organizationId: string): Promise<number> {
  const { count, error } = await getSupabaseClient()
    .from('docs_folders')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (error) throw error

  return count || 0
}

// ===========================================
// HELPERS
// ===========================================

function mapFolderFromDb(data: any): Folder {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    parentId: data.parent_id as string | null,
    path: data.path as string,
    depth: data.depth as number,
    color: data.color as string | null,
    icon: data.icon as string | null,
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
