// ===========================================
// TIME ENTRY SERVER FUNCTIONS (PRO)
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  TimeEntry,
  TimeEntryWithRelations,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimeEntryFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

function getHrClient() {
  return getSupabaseClient().schema('hr' as any) as any
}

// ===========================================
// GET TIME ENTRIES
// ===========================================

export async function getTimeEntries(
  organizationId: string,
  filters: TimeEntryFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<TimeEntryWithRelations>> {
  const { page = 1, pageSize = 20, sortBy = 'date', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getHrClient()
    .from('time_entries')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)

  // Apply filters
  if (filters.employeeId) {
    query = query.eq('employee_id', filters.employeeId)
  }
  if (filters.dateFrom) {
    query = query.gte('date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('date', filters.dateTo)
  }
  if (filters.validated !== undefined) {
    if (filters.validated) {
      query = query.not('validated_at', 'is', null)
    } else {
      query = query.is('validated_at', null)
    }
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get related data
  const employeeIds = [...new Set((data || []).map((e: any) => e.employee_id))]
  const validatorIds = [...new Set((data || []).filter((e: any) => e.validated_by).map((e: any) => e.validated_by))]

  const [employees, validators] = await Promise.all([
    employeeIds.length > 0
      ? getHrClient().from('employees').select('id, first_name, last_name, photo_url').in('id', employeeIds)
      : { data: [] },
    validatorIds.length > 0
      ? getSupabaseClient().from('users').select('id, email, full_name').in('id', validatorIds)
      : { data: [] },
  ])

  const employeeMap: Record<string, any> = {}
  ;(employees.data || []).forEach((e: any) => {
    employeeMap[e.id] = e
  })

  const validatorMap: Record<string, any> = {}
  ;(validators.data || []).forEach((v: any) => {
    validatorMap[v.id] = v
  })

  return {
    data: (data || []).map((e: any) => ({
      ...mapTimeEntryFromDb(e),
      employee: employeeMap[e.employee_id]
        ? {
            id: employeeMap[e.employee_id].id,
            firstName: employeeMap[e.employee_id].first_name,
            lastName: employeeMap[e.employee_id].last_name,
            photoUrl: employeeMap[e.employee_id].photo_url,
          }
        : undefined,
      validator: e.validated_by && validatorMap[e.validated_by]
        ? {
            id: validatorMap[e.validated_by].id,
            email: validatorMap[e.validated_by].email,
            fullName: validatorMap[e.validated_by].full_name,
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
// GET TIME ENTRIES BY EMPLOYEE
// ===========================================

export async function getTimeEntriesByEmployee(
  employeeId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<TimeEntry[]> {
  let query = getHrClient()
    .from('time_entries')
    .select('*')
    .eq('employee_id', employeeId)

  if (dateFrom) {
    query = query.gte('date', dateFrom)
  }
  if (dateTo) {
    query = query.lte('date', dateTo)
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) throw error

  return (data || []).map(mapTimeEntryFromDb)
}

// ===========================================
// GET TIME ENTRY BY ID
// ===========================================

export async function getTimeEntryById(id: string): Promise<TimeEntryWithRelations | null> {
  const { data, error } = await getHrClient()
    .from('time_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const entry = mapTimeEntryFromDb(data)

  // Get employee data
  const { data: employeeData } = await getHrClient()
    .from('employees')
    .select('id, first_name, last_name, photo_url')
    .eq('id', entry.employeeId)
    .single()

  // Get validator data if exists
  let validatorData: { id: string; email: string; full_name: string | null } | null = null
  if (entry.validatedBy) {
    const { data } = await getSupabaseClient()
      .from('users')
      .select('id, email, full_name')
      .eq('id', entry.validatedBy)
      .single()
    validatorData = data as { id: string; email: string; full_name: string | null } | null
  }

  return {
    ...entry,
    employee: employeeData
      ? {
          id: employeeData.id,
          firstName: employeeData.first_name,
          lastName: employeeData.last_name,
          photoUrl: employeeData.photo_url,
        }
      : undefined,
    validator: validatorData
      ? {
          id: validatorData.id,
          email: validatorData.email,
          fullName: validatorData.full_name,
        }
      : undefined,
  }
}

// ===========================================
// GET TIME ENTRY BY DATE
// ===========================================

export async function getTimeEntryByDate(employeeId: string, date: string): Promise<TimeEntry | null> {
  const { data, error } = await getHrClient()
    .from('time_entries')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', date)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapTimeEntryFromDb(data)
}

// ===========================================
// CREATE TIME ENTRY
// ===========================================

export async function createTimeEntry(
  organizationId: string,
  input: CreateTimeEntryInput
): Promise<TimeEntry> {
  const { data, error } = await getHrClient()
    .from('time_entries')
    .insert({
      organization_id: organizationId,
      employee_id: input.employeeId,
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      break_duration_minutes: input.breakDurationMinutes || 0,
      hours_worked: input.hoursWorked,
      overtime_hours: input.overtimeHours || 0,
      notes: input.notes,
    })
    .select()
    .single()

  if (error) throw error

  return mapTimeEntryFromDb(data)
}

// ===========================================
// UPDATE TIME ENTRY
// ===========================================

export async function updateTimeEntry(input: UpdateTimeEntryInput): Promise<TimeEntry> {
  const updateData: any = {}

  if (input.date !== undefined) updateData.date = input.date
  if (input.startTime !== undefined) updateData.start_time = input.startTime
  if (input.endTime !== undefined) updateData.end_time = input.endTime
  if (input.breakDurationMinutes !== undefined) updateData.break_duration_minutes = input.breakDurationMinutes
  if (input.hoursWorked !== undefined) updateData.hours_worked = input.hoursWorked
  if (input.overtimeHours !== undefined) updateData.overtime_hours = input.overtimeHours
  if (input.notes !== undefined) updateData.notes = input.notes

  const { data, error } = await getHrClient()
    .from('time_entries')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapTimeEntryFromDb(data)
}

// ===========================================
// VALIDATE TIME ENTRY
// ===========================================

export async function validateTimeEntry(id: string, userId: string): Promise<TimeEntry> {
  const { data, error } = await getHrClient()
    .from('time_entries')
    .update({
      validated_by: userId,
      validated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapTimeEntryFromDb(data)
}

// ===========================================
// UNVALIDATE TIME ENTRY
// ===========================================

export async function unvalidateTimeEntry(id: string): Promise<TimeEntry> {
  const { data, error } = await getHrClient()
    .from('time_entries')
    .update({
      validated_by: null,
      validated_at: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapTimeEntryFromDb(data)
}

// ===========================================
// DELETE TIME ENTRY
// ===========================================

export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await getHrClient()
    .from('time_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET WEEKLY SUMMARY
// ===========================================

export async function getWeeklySummary(
  employeeId: string,
  weekStartDate: string
): Promise<{
  totalHours: number
  totalOvertimeHours: number
  entriesCount: number
  validatedCount: number
}> {
  // Calculate week end date
  const startDate = new Date(weekStartDate)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const { data, error } = await getHrClient()
    .from('time_entries')
    .select('hours_worked, overtime_hours, validated_at')
    .eq('employee_id', employeeId)
    .gte('date', weekStartDate)
    .lte('date', endDate.toISOString().split('T')[0])

  if (error) throw error

  const entries = data || []

  return {
    totalHours: entries.reduce((sum: number, e: any) => sum + (e.hours_worked || 0), 0),
    totalOvertimeHours: entries.reduce((sum: number, e: any) => sum + (e.overtime_hours || 0), 0),
    entriesCount: entries.length,
    validatedCount: entries.filter((e: any) => e.validated_at).length,
  }
}

// ===========================================
// GET MONTHLY SUMMARY
// ===========================================

export async function getMonthlySummary(
  employeeId: string,
  year: number,
  month: number
): Promise<{
  totalHours: number
  totalOvertimeHours: number
  workingDays: number
  validatedDays: number
}> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of month

  const { data, error } = await getHrClient()
    .from('time_entries')
    .select('hours_worked, overtime_hours, validated_at')
    .eq('employee_id', employeeId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])

  if (error) throw error

  const entries = data || []

  return {
    totalHours: entries.reduce((sum: number, e: any) => sum + (e.hours_worked || 0), 0),
    totalOvertimeHours: entries.reduce((sum: number, e: any) => sum + (e.overtime_hours || 0), 0),
    workingDays: entries.length,
    validatedDays: entries.filter((e: any) => e.validated_at).length,
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapTimeEntryFromDb(data: any): TimeEntry {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    employeeId: data.employee_id as string,
    date: data.date as string,
    startTime: data.start_time as string | null,
    endTime: data.end_time as string | null,
    breakDurationMinutes: (data.break_duration_minutes as number) || 0,
    hoursWorked: (data.hours_worked as number) || 0,
    overtimeHours: (data.overtime_hours as number) || 0,
    notes: data.notes as string | null,
    validatedBy: data.validated_by as string | null,
    validatedAt: data.validated_at as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
