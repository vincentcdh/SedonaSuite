// ===========================================
// GANTT CHART TYPES
// ===========================================

import type { TaskWithRelations, TaskDependency } from '../../types'

export type GanttViewMode = 'day' | 'week' | 'month' | 'quarter'
export type GanttGroupBy = 'none' | 'status' | 'assignee' | 'priority'

export interface GanttViewConfig {
  viewMode: GanttViewMode
  startDate: Date
  endDate: Date
  showDependencies: boolean
  showProgress: boolean
  showAssignees: boolean
  showWeekends: boolean
  groupBy: GanttGroupBy
}

export interface GanttColumn {
  date: Date
  width: number
  label: string
  subLabel?: string
  isWeekend: boolean
  isToday: boolean
}

export interface GanttTaskRow {
  id: string
  title: string
  startDate: Date | null
  endDate: Date | null
  dueDate: Date | null
  status: string
  statusColor: string
  priority: string
  progress: number
  assignees: {
    id: string
    name: string
    avatarUrl: string | null
  }[]
  dependencies: string[]
  parentTaskId: string | null
  depth: number
  isExpanded: boolean
  hasChildren: boolean
}

export interface ProcessedDependency {
  id: string
  fromTaskId: string
  toTaskId: string
  fromIndex: number
  toIndex: number
  type: string
}

// Constants
export const GANTT_COLORS = {
  // Par statut (valeurs par défaut)
  todo: '#6b7280',
  in_progress: '#0c82d6',
  review: '#f59e0b',
  done: '#10b981',
  blocked: '#c0392b',
  overdue: '#c0392b',
} as const

export const COLUMN_WIDTHS: Record<GanttViewMode, number> = {
  day: 40,
  week: 100,
  month: 150,
  quarter: 200,
}

export const DEFAULT_CONFIG: GanttViewConfig = {
  viewMode: 'week',
  startDate: new Date(),
  endDate: new Date(),
  showDependencies: true,
  showProgress: true,
  showAssignees: true,
  showWeekends: true,
  groupBy: 'none',
}
