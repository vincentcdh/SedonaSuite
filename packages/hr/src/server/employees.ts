// ===========================================
// EMPLOYEES SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient, validateOrganizationId } from '@sedona/database'
import { assertEmployeeLimit } from '@sedona/billing/server'
import type {
  Employee,
  EmployeeWithRelations,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeFilters,
  PaginationParams,
  PaginatedResult,
} from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = any

const employeeColumns = `
  id, organization_id, user_id, first_name, last_name, email, phone,
  birth_date, birth_place, nationality, social_security_number, photo_url,
  address_line_1, address_line_2, city, postal_code, country,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
  employee_number, job_title, department, manager_id, work_email, work_phone,
  contract_type, contract_start_date, contract_end_date, trial_end_date,
  gross_salary, salary_currency, annual_leave_balance, rtt_balance,
  status, left_date, left_reason, notes, custom_fields,
  created_at, updated_at, deleted_at
`

function mapEmployeeFromDb(row: Record<string, unknown>): Employee {
  return {
    id: row['id'] as string,
    organizationId: row['organization_id'] as string,
    userId: row['user_id'] as string | null,
    firstName: row['first_name'] as string,
    lastName: row['last_name'] as string,
    email: row['email'] as string | null,
    phone: row['phone'] as string | null,
    birthDate: row['birth_date'] as string | null,
    birthPlace: row['birth_place'] as string | null,
    nationality: row['nationality'] as string | null,
    socialSecurityNumber: row['social_security_number'] as string | null,
    photoUrl: row['photo_url'] as string | null,
    addressLine1: row['address_line_1'] as string | null,
    addressLine2: row['address_line_2'] as string | null,
    city: row['city'] as string | null,
    postalCode: row['postal_code'] as string | null,
    country: row['country'] as string | null,
    emergencyContactName: row['emergency_contact_name'] as string | null,
    emergencyContactPhone: row['emergency_contact_phone'] as string | null,
    emergencyContactRelation: row['emergency_contact_relation'] as string | null,
    employeeNumber: row['employee_number'] as string | null,
    jobTitle: row['job_title'] as string | null,
    department: row['department'] as string | null,
    managerId: row['manager_id'] as string | null,
    workEmail: row['work_email'] as string | null,
    workPhone: row['work_phone'] as string | null,
    contractType: row['contract_type'] as Employee['contractType'],
    contractStartDate: row['contract_start_date'] as string | null,
    contractEndDate: row['contract_end_date'] as string | null,
    trialEndDate: row['trial_end_date'] as string | null,
    grossSalary: row['gross_salary'] as number | null,
    salaryCurrency: (row['salary_currency'] as string) ?? 'EUR',
    annualLeaveBalance: (row['annual_leave_balance'] as number) ?? 0,
    rttBalance: (row['rtt_balance'] as number) ?? 0,
    status: (row['status'] as Employee['status']) ?? 'active',
    leftDate: row['left_date'] as string | null,
    leftReason: row['left_reason'] as string | null,
    notes: row['notes'] as string | null,
    customFields: (row['custom_fields'] as Record<string, unknown>) ?? {},
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
    deletedAt: row['deleted_at'] as string | null,
  }
}

function mapEmployeeWithRelationsFromDb(row: Record<string, unknown>): EmployeeWithRelations {
  const employee = mapEmployeeFromDb(row)
  const manager = row['manager'] as Record<string, unknown> | null
  return {
    ...employee,
    manager: manager ? {
      id: manager['id'] as string,
      firstName: manager['first_name'] as string,
      lastName: manager['last_name'] as string,
      photoUrl: manager['photo_url'] as string | null,
    } : null,
  }
}

export interface CreateEmployeeResult {
  employee: Employee
  userId?: string
}

export async function getEmployees(
  organizationId: string,
  filters: EmployeeFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<EmployeeWithRelations>> {
  const validOrgId = validateOrganizationId(organizationId)
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { page = 1, pageSize = 20, sortBy = 'last_name', sortOrder = 'asc' } = pagination

  // Query employees without self-referential join (views don't have foreign keys)
  let query = supabase
    .from('hr_employees')
    .select(employeeColumns, { count: 'exact' })
    .eq('organization_id', validOrgId)
    .is('deleted_at', null)

  if (filters.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_number.ilike.%${filters.search}%`)
  }
  if (filters.status !== undefined) {
    query = Array.isArray(filters.status) ? query.in('status', filters.status) : query.eq('status', filters.status)
  }
  if (filters.contractType !== undefined) {
    query = Array.isArray(filters.contractType) ? query.in('contract_type', filters.contractType) : query.eq('contract_type', filters.contractType)
  }
  if (filters.department) query = query.eq('department', filters.department)
  if (filters.managerId !== undefined) {
    query = filters.managerId === null ? query.is('manager_id', null) : query.eq('manager_id', filters.managerId)
  }

  const sortColumn = sortBy.replace(/([A-Z])/g, '_$1').toLowerCase()
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' })
  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(`Failed to fetch employees: ${error.message}`)

  const employees = data ?? []

  // Fetch manager info separately
  const managerIds = [...new Set(employees.map((e: Record<string, unknown>) => e['manager_id']).filter(Boolean))] as string[]
  let managersMap: Record<string, { id: string; first_name: string; last_name: string; photo_url: string | null }> = {}

  if (managerIds.length > 0) {
    const { data: managers } = await supabase
      .from('hr_employees')
      .select('id, first_name, last_name, photo_url')
      .in('id', managerIds)

    if (managers) {
      for (const m of managers) {
        managersMap[m.id] = m
      }
    }
  }

  // Map employees with manager info
  const employeesWithRelations = employees.map((row: Record<string, unknown>) => {
    const employee = mapEmployeeFromDb(row)
    const managerId = row['manager_id'] as string | null
    const manager = managerId ? managersMap[managerId] : null
    return {
      ...employee,
      manager: manager ? {
        id: manager.id,
        firstName: manager.first_name,
        lastName: manager.last_name,
        photoUrl: manager.photo_url,
      } : null,
    }
  })

  return {
    data: employeesWithRelations,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export async function getEmployeeById(id: string): Promise<EmployeeWithRelations> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('hr_employees')
    .select(employeeColumns)
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (error) throw new Error(`Failed to fetch employee: ${error.message}`)

  const employee = mapEmployeeFromDb(data)

  // Fetch manager info separately if exists
  let manager = null
  if (data.manager_id) {
    const { data: managerData } = await supabase
      .from('hr_employees')
      .select('id, first_name, last_name, photo_url')
      .eq('id', data.manager_id)
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

  return { ...employee, manager }
}

export async function getEmployeeByUserId(userId: string): Promise<EmployeeWithRelations | null> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase
    .from('hr_employees')
    .select(employeeColumns)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch employee: ${error.message}`)
  }

  const employee = mapEmployeeFromDb(data)

  // Fetch manager info separately if exists
  let manager = null
  if (data.manager_id) {
    const { data: managerData } = await supabase
      .from('hr_employees')
      .select('id, first_name, last_name, photo_url')
      .eq('id', data.manager_id)
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

  return { ...employee, manager }
}

export async function createEmployee(organizationId: string, input: CreateEmployeeInput): Promise<Employee> {
  const validOrgId = validateOrganizationId(organizationId)
  await assertEmployeeLimit(validOrgId)
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { data, error } = await supabase.from('hr_employees').insert({
    organization_id: validOrgId,
    first_name: input.firstName, last_name: input.lastName,
    email: input.email ?? null, phone: input.phone ?? null,
    birth_date: input.birthDate ?? null, birth_place: input.birthPlace ?? null,
    nationality: input.nationality ?? null, social_security_number: input.socialSecurityNumber ?? null,
    photo_url: input.photoUrl ?? null,
    address_line_1: input.addressLine1 ?? null, address_line_2: input.addressLine2 ?? null,
    city: input.city ?? null, postal_code: input.postalCode ?? null, country: input.country ?? null,
    emergency_contact_name: input.emergencyContactName ?? null,
    emergency_contact_phone: input.emergencyContactPhone ?? null,
    emergency_contact_relation: input.emergencyContactRelation ?? null,
    employee_number: input.employeeNumber ?? null, job_title: input.jobTitle ?? null,
    department: input.department ?? null, manager_id: input.managerId ?? null,
    work_email: input.workEmail ?? null, work_phone: input.workPhone ?? null,
    contract_type: input.contractType ?? null,
    contract_start_date: input.contractStartDate ?? null, contract_end_date: input.contractEndDate ?? null,
    trial_end_date: input.trialEndDate ?? null, gross_salary: input.grossSalary ?? null,
    salary_currency: input.salaryCurrency ?? 'EUR',
    annual_leave_balance: input.annualLeaveBalance ?? 0, rtt_balance: input.rttBalance ?? 0,
    status: input.status ?? 'active', notes: input.notes ?? null, custom_fields: input.customFields ?? {},
  }).select(employeeColumns).single()

  if (error) throw new Error(`Failed to create employee: ${error.message}`)
  return mapEmployeeFromDb(data)
}

export async function createEmployeeWithUser(organizationId: string, input: CreateEmployeeInput): Promise<CreateEmployeeResult> {
  const employee = await createEmployee(organizationId, input)
  return { employee }
}

export async function updateEmployee(input: UpdateEmployeeInput): Promise<Employee> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (input.firstName !== undefined) updateData['first_name'] = input.firstName
  if (input.lastName !== undefined) updateData['last_name'] = input.lastName
  if (input.email !== undefined) updateData['email'] = input.email
  if (input.phone !== undefined) updateData['phone'] = input.phone
  if (input.birthDate !== undefined) updateData['birth_date'] = input.birthDate
  if (input.birthPlace !== undefined) updateData['birth_place'] = input.birthPlace
  if (input.nationality !== undefined) updateData['nationality'] = input.nationality
  if (input.socialSecurityNumber !== undefined) updateData['social_security_number'] = input.socialSecurityNumber
  if (input.photoUrl !== undefined) updateData['photo_url'] = input.photoUrl
  if (input.addressLine1 !== undefined) updateData['address_line_1'] = input.addressLine1
  if (input.addressLine2 !== undefined) updateData['address_line_2'] = input.addressLine2
  if (input.city !== undefined) updateData['city'] = input.city
  if (input.postalCode !== undefined) updateData['postal_code'] = input.postalCode
  if (input.country !== undefined) updateData['country'] = input.country
  if (input.emergencyContactName !== undefined) updateData['emergency_contact_name'] = input.emergencyContactName
  if (input.emergencyContactPhone !== undefined) updateData['emergency_contact_phone'] = input.emergencyContactPhone
  if (input.emergencyContactRelation !== undefined) updateData['emergency_contact_relation'] = input.emergencyContactRelation
  if (input.employeeNumber !== undefined) updateData['employee_number'] = input.employeeNumber
  if (input.jobTitle !== undefined) updateData['job_title'] = input.jobTitle
  if (input.department !== undefined) updateData['department'] = input.department
  if (input.managerId !== undefined) updateData['manager_id'] = input.managerId
  if (input.workEmail !== undefined) updateData['work_email'] = input.workEmail
  if (input.workPhone !== undefined) updateData['work_phone'] = input.workPhone
  if (input.contractType !== undefined) updateData['contract_type'] = input.contractType
  if (input.contractStartDate !== undefined) updateData['contract_start_date'] = input.contractStartDate
  if (input.contractEndDate !== undefined) updateData['contract_end_date'] = input.contractEndDate
  if (input.trialEndDate !== undefined) updateData['trial_end_date'] = input.trialEndDate
  if (input.grossSalary !== undefined) updateData['gross_salary'] = input.grossSalary
  if (input.salaryCurrency !== undefined) updateData['salary_currency'] = input.salaryCurrency
  if (input.annualLeaveBalance !== undefined) updateData['annual_leave_balance'] = input.annualLeaveBalance
  if (input.rttBalance !== undefined) updateData['rtt_balance'] = input.rttBalance
  if (input.status !== undefined) updateData['status'] = input.status
  if (input.leftDate !== undefined) updateData['left_date'] = input.leftDate
  if (input.leftReason !== undefined) updateData['left_reason'] = input.leftReason
  if (input.notes !== undefined) updateData['notes'] = input.notes
  if (input.customFields !== undefined) updateData['custom_fields'] = input.customFields

  const { data, error } = await supabase.from('hr_employees').update(updateData).eq('id', input.id).select(employeeColumns).single()
  if (error) throw new Error(`Failed to update employee: ${error.message}`)
  return mapEmployeeFromDb(data)
}

export async function deleteEmployee(id: string): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { error } = await supabase.from('hr_employees').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(`Failed to delete employee: ${error.message}`)
}

export async function restoreEmployee(id: string): Promise<Employee> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase.from('hr_employees').update({ deleted_at: null, updated_at: new Date().toISOString() }).eq('id', id).select(employeeColumns).single()
  if (error) throw new Error(`Failed to restore employee: ${error.message}`)
  return mapEmployeeFromDb(data)
}

export async function getDepartments(organizationId: string): Promise<string[]> {
  const validOrgId = validateOrganizationId(organizationId)
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { data, error } = await supabase.from('hr_employees').select('department').eq('organization_id', validOrgId).is('deleted_at', null).not('department', 'is', null)
  if (error) throw new Error(`Failed to fetch departments: ${error.message}`)
  const departments = new Set<string>()
  for (const row of data ?? []) {
    if (row['department']) departments.add(row['department'] as string)
  }
  return Array.from(departments).sort()
}

export async function getEmployeeCount(organizationId: string): Promise<number> {
  const validOrgId = validateOrganizationId(organizationId)
  const supabase = getSupabaseClient() as SupabaseClientAny
  const { count, error } = await supabase.from('hr_employees').select('*', { count: 'exact', head: true }).eq('organization_id', validOrgId).is('deleted_at', null)
  if (error) throw new Error(`Failed to get employee count: ${error.message}`)
  return count ?? 0
}
