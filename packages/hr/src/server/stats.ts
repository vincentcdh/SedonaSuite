// ===========================================
// HR STATISTICS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  HrStats,
  EmployeeCountByDepartment,
  EmployeeCountByContractType,
  HrAlert,
  ContractType,
} from '../types'

// ===========================================
// GET HR STATS
// ===========================================

export async function getHrStats(organizationId: string): Promise<HrStats> {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Get employee counts by status
  const { data: statusCounts } = await getSupabaseClient()
    .from('hr_employees')
    .select('status')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  const totalEmployees = statusCounts?.length || 0
  const activeEmployees = statusCounts?.filter((e: any) => e.status === 'active').length || 0
  const trialPeriodEmployees = statusCounts?.filter((e: any) => e.status === 'trial_period').length || 0

  // Get hired this month
  const { count: hiredThisMonth } = await getSupabaseClient()
    .from('hr_employees')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .gte('contract_start_date', firstDayOfMonth.toISOString().split('T')[0])
    .lte('contract_start_date', lastDayOfMonth.toISOString().split('T')[0])

  // Get left this month
  const { count: leftThisMonth } = await getSupabaseClient()
    .from('hr_employees')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'left')
    .gte('left_date', firstDayOfMonth.toISOString().split('T')[0])
    .lte('left_date', lastDayOfMonth.toISOString().split('T')[0])

  // Get pending leave requests
  const { count: pendingLeaveRequests } = await getSupabaseClient()
    .from('hr_leave_requests')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .is('deleted_at', null)

  // Get upcoming interviews (next 30 days)
  const { count: upcomingInterviews } = await getSupabaseClient()
    .from('hr_interviews')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'scheduled')
    .is('deleted_at', null)
    .gte('scheduled_date', now.toISOString())
    .lte('scheduled_date', thirtyDaysFromNow.toISOString())

  // Get trial periods ending soon (next 15 days)
  const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
  const { count: trialEndingSoon } = await getSupabaseClient()
    .from('hr_employees')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('trial_end_date', 'is', null)
    .gte('trial_end_date', now.toISOString().split('T')[0])
    .lte('trial_end_date', fifteenDaysFromNow.toISOString().split('T')[0])

  // Get contracts ending soon (next 30 days)
  const { count: contractEndingSoon } = await getSupabaseClient()
    .from('hr_contracts')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('end_date', 'is', null)
    .gte('end_date', now.toISOString().split('T')[0])
    .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0])

  // Calculate absenteeism rate (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const { data: absences } = await getSupabaseClient()
    .from('hr_absences')
    .select('days_count')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .gte('start_date', thirtyDaysAgo.toISOString().split('T')[0])
    .lte('start_date', now.toISOString().split('T')[0])

  const totalAbsenceDays = absences?.reduce((sum: number, a: any) => sum + (a.days_count || 0), 0) || 0
  const expectedWorkDays = activeEmployees * 22 // Approximate working days in a month
  const absenteeismRate = expectedWorkDays > 0 ? (totalAbsenceDays / expectedWorkDays) * 100 : null

  // Calculate average tenure
  const { data: employeesWithStart } = await getSupabaseClient()
    .from('hr_employees')
    .select('contract_start_date')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .not('contract_start_date', 'is', null)

  let averageTenureMonths: number | null = null
  if (employeesWithStart && employeesWithStart.length > 0) {
    const totalMonths = employeesWithStart.reduce((sum: number, e: any) => {
      const startDate = new Date(e.contract_start_date)
      const months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
      return sum + Math.max(0, months)
    }, 0)
    averageTenureMonths = Math.round(totalMonths / employeesWithStart.length)
  }

  // Get leave days this month (approved leave requests)
  const { data: leaveRequests } = await getSupabaseClient()
    .from('hr_leave_requests')
    .select('days_count')
    .eq('organization_id', organizationId)
    .eq('status', 'approved')
    .is('deleted_at', null)
    .or(`start_date.gte.${firstDayOfMonth.toISOString().split('T')[0]},end_date.gte.${firstDayOfMonth.toISOString().split('T')[0]}`)
    .lte('start_date', lastDayOfMonth.toISOString().split('T')[0])

  const leaveDaysThisMonth = leaveRequests?.reduce((sum: number, r: any) => sum + (r.days_count || 0), 0) || 0

  // Get overdue professional interviews (employees without professional interview in last 2 years)
  const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000)

  // Get all active employees
  const { data: allActiveEmployees } = await getSupabaseClient()
    .from('hr_employees')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .is('deleted_at', null)

  let overdueInterviews = 0
  if (allActiveEmployees && allActiveEmployees.length > 0) {
    const employeeIds = allActiveEmployees.map((e: any) => e.id)

    // Get employees with professional interview in last 2 years
    const { data: recentInterviews } = await getSupabaseClient()
      .from('hr_interviews')
      .select('employee_id')
      .eq('organization_id', organizationId)
      .eq('type', 'professional')
      .eq('status', 'completed')
      .is('deleted_at', null)
      .gte('completed_date', twoYearsAgo.toISOString().split('T')[0])
      .in('employee_id', employeeIds)

    const employeesWithRecentInterview = new Set((recentInterviews || []).map((i: any) => i.employee_id))
    overdueInterviews = employeeIds.filter((id: string) => !employeesWithRecentInterview.has(id)).length
  }

  // Calculate turnover rate (left this month / average headcount * 100)
  const turnoverRate = activeEmployees > 0 ? ((leftThisMonth || 0) / activeEmployees) * 100 : null

  return {
    totalEmployees,
    activeEmployees,
    trialPeriodEmployees,
    leftThisMonth: leftThisMonth || 0,
    hiredThisMonth: hiredThisMonth || 0,
    pendingLeaveRequests: pendingLeaveRequests || 0,
    upcomingInterviews: upcomingInterviews || 0,
    trialEndingSoon: trialEndingSoon || 0,
    contractEndingSoon: contractEndingSoon || 0,
    absenteeismRate,
    averageTenureMonths,
    leaveDaysThisMonth,
    overdueInterviews,
    turnoverRate,
  }
}

// ===========================================
// GET EMPLOYEE COUNT BY DEPARTMENT
// ===========================================

export async function getEmployeeCountByDepartment(
  organizationId: string
): Promise<EmployeeCountByDepartment[]> {
  const { data, error } = await getSupabaseClient()
    .from('hr_employees')
    .select('department')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .not('department', 'is', null)

  if (error) throw error

  // Count by department
  const counts: Record<string, number> = {}
  ;(data || []).forEach((e: any) => {
    const dept = e.department || 'Non défini'
    counts[dept] = (counts[dept] || 0) + 1
  })

  return Object.entries(counts)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count)
}

// ===========================================
// GET EMPLOYEE COUNT BY CONTRACT TYPE
// ===========================================

export async function getEmployeeCountByContractType(
  organizationId: string
): Promise<EmployeeCountByContractType[]> {
  const { data, error } = await getSupabaseClient()
    .from('hr_employees')
    .select('contract_type')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .not('contract_type', 'is', null)

  if (error) throw error

  // Count by contract type
  const counts: Record<string, number> = {}
  ;(data || []).forEach((e: any) => {
    const type = e.contract_type || 'unknown'
    counts[type] = (counts[type] || 0) + 1
  })

  return Object.entries(counts)
    .map(([contractType, count]) => ({ contractType: contractType as ContractType, count }))
    .sort((a, b) => b.count - a.count)
}

// ===========================================
// GET HR ALERTS
// ===========================================

export async function getHrAlerts(organizationId: string): Promise<HrAlert[]> {
  const alerts: HrAlert[] = []
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Trial periods ending in next 15 days
  const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
  const { data: trialEnding } = await getSupabaseClient()
    .from('hr_employees')
    .select('id, first_name, last_name, trial_end_date')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('trial_end_date', 'is', null)
    .gte('trial_end_date', today)
    .lte('trial_end_date', fifteenDaysFromNow.toISOString().split('T')[0])

  ;(trialEnding || []).forEach((e: any) => {
    const daysRemaining = Math.ceil(
      (new Date(e.trial_end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    alerts.push({
      id: `trial-${e.id}`,
      type: 'trial_end',
      employeeId: e.id,
      employeeName: `${e.first_name} ${e.last_name}`,
      dueDate: e.trial_end_date,
      daysRemaining,
      message: `Fin de période d'essai dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`,
    })
  })

  // Contracts ending in next 30 days
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const { data: contractsEnding } = await getSupabaseClient()
    .from('hr_contracts')
    .select('id, employee_id, end_date')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('end_date', 'is', null)
    .gte('end_date', today)
    .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0])

  // Get employee names for contracts
  if (contractsEnding && contractsEnding.length > 0) {
    const employeeIds = [...new Set(contractsEnding.map((c: any) => c.employee_id))]
    const { data: employees } = await getSupabaseClient()
      .from('hr_employees')
      .select('id, first_name, last_name')
      .in('id', employeeIds)

    const employeeMap: Record<string, any> = {}
    ;(employees || []).forEach((e: any) => {
      employeeMap[e.id] = e
    })

    contractsEnding.forEach((c: any) => {
      const employee = employeeMap[c.employee_id]
      if (employee) {
        const daysRemaining = Math.ceil(
          (new Date(c.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        alerts.push({
          id: `contract-${c.id}`,
          type: 'contract_end',
          employeeId: c.employee_id,
          employeeName: `${employee.first_name} ${employee.last_name}`,
          dueDate: c.end_date,
          daysRemaining,
          message: `Fin de contrat dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`,
        })
      }
    })
  }

  // Documents expiring in next 30 days
  const { data: expiringDocs } = await getSupabaseClient()
    .from('hr_documents')
    .select('id, employee_id, name, valid_until')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .not('valid_until', 'is', null)
    .gte('valid_until', today)
    .lte('valid_until', thirtyDaysFromNow.toISOString().split('T')[0])

  // Get employee names for documents
  if (expiringDocs && expiringDocs.length > 0) {
    const employeeIds = [...new Set(expiringDocs.map((d: any) => d.employee_id))]
    const { data: employees } = await getSupabaseClient()
      .from('hr_employees')
      .select('id, first_name, last_name')
      .in('id', employeeIds)

    const employeeMap: Record<string, any> = {}
    ;(employees || []).forEach((e: any) => {
      employeeMap[e.id] = e
    })

    expiringDocs.forEach((d: any) => {
      const employee = employeeMap[d.employee_id]
      if (employee) {
        const daysRemaining = Math.ceil(
          (new Date(d.valid_until).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        alerts.push({
          id: `doc-${d.id}`,
          type: 'document_expiring',
          employeeId: d.employee_id,
          employeeName: `${employee.first_name} ${employee.last_name}`,
          dueDate: d.valid_until,
          daysRemaining,
          message: `Document "${d.name}" expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`,
        })
      }
    })
  }

  // Sort by days remaining
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining)
}

// ===========================================
// GET HEADCOUNT HISTORY
// ===========================================

export async function getHeadcountHistory(
  organizationId: string,
  months: number = 12
): Promise<{ month: string; count: number }[]> {
  const result: { month: string; count: number }[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)

    // Count employees active at end of that month
    const { count } = await getSupabaseClient()
      .from('hr_employees')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .lte('contract_start_date', endOfMonth.toISOString().split('T')[0])
      .or(`left_date.is.null,left_date.gt.${endOfMonth.toISOString().split('T')[0]}`)

    result.push({
      month: targetDate.toISOString().slice(0, 7), // YYYY-MM format
      count: count || 0,
    })
  }

  return result
}
