// ===========================================
// ACTIVITY SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  ActivityLog,
  ActivityLogWithRelations,
  ActivityFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

function getDocsClient() {
  return getSupabaseClient().schema('docs' as any) as any
}

// ===========================================
// GET ACTIVITY LOG
// ===========================================

export async function getActivityLog(
  organizationId: string,
  filters: ActivityFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<ActivityLogWithRelations>> {
  const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getDocsClient()
    .from('activity_log')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)

  // Apply filters
  if (filters.action) {
    if (Array.isArray(filters.action)) {
      query = query.in('action', filters.action)
    } else {
      query = query.eq('action', filters.action)
    }
  }

  if (filters.fileId) {
    query = query.eq('file_id', filters.fileId)
  }

  if (filters.folderId) {
    query = query.eq('folder_id', filters.folderId)
  }

  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get users
  const userIds = [...new Set((data || []).filter((a: any) => a.user_id).map((a: any) => a.user_id))]

  let users: any[] = []
  if (userIds.length > 0) {
    const { data: userData } = await getSupabaseClient()
      .from('users')
      .select('id, email, full_name')
      .in('id', userIds)
    users = (userData || []) as any[]
  }

  const userMap: Record<string, any> = {}
  users.forEach((u: any) => {
    userMap[u.id] = u
  })

  // Get files
  const fileIds = [...new Set((data || []).filter((a: any) => a.file_id).map((a: any) => a.file_id))]

  let files: any[] = []
  if (fileIds.length > 0) {
    const { data: fileData } = await getDocsClient()
      .from('files')
      .select('id, name, file_type')
      .in('id', fileIds)
    files = fileData || []
  }

  const fileMap: Record<string, any> = {}
  files.forEach((f: any) => {
    fileMap[f.id] = f
  })

  // Get folders
  const folderIds = [...new Set((data || []).filter((a: any) => a.folder_id).map((a: any) => a.folder_id))]

  let folders: any[] = []
  if (folderIds.length > 0) {
    const { data: folderData } = await getDocsClient()
      .from('folders')
      .select('id, name')
      .in('id', folderIds)
    folders = folderData || []
  }

  const folderMap: Record<string, any> = {}
  folders.forEach((f: any) => {
    folderMap[f.id] = f
  })

  return {
    data: (data || []).map((a: any) => ({
      ...mapActivityFromDb(a),
      user: a.user_id && userMap[a.user_id]
        ? {
            id: userMap[a.user_id].id,
            email: userMap[a.user_id].email,
            fullName: userMap[a.user_id].full_name,
          }
        : undefined,
      file: a.file_id && fileMap[a.file_id]
        ? {
            id: fileMap[a.file_id].id,
            name: fileMap[a.file_id].name,
            fileType: fileMap[a.file_id].file_type,
          }
        : undefined,
      folder: a.folder_id && folderMap[a.folder_id]
        ? {
            id: folderMap[a.folder_id].id,
            name: folderMap[a.folder_id].name,
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
// GET FILE ACTIVITY
// ===========================================

export async function getFileActivity(
  fileId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<ActivityLogWithRelations>> {
  const { page = 1, pageSize = 20 } = pagination
  const offset = (page - 1) * pageSize

  const { data, error, count } = await getDocsClient()
    .from('activity_log')
    .select('*', { count: 'exact' })
    .eq('file_id', fileId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  // Get users
  const userIds = [...new Set((data || []).filter((a: any) => a.user_id).map((a: any) => a.user_id))]

  let users: any[] = []
  if (userIds.length > 0) {
    const { data: userData } = await getSupabaseClient()
      .from('users')
      .select('id, email, full_name')
      .in('id', userIds)
    users = (userData || []) as any[]
  }

  const userMap: Record<string, any> = {}
  users.forEach((u: any) => {
    userMap[u.id] = u
  })

  return {
    data: (data || []).map((a: any) => ({
      ...mapActivityFromDb(a),
      user: a.user_id && userMap[a.user_id]
        ? {
            id: userMap[a.user_id].id,
            email: userMap[a.user_id].email,
            fullName: userMap[a.user_id].full_name,
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
// LOG DOWNLOAD
// ===========================================

export async function logDownload(
  organizationId: string,
  fileId: string,
  userId?: string
): Promise<void> {
  await getDocsClient()
    .from('activity_log')
    .insert({
      organization_id: organizationId,
      action: 'downloaded',
      file_id: fileId,
      user_id: userId || null,
    })
}

// ===========================================
// HELPERS
// ===========================================

function mapActivityFromDb(data: any): ActivityLog {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    action: data.action as ActivityLog['action'],
    fileId: data.file_id as string | null,
    folderId: data.folder_id as string | null,
    details: data.details as Record<string, unknown> | null,
    userId: data.user_id as string | null,
    createdAt: data.created_at as string,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
