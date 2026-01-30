// ===========================================
// ANALYTICS MODULE TYPES
// ===========================================

import { z } from 'zod'

// ===========================================
// ENUMS
// ===========================================

export const WidgetType = {
  KPI: 'kpi',
  LINE_CHART: 'line_chart',
  BAR_CHART: 'bar_chart',
  PIE_CHART: 'pie_chart',
  TABLE: 'table',
  GOAL_PROGRESS: 'goal_progress',
  HEATMAP: 'heatmap',
} as const

export type WidgetType = (typeof WidgetType)[keyof typeof WidgetType]

export const MetricSource = {
  CRM: 'crm',
  INVOICE: 'invoice',
  PROJECTS: 'projects',
  TICKETS: 'tickets',
  HR: 'hr',
  DOCS: 'docs',
} as const

export type MetricSource = (typeof MetricSource)[keyof typeof MetricSource]

export const PeriodType = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
} as const

export type PeriodType = (typeof PeriodType)[keyof typeof PeriodType]

export const ComparisonType = {
  PREVIOUS_PERIOD: 'previous_period',
  SAME_PERIOD_LAST_YEAR: 'same_period_last_year',
  CUSTOM: 'custom',
  NONE: 'none',
} as const

export type ComparisonType = (typeof ComparisonType)[keyof typeof ComparisonType]

export const ReportFormat = {
  PDF: 'pdf',
  CSV: 'csv',
  EXCEL: 'excel',
} as const

export type ReportFormat = (typeof ReportFormat)[keyof typeof ReportFormat]

export const ReportFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const

export type ReportFrequency = (typeof ReportFrequency)[keyof typeof ReportFrequency]

// ===========================================
// DASHBOARD TYPES
// ===========================================

export interface Dashboard {
  id: string
  organizationId: string
  createdBy: string
  name: string
  description: string | null
  isDefault: boolean
  isShared: boolean
  layout: DashboardLayout[]
  createdAt: string
  updatedAt: string
}

export interface DashboardLayout {
  widgetId: string
  x: number
  y: number
  w: number
  h: number
}

export interface DashboardWithWidgets extends Dashboard {
  widgets: Widget[]
}

// ===========================================
// WIDGET TYPES
// ===========================================

export interface Widget {
  id: string
  dashboardId: string
  title: string
  widgetType: WidgetType
  metricSource: MetricSource
  metricKey: string
  config: WidgetConfig
  gridX: number
  gridY: number
  gridW: number
  gridH: number
  createdAt: string
  updatedAt: string
}

export interface WidgetConfig {
  period?: PeriodType
  comparison?: ComparisonType
  filters?: Record<string, unknown>
  colors?: string[]
  format?: 'currency' | 'number' | 'percentage'
  showTrend?: boolean
  showComparison?: boolean
  limit?: number
}

export interface WidgetData {
  value: number
  previousValue?: number
  change?: number
  changePercent?: number
  trend?: 'up' | 'down' | 'stable'
  series?: DataPoint[]
  breakdown?: BreakdownItem[]
}

export interface DataPoint {
  date: string
  value: number
  label?: string
}

export interface BreakdownItem {
  label: string
  value: number
  color?: string
  percentage?: number
}

// ===========================================
// GOAL TYPES
// ===========================================

export interface Goal {
  id: string
  organizationId: string
  createdBy: string
  assignedTo: string | null
  name: string
  description: string | null
  metricSource: MetricSource
  metricKey: string
  targetValue: number
  currentValue: number
  periodType: PeriodType
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GoalWithProgress extends Goal {
  progress: GoalProgress[]
  percentComplete: number
  daysRemaining: number
  projectedValue?: number
  onTrack: boolean
}

export interface GoalProgress {
  id: string
  goalId: string
  recordedAt: string
  value: number
  createdAt: string
}

// ===========================================
// SCHEDULED REPORT TYPES
// ===========================================

export interface ScheduledReport {
  id: string
  organizationId: string
  createdBy: string
  name: string
  description: string | null
  dashboardId: string | null
  metrics: MetricConfig[]
  filters: Record<string, unknown>
  frequency: ReportFrequency
  dayOfWeek: number | null
  dayOfMonth: number | null
  timeOfDay: string
  timezone: string
  format: ReportFormat
  recipients: string[]
  isActive: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  createdAt: string
  updatedAt: string
}

export interface MetricConfig {
  source: MetricSource
  key: string
}

export interface ReportHistory {
  id: string
  scheduledReportId: string
  generatedAt: string
  fileUrl: string | null
  fileSizeBytes: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  errorMessage: string | null
  recipientsSent: string[]
  createdAt: string
}

// ===========================================
// METRICS CACHE TYPES
// ===========================================

export interface MetricsCache {
  id: string
  organizationId: string
  metricSource: MetricSource
  metricKey: string
  periodType: PeriodType
  periodStart: string
  periodEnd: string
  value: number
  metadata: Record<string, unknown>
  computedAt: string
  expiresAt: string | null
}

// ===========================================
// ZOD SCHEMAS
// ===========================================

export const createDashboardSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
  isShared: z.boolean().optional(),
})

export const updateDashboardSchema = createDashboardSchema.partial()

export const createWidgetSchema = z.object({
  dashboardId: z.string().uuid(),
  title: z.string().min(1).max(255),
  widgetType: z.enum(['kpi', 'line_chart', 'bar_chart', 'pie_chart', 'table', 'goal_progress', 'heatmap']),
  metricSource: z.enum(['crm', 'invoice', 'projects', 'tickets', 'hr', 'docs']),
  metricKey: z.string().min(1).max(100),
  config: z.record(z.unknown()).optional(),
  gridX: z.number().int().min(0).optional(),
  gridY: z.number().int().min(0).optional(),
  gridW: z.number().int().min(1).max(12).optional(),
  gridH: z.number().int().min(1).max(6).optional(),
})

export const updateWidgetSchema = createWidgetSchema.partial().omit({ dashboardId: true })

export const createGoalSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  metricSource: z.enum(['crm', 'invoice', 'projects', 'tickets', 'hr', 'docs']),
  metricKey: z.string().min(1).max(100),
  targetValue: z.number().positive(),
  assignedTo: z.string().uuid().nullable().optional(),
  periodType: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  startDate: z.string(),
  endDate: z.string(),
})

export const updateGoalSchema = createGoalSchema.partial()

export const createScheduledReportSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  dashboardId: z.string().uuid().nullable().optional(),
  metrics: z.array(z.object({
    source: z.enum(['crm', 'invoice', 'projects', 'tickets', 'hr', 'docs']),
    key: z.string(),
  })).optional(),
  filters: z.record(z.unknown()).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  dayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
  timeOfDay: z.string().optional(),
  timezone: z.string().optional(),
  format: z.enum(['pdf', 'csv', 'excel']).optional(),
  recipients: z.array(z.string().email()),
})

export const updateScheduledReportSchema = createScheduledReportSchema.partial()

// ===========================================
// INPUT TYPES
// ===========================================

export type CreateDashboardInput = z.infer<typeof createDashboardSchema>
export type UpdateDashboardInput = z.infer<typeof updateDashboardSchema>
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>
export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
export type CreateScheduledReportInput = z.infer<typeof createScheduledReportSchema>
export type UpdateScheduledReportInput = z.infer<typeof updateScheduledReportSchema>

// ===========================================
// FILTER TYPES
// ===========================================

export interface DashboardFilters {
  search?: string
  isShared?: boolean
  createdBy?: string
}

export interface GoalFilters {
  search?: string
  metricSource?: MetricSource
  isActive?: boolean
  assignedTo?: string
}

export interface MetricFilters {
  periodType: PeriodType
  startDate: string
  endDate: string
  comparison?: ComparisonType
}

// ===========================================
// PLAN LIMITS
// ===========================================

export const ANALYTICS_PLAN_LIMITS = {
  FREE: {
    maxDashboards: 1,
    maxWidgetsPerDashboard: 6,
    maxGoals: 3,
    scheduledReports: false,
    customMetrics: false,
    exportFormats: ['pdf'] as ReportFormat[],
    dataRetentionDays: 90,
  },
  PRO: {
    maxDashboards: 10,
    maxWidgetsPerDashboard: 20,
    maxGoals: 50,
    scheduledReports: true,
    customMetrics: true,
    exportFormats: ['pdf', 'csv', 'excel'] as ReportFormat[],
    dataRetentionDays: 365,
  },
} as const
