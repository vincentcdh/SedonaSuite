// ===========================================
// INTERVIEW SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Interview,
  InterviewWithRelations,
  CreateInterviewInput,
  UpdateInterviewInput,
  InterviewFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// GET INTERVIEWS
// ===========================================

export async function getInterviews(
  organizationId: string,
  filters: InterviewFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<InterviewWithRelations>> {
  const { page = 1, pageSize = 20, sortBy = 'scheduledDate', sortOrder = 'asc' } = pagination
  const offset = (page - 1) * pageSize

  let query = getSupabaseClient()
    .from('hr_interviews')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Apply filters
  if (filters.employeeId) {
    query = query.eq('employee_id', filters.employeeId)
  }
  if (filters.type) {
    if (Array.isArray(filters.type)) {
      query = query.in('type', filters.type)
    } else {
      query = query.eq('type', filters.type)
    }
  }
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }
  if (filters.scheduledFrom) {
    query = query.gte('scheduled_date', filters.scheduledFrom)
  }
  if (filters.scheduledTo) {
    query = query.lte('scheduled_date', filters.scheduledTo)
  }

  // Sorting
  query = query.order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Get related data
  const employeeIds = [...new Set((data || []).map((i: any) => i.employee_id))]
  const interviewerIds = [...new Set((data || []).filter((i: any) => i.interviewer_id).map((i: any) => i.interviewer_id))]
  const allEmployeeIds = [...new Set([...employeeIds, ...interviewerIds])]

  let employees: any[] = []
  if (allEmployeeIds.length > 0) {
    const { data: employeeData } = await getSupabaseClient()
      .from('hr_employees')
      .select('id, first_name, last_name, photo_url, job_title')
      .in('id', allEmployeeIds)
    employees = employeeData || []
  }

  const employeeMap: Record<string, any> = {}
  employees.forEach((e: any) => {
    employeeMap[e.id] = e
  })

  return {
    data: (data || []).map((i: any) => ({
      ...mapInterviewFromDb(i),
      employee: employeeMap[i.employee_id]
        ? {
            id: employeeMap[i.employee_id].id,
            firstName: employeeMap[i.employee_id].first_name,
            lastName: employeeMap[i.employee_id].last_name,
            photoUrl: employeeMap[i.employee_id].photo_url,
            jobTitle: employeeMap[i.employee_id].job_title,
          }
        : undefined,
      interviewer: i.interviewer_id && employeeMap[i.interviewer_id]
        ? {
            id: employeeMap[i.interviewer_id].id,
            firstName: employeeMap[i.interviewer_id].first_name,
            lastName: employeeMap[i.interviewer_id].last_name,
            photoUrl: employeeMap[i.interviewer_id].photo_url,
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
// GET INTERVIEWS BY EMPLOYEE
// ===========================================

export async function getInterviewsByEmployee(employeeId: string): Promise<InterviewWithRelations[]> {
  const { data, error } = await getSupabaseClient()
    .from('hr_interviews')
    .select('*')
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('scheduled_date', { ascending: false })

  if (error) throw error

  // Get interviewers
  const interviewerIds = [...new Set((data || []).filter((i: any) => i.interviewer_id).map((i: any) => i.interviewer_id))]

  let interviewers: any[] = []
  if (interviewerIds.length > 0) {
    const { data: interviewerData } = await getSupabaseClient()
      .from('hr_employees')
      .select('id, first_name, last_name, photo_url')
      .in('id', interviewerIds)
    interviewers = interviewerData || []
  }

  const interviewerMap: Record<string, any> = {}
  interviewers.forEach((i: any) => {
    interviewerMap[i.id] = i
  })

  return (data || []).map((i: any) => ({
    ...mapInterviewFromDb(i),
    interviewer: i.interviewer_id && interviewerMap[i.interviewer_id]
      ? {
          id: interviewerMap[i.interviewer_id].id,
          firstName: interviewerMap[i.interviewer_id].first_name,
          lastName: interviewerMap[i.interviewer_id].last_name,
          photoUrl: interviewerMap[i.interviewer_id].photo_url,
        }
      : undefined,
  }))
}

// ===========================================
// GET INTERVIEW BY ID
// ===========================================

export async function getInterviewById(id: string): Promise<InterviewWithRelations | null> {
  const { data, error } = await getSupabaseClient()
    .from('hr_interviews')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const interview = mapInterviewFromDb(data)

  // Get related employees
  const employeeIds = [interview.employeeId]
  if (interview.interviewerId) {
    employeeIds.push(interview.interviewerId)
  }

  const { data: employees } = await getSupabaseClient()
    .from('hr_employees')
    .select('id, first_name, last_name, photo_url, job_title')
    .in('id', employeeIds)

  const employeeMap: Record<string, any> = {}
  ;(employees || []).forEach((e: any) => {
    employeeMap[e.id] = e
  })

  return {
    ...interview,
    employee: employeeMap[interview.employeeId]
      ? {
          id: employeeMap[interview.employeeId].id,
          firstName: employeeMap[interview.employeeId].first_name,
          lastName: employeeMap[interview.employeeId].last_name,
          photoUrl: employeeMap[interview.employeeId].photo_url,
          jobTitle: employeeMap[interview.employeeId].job_title,
        }
      : undefined,
    interviewer: interview.interviewerId && employeeMap[interview.interviewerId]
      ? {
          id: employeeMap[interview.interviewerId].id,
          firstName: employeeMap[interview.interviewerId].first_name,
          lastName: employeeMap[interview.interviewerId].last_name,
          photoUrl: employeeMap[interview.interviewerId].photo_url,
        }
      : undefined,
  }
}

// ===========================================
// CREATE INTERVIEW
// ===========================================

export async function createInterview(
  organizationId: string,
  input: CreateInterviewInput,
  userId?: string
): Promise<Interview> {
  const { data, error } = await getSupabaseClient()
    .from('hr_interviews')
    .insert({
      organization_id: organizationId,
      employee_id: input.employeeId,
      type: input.type,
      scheduled_date: input.scheduledDate,
      interviewer_id: input.interviewerId,
      objectives: input.objectives,
      status: 'scheduled',
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  return mapInterviewFromDb(data)
}

// ===========================================
// UPDATE INTERVIEW
// ===========================================

export async function updateInterview(input: UpdateInterviewInput): Promise<Interview> {
  const updateData: any = {}

  if (input.type !== undefined) updateData.type = input.type
  if (input.scheduledDate !== undefined) updateData.scheduled_date = input.scheduledDate
  if (input.completedDate !== undefined) updateData.completed_date = input.completedDate
  if (input.interviewerId !== undefined) updateData.interviewer_id = input.interviewerId
  if (input.objectives !== undefined) updateData.objectives = input.objectives
  if (input.achievements !== undefined) updateData.achievements = input.achievements
  if (input.feedback !== undefined) updateData.feedback = input.feedback
  if (input.developmentPlan !== undefined) updateData.development_plan = input.developmentPlan
  if (input.employeeComments !== undefined) updateData.employee_comments = input.employeeComments
  if (input.documentUrl !== undefined) updateData.document_url = input.documentUrl
  if (input.status !== undefined) updateData.status = input.status

  const { data, error } = await getSupabaseClient()
    .from('hr_interviews')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapInterviewFromDb(data)
}

// ===========================================
// COMPLETE INTERVIEW
// ===========================================

export async function completeInterview(
  id: string,
  report: {
    achievements?: string
    feedback?: string
    developmentPlan?: string
    employeeComments?: string
    documentUrl?: string
  }
): Promise<Interview> {
  const { data, error } = await getSupabaseClient()
    .from('hr_interviews')
    .update({
      status: 'completed',
      completed_date: new Date().toISOString(),
      achievements: report.achievements,
      feedback: report.feedback,
      development_plan: report.developmentPlan,
      employee_comments: report.employeeComments,
      document_url: report.documentUrl,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapInterviewFromDb(data)
}

// ===========================================
// CANCEL INTERVIEW
// ===========================================

export async function cancelInterview(id: string): Promise<Interview> {
  const { data, error } = await getSupabaseClient()
    .from('hr_interviews')
    .update({
      status: 'canceled',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapInterviewFromDb(data)
}

// ===========================================
// DELETE INTERVIEW
// ===========================================

export async function deleteInterview(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('hr_interviews')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// GET UPCOMING INTERVIEWS
// ===========================================

export async function getUpcomingInterviews(
  organizationId: string,
  daysAhead: number = 30
): Promise<InterviewWithRelations[]> {
  const today = new Date()
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000)

  const { data, error } = await getSupabaseClient()
    .from('hr_interviews')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'scheduled')
    .is('deleted_at', null)
    .gte('scheduled_date', today.toISOString())
    .lte('scheduled_date', futureDate.toISOString())
    .order('scheduled_date', { ascending: true })

  if (error) throw error

  // Get related employees
  const employeeIds = [...new Set((data || []).map((i: any) => i.employee_id))]
  const interviewerIds = [...new Set((data || []).filter((i: any) => i.interviewer_id).map((i: any) => i.interviewer_id))]
  const allEmployeeIds = [...new Set([...employeeIds, ...interviewerIds])]

  let employees: any[] = []
  if (allEmployeeIds.length > 0) {
    const { data: employeeData } = await getSupabaseClient()
      .from('hr_employees')
      .select('id, first_name, last_name, photo_url, job_title')
      .in('id', allEmployeeIds)
    employees = employeeData || []
  }

  const employeeMap: Record<string, any> = {}
  employees.forEach((e: any) => {
    employeeMap[e.id] = e
  })

  return (data || []).map((i: any) => ({
    ...mapInterviewFromDb(i),
    employee: employeeMap[i.employee_id]
      ? {
          id: employeeMap[i.employee_id].id,
          firstName: employeeMap[i.employee_id].first_name,
          lastName: employeeMap[i.employee_id].last_name,
          photoUrl: employeeMap[i.employee_id].photo_url,
          jobTitle: employeeMap[i.employee_id].job_title,
        }
      : undefined,
    interviewer: i.interviewer_id && employeeMap[i.interviewer_id]
      ? {
          id: employeeMap[i.interviewer_id].id,
          firstName: employeeMap[i.interviewer_id].first_name,
          lastName: employeeMap[i.interviewer_id].last_name,
          photoUrl: employeeMap[i.interviewer_id].photo_url,
        }
      : undefined,
  }))
}

// ===========================================
// GET EMPLOYEES NEEDING PROFESSIONAL INTERVIEW
// ===========================================

export async function getEmployeesNeedingProfessionalInterview(
  organizationId: string
): Promise<{ employeeId: string; lastInterviewDate: string | null; monthsSinceLastInterview: number }[]> {
  // Get all active employees
  const { data: employees } = await getSupabaseClient()
    .from('hr_employees')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .is('deleted_at', null)

  if (!employees || employees.length === 0) return []

  // Get last professional interview for each employee
  const employeeIds = employees.map((e: any) => e.id)
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

  const results: { employeeId: string; lastInterviewDate: string | null; monthsSinceLastInterview: number }[] = []

  for (const employeeId of employeeIds) {
    const { data: lastInterview } = await getSupabaseClient()
      .from('hr_interviews')
      .select('completed_date')
      .eq('employee_id', employeeId)
      .eq('type', 'professional')
      .eq('status', 'completed')
      .is('deleted_at', null)
      .order('completed_date', { ascending: false })
      .limit(1)
      .single()

    const lastInterviewDate = lastInterview?.completed_date || null
    let monthsSinceLastInterview = 999

    if (lastInterviewDate) {
      const lastDate = new Date(lastInterviewDate)
      const now = new Date()
      monthsSinceLastInterview = (now.getFullYear() - lastDate.getFullYear()) * 12 + (now.getMonth() - lastDate.getMonth())
    }

    // Professional interviews are required every 2 years (24 months)
    if (monthsSinceLastInterview >= 24) {
      results.push({
        employeeId,
        lastInterviewDate,
        monthsSinceLastInterview,
      })
    }
  }

  return results
}

// ===========================================
// HELPERS
// ===========================================

function mapInterviewFromDb(data: any): Interview {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    employeeId: data.employee_id as string,
    type: data.type as Interview['type'],
    scheduledDate: data.scheduled_date as string,
    completedDate: data.completed_date as string | null,
    interviewerId: data.interviewer_id as string | null,
    objectives: data.objectives as string | null,
    achievements: data.achievements as string | null,
    feedback: data.feedback as string | null,
    developmentPlan: data.development_plan as string | null,
    employeeComments: data.employee_comments as string | null,
    documentUrl: data.document_url as string | null,
    status: (data.status as Interview['status']) || 'scheduled',
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | null,
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
