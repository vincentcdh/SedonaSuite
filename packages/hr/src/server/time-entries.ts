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

  let query = getSupabaseClient()
    .from('hr_time_entries')
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
      ? getSupabaseClient().from('hr_employees').select('id, first_name, last_name, photo_url').in('id', employeeIds)
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
  let query = getSupabaseClient()
    .from('hr_time_entries')
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
  const { data, error } = await getSupabaseClient()
    .from('hr_time_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const entry = mapTimeEntryFromDb(data)

  // Get employee data
  const { data: employeeData } = await getSupabaseClient()
    .from('hr_employees')
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
  const { data, error } = await getSupabaseClient()
    .from('hr_time_entries')
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
  const { data, error } = await getSupabaseClient()
    .from('hr_time_entries')
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

  const { data, error } = await getSupabaseClient()
    .from('hr_time_entries')
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
  const { data, error } = await getSupabaseClient()
    .from('hr_time_entries')
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
  const { data, error } = await getSupabaseClient()
    .from('hr_time_entries')
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
  const { error } = await getSupabaseClient()
    .from('hr_time_entries')
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

  const { data, error } = await getSupabaseClient()
    .from('hr_time_entries')
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

  const { data, error } = await getSupabaseClient()
    .from('hr_time_entries')
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
// GET ORGANIZATION TIME STATS
// ===========================================

export async function getOrganizationTimeStats(
  organizationId: string
): Promise<{
  totalHoursToday: number
  totalHoursWeek: number
  averagePerDay: number
  overtimeHours: number
}> {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Get start of week (Monday)
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() + mondayOffset)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Get today's entries
  const { data: todayData } = await getSupabaseClient()
    .from('hr_time_entries')
    .select('hours_worked, overtime_hours')
    .eq('organization_id', organizationId)
    .eq('date', todayStr)

  // Get week's entries
  const { data: weekData } = await getSupabaseClient()
    .from('hr_time_entries')
    .select('hours_worked, overtime_hours, date')
    .eq('organization_id', organizationId)
    .gte('date', weekStartStr)
    .lte('date', todayStr)

  const todayEntries = todayData || []
  const weekEntries = weekData || []

  const totalHoursToday = todayEntries.reduce((sum: number, e: any) => sum + (e.hours_worked || 0), 0)
  const totalHoursWeek = weekEntries.reduce((sum: number, e: any) => sum + (e.hours_worked || 0), 0)
  const overtimeHours = weekEntries.reduce((sum: number, e: any) => sum + (e.overtime_hours || 0), 0)

  // Calculate unique days worked this week
  const uniqueDays = new Set(weekEntries.map((e: any) => e.date)).size
  const averagePerDay = uniqueDays > 0 ? totalHoursWeek / uniqueDays : 0

  return {
    totalHoursToday: Math.round(totalHoursToday * 10) / 10,
    totalHoursWeek: Math.round(totalHoursWeek * 10) / 10,
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    overtimeHours: Math.round(overtimeHours * 10) / 10,
  }
}

// ===========================================
// GET EMPLOYEES TIME STATUS
// ===========================================

export interface EmployeeTimeStatus {
  id: string
  firstName: string
  lastName: string
  photoUrl: string | null
  jobTitle: string | null
  hoursToday: number
  hoursWeek: number
  lastEntry: {
    startTime: string | null
    endTime: string | null
    notes: string | null
  } | null
  status: 'working' | 'break' | 'offline'
}

export async function getEmployeesTimeStatus(
  organizationId: string
): Promise<EmployeeTimeStatus[]> {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Get start of week (Monday)
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() + mondayOffset)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Get all active employees
  const { data: employees } = await getSupabaseClient()
    .from('hr_employees')
    .select('id, first_name, last_name, photo_url, job_title')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .is('deleted_at', null)

  if (!employees || employees.length === 0) {
    return []
  }

  const employeeIds = employees.map((e: any) => e.id)

  // Get today's entries for all employees
  const { data: todayEntries } = await getSupabaseClient()
    .from('hr_time_entries')
    .select('employee_id, hours_worked, start_time, end_time, notes')
    .in('employee_id', employeeIds)
    .eq('date', todayStr)

  // Get week's entries for all employees
  const { data: weekEntries } = await getSupabaseClient()
    .from('hr_time_entries')
    .select('employee_id, hours_worked')
    .in('employee_id', employeeIds)
    .gte('date', weekStartStr)
    .lte('date', todayStr)

  const todayMap: Record<string, any[]> = {}
  const weekMap: Record<string, number> = {}

  ;(todayEntries || []).forEach((e: any) => {
    if (!todayMap[e.employee_id]) {
      todayMap[e.employee_id] = []
    }
    todayMap[e.employee_id].push(e)
  })

  ;(weekEntries || []).forEach((e: any) => {
    weekMap[e.employee_id] = (weekMap[e.employee_id] || 0) + (e.hours_worked || 0)
  })

  return employees.map((emp: any) => {
    const todayData = todayMap[emp.id] || []
    const hoursToday = todayData.reduce((sum: number, e: any) => sum + (e.hours_worked || 0), 0)
    const hoursWeek = weekMap[emp.id] || 0
    const lastEntry = todayData.length > 0 ? todayData[todayData.length - 1] : null

    // Determine status based on last entry
    let status: 'working' | 'break' | 'offline' = 'offline'
    if (lastEntry) {
      if (lastEntry.start_time && !lastEntry.end_time) {
        status = 'working'
      } else if (lastEntry.end_time) {
        // Check if recently ended (within last 30 minutes)
        const now = new Date()
        const [hours, minutes] = (lastEntry.end_time as string).split(':').map(Number)
        const endTime = new Date(today)
        endTime.setHours(hours, minutes, 0, 0)
        const diffMinutes = (now.getTime() - endTime.getTime()) / (1000 * 60)
        status = diffMinutes < 30 ? 'break' : 'offline'
      }
    }

    return {
      id: emp.id,
      firstName: emp.first_name,
      lastName: emp.last_name,
      photoUrl: emp.photo_url,
      jobTitle: emp.job_title,
      hoursToday: Math.round(hoursToday * 10) / 10,
      hoursWeek: Math.round(hoursWeek * 10) / 10,
      lastEntry: lastEntry ? {
        startTime: lastEntry.start_time,
        endTime: lastEntry.end_time,
        notes: lastEntry.notes,
      } : null,
      status,
    }
  })
}

// ===========================================
// BADGE / CLOCK IN-OUT
// ===========================================

import type {
  Badge,
  BadgeWithEmployee,
  BadgeType,
  EmployeeBadgeStatus,
  DailyWorkSummary,
  CreateBadgeInput,
  BadgeFilters,
} from '../types'

export async function getBadges(
  organizationId: string,
  filters: BadgeFilters = {}
): Promise<Badge[]> {
  let query = getSupabaseClient()
    .from('hr_badges')
    .select('*')
    .eq('organization_id', organizationId)

  if (filters.employeeId) {
    query = query.eq('employee_id', filters.employeeId)
  }
  if (filters.dateFrom) {
    query = query.gte('badge_date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('badge_date', filters.dateTo)
  }
  if (filters.badgeType) {
    if (Array.isArray(filters.badgeType)) {
      query = query.in('badge_type', filters.badgeType)
    } else {
      query = query.eq('badge_type', filters.badgeType)
    }
  }

  const { data, error } = await query.order('badge_time', { ascending: true })

  if (error) throw error

  return (data || []).map(mapBadgeFromDb)
}

export async function getBadgesByEmployee(
  employeeId: string,
  date: string
): Promise<Badge[]> {
  const { data, error } = await getSupabaseClient()
    .from('hr_badges')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('badge_date', date)
    .order('badge_time', { ascending: true })

  if (error) throw error

  return (data || []).map(mapBadgeFromDb)
}

export async function getEmployeeBadgeStatus(
  employeeId: string,
  date: string
): Promise<EmployeeBadgeStatus> {
  const badges = await getBadgesByEmployee(employeeId, date)

  // Get employee info
  const { data: employeeData } = await getSupabaseClient()
    .from('hr_employees')
    .select('id, organization_id, first_name, last_name')
    .eq('id', employeeId)
    .single()

  const lastBadge = badges.length > 0 ? badges[badges.length - 1] : null

  // Determine status based on last badge
  const isClockedIn = lastBadge?.badgeType === 'clock_in' || lastBadge?.badgeType === 'break_end'
  const isOnBreak = lastBadge?.badgeType === 'break_start'

  return {
    employeeId,
    organizationId: employeeData?.organization_id || '',
    firstName: employeeData?.first_name || '',
    lastName: employeeData?.last_name || '',
    lastBadgeType: lastBadge?.badgeType || null,
    lastBadgeTime: lastBadge?.badgeTime || null,
    badgeDate: date,
    isClockedIn,
    isOnBreak,
  }
}

export async function getAllEmployeesBadgeStatus(
  organizationId: string,
  date: string
): Promise<EmployeeBadgeStatus[]> {
  // Get all active employees
  const { data: employees } = await getSupabaseClient()
    .from('hr_employees')
    .select('id, organization_id, first_name, last_name')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .is('deleted_at', null)

  if (!employees || employees.length === 0) {
    return []
  }

  // Get all badges for today
  const employeeIds = employees.map((e: any) => e.id)
  const { data: badges } = await getSupabaseClient()
    .from('hr_badges')
    .select('*')
    .in('employee_id', employeeIds)
    .eq('badge_date', date)
    .order('badge_time', { ascending: true })

  // Group badges by employee
  const badgesByEmployee: Record<string, Badge[]> = {}
  employeeIds.forEach((id: string) => {
    badgesByEmployee[id] = []
  })

  ;(badges || []).forEach((b: any) => {
    if (!badgesByEmployee[b.employee_id]) {
      badgesByEmployee[b.employee_id] = []
    }
    badgesByEmployee[b.employee_id].push(mapBadgeFromDb(b))
  })

  return employees.map((emp: any) => {
    const empBadges = badgesByEmployee[emp.id] || []
    const lastBadge = empBadges.length > 0 ? empBadges[empBadges.length - 1] : null

    const isClockedIn = lastBadge?.badgeType === 'clock_in' || lastBadge?.badgeType === 'break_end'
    const isOnBreak = lastBadge?.badgeType === 'break_start'

    return {
      employeeId: emp.id,
      organizationId: emp.organization_id,
      firstName: emp.first_name,
      lastName: emp.last_name,
      lastBadgeType: lastBadge?.badgeType || null,
      lastBadgeTime: lastBadge?.badgeTime || null,
      badgeDate: date,
      isClockedIn,
      isOnBreak,
    }
  })
}

export async function getDailyWorkSummary(
  employeeId: string,
  date: string
): Promise<DailyWorkSummary> {
  const badges = await getBadgesByEmployee(employeeId, date)

  let totalMinutes = 0
  let breakMinutes = 0
  let clockInTime: Date | null = null
  let breakStartTime: Date | null = null
  let firstClockIn: string | null = null
  let lastClockOut: string | null = null

  for (const badge of badges) {
    const badgeTime = new Date(badge.badgeTime)

    switch (badge.badgeType) {
      case 'clock_in':
        clockInTime = badgeTime
        if (!firstClockIn) {
          firstClockIn = badge.badgeTime
        }
        break
      case 'clock_out':
        if (clockInTime) {
          totalMinutes += (badgeTime.getTime() - clockInTime.getTime()) / (1000 * 60)
          clockInTime = null
          lastClockOut = badge.badgeTime
        }
        break
      case 'break_start':
        breakStartTime = badgeTime
        break
      case 'break_end':
        if (breakStartTime) {
          breakMinutes += (badgeTime.getTime() - breakStartTime.getTime()) / (1000 * 60)
          breakStartTime = null
        }
        break
    }
  }

  // If still clocked in, add time until now
  if (clockInTime) {
    const now = new Date()
    totalMinutes += (now.getTime() - clockInTime.getTime()) / (1000 * 60)
  }

  // If still on break, add break time until now
  if (breakStartTime) {
    const now = new Date()
    breakMinutes += (now.getTime() - breakStartTime.getTime()) / (1000 * 60)
  }

  const workMinutes = Math.max(0, totalMinutes - breakMinutes)

  return {
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    breakHours: Math.round((breakMinutes / 60) * 100) / 100,
    workHours: Math.round((workMinutes / 60) * 100) / 100,
    firstClockIn,
    lastClockOut,
  }
}

export async function createBadge(
  organizationId: string,
  input: CreateBadgeInput
): Promise<Badge> {
  const badgeTime = input.badgeTime || new Date().toISOString()

  const { data, error } = await getSupabaseClient()
    .from('hr_badges')
    .insert({
      organization_id: organizationId,
      employee_id: input.employeeId,
      badge_type: input.badgeType,
      badge_time: badgeTime,
      latitude: input.latitude,
      longitude: input.longitude,
      location_name: input.locationName,
      device_type: input.deviceType || 'web',
      notes: input.notes,
    })
    .select()
    .single()

  if (error) throw error

  return mapBadgeFromDb(data)
}

export async function clockIn(
  organizationId: string,
  employeeId: string,
  notes?: string
): Promise<Badge> {
  return createBadge(organizationId, {
    employeeId,
    badgeType: 'clock_in',
    notes,
    deviceType: 'web',
  })
}

export async function clockOut(
  organizationId: string,
  employeeId: string,
  notes?: string
): Promise<Badge> {
  return createBadge(organizationId, {
    employeeId,
    badgeType: 'clock_out',
    notes,
    deviceType: 'web',
  })
}

export async function startBreak(
  organizationId: string,
  employeeId: string,
  notes?: string
): Promise<Badge> {
  return createBadge(organizationId, {
    employeeId,
    badgeType: 'break_start',
    notes,
    deviceType: 'web',
  })
}

export async function endBreak(
  organizationId: string,
  employeeId: string,
  notes?: string
): Promise<Badge> {
  return createBadge(organizationId, {
    employeeId,
    badgeType: 'break_end',
    notes,
    deviceType: 'web',
  })
}

export async function deleteBadge(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('hr_badges')
    .delete()
    .eq('id', id)

  if (error) throw error
}

function mapBadgeFromDb(data: any): Badge {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    employeeId: data.employee_id as string,
    badgeType: data.badge_type as BadgeType,
    badgeTime: data.badge_time as string,
    badgeDate: data.badge_date as string,
    latitude: data.latitude as number | null,
    longitude: data.longitude as number | null,
    locationName: data.location_name as string | null,
    deviceType: data.device_type as string | null,
    ipAddress: data.ip_address as string | null,
    notes: data.notes as string | null,
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
  }
}

function parseTime(timeStr: string): number {
  const parts = timeStr.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 60 + minutes
}

function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h${mins > 0 ? String(mins).padStart(2, '0') : ''}`
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
