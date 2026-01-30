// ===========================================
// HR SETTINGS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type { HrSettings, UpdateHrSettingsInput } from '../types'

function getHrClient() {
  return getSupabaseClient().schema('hr' as any) as any
}

// ===========================================
// GET SETTINGS
// ===========================================

export async function getHrSettings(organizationId: string): Promise<HrSettings | null> {
  const { data, error } = await getHrClient()
    .from('settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapSettingsFromDb(data)
}

// ===========================================
// CREATE SETTINGS (if not exist)
// ===========================================

export async function createHrSettings(organizationId: string): Promise<HrSettings> {
  const { data, error } = await getHrClient()
    .from('settings')
    .insert({
      organization_id: organizationId,
    })
    .select()
    .single()

  if (error) throw error

  return mapSettingsFromDb(data)
}

// ===========================================
// GET OR CREATE SETTINGS
// ===========================================

export async function getOrCreateHrSettings(organizationId: string): Promise<HrSettings> {
  const existing = await getHrSettings(organizationId)
  if (existing) return existing

  return createHrSettings(organizationId)
}

// ===========================================
// UPDATE SETTINGS
// ===========================================

export async function updateHrSettings(
  organizationId: string,
  input: UpdateHrSettingsInput
): Promise<HrSettings> {
  const updateData: any = {}

  if (input.annualLeaveDaysPerYear !== undefined) updateData.annual_leave_days_per_year = input.annualLeaveDaysPerYear
  if (input.rttDaysPerYear !== undefined) updateData.rtt_days_per_year = input.rttDaysPerYear
  if (input.leaveYearStartMonth !== undefined) updateData.leave_year_start_month = input.leaveYearStartMonth
  if (input.defaultWorkHoursPerWeek !== undefined) updateData.default_work_hours_per_week = input.defaultWorkHoursPerWeek
  if (input.workDays !== undefined) updateData.work_days = input.workDays
  if (input.alertTrialEndDays !== undefined) updateData.alert_trial_end_days = input.alertTrialEndDays
  if (input.alertContractEndDays !== undefined) updateData.alert_contract_end_days = input.alertContractEndDays
  if (input.alertInterviewDays !== undefined) updateData.alert_interview_days = input.alertInterviewDays
  if (input.employeeSelfServiceEnabled !== undefined) updateData.employee_self_service_enabled = input.employeeSelfServiceEnabled
  if (input.employeesCanRequestLeaves !== undefined) updateData.employees_can_request_leaves = input.employeesCanRequestLeaves
  if (input.employeesCanViewDirectory !== undefined) updateData.employees_can_view_directory = input.employeesCanViewDirectory
  if (input.employeesCanEditProfile !== undefined) updateData.employees_can_edit_profile = input.employeesCanEditProfile

  const { data, error } = await getHrClient()
    .from('settings')
    .update(updateData)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) throw error

  return mapSettingsFromDb(data)
}

// ===========================================
// HELPERS
// ===========================================

function mapSettingsFromDb(data: any): HrSettings {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    annualLeaveDaysPerYear: (data.annual_leave_days_per_year as number) || 25,
    rttDaysPerYear: (data.rtt_days_per_year as number) || 0,
    leaveYearStartMonth: (data.leave_year_start_month as number) || 6,
    defaultWorkHoursPerWeek: (data.default_work_hours_per_week as number) || 35,
    workDays: (data.work_days as string[]) || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    alertTrialEndDays: (data.alert_trial_end_days as number) || 15,
    alertContractEndDays: (data.alert_contract_end_days as number) || 30,
    alertInterviewDays: (data.alert_interview_days as number) || 30,
    employeeSelfServiceEnabled: (data.employee_self_service_enabled as boolean) || false,
    employeesCanRequestLeaves: (data.employees_can_request_leaves as boolean) ?? true,
    employeesCanViewDirectory: (data.employees_can_view_directory as boolean) ?? true,
    employeesCanEditProfile: (data.employees_can_edit_profile as boolean) || false,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
