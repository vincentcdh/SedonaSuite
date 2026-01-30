// ===========================================
// EMPLOYEE DOCUMENT SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  EmployeeDocument,
  CreateDocumentInput,
  UpdateDocumentInput,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// GET DOCUMENTS BY EMPLOYEE
// ===========================================

export async function getDocumentsByEmployee(
  employeeId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<EmployeeDocument>> {
  const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  const { data, error, count } = await getSupabaseClient()
    .from('hr_employee_documents')
    .select('*', { count: 'exact' })
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  return {
    data: (data || []).map(mapDocumentFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET DOCUMENT BY ID
// ===========================================

export async function getDocumentById(id: string): Promise<EmployeeDocument | null> {
  const { data, error } = await getSupabaseClient()
    .from('hr_employee_documents')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapDocumentFromDb(data)
}

// ===========================================
// CREATE DOCUMENT
// ===========================================

export async function createDocument(
  organizationId: string,
  input: CreateDocumentInput,
  userId?: string
): Promise<EmployeeDocument> {
  const { data, error } = await getSupabaseClient()
    .from('hr_employee_documents')
    .insert({
      organization_id: organizationId,
      employee_id: input.employeeId,
      name: input.name,
      document_type: input.documentType,
      file_url: input.fileUrl,
      file_size: input.fileSize,
      mime_type: input.mimeType,
      valid_from: input.validFrom,
      valid_until: input.validUntil,
      uploaded_by: userId,
      notes: input.notes,
    })
    .select()
    .single()

  if (error) throw error

  return mapDocumentFromDb(data)
}

// ===========================================
// UPDATE DOCUMENT
// ===========================================

export async function updateDocument(input: UpdateDocumentInput): Promise<EmployeeDocument> {
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.documentType !== undefined) updateData.document_type = input.documentType
  if (input.validFrom !== undefined) updateData.valid_from = input.validFrom
  if (input.validUntil !== undefined) updateData.valid_until = input.validUntil
  if (input.notes !== undefined) updateData.notes = input.notes

  const { data, error } = await getSupabaseClient()
    .from('hr_employee_documents')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapDocumentFromDb(data)
}

// ===========================================
// DELETE DOCUMENT
// ===========================================

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('hr_employee_documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET EXPIRING DOCUMENTS
// ===========================================

export async function getExpiringDocuments(
  organizationId: string,
  daysAhead: number = 30
): Promise<(EmployeeDocument & { employee?: { id: string; firstName: string; lastName: string } })[]> {
  const today = new Date()
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000)

  const { data, error } = await getSupabaseClient()
    .from('hr_employee_documents')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('valid_until', 'is', null)
    .gte('valid_until', today.toISOString().split('T')[0])
    .lte('valid_until', futureDate.toISOString().split('T')[0])
    .order('valid_until', { ascending: true })

  if (error) throw error

  // Get employees
  const employeeIds = [...new Set((data || []).map((d: any) => d.employee_id))]

  let employees: any[] = []
  if (employeeIds.length > 0) {
    const { data: employeeData } = await getSupabaseClient()
      .from('hr_employees')
      .select('id, first_name, last_name')
      .in('id', employeeIds)
    employees = employeeData || []
  }

  const employeeMap: Record<string, any> = {}
  employees.forEach((e: any) => {
    employeeMap[e.id] = e
  })

  return (data || []).map((d: any) => ({
    ...mapDocumentFromDb(d),
    employee: employeeMap[d.employee_id]
      ? {
          id: employeeMap[d.employee_id].id,
          firstName: employeeMap[d.employee_id].first_name,
          lastName: employeeMap[d.employee_id].last_name,
        }
      : undefined,
  }))
}

// ===========================================
// HELPERS
// ===========================================

function mapDocumentFromDb(data: any): EmployeeDocument {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    employeeId: data.employee_id as string,
    name: data.name as string,
    documentType: data.document_type as EmployeeDocument['documentType'],
    fileUrl: data.file_url as string,
    fileSize: data.file_size as number | null,
    mimeType: data.mime_type as string | null,
    validFrom: data.valid_from as string | null,
    validUntil: data.valid_until as string | null,
    uploadedBy: data.uploaded_by as string | null,
    notes: data.notes as string | null,
    createdAt: data.created_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
