// ===========================================
// SCHEDULED REPORTS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  ScheduledReport,
  ReportHistory,
  CreateScheduledReportInput,
  UpdateScheduledReportInput,
} from '../types'

// Get Supabase client with analytics schema
function getAnalyticsClient() {
  return getSupabaseClient().schema('analytics' as any) as any
}

// ===========================================
// GET SCHEDULED REPORTS
// ===========================================

export async function getScheduledReports(
  organizationId: string
): Promise<ScheduledReport[]> {
  const client = getAnalyticsClient()

  const { data, error } = await client
    .from('scheduled_reports')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapScheduledReport)
}

// ===========================================
// GET SCHEDULED REPORT BY ID
// ===========================================

export async function getScheduledReportById(
  reportId: string
): Promise<ScheduledReport | null> {
  const client = getAnalyticsClient()

  const { data, error } = await client
    .from('scheduled_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapScheduledReport(data)
}

// ===========================================
// CREATE SCHEDULED REPORT
// ===========================================

export async function createScheduledReport(
  organizationId: string,
  userId: string,
  input: CreateScheduledReportInput
): Promise<ScheduledReport> {
  const client = getAnalyticsClient()

  // Calculate next run time
  const nextRunAt = calculateNextRun(
    input.frequency,
    input.dayOfWeek ?? null,
    input.dayOfMonth ?? null,
    input.timeOfDay || '08:00:00',
    input.timezone || 'Europe/Paris'
  )

  const { data, error } = await client
    .from('scheduled_reports')
    .insert({
      organization_id: organizationId,
      created_by: userId,
      name: input.name,
      description: input.description || null,
      dashboard_id: input.dashboardId || null,
      metrics: input.metrics || [],
      filters: input.filters || {},
      frequency: input.frequency,
      day_of_week: input.dayOfWeek ?? null,
      day_of_month: input.dayOfMonth ?? null,
      time_of_day: input.timeOfDay || '08:00:00',
      timezone: input.timezone || 'Europe/Paris',
      format: input.format || 'pdf',
      recipients: input.recipients,
      is_active: true,
      next_run_at: nextRunAt,
    })
    .select()
    .single()

  if (error) throw error

  return mapScheduledReport(data)
}

// ===========================================
// UPDATE SCHEDULED REPORT
// ===========================================

export async function updateScheduledReport(
  reportId: string,
  input: UpdateScheduledReportInput
): Promise<ScheduledReport> {
  const client = getAnalyticsClient()

  // Get current report to calculate next run if schedule changed
  const current = await getScheduledReportById(reportId)
  if (!current) throw new Error('Report not found')

  const updateData: any = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.dashboardId !== undefined) updateData.dashboard_id = input.dashboardId
  if (input.metrics !== undefined) updateData.metrics = input.metrics
  if (input.filters !== undefined) updateData.filters = input.filters
  if (input.frequency !== undefined) updateData.frequency = input.frequency
  if (input.dayOfWeek !== undefined) updateData.day_of_week = input.dayOfWeek
  if (input.dayOfMonth !== undefined) updateData.day_of_month = input.dayOfMonth
  if (input.timeOfDay !== undefined) updateData.time_of_day = input.timeOfDay
  if (input.timezone !== undefined) updateData.timezone = input.timezone
  if (input.format !== undefined) updateData.format = input.format
  if (input.recipients !== undefined) updateData.recipients = input.recipients

  // Recalculate next run if schedule changed
  if (input.frequency || input.dayOfWeek !== undefined || input.dayOfMonth !== undefined || input.timeOfDay) {
    updateData.next_run_at = calculateNextRun(
      input.frequency || current.frequency,
      input.dayOfWeek ?? current.dayOfWeek,
      input.dayOfMonth ?? current.dayOfMonth,
      input.timeOfDay || current.timeOfDay,
      input.timezone || current.timezone
    )
  }

  const { data, error } = await client
    .from('scheduled_reports')
    .update(updateData)
    .eq('id', reportId)
    .select()
    .single()

  if (error) throw error

  return mapScheduledReport(data)
}

// ===========================================
// TOGGLE SCHEDULED REPORT ACTIVE
// ===========================================

export async function toggleScheduledReportActive(
  reportId: string,
  isActive: boolean
): Promise<ScheduledReport> {
  const client = getAnalyticsClient()

  const updateData: any = { is_active: isActive }

  // If activating, recalculate next run
  if (isActive) {
    const current = await getScheduledReportById(reportId)
    if (current) {
      updateData.next_run_at = calculateNextRun(
        current.frequency,
        current.dayOfWeek,
        current.dayOfMonth,
        current.timeOfDay,
        current.timezone
      )
    }
  }

  const { data, error } = await client
    .from('scheduled_reports')
    .update(updateData)
    .eq('id', reportId)
    .select()
    .single()

  if (error) throw error

  return mapScheduledReport(data)
}

// ===========================================
// DELETE SCHEDULED REPORT
// ===========================================

export async function deleteScheduledReport(reportId: string): Promise<void> {
  const client = getAnalyticsClient()

  const { error } = await client
    .from('scheduled_reports')
    .delete()
    .eq('id', reportId)

  if (error) throw error
}

// ===========================================
// GET REPORT HISTORY
// ===========================================

export async function getReportHistory(
  reportId: string,
  limit = 20
): Promise<ReportHistory[]> {
  const client = getAnalyticsClient()

  const { data, error } = await client
    .from('report_history')
    .select('*')
    .eq('scheduled_report_id', reportId)
    .order('generated_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map(mapReportHistory)
}

// ===========================================
// TRIGGER REPORT MANUALLY
// ===========================================

export async function triggerReportManually(
  reportId: string
): Promise<ReportHistory> {
  const client = getAnalyticsClient()

  // Create a pending report history entry
  const { data, error } = await client
    .from('report_history')
    .insert({
      scheduled_report_id: reportId,
      status: 'pending',
      recipients_sent: [],
    })
    .select()
    .single()

  if (error) throw error

  // In a real implementation, this would trigger a background job
  // to generate the report

  return mapReportHistory(data)
}

// ===========================================
// HELPERS
// ===========================================

function mapScheduledReport(row: any): ScheduledReport {
  return {
    id: row.id,
    organizationId: row.organization_id,
    createdBy: row.created_by,
    name: row.name,
    description: row.description,
    dashboardId: row.dashboard_id,
    metrics: row.metrics || [],
    filters: row.filters || {},
    frequency: row.frequency,
    dayOfWeek: row.day_of_week,
    dayOfMonth: row.day_of_month,
    timeOfDay: row.time_of_day,
    timezone: row.timezone,
    format: row.format,
    recipients: row.recipients || [],
    isActive: row.is_active,
    lastRunAt: row.last_run_at,
    nextRunAt: row.next_run_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapReportHistory(row: any): ReportHistory {
  return {
    id: row.id,
    scheduledReportId: row.scheduled_report_id,
    generatedAt: row.generated_at,
    fileUrl: row.file_url,
    fileSizeBytes: row.file_size_bytes,
    status: row.status,
    errorMessage: row.error_message,
    recipientsSent: row.recipients_sent || [],
    createdAt: row.created_at,
  }
}

function calculateNextRun(
  frequency: string,
  dayOfWeek: number | null,
  dayOfMonth: number | null,
  timeOfDay: string,
  _timezone: string
): string {
  const now = new Date()
  const [hours, minutes] = timeOfDay.split(':').map(Number)

  let nextRun = new Date(now)
  nextRun.setHours(hours || 8, minutes || 0, 0, 0)

  switch (frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      break

    case 'weekly':
      const targetDay = dayOfWeek ?? 1 // Default to Monday
      const currentDay = nextRun.getDay()
      let daysUntil = (targetDay - currentDay + 7) % 7
      if (daysUntil === 0 && nextRun <= now) {
        daysUntil = 7
      }
      nextRun.setDate(nextRun.getDate() + daysUntil)
      break

    case 'monthly':
      const targetDate = dayOfMonth ?? 1
      nextRun.setDate(Math.min(targetDate, getDaysInMonth(nextRun)))
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
        nextRun.setDate(Math.min(targetDate, getDaysInMonth(nextRun)))
      }
      break
  }

  return nextRun.toISOString()
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}
