// ===========================================
// FOLDER SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient, validateOrganizationId } from '@sedona/database'
import { assertDocsFolderLimit } from '@sedona/billing/server'
import type {
  Folder,
  FolderWithChildren,
  FolderBreadcrumb,
  CreateFolderInput,
  UpdateFolderInput,
  PaginatedResult,
  PaginationParams,
} from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = any

// ===========================================
// GET FOLDERS
// ===========================================

export async function getFolders(
  organizationId: string,
  parentId: string | null = null,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Folder>> {
  const validOrgId = validateOrganizationId(organizationId)
  const { page = 1, pageSize = 50, sortBy = 'name', sortOrder = 'asc' } = pagination
  const offset = (page - 1) * pageSize

  const supabase = getSupabaseClient() as SupabaseClientAny
  let query = supabase
    .from('docs_folders')
    .select('*', { count: 'exact' })
    .eq('organization_id', validOrgId)
    .is('deleted_at', null)

  if (parentId === null) {
    query = query.is('parent_id', null)
  } else {
    query = query.eq('parent_id', parentId)
  }

  const sortColumn = sortBy.replace(/([A-Z])/g, '_$1').toLowerCase()
  query = query
    .order(sortColumn, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw new Error(`Failed to fetch folders: ${error.message}`)

  return {
    data: (data ?? []).map(mapFolderFromDb),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

// ===========================================
// GET ALL FOLDERS (TREE)
// ===========================================

export async function getFolderTree(organizationId: string): Promise<FolderWithChildren[]> {
  const validOrgId = validateOrganizationId(organizationId)
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { data, error } = await supabase
    .from('docs_folders')
    .select('*')
    .eq('organization_id', validOrgId)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch folder tree: ${error.message}`)

  const folders = (data ?? []).map(mapFolderFromDb)
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
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('docs_folders')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch folder: ${error.message}`)
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

  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('docs_folders')
    .select('id, name')
    .in('id', pathIds)

  if (error) throw new Error(`Failed to fetch folder breadcrumbs: ${error.message}`)

  // Sort by path order
  const folderMap = new Map<string, string>()
  for (const f of data ?? []) {
    folderMap.set(f['id'] as string, f['name'] as string)
  }
  return pathIds.map((id): FolderBreadcrumb => ({
    id,
    name: folderMap.get(id) ?? 'Unknown',
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
  const validOrgId = validateOrganizationId(organizationId)

  // Check folder limit before creating
  await assertDocsFolderLimit(validOrgId)

  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('docs_folders')
    .insert({
      organization_id: validOrgId,
      name: input.name,
      parent_id: input.parentId ?? null,
      color: input.color ?? null,
      icon: input.icon ?? null,
      created_by: userId ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create folder: ${error.message}`)

  return mapFolderFromDb(data)
}

// ===========================================
// UPDATE FOLDER
// ===========================================

export async function updateFolder(input: UpdateFolderInput): Promise<Folder> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (input.name !== undefined) updateData['name'] = input.name
  if (input.parentId !== undefined) updateData['parent_id'] = input.parentId
  if (input.color !== undefined) updateData['color'] = input.color
  if (input.icon !== undefined) updateData['icon'] = input.icon

  const { data, error } = await supabase
    .from('docs_folders')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update folder: ${error.message}`)

  return mapFolderFromDb(data)
}

// ===========================================
// DELETE FOLDER (SOFT)
// ===========================================

export async function deleteFolder(id: string): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { error } = await supabase
    .from('docs_folders')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`Failed to delete folder: ${error.message}`)
}

// ===========================================
// RESTORE FOLDER
// ===========================================

export async function restoreFolder(id: string): Promise<Folder> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('docs_folders')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to restore folder: ${error.message}`)

  return mapFolderFromDb(data)
}

// ===========================================
// DELETE FOLDER PERMANENTLY
// ===========================================

export async function deleteFolderPermanently(id: string): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { error } = await supabase.from('docs_folders').delete().eq('id', id)

  if (error) throw new Error(`Failed to permanently delete folder: ${error.message}`)
}

// ===========================================
// GET DELETED FOLDERS (TRASH)
// ===========================================

export async function getDeletedFolders(
  organizationId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Folder>> {
  const validOrgId = validateOrganizationId(organizationId)
  const { page = 1, pageSize = 20, sortBy = 'deletedAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  const supabase = getSupabaseClient() as SupabaseClientAny
  const sortColumn = sortBy.replace(/([A-Z])/g, '_$1').toLowerCase()

  const { data, error, count } = await supabase
    .from('docs_folders')
    .select('*', { count: 'exact' })
    .eq('organization_id', validOrgId)
    .not('deleted_at', 'is', null)
    .order(sortColumn, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  if (error) throw new Error(`Failed to fetch deleted folders: ${error.message}`)

  return {
    data: (data ?? []).map(mapFolderFromDb),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

// ===========================================
// GET FOLDER COUNT
// ===========================================

export async function getFolderCount(organizationId: string): Promise<number> {
  const validOrgId = validateOrganizationId(organizationId)
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { count, error } = await supabase
    .from('docs_folders')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', validOrgId)
    .is('deleted_at', null)

  if (error) throw new Error(`Failed to get folder count: ${error.message}`)

  return count ?? 0
}

// ===========================================
// HELPERS
// ===========================================

function mapFolderFromDb(row: Record<string, unknown>): Folder {
  return {
    id: row['id'] as string,
    organizationId: row['organization_id'] as string,
    name: row['name'] as string,
    parentId: row['parent_id'] as string | null,
    path: (row['path'] as string) ?? '',
    depth: (row['depth'] as number) ?? 0,
    color: row['color'] as string | null,
    icon: row['icon'] as string | null,
    totalSizeBytes: (row['total_size_bytes'] as number) ?? 0,
    fileCount: (row['file_count'] as number) ?? 0,
    createdBy: row['created_by'] as string | null,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
    deletedAt: row['deleted_at'] as string | null,
  }
}
