// ===========================================
// USE GANTT COLUMNS HOOK
// ===========================================

import { useMemo } from 'react'
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  format,
  isSameDay,
  isWeekend,
  differenceInDays,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { GanttViewConfig, GanttColumn } from './types'
import { COLUMN_WIDTHS } from './types'

export function useGanttColumns(config: GanttViewConfig) {
  return useMemo(() => {
    const columns: GanttColumn[] = []
    const colWidth = COLUMN_WIDTHS[config.viewMode]
    const today = startOfDay(new Date())

    let currentDate: Date
    let endDate: Date

    switch (config.viewMode) {
      case 'day':
        currentDate = startOfDay(config.startDate)
        endDate = startOfDay(config.endDate)
        while (currentDate <= endDate) {
          if (config.showWeekends || !isWeekend(currentDate)) {
            columns.push({
              date: new Date(currentDate),
              width: colWidth,
              label: format(currentDate, 'd', { locale: fr }),
              subLabel: format(currentDate, 'EEE', { locale: fr }),
              isWeekend: isWeekend(currentDate),
              isToday: isSameDay(currentDate, today),
            })
          }
          currentDate = addDays(currentDate, 1)
        }
        break

      case 'week':
        currentDate = startOfWeek(config.startDate, { weekStartsOn: 1 })
        endDate = config.endDate
        while (currentDate <= endDate) {
          const weekEnd = addDays(currentDate, 6)
          columns.push({
            date: new Date(currentDate),
            width: colWidth,
            label: `S${format(currentDate, 'w', { locale: fr })}`,
            subLabel: `${format(currentDate, 'd MMM', { locale: fr })}`,
            isWeekend: false,
            isToday: today >= currentDate && today <= weekEnd,
          })
          currentDate = addWeeks(currentDate, 1)
        }
        break

      case 'month':
        currentDate = startOfMonth(config.startDate)
        endDate = config.endDate
        while (currentDate <= endDate) {
          columns.push({
            date: new Date(currentDate),
            width: colWidth,
            label: format(currentDate, 'MMMM', { locale: fr }),
            subLabel: format(currentDate, 'yyyy', { locale: fr }),
            isWeekend: false,
            isToday: format(today, 'yyyy-MM') === format(currentDate, 'yyyy-MM'),
          })
          currentDate = addMonths(currentDate, 1)
        }
        break

      case 'quarter':
        currentDate = startOfQuarter(config.startDate)
        endDate = config.endDate
        while (currentDate <= endDate) {
          const quarter = Math.ceil((currentDate.getMonth() + 1) / 3)
          columns.push({
            date: new Date(currentDate),
            width: colWidth,
            label: `T${quarter}`,
            subLabel: format(currentDate, 'yyyy', { locale: fr }),
            isWeekend: false,
            isToday: false,
          })
          currentDate = addQuarters(currentDate, 1)
        }
        break
    }

    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0)

    return { columns, totalWidth, colWidth }
  }, [config.viewMode, config.startDate, config.endDate, config.showWeekends])
}

export function getColumnForDate(
  date: Date,
  columns: GanttColumn[],
  viewMode: GanttViewConfig['viewMode']
): number {
  const targetDate = startOfDay(date)

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i]
    if (!col) continue

    switch (viewMode) {
      case 'day':
        if (isSameDay(col.date, targetDate)) return i
        break
      case 'week': {
        const weekEnd = addDays(col.date, 6)
        if (targetDate >= col.date && targetDate <= weekEnd) return i
        break
      }
      case 'month':
        if (
          targetDate.getFullYear() === col.date.getFullYear() &&
          targetDate.getMonth() === col.date.getMonth()
        ) return i
        break
      case 'quarter': {
        const quarterEnd = addMonths(col.date, 2)
        if (targetDate >= col.date && targetDate <= quarterEnd) return i
        break
      }
    }
  }

  return -1
}

export function getPositionInColumn(
  date: Date,
  column: GanttColumn,
  viewMode: GanttViewConfig['viewMode']
): number {
  // Returns a value between 0 and 1 representing position within the column
  const targetDate = startOfDay(date)

  switch (viewMode) {
    case 'day':
      return 0.5 // Center of day
    case 'week': {
      const daysFromStart = differenceInDays(targetDate, column.date)
      return Math.max(0, Math.min(1, daysFromStart / 7))
    }
    case 'month': {
      const daysInMonth = new Date(
        column.date.getFullYear(),
        column.date.getMonth() + 1,
        0
      ).getDate()
      return Math.max(0, Math.min(1, (targetDate.getDate() - 1) / daysInMonth))
    }
    case 'quarter': {
      const quarterStart = column.date
      const quarterEnd = addMonths(quarterStart, 3)
      const totalDays = differenceInDays(quarterEnd, quarterStart)
      const daysFromStart = differenceInDays(targetDate, quarterStart)
      return Math.max(0, Math.min(1, daysFromStart / totalDays))
    }
  }
}
