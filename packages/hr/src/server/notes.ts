// ===========================================
// EMPLOYEE NOTES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  EmployeeNote,
  EmployeeNoteWithAuthor,
  CreateEmployeeNoteInput,
  UpdateEmployeeNoteInput,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// GET NOTES BY EMPLOYEE
// ===========================================

export async function getNotesByEmployee(
  employeeId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<EmployeeNoteWithAuthor>> {
  const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  const { data, error, count } = await getSupabaseClient()
    .from('hr_employee_notes')
    .select('*', { count: 'exact' })
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  // Get authors
  const authorIds = [...new Set((data || []).filter((n: any) => n.created_by).map((n: any) => n.created_by))]

  let authors: any[] = []
  if (authorIds.length > 0) {
    const { data: authorData } = await getSupabaseClient()
      .from('users')
      .select('id, email, full_name')
      .in('id', authorIds)
    authors = authorData || []
  }

  const authorMap: Record<string, any> = {}
  authors.forEach((a: any) => {
    authorMap[a.id] = a
  })

  return {
    data: (data || []).map((n: any) => ({
      ...mapNoteFromDb(n),
      author: n.created_by && authorMap[n.created_by]
        ? {
            id: authorMap[n.created_by].id,
            email: authorMap[n.created_by].email,
            fullName: authorMap[n.created_by].full_name,
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
// GET NOTE BY ID
// ===========================================

export async function getNoteById(id: string): Promise<EmployeeNoteWithAuthor | null> {
  const { data, error } = await getSupabaseClient()
    .from('hr_employee_notes')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const note = mapNoteFromDb(data)

  // Get author
  let author: { id: string; email: string; fullName: string | null } | undefined = undefined
  if (note.createdBy) {
    const { data: authorData } = await getSupabaseClient()
      .from('users')
      .select('id, email, full_name')
      .eq('id', note.createdBy)
      .single()

    const userData = authorData as { id: string; email: string; full_name: string | null } | null
    if (userData) {
      author = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
      }
    }
  }

  return {
    ...note,
    author,
  }
}

// ===========================================
// CREATE NOTE
// ===========================================

export async function createNote(
  organizationId: string,
  input: CreateEmployeeNoteInput,
  userId?: string
): Promise<EmployeeNote> {
  const { data, error } = await getSupabaseClient()
    .from('hr_employee_notes')
    .insert({
      organization_id: organizationId,
      employee_id: input.employeeId,
      title: input.title,
      content: input.content,
      is_private: input.isPrivate || false,
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  return mapNoteFromDb(data)
}

// ===========================================
// UPDATE NOTE
// ===========================================

export async function updateNote(input: UpdateEmployeeNoteInput): Promise<EmployeeNote> {
  const updateData: any = {}

  if (input.title !== undefined) updateData.title = input.title
  if (input.content !== undefined) updateData.content = input.content
  if (input.isPrivate !== undefined) updateData.is_private = input.isPrivate

  const { data, error } = await getSupabaseClient()
    .from('hr_employee_notes')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapNoteFromDb(data)
}

// ===========================================
// DELETE NOTE
// ===========================================

export async function deleteNote(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('hr_employee_notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// HELPERS
// ===========================================

function mapNoteFromDb(data: any): EmployeeNote {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    employeeId: data.employee_id as string,
    title: data.title as string | null,
    content: data.content as string,
    isPrivate: (data.is_private as boolean) || false,
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
