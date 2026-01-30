// ===========================================
// CONTRACT SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Contract,
  ContractWithEmployee,
  CreateContractInput,
  UpdateContractInput,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// GET CONTRACTS
// ===========================================

export async function getContracts(
  organizationId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<ContractWithEmployee>> {
  const { page = 1, pageSize = 20, sortBy = 'startDate', sortOrder = 'desc' } = pagination
  const offset = (page - 1) * pageSize

  const { data, error, count } = await getSupabaseClient()
    .from('hr_contracts')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  // Get employees
  const employeeIds = [...new Set((data || []).map((c: any) => c.employee_id))]

  let employees: any[] = []
  if (employeeIds.length > 0) {
    const { data: employeeData } = await getSupabaseClient()
      .from('hr_employees')
      .select('id, first_name, last_name, photo_url')
      .in('id', employeeIds)
    employees = employeeData || []
  }

  const employeeMap: Record<string, any> = {}
  employees.forEach((e: any) => {
    employeeMap[e.id] = e
  })

  return {
    data: (data || []).map((c: any) => ({
      ...mapContractFromDb(c),
      employee: employeeMap[c.employee_id]
        ? {
            id: employeeMap[c.employee_id].id,
            firstName: employeeMap[c.employee_id].first_name,
            lastName: employeeMap[c.employee_id].last_name,
            photoUrl: employeeMap[c.employee_id].photo_url,
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
// GET CONTRACTS BY EMPLOYEE
// ===========================================

export async function getContractsByEmployee(employeeId: string): Promise<Contract[]> {
  const { data, error } = await getSupabaseClient()
    .from('hr_contracts')
    .select('*')
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })

  if (error) throw error

  return (data || []).map(mapContractFromDb)
}

// ===========================================
// GET CONTRACT BY ID
// ===========================================

export async function getContractById(id: string): Promise<ContractWithEmployee | null> {
  const { data, error } = await getSupabaseClient()
    .from('hr_contracts')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const contract = mapContractFromDb(data)

  // Get employee
  const { data: employeeData } = await getSupabaseClient()
    .from('hr_employees')
    .select('id, first_name, last_name, photo_url')
    .eq('id', contract.employeeId)
    .single()

  return {
    ...contract,
    employee: employeeData
      ? {
          id: employeeData.id,
          firstName: employeeData.first_name,
          lastName: employeeData.last_name,
          photoUrl: employeeData.photo_url,
        }
      : undefined,
  }
}

// ===========================================
// GET CURRENT CONTRACT
// ===========================================

export async function getCurrentContract(employeeId: string): Promise<Contract | null> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await getSupabaseClient()
    .from('hr_contracts')
    .select('*')
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .lte('start_date', today)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('start_date', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapContractFromDb(data)
}

// ===========================================
// CREATE CONTRACT
// ===========================================

export async function createContract(
  organizationId: string,
  input: CreateContractInput
): Promise<Contract> {
  const { data, error } = await getSupabaseClient()
    .from('hr_contracts')
    .insert({
      organization_id: organizationId,
      employee_id: input.employeeId,
      contract_type: input.contractType,
      start_date: input.startDate,
      end_date: input.endDate,
      trial_duration_days: input.trialDurationDays,
      trial_end_date: input.trialEndDate,
      trial_renewed: input.trialRenewed || false,
      job_title: input.jobTitle,
      department: input.department,
      classification: input.classification,
      work_hours_per_week: input.workHoursPerWeek || 35,
      is_full_time: input.isFullTime ?? true,
      remote_policy: input.remotePolicy,
      gross_salary: input.grossSalary,
      salary_currency: input.salaryCurrency || 'EUR',
      salary_frequency: input.salaryFrequency || 'monthly',
      signed_document_url: input.signedDocumentUrl,
      notes: input.notes,
    })
    .select()
    .single()

  if (error) throw error

  // Update employee's current contract info
  await getSupabaseClient()
    .from('hr_employees')
    .update({
      contract_type: input.contractType,
      contract_start_date: input.startDate,
      contract_end_date: input.endDate,
      trial_end_date: input.trialEndDate,
      job_title: input.jobTitle,
      department: input.department,
      gross_salary: input.grossSalary,
    })
    .eq('id', input.employeeId)

  return mapContractFromDb(data)
}

// ===========================================
// UPDATE CONTRACT
// ===========================================

export async function updateContract(input: UpdateContractInput): Promise<Contract> {
  const updateData: any = {}

  if (input.contractType !== undefined) updateData.contract_type = input.contractType
  if (input.startDate !== undefined) updateData.start_date = input.startDate
  if (input.endDate !== undefined) updateData.end_date = input.endDate
  if (input.trialDurationDays !== undefined) updateData.trial_duration_days = input.trialDurationDays
  if (input.trialEndDate !== undefined) updateData.trial_end_date = input.trialEndDate
  if (input.trialRenewed !== undefined) updateData.trial_renewed = input.trialRenewed
  if (input.jobTitle !== undefined) updateData.job_title = input.jobTitle
  if (input.department !== undefined) updateData.department = input.department
  if (input.classification !== undefined) updateData.classification = input.classification
  if (input.workHoursPerWeek !== undefined) updateData.work_hours_per_week = input.workHoursPerWeek
  if (input.isFullTime !== undefined) updateData.is_full_time = input.isFullTime
  if (input.remotePolicy !== undefined) updateData.remote_policy = input.remotePolicy
  if (input.grossSalary !== undefined) updateData.gross_salary = input.grossSalary
  if (input.salaryCurrency !== undefined) updateData.salary_currency = input.salaryCurrency
  if (input.salaryFrequency !== undefined) updateData.salary_frequency = input.salaryFrequency
  if (input.signedDocumentUrl !== undefined) updateData.signed_document_url = input.signedDocumentUrl
  if (input.notes !== undefined) updateData.notes = input.notes

  const { data, error } = await getSupabaseClient()
    .from('hr_contracts')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapContractFromDb(data)
}

// ===========================================
// DELETE CONTRACT
// ===========================================

export async function deleteContract(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('hr_contracts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET EXPIRING CONTRACTS
// ===========================================

export async function getExpiringContracts(
  organizationId: string,
  daysAhead: number = 30
): Promise<ContractWithEmployee[]> {
  const today = new Date()
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000)

  const { data, error } = await getSupabaseClient()
    .from('hr_contracts')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('end_date', 'is', null)
    .gte('end_date', today.toISOString().split('T')[0])
    .lte('end_date', futureDate.toISOString().split('T')[0])
    .order('end_date', { ascending: true })

  if (error) throw error

  // Get employees
  const employeeIds = [...new Set((data || []).map((c: any) => c.employee_id))]

  let employees: any[] = []
  if (employeeIds.length > 0) {
    const { data: employeeData } = await getSupabaseClient()
      .from('hr_employees')
      .select('id, first_name, last_name, photo_url')
      .in('id', employeeIds)
    employees = employeeData || []
  }

  const employeeMap: Record<string, any> = {}
  employees.forEach((e: any) => {
    employeeMap[e.id] = e
  })

  return (data || []).map((c: any) => ({
    ...mapContractFromDb(c),
    employee: employeeMap[c.employee_id]
      ? {
          id: employeeMap[c.employee_id].id,
          firstName: employeeMap[c.employee_id].first_name,
          lastName: employeeMap[c.employee_id].last_name,
          photoUrl: employeeMap[c.employee_id].photo_url,
        }
      : undefined,
  }))
}

// ===========================================
// GET TRIAL PERIODS ENDING SOON
// ===========================================

export async function getTrialPeriodsEndingSoon(
  organizationId: string,
  daysAhead: number = 15
): Promise<ContractWithEmployee[]> {
  const today = new Date()
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000)

  const { data, error } = await getSupabaseClient()
    .from('hr_contracts')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('trial_end_date', 'is', null)
    .gte('trial_end_date', today.toISOString().split('T')[0])
    .lte('trial_end_date', futureDate.toISOString().split('T')[0])
    .order('trial_end_date', { ascending: true })

  if (error) throw error

  // Get employees
  const employeeIds = [...new Set((data || []).map((c: any) => c.employee_id))]

  let employees: any[] = []
  if (employeeIds.length > 0) {
    const { data: employeeData } = await getSupabaseClient()
      .from('hr_employees')
      .select('id, first_name, last_name, photo_url')
      .in('id', employeeIds)
    employees = employeeData || []
  }

  const employeeMap: Record<string, any> = {}
  employees.forEach((e: any) => {
    employeeMap[e.id] = e
  })

  return (data || []).map((c: any) => ({
    ...mapContractFromDb(c),
    employee: employeeMap[c.employee_id]
      ? {
          id: employeeMap[c.employee_id].id,
          firstName: employeeMap[c.employee_id].first_name,
          lastName: employeeMap[c.employee_id].last_name,
          photoUrl: employeeMap[c.employee_id].photo_url,
        }
      : undefined,
  }))
}

// ===========================================
// HELPERS
// ===========================================

function mapContractFromDb(data: any): Contract {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    employeeId: data.employee_id as string,
    contractType: data.contract_type as Contract['contractType'],
    startDate: data.start_date as string,
    endDate: data.end_date as string | null,
    trialDurationDays: data.trial_duration_days as number | null,
    trialEndDate: data.trial_end_date as string | null,
    trialRenewed: (data.trial_renewed as boolean) || false,
    jobTitle: data.job_title as string,
    department: data.department as string | null,
    classification: data.classification as string | null,
    workHoursPerWeek: (data.work_hours_per_week as number) || 35,
    isFullTime: (data.is_full_time as boolean) ?? true,
    remotePolicy: data.remote_policy as string | null,
    grossSalary: data.gross_salary as number | null,
    salaryCurrency: (data.salary_currency as string) || 'EUR',
    salaryFrequency: (data.salary_frequency as string) || 'monthly',
    signedDocumentUrl: data.signed_document_url as string | null,
    notes: data.notes as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
