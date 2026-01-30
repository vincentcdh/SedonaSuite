// ===========================================
// PERIOD UTILITIES
// ===========================================

import type { PeriodType, ComparisonType, MetricFilters } from '../types'

export interface DateRange {
  startDate: string
  endDate: string
}

/**
 * Get the date range for a given period type
 */
export function getPeriodRange(
  periodType: PeriodType,
  referenceDate: Date = new Date()
): DateRange {
  const date = new Date(referenceDate)

  switch (periodType) {
    case 'day':
      return {
        startDate: formatDate(date),
        endDate: formatDate(date),
      }

    case 'week': {
      const dayOfWeek = date.getDay()
      const monday = new Date(date)
      monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return {
        startDate: formatDate(monday),
        endDate: formatDate(sunday),
      }
    }

    case 'month': {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
      }
    }

    case 'quarter': {
      const quarter = Math.floor(date.getMonth() / 3)
      const firstDay = new Date(date.getFullYear(), quarter * 3, 1)
      const lastDay = new Date(date.getFullYear(), quarter * 3 + 3, 0)
      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
      }
    }

    case 'year': {
      const firstDay = new Date(date.getFullYear(), 0, 1)
      const lastDay = new Date(date.getFullYear(), 11, 31)
      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
      }
    }

    default:
      return {
        startDate: formatDate(date),
        endDate: formatDate(date),
      }
  }
}

/**
 * Get the comparison date range based on comparison type
 */
export function getComparisonRange(
  currentRange: DateRange,
  comparisonType: ComparisonType
): DateRange | null {
  if (comparisonType === 'none') return null

  const currentStart = new Date(currentRange.startDate)
  const currentEnd = new Date(currentRange.endDate)
  const durationMs = currentEnd.getTime() - currentStart.getTime()
  const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24))

  switch (comparisonType) {
    case 'previous_period': {
      const previousEnd = new Date(currentStart)
      previousEnd.setDate(previousEnd.getDate() - 1)
      const previousStart = new Date(previousEnd)
      previousStart.setDate(previousStart.getDate() - durationDays)
      return {
        startDate: formatDate(previousStart),
        endDate: formatDate(previousEnd),
      }
    }

    case 'same_period_last_year': {
      const previousStart = new Date(currentStart)
      previousStart.setFullYear(previousStart.getFullYear() - 1)
      const previousEnd = new Date(currentEnd)
      previousEnd.setFullYear(previousEnd.getFullYear() - 1)
      return {
        startDate: formatDate(previousStart),
        endDate: formatDate(previousEnd),
      }
    }

    default:
      return null
  }
}

/**
 * Get period label for display
 */
export function getPeriodLabel(periodType: PeriodType, range: DateRange): string {
  const start = new Date(range.startDate)
  const end = new Date(range.endDate)

  const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }

  switch (periodType) {
    case 'day':
      return start.toLocaleDateString('fr-FR', { ...formatOptions, year: 'numeric' })

    case 'week':
      return `${start.toLocaleDateString('fr-FR', formatOptions)} - ${end.toLocaleDateString('fr-FR', formatOptions)}`

    case 'month':
      return start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

    case 'quarter': {
      const quarter = Math.floor(start.getMonth() / 3) + 1
      return `T${quarter} ${start.getFullYear()}`
    }

    case 'year':
      return start.getFullYear().toString()

    default:
      return `${start.toLocaleDateString('fr-FR', formatOptions)} - ${end.toLocaleDateString('fr-FR', formatOptions)}`
  }
}

/**
 * Get period type options for UI
 */
export function getPeriodTypeOptions(): Array<{ value: PeriodType; label: string }> {
  return [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Année' },
  ]
}

/**
 * Get comparison type options for UI
 */
export function getComparisonTypeOptions(): Array<{ value: ComparisonType; label: string }> {
  return [
    { value: 'none', label: 'Aucune comparaison' },
    { value: 'previous_period', label: 'Période précédente' },
    { value: 'same_period_last_year', label: 'Même période l\'année dernière' },
  ]
}

/**
 * Build metric filters from period type and comparison
 */
export function buildMetricFilters(
  periodType: PeriodType,
  comparison: ComparisonType = 'previous_period',
  referenceDate?: Date
): MetricFilters {
  const range = getPeriodRange(periodType, referenceDate)
  return {
    periodType,
    startDate: range.startDate,
    endDate: range.endDate,
    comparison,
  }
}

/**
 * Get previous N periods for trend charts
 */
export function getPreviousPeriods(
  periodType: PeriodType,
  count: number,
  referenceDate: Date = new Date()
): DateRange[] {
  const periods: DateRange[] = []
  const date = new Date(referenceDate)

  for (let i = count - 1; i >= 0; i--) {
    let periodDate: Date

    switch (periodType) {
      case 'day':
        periodDate = new Date(date)
        periodDate.setDate(date.getDate() - i)
        break

      case 'week':
        periodDate = new Date(date)
        periodDate.setDate(date.getDate() - i * 7)
        break

      case 'month':
        periodDate = new Date(date)
        periodDate.setMonth(date.getMonth() - i)
        break

      case 'quarter':
        periodDate = new Date(date)
        periodDate.setMonth(date.getMonth() - i * 3)
        break

      case 'year':
        periodDate = new Date(date)
        periodDate.setFullYear(date.getFullYear() - i)
        break

      default:
        periodDate = new Date(date)
    }

    periods.push(getPeriodRange(periodType, periodDate))
  }

  return periods
}

// ===========================================
// HELPERS
// ===========================================

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] || ''
}
