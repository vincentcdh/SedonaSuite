// ===========================================
// EMPLOYEE SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Employee,
  EmployeeWithRelations,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

function getHrClient() {
  return getSupabaseClient().schema('hr' as any) as any
}

// ===========================================
// GET EMPLOYEES
// ===========================================

export async function getEmployees(
  organizationId: string,
  filters: EmployeeFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<EmployeeWithRelations>> {
  const { page = 1, pageSize = 20, sortBy = 'lastName', sortOrder = 'asc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getHrClient()
    .from('employees')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_number.ilike.%${filters.search}%,work_email.ilike.%${filters.search}%`
    )
  }
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }
  if (filters.contractType) {
    if (Array.isArray(filters.contractType)) {
      query = query.in('contract_type', filters.contractType)
    } else {
      query = query.eq('contract_type', filters.contractType)
    }
  }
  if (filters.department) {
    query = query.eq('department', filters.department)
  }
  if (filters.managerId !== undefined) {
    if (filters.managerId === null) {
      query = query.is('manager_id', null)
    } else {
      query = query.eq('manager_id', filters.managerId)
    }
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get managers
  const managerIds = [...new Set((data || []).filter((e: any) => e.manager_id).map((e: any) => e.manager_id))]

  let managers: any[] = []
  if (managerIds.length > 0) {
    const { data: managerData } = await getHrClient()
      .from('employees')
      .select('id, first_name, last_name, photo_url')
      .in('id', managerIds)
    managers = managerData || []
  }

  const managerMap: Record<string, any> = {}
  managers.forEach((m: any) => {
    managerMap[m.id] = m
  })

  return {
    data: (data || []).map((e: any) => ({
      ...mapEmployeeFromDb(e),
      manager: e.manager_id && managerMap[e.manager_id]
        ? {
            id: managerMap[e.manager_id].id,
            firstName: managerMap[e.manager_id].first_name,
            lastName: managerMap[e.manager_id].last_name,
            photoUrl: managerMap[e.manager_id].photo_url,
          }
        : null,
    })),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET EMPLOYEE BY ID
// ===========================================

export async function getEmployeeById(id: string): Promise<EmployeeWithRelations | null> {
  const { data, error } = await getHrClient()
    .from('employees')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const employee = mapEmployeeFromDb(data)

  // Get manager
  let manager = null
  if (employee.managerId) {
    const { data: managerData } = await getHrClient()
      .from('employees')
      .select('id, first_name, last_name, photo_url')
      .eq('id', employee.managerId)
      .single()

    if (managerData) {
      manager = {
        id: managerData.id,
        firstName: managerData.first_name,
        lastName: managerData.last_name,
        photoUrl: managerData.photo_url,
      }
    }
  }

  // Get direct reports
  const { data: reportsData } = await getHrClient()
    .from('employees')
    .select('id, first_name, last_name, photo_url')
    .eq('manager_id', id)
    .is('deleted_at', null)

  const directReports = (reportsData || []).map((r: any) => ({
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    photoUrl: r.photo_url,
  }))

  return {
    ...employee,
    manager,
    directReports,
  }
}

// ===========================================
// GET EMPLOYEE BY USER ID
// ===========================================

export async function getEmployeeByUserId(userId: string): Promise<Employee | null> {
  const { data, error } = await getHrClient()
    .from('employees')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapEmployeeFromDb(data)
}

// ===========================================
// CREATE EMPLOYEE
// ===========================================

export async function createEmployee(
  organizationId: string,
  input: CreateEmployeeInput
): Promise<Employee> {
  const { data, error } = await getHrClient()
    .from('employees')
    .insert({
      organization_id: organizationId,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      birth_date: input.birthDate,
      birth_place: input.birthPlace,
      nationality: input.nationality,
      social_security_number: input.socialSecurityNumber,
      photo_url: input.photoUrl,
      address_line1: input.addressLine1,
      address_line2: input.addressLine2,
      city: input.city,
      postal_code: input.postalCode,
      country: input.country,
      emergency_contact_name: input.emergencyContactName,
      emergency_contact_phone: input.emergencyContactPhone,
      emergency_contact_relation: input.emergencyContactRelation,
      employee_number: input.employeeNumber,
      job_title: input.jobTitle,
      department: input.department,
      manager_id: input.managerId,
      work_email: input.workEmail,
      work_phone: input.workPhone,
      contract_type: input.contractType,
      contract_start_date: input.contractStartDate,
      contract_end_date: input.contractEndDate,
      trial_end_date: input.trialEndDate,
      gross_salary: input.grossSalary,
      salary_currency: input.salaryCurrency || 'EUR',
      annual_leave_balance: input.annualLeaveBalance || 0,
      rtt_balance: input.rttBalance || 0,
      status: input.status || 'active',
      notes: input.notes,
      custom_fields: input.customFields || {},
    })
    .select()
    .single()

  if (error) throw error

  return mapEmployeeFromDb(data)
}

// ===========================================
// UPDATE EMPLOYEE
// ===========================================

export async function updateEmployee(input: UpdateEmployeeInput): Promise<Employee> {
  const updateData: any = {}

  if (input.firstName !== undefined) updateData.first_name = input.firstName
  if (input.lastName !== undefined) updateData.last_name = input.lastName
  if (input.email !== undefined) updateData.email = input.email
  if (input.phone !== undefined) updateData.phone = input.phone
  if (input.birthDate !== undefined) updateData.birth_date = input.birthDate
  if (input.birthPlace !== undefined) updateData.birth_place = input.birthPlace
  if (input.nationality !== undefined) updateData.nationality = input.nationality
  if (input.socialSecurityNumber !== undefined) updateData.social_security_number = input.socialSecurityNumber
  if (input.photoUrl !== undefined) updateData.photo_url = input.photoUrl
  if (input.addressLine1 !== undefined) updateData.address_line1 = input.addressLine1
  if (input.addressLine2 !== undefined) updateData.address_line2 = input.addressLine2
  if (input.city !== undefined) updateData.city = input.city
  if (input.postalCode !== undefined) updateData.postal_code = input.postalCode
  if (input.country !== undefined) updateData.country = input.country
  if (input.emergencyContactName !== undefined) updateData.emergency_contact_name = input.emergencyContactName
  if (input.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = input.emergencyContactPhone
  if (input.emergencyContactRelation !== undefined) updateData.emergency_contact_relation = input.emergencyContactRelation
  if (input.employeeNumber !== undefined) updateData.employee_number = input.employeeNumber
  if (input.jobTitle !== undefined) updateData.job_title = input.jobTitle
  if (input.department !== undefined) updateData.department = input.department
  if (input.managerId !== undefined) updateData.manager_id = input.managerId
  if (input.workEmail !== undefined) updateData.work_email = input.workEmail
  if (input.workPhone !== undefined) updateData.work_phone = input.workPhone
  if (input.contractType !== undefined) updateData.contract_type = input.contractType
  if (input.contractStartDate !== undefined) updateData.contract_start_date = input.contractStartDate
  if (input.contractEndDate !== undefined) updateData.contract_end_date = input.contractEndDate
  if (input.trialEndDate !== undefined) updateData.trial_end_date = input.trialEndDate
  if (input.grossSalary !== undefined) updateData.gross_salary = input.grossSalary
  if (input.salaryCurrency !== undefined) updateData.salary_currency = input.salaryCurrency
  if (input.annualLeaveBalance !== undefined) updateData.annual_leave_balance = input.annualLeaveBalance
  if (input.rttBalance !== undefined) updateData.rtt_balance = input.rttBalance
  if (input.status !== undefined) updateData.status = input.status
  if (input.leftDate !== undefined) updateData.left_date = input.leftDate
  if (input.leftReason !== undefined) updateData.left_reason = input.leftReason
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.customFields !== undefined) updateData.custom_fields = input.customFields

  const { data, error } = await getHrClient()
    .from('employees')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapEmployeeFromDb(data)
}

// ===========================================
// SOFT DELETE EMPLOYEE
// ===========================================

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await getHrClient()
    .from('employees')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// RESTORE EMPLOYEE
// ===========================================

export async function restoreEmployee(id: string): Promise<Employee> {
  const { data, error } = await getHrClient()
    .from('employees')
    .update({ deleted_at: null })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapEmployeeFromDb(data)
}

// ===========================================
// GET DEPARTMENTS
// ===========================================

export async function getDepartments(organizationId: string): Promise<string[]> {
  const { data, error } = await getHrClient()
    .from('employees')
    .select('department')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('department', 'is', null)

  if (error) throw error

  const departments = [...new Set((data || []).map((e: any) => e.department as string).filter(Boolean))] as string[]
  return departments.sort()
}

// ===========================================
// GET EMPLOYEE COUNT
// ===========================================

export async function getEmployeeCount(organizationId: string): Promise<number> {
  const { count, error } = await getHrClient()
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (error) throw error

  return count || 0
}

// ===========================================
// HELPERS
// ===========================================

function mapEmployeeFromDb(data: any): Employee {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    userId: data.user_id as string | null,
    firstName: data.first_name as string,
    lastName: data.last_name as string,
    email: data.email as string | null,
    phone: data.phone as string | null,
    birthDate: data.birth_date as string | null,
    birthPlace: data.birth_place as string | null,
    nationality: data.nationality as string | null,
    socialSecurityNumber: data.social_security_number as string | null,
    photoUrl: data.photo_url as string | null,
    addressLine1: data.address_line1 as string | null,
    addressLine2: data.address_line2 as string | null,
    city: data.city as string | null,
    postalCode: data.postal_code as string | null,
    country: data.country as string | null,
    emergencyContactName: data.emergency_contact_name as string | null,
    emergencyContactPhone: data.emergency_contact_phone as string | null,
    emergencyContactRelation: data.emergency_contact_relation as string | null,
    employeeNumber: data.employee_number as string | null,
    jobTitle: data.job_title as string | null,
    department: data.department as string | null,
    managerId: data.manager_id as string | null,
    workEmail: data.work_email as string | null,
    workPhone: data.work_phone as string | null,
    contractType: data.contract_type as Employee['contractType'],
    contractStartDate: data.contract_start_date as string | null,
    contractEndDate: data.contract_end_date as string | null,
    trialEndDate: data.trial_end_date as string | null,
    grossSalary: data.gross_salary as number | null,
    salaryCurrency: (data.salary_currency as string) || 'EUR',
    annualLeaveBalance: (data.annual_leave_balance as number) || 0,
    rttBalance: (data.rtt_balance as number) || 0,
    status: (data.status as Employee['status']) || 'active',
    leftDate: data.left_date as string | null,
    leftReason: data.left_reason as string | null,
    notes: data.notes as string | null,
    customFields: (data.custom_fields as Record<string, unknown>) || {},
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
