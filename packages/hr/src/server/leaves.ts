// ===========================================
// LEAVE SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  LeaveType,
  CreateLeaveTypeInput,
  UpdateLeaveTypeInput,
  LeaveRequest,
  LeaveRequestWithRelations,
  CreateLeaveRequestInput,
  UpdateLeaveRequestInput,
  ApproveLeaveRequestInput,
  RejectLeaveRequestInput,
  LeaveRequestFilters,
  Absence,
  AbsenceWithRelations,
  CreateAbsenceInput,
  UpdateAbsenceInput,
  AbsenceFilters,
  PaginatedResult,
  PaginationParams,
  LeaveBalance,
} from '../types'

function getHrClient() {
  return getSupabaseClient().schema('hr' as any) as any
}

// ===========================================
// LEAVE TYPES
// ===========================================

export async function getLeaveTypes(organizationId: string): Promise<LeaveType[]> {
  const { data, error } = await getHrClient()
    .from('leave_types')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) throw error

  return (data || []).map(mapLeaveTypeFromDb)
}

export async function getLeaveTypeById(id: string): Promise<LeaveType | null> {
  const { data, error } = await getHrClient()
    .from('leave_types')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapLeaveTypeFromDb(data)
}

export async function createLeaveType(
  organizationId: string,
  input: CreateLeaveTypeInput
): Promise<LeaveType> {
  const { data, error } = await getHrClient()
    .from('leave_types')
    .insert({
      organization_id: organizationId,
      name: input.name,
      code: input.code,
      color: input.color || '#0c82d6',
      is_paid: input.isPaid ?? true,
      requires_approval: input.requiresApproval ?? true,
      deducts_from_balance: input.deductsFromBalance ?? true,
      is_system: false,
    })
    .select()
    .single()

  if (error) throw error

  return mapLeaveTypeFromDb(data)
}

export async function updateLeaveType(input: UpdateLeaveTypeInput): Promise<LeaveType> {
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.code !== undefined) updateData.code = input.code
  if (input.color !== undefined) updateData.color = input.color
  if (input.isPaid !== undefined) updateData.is_paid = input.isPaid
  if (input.requiresApproval !== undefined) updateData.requires_approval = input.requiresApproval
  if (input.deductsFromBalance !== undefined) updateData.deducts_from_balance = input.deductsFromBalance

  const { data, error } = await getHrClient()
    .from('leave_types')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapLeaveTypeFromDb(data)
}

export async function deleteLeaveType(id: string): Promise<void> {
  const { error } = await getHrClient()
    .from('leave_types')
    .delete()
    .eq('id', id)
    .eq('is_system', false)

  if (error) throw error
}

// ===========================================
// LEAVE REQUESTS
// ===========================================

export async function getLeaveRequests(
  organizationId: string,
  filters: LeaveRequestFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<LeaveRequestWithRelations>> {
  const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getHrClient()
    .from('leave_requests')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filters.employeeId) {
    query = query.eq('employee_id', filters.employeeId)
  }
  if (filters.leaveTypeId) {
    query = query.eq('leave_type_id', filters.leaveTypeId)
  }
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }
  if (filters.startDateFrom) {
    query = query.gte('start_date', filters.startDateFrom)
  }
  if (filters.startDateTo) {
    query = query.lte('start_date', filters.startDateTo)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get related data
  const employeeIds = [...new Set((data || []).map((r: any) => r.employee_id))]
  const leaveTypeIds = [...new Set((data || []).map((r: any) => r.leave_type_id))]
  const approverIds = [...new Set((data || []).filter((r: any) => r.approved_by).map((r: any) => r.approved_by))]

  const [employees, leaveTypes, approvers] = await Promise.all([
    employeeIds.length > 0
      ? getHrClient().from('employees').select('id, first_name, last_name, photo_url').in('id', employeeIds)
      : { data: [] },
    leaveTypeIds.length > 0
      ? getHrClient().from('leave_types').select('*').in('id', leaveTypeIds)
      : { data: [] },
    approverIds.length > 0
      ? getSupabaseClient().from('users').select('id, email, full_name').in('id', approverIds)
      : { data: [] },
  ])

  const employeeMap: Record<string, any> = {}
  ;(employees.data || []).forEach((e: any) => {
    employeeMap[e.id] = e
  })

  const leaveTypeMap: Record<string, any> = {}
  ;(leaveTypes.data || []).forEach((t: any) => {
    leaveTypeMap[t.id] = t
  })

  const approverMap: Record<string, any> = {}
  ;(approvers.data || []).forEach((a: any) => {
    approverMap[a.id] = a
  })

  return {
    data: (data || []).map((r: any) => ({
      ...mapLeaveRequestFromDb(r),
      employee: employeeMap[r.employee_id]
        ? {
            id: employeeMap[r.employee_id].id,
            firstName: employeeMap[r.employee_id].first_name,
            lastName: employeeMap[r.employee_id].last_name,
            photoUrl: employeeMap[r.employee_id].photo_url,
          }
        : undefined,
      leaveType: leaveTypeMap[r.leave_type_id]
        ? mapLeaveTypeFromDb(leaveTypeMap[r.leave_type_id])
        : undefined,
      approver: r.approved_by && approverMap[r.approved_by]
        ? {
            id: approverMap[r.approved_by].id,
            email: approverMap[r.approved_by].email,
            fullName: approverMap[r.approved_by].full_name,
          }
        : undefined,
    })),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export async function getLeaveRequestById(id: string): Promise<LeaveRequestWithRelations | null> {
  const { data, error } = await getHrClient()
    .from('leave_requests')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const request = mapLeaveRequestFromDb(data)

  // Get related data
  const [employeeResult, leaveTypeResult] = await Promise.all([
    getHrClient()
      .from('employees')
      .select('id, first_name, last_name, photo_url')
      .eq('id', request.employeeId)
      .single(),
    getHrClient()
      .from('leave_types')
      .select('*')
      .eq('id', request.leaveTypeId)
      .single(),
  ])

  let approverData: { id: string; email: string; full_name: string | null } | null = null
  if (request.approvedBy) {
    const { data } = await getSupabaseClient()
      .from('users')
      .select('id, email, full_name')
      .eq('id', request.approvedBy)
      .single()
    approverData = data as { id: string; email: string; full_name: string | null } | null
  }

  return {
    ...request,
    employee: employeeResult.data
      ? {
          id: employeeResult.data.id,
          firstName: employeeResult.data.first_name,
          lastName: employeeResult.data.last_name,
          photoUrl: employeeResult.data.photo_url,
        }
      : undefined,
    leaveType: leaveTypeResult.data
      ? mapLeaveTypeFromDb(leaveTypeResult.data)
      : undefined,
    approver: approverData
      ? {
          id: approverData.id,
          email: approverData.email,
          fullName: approverData.full_name,
        }
      : undefined,
  }
}

export async function createLeaveRequest(
  organizationId: string,
  input: CreateLeaveRequestInput,
  userId?: string
): Promise<LeaveRequest> {
  const { data, error } = await getHrClient()
    .from('leave_requests')
    .insert({
      organization_id: organizationId,
      employee_id: input.employeeId,
      leave_type_id: input.leaveTypeId,
      start_date: input.startDate,
      end_date: input.endDate,
      start_half_day: input.startHalfDay || false,
      end_half_day: input.endHalfDay || false,
      days_count: 0, // Will be calculated by trigger
      reason: input.reason,
      status: 'pending',
      requested_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  return mapLeaveRequestFromDb(data)
}

export async function updateLeaveRequest(input: UpdateLeaveRequestInput): Promise<LeaveRequest> {
  const updateData: any = {}

  if (input.startDate !== undefined) updateData.start_date = input.startDate
  if (input.endDate !== undefined) updateData.end_date = input.endDate
  if (input.startHalfDay !== undefined) updateData.start_half_day = input.startHalfDay
  if (input.endHalfDay !== undefined) updateData.end_half_day = input.endHalfDay
  if (input.reason !== undefined) updateData.reason = input.reason

  const { data, error } = await getHrClient()
    .from('leave_requests')
    .update(updateData)
    .eq('id', input.id)
    .eq('status', 'pending') // Can only update pending requests
    .select()
    .single()

  if (error) throw error

  return mapLeaveRequestFromDb(data)
}

export async function approveLeaveRequest(
  input: ApproveLeaveRequestInput,
  userId: string
): Promise<LeaveRequest> {
  const { data, error } = await getHrClient()
    .from('leave_requests')
    .update({
      status: 'approved',
      approved_by: userId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw error

  // Deduct from employee balance if applicable
  const request = mapLeaveRequestFromDb(data)
  const leaveType = await getLeaveTypeById(request.leaveTypeId)

  if (leaveType?.deductsFromBalance) {
    // Get current employee balance and deduct
    const { data: employee } = await getHrClient()
      .from('employees')
      .select('annual_leave_balance, rtt_balance')
      .eq('id', request.employeeId)
      .single()

    if (employee) {
      const updateData: any = {}
      if (leaveType.code === 'cp' || leaveType.code === 'annual') {
        updateData.annual_leave_balance = Math.max(0, employee.annual_leave_balance - request.daysCount)
      } else if (leaveType.code === 'rtt') {
        updateData.rtt_balance = Math.max(0, employee.rtt_balance - request.daysCount)
      }

      if (Object.keys(updateData).length > 0) {
        await getHrClient()
          .from('employees')
          .update(updateData)
          .eq('id', request.employeeId)
      }
    }
  }

  return request
}

export async function rejectLeaveRequest(
  input: RejectLeaveRequestInput,
  userId: string
): Promise<LeaveRequest> {
  const { data, error } = await getHrClient()
    .from('leave_requests')
    .update({
      status: 'rejected',
      approved_by: userId,
      approved_at: new Date().toISOString(),
      rejection_reason: input.rejectionReason,
    })
    .eq('id', input.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw error

  return mapLeaveRequestFromDb(data)
}

export async function cancelLeaveRequest(id: string): Promise<LeaveRequest> {
  // Get the request first to check if we need to restore balance
  const request = await getLeaveRequestById(id)
  if (!request) throw new Error('Leave request not found')

  const { data, error } = await getHrClient()
    .from('leave_requests')
    .update({
      status: 'canceled',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Restore balance if the request was approved
  if (request.status === 'approved' && request.leaveType?.deductsFromBalance) {
    const { data: employee } = await getHrClient()
      .from('employees')
      .select('annual_leave_balance, rtt_balance')
      .eq('id', request.employeeId)
      .single()

    if (employee) {
      const updateData: any = {}
      if (request.leaveType.code === 'cp' || request.leaveType.code === 'annual') {
        updateData.annual_leave_balance = employee.annual_leave_balance + request.daysCount
      } else if (request.leaveType.code === 'rtt') {
        updateData.rtt_balance = employee.rtt_balance + request.daysCount
      }

      if (Object.keys(updateData).length > 0) {
        await getHrClient()
          .from('employees')
          .update(updateData)
          .eq('id', request.employeeId)
      }
    }
  }

  return mapLeaveRequestFromDb(data)
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  const { error } = await getHrClient()
    .from('leave_requests')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// ABSENCES
// ===========================================

export async function getAbsences(
  organizationId: string,
  filters: AbsenceFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<AbsenceWithRelations>> {
  const { page = 1, pageSize = 20, sortBy = 'startDate', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getHrClient()
    .from('absences')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filters.employeeId) {
    query = query.eq('employee_id', filters.employeeId)
  }
  if (filters.leaveTypeId) {
    query = query.eq('leave_type_id', filters.leaveTypeId)
  }
  if (filters.startDateFrom) {
    query = query.gte('start_date', filters.startDateFrom)
  }
  if (filters.startDateTo) {
    query = query.lte('start_date', filters.startDateTo)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get related data
  const employeeIds = [...new Set((data || []).map((a: any) => a.employee_id))]
  const leaveTypeIds = [...new Set((data || []).map((a: any) => a.leave_type_id))]

  const [employees, leaveTypes] = await Promise.all([
    employeeIds.length > 0
      ? getHrClient().from('employees').select('id, first_name, last_name, photo_url').in('id', employeeIds)
      : { data: [] },
    leaveTypeIds.length > 0
      ? getHrClient().from('leave_types').select('*').in('id', leaveTypeIds)
      : { data: [] },
  ])

  const employeeMap: Record<string, any> = {}
  ;(employees.data || []).forEach((e: any) => {
    employeeMap[e.id] = e
  })

  const leaveTypeMap: Record<string, any> = {}
  ;(leaveTypes.data || []).forEach((t: any) => {
    leaveTypeMap[t.id] = t
  })

  return {
    data: (data || []).map((a: any) => ({
      ...mapAbsenceFromDb(a),
      employee: employeeMap[a.employee_id]
        ? {
            id: employeeMap[a.employee_id].id,
            firstName: employeeMap[a.employee_id].first_name,
            lastName: employeeMap[a.employee_id].last_name,
            photoUrl: employeeMap[a.employee_id].photo_url,
          }
        : undefined,
      leaveType: leaveTypeMap[a.leave_type_id]
        ? mapLeaveTypeFromDb(leaveTypeMap[a.leave_type_id])
        : undefined,
    })),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export async function getAbsenceById(id: string): Promise<AbsenceWithRelations | null> {
  const { data, error } = await getHrClient()
    .from('absences')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const absence = mapAbsenceFromDb(data)

  // Get related data
  const [employeeResult, leaveTypeResult] = await Promise.all([
    getHrClient()
      .from('employees')
      .select('id, first_name, last_name, photo_url')
      .eq('id', absence.employeeId)
      .single(),
    getHrClient()
      .from('leave_types')
      .select('*')
      .eq('id', absence.leaveTypeId)
      .single(),
  ])

  return {
    ...absence,
    employee: employeeResult.data
      ? {
          id: employeeResult.data.id,
          firstName: employeeResult.data.first_name,
          lastName: employeeResult.data.last_name,
          photoUrl: employeeResult.data.photo_url,
        }
      : undefined,
    leaveType: leaveTypeResult.data
      ? mapLeaveTypeFromDb(leaveTypeResult.data)
      : undefined,
  }
}

export async function createAbsence(
  organizationId: string,
  input: CreateAbsenceInput,
  userId?: string
): Promise<Absence> {
  // Calculate days count
  const startDate = new Date(input.startDate)
  const endDate = new Date(input.endDate)
  const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const { data, error } = await getHrClient()
    .from('absences')
    .insert({
      organization_id: organizationId,
      employee_id: input.employeeId,
      leave_type_id: input.leaveTypeId,
      start_date: input.startDate,
      end_date: input.endDate,
      days_count: daysCount,
      medical_certificate_url: input.medicalCertificateUrl,
      reason: input.reason,
      recorded_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  return mapAbsenceFromDb(data)
}

export async function updateAbsence(input: UpdateAbsenceInput): Promise<Absence> {
  const updateData: any = {}

  if (input.leaveTypeId !== undefined) updateData.leave_type_id = input.leaveTypeId
  if (input.startDate !== undefined) updateData.start_date = input.startDate
  if (input.endDate !== undefined) updateData.end_date = input.endDate
  if (input.medicalCertificateUrl !== undefined) updateData.medical_certificate_url = input.medicalCertificateUrl
  if (input.reason !== undefined) updateData.reason = input.reason

  // Recalculate days if dates changed
  if (input.startDate !== undefined || input.endDate !== undefined) {
    const { data: current } = await getHrClient()
      .from('absences')
      .select('start_date, end_date')
      .eq('id', input.id)
      .single()

    const startDate = new Date(input.startDate || current.start_date)
    const endDate = new Date(input.endDate || current.end_date)
    updateData.days_count = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const { data, error } = await getHrClient()
    .from('absences')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapAbsenceFromDb(data)
}

export async function deleteAbsence(id: string): Promise<void> {
  const { error } = await getHrClient()
    .from('absences')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// LEAVE BALANCE
// ===========================================

export async function getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
  // Get employee's current balance
  const { data: employee, error: employeeError } = await getHrClient()
    .from('employees')
    .select('id, annual_leave_balance, rtt_balance, organization_id')
    .eq('id', employeeId)
    .single()

  if (employeeError) throw employeeError

  // Get used leaves (approved requests + absences)
  const currentYear = new Date().getFullYear()
  const yearStart = `${currentYear}-01-01`
  const yearEnd = `${currentYear}-12-31`

  // Get leave types for this org
  const { data: leaveTypes } = await getHrClient()
    .from('leave_types')
    .select('id, code')
    .eq('organization_id', employee.organization_id)

  const cpTypeIds = (leaveTypes || []).filter((t: any) => t.code === 'cp').map((t: any) => t.id)
  const rttTypeIds = (leaveTypes || []).filter((t: any) => t.code === 'rtt').map((t: any) => t.id)

  // Get approved leave requests
  const { data: approvedRequests } = await getHrClient()
    .from('leave_requests')
    .select('leave_type_id, days_count')
    .eq('employee_id', employeeId)
    .eq('status', 'approved')
    .gte('start_date', yearStart)
    .lte('start_date', yearEnd)
    .is('deleted_at', null)

  // Get pending leave requests
  const { data: pendingRequests } = await getHrClient()
    .from('leave_requests')
    .select('leave_type_id, days_count')
    .eq('employee_id', employeeId)
    .eq('status', 'pending')
    .gte('start_date', yearStart)
    .lte('start_date', yearEnd)
    .is('deleted_at', null)

  // Calculate used and pending
  let usedAnnualLeave = 0
  let usedRtt = 0
  let pendingAnnualLeave = 0
  let pendingRtt = 0

  ;(approvedRequests || []).forEach((r: any) => {
    if (cpTypeIds.includes(r.leave_type_id)) {
      usedAnnualLeave += r.days_count
    } else if (rttTypeIds.includes(r.leave_type_id)) {
      usedRtt += r.days_count
    }
  })

  ;(pendingRequests || []).forEach((r: any) => {
    if (cpTypeIds.includes(r.leave_type_id)) {
      pendingAnnualLeave += r.days_count
    } else if (rttTypeIds.includes(r.leave_type_id)) {
      pendingRtt += r.days_count
    }
  })

  return {
    employeeId,
    annualLeaveBalance: employee.annual_leave_balance,
    rttBalance: employee.rtt_balance,
    usedAnnualLeave,
    usedRtt,
    pendingAnnualLeave,
    pendingRtt,
  }
}

// ===========================================
// CALENDAR DATA
// ===========================================

export async function getLeaveCalendarData(
  organizationId: string,
  startDate: string,
  endDate: string
): Promise<(LeaveRequestWithRelations | AbsenceWithRelations)[]> {
  // Get approved leave requests in date range
  const { data: requests } = await getHrClient()
    .from('leave_requests')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'approved')
    .is('deleted_at', null)
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

  // Get absences in date range
  const { data: absences } = await getHrClient()
    .from('absences')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

  // Get related data
  const employeeIds = [
    ...new Set([
      ...(requests || []).map((r: any) => r.employee_id),
      ...(absences || []).map((a: any) => a.employee_id),
    ]),
  ]
  const leaveTypeIds = [
    ...new Set([
      ...(requests || []).map((r: any) => r.leave_type_id),
      ...(absences || []).map((a: any) => a.leave_type_id),
    ]),
  ]

  const [employees, leaveTypes] = await Promise.all([
    employeeIds.length > 0
      ? getHrClient().from('employees').select('id, first_name, last_name, photo_url').in('id', employeeIds)
      : { data: [] },
    leaveTypeIds.length > 0
      ? getHrClient().from('leave_types').select('*').in('id', leaveTypeIds)
      : { data: [] },
  ])

  const employeeMap: Record<string, any> = {}
  ;(employees.data || []).forEach((e: any) => {
    employeeMap[e.id] = e
  })

  const leaveTypeMap: Record<string, any> = {}
  ;(leaveTypes.data || []).forEach((t: any) => {
    leaveTypeMap[t.id] = t
  })

  const result: any[] = []

  // Map requests
  ;(requests || []).forEach((r: any) => {
    result.push({
      ...mapLeaveRequestFromDb(r),
      employee: employeeMap[r.employee_id]
        ? {
            id: employeeMap[r.employee_id].id,
            firstName: employeeMap[r.employee_id].first_name,
            lastName: employeeMap[r.employee_id].last_name,
            photoUrl: employeeMap[r.employee_id].photo_url,
          }
        : undefined,
      leaveType: leaveTypeMap[r.leave_type_id]
        ? mapLeaveTypeFromDb(leaveTypeMap[r.leave_type_id])
        : undefined,
    })
  })

  // Map absences
  ;(absences || []).forEach((a: any) => {
    result.push({
      ...mapAbsenceFromDb(a),
      employee: employeeMap[a.employee_id]
        ? {
            id: employeeMap[a.employee_id].id,
            firstName: employeeMap[a.employee_id].first_name,
            lastName: employeeMap[a.employee_id].last_name,
            photoUrl: employeeMap[a.employee_id].photo_url,
          }
        : undefined,
      leaveType: leaveTypeMap[a.leave_type_id]
        ? mapLeaveTypeFromDb(leaveTypeMap[a.leave_type_id])
        : undefined,
    })
  })

  return result
}

// ===========================================
// HELPERS
// ===========================================

function mapLeaveTypeFromDb(data: any): LeaveType {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    code: data.code as string,
    color: (data.color as string) || '#0c82d6',
    isPaid: (data.is_paid as boolean) ?? true,
    requiresApproval: (data.requires_approval as boolean) ?? true,
    deductsFromBalance: (data.deducts_from_balance as boolean) ?? true,
    isSystem: (data.is_system as boolean) || false,
    createdAt: data.created_at as string,
  }
}

function mapLeaveRequestFromDb(data: any): LeaveRequest {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    employeeId: data.employee_id as string,
    leaveTypeId: data.leave_type_id as string,
    startDate: data.start_date as string,
    endDate: data.end_date as string,
    startHalfDay: (data.start_half_day as boolean) || false,
    endHalfDay: (data.end_half_day as boolean) || false,
    daysCount: (data.days_count as number) || 0,
    reason: data.reason as string | null,
    status: (data.status as LeaveRequest['status']) || 'pending',
    approvedBy: data.approved_by as string | null,
    approvedAt: data.approved_at as string | null,
    rejectionReason: data.rejection_reason as string | null,
    requestedBy: data.requested_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function mapAbsenceFromDb(data: any): Absence {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    employeeId: data.employee_id as string,
    leaveTypeId: data.leave_type_id as string,
    startDate: data.start_date as string,
    endDate: data.end_date as string,
    daysCount: (data.days_count as number) || 0,
    medicalCertificateUrl: data.medical_certificate_url as string | null,
    reason: data.reason as string | null,
    recordedBy: data.recorded_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
