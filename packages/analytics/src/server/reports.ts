// ===========================================
// SCHEDULED REPORTS SERVER FUNCTIONS
// ===========================================
// Note: analytics_scheduled_reports and analytics_report_history tables
// don't exist in the database schema. All functions return empty/stub data.

import type {
  ScheduledReport,
  ReportHistory,
  CreateScheduledReportInput,
  UpdateScheduledReportInput,
} from '../types'

// ===========================================
// GET SCHEDULED REPORTS
// ===========================================

export async function getScheduledReports(
  _organizationId: string
): Promise<ScheduledReport[]> {
  // Table doesn't exist in schema
  return []
}

// ===========================================
// GET SCHEDULED REPORT BY ID
// ===========================================

export async function getScheduledReportById(
  _reportId: string
): Promise<ScheduledReport | null> {
  // Table doesn't exist in schema
  return null
}

// ===========================================
// CREATE SCHEDULED REPORT
// ===========================================

export async function createScheduledReport(
  _organizationId: string,
  _userId: string,
  _input: CreateScheduledReportInput
): Promise<ScheduledReport> {
  // Table doesn't exist in schema
  throw new Error('Scheduled reports feature is not available')
}

// ===========================================
// UPDATE SCHEDULED REPORT
// ===========================================

export async function updateScheduledReport(
  _reportId: string,
  _input: UpdateScheduledReportInput
): Promise<ScheduledReport> {
  // Table doesn't exist in schema
  throw new Error('Scheduled reports feature is not available')
}

// ===========================================
// TOGGLE SCHEDULED REPORT ACTIVE
// ===========================================

export async function toggleScheduledReportActive(
  _reportId: string,
  _isActive: boolean
): Promise<ScheduledReport> {
  // Table doesn't exist in schema
  throw new Error('Scheduled reports feature is not available')
}

// ===========================================
// DELETE SCHEDULED REPORT
// ===========================================

export async function deleteScheduledReport(_reportId: string): Promise<void> {
  // Table doesn't exist in schema
}

// ===========================================
// GET REPORT HISTORY
// ===========================================

export async function getReportHistory(
  _reportId: string,
  _limit = 20
): Promise<ReportHistory[]> {
  // Table doesn't exist in schema
  return []
}

// ===========================================
// TRIGGER REPORT MANUALLY
// ===========================================

export async function triggerReportManually(
  _reportId: string
): Promise<ReportHistory> {
  // Table doesn't exist in schema
  throw new Error('Scheduled reports feature is not available')
}
