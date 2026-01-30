// ===========================================
// GANTT GRID COMPONENTS
// ===========================================

import { type FC } from 'react'
import { cn } from '@sedona/ui'
import { isSameDay, startOfDay } from 'date-fns'
import type { GanttColumn, GanttViewConfig } from './types'

// ===========================================
// GANTT GRID (Background grid)
// ===========================================

interface GanttGridProps {
  columns: GanttColumn[]
  config: GanttViewConfig
  rowCount: number
  rowHeight: number
}

export const GanttGrid: FC<GanttGridProps> = ({
  columns,
  config,
  rowCount,
  rowHeight,
}) => {
  const totalHeight = rowCount * rowHeight

  return (
    <div className="absolute inset-0 flex pointer-events-none">
      {columns.map((col, index) => {
        const isHidden = col.isWeekend && !config.showWeekends

        if (isHidden) return null

        return (
          <div
            key={index}
            className={cn(
              'border-r border-border/30 flex-shrink-0',
              col.isWeekend && 'bg-muted/30',
              col.isToday && 'bg-primary/5'
            )}
            style={{
              width: col.width,
              height: totalHeight,
            }}
          />
        )
      })}
    </div>
  )
}

// ===========================================
// GANTT TIMELINE HEADER
// ===========================================

interface GanttTimelineHeaderProps {
  columns: GanttColumn[]
  config: GanttViewConfig
  rowHeight: number
}

export const GanttTimelineHeader: FC<GanttTimelineHeaderProps> = ({
  columns,
  config,
  rowHeight,
}) => {
  return (
    <div
      className="flex border-b bg-muted/30 sticky top-0 z-10"
      style={{ height: rowHeight + 20 }}
    >
      {columns.map((col, index) => {
        const isHidden = col.isWeekend && !config.showWeekends

        if (isHidden) return null

        return (
          <div
            key={index}
            className={cn(
              'flex-shrink-0 border-r border-border/50 flex flex-col items-center justify-center',
              col.isWeekend && 'bg-muted/30',
              col.isToday && 'bg-primary/10'
            )}
            style={{ width: col.width }}
          >
            {col.subLabel && (
              <div className="text-[10px] text-muted-foreground">
                {col.subLabel}
              </div>
            )}
            <div
              className={cn(
                'text-xs font-medium',
                col.isToday && 'text-primary'
              )}
            >
              {col.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ===========================================
// TODAY LINE
// ===========================================

interface TodayLineProps {
  columns: GanttColumn[]
  config: GanttViewConfig
  height: number
}

export const TodayLine: FC<TodayLineProps> = ({ columns, config, height }) => {
  const today = startOfDay(new Date())

  // Find today's column
  let leftPosition = 0
  let foundToday = false

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i]
    if (!col) continue

    // Skip hidden weekend columns
    if (col.isWeekend && !config.showWeekends) continue

    if (config.viewMode === 'day') {
      if (isSameDay(col.date, today)) {
        leftPosition += col.width / 2
        foundToday = true
        break
      }
    } else {
      // For week/month/quarter, check if today falls within the range
      if (col.isToday) {
        // Calculate position within the column based on the day
        const daysInPeriod = config.viewMode === 'week' ? 7 : 30
        const dayOfPeriod = today.getDate()
        const positionInCol = (dayOfPeriod / daysInPeriod) * col.width
        leftPosition += positionInCol
        foundToday = true
        break
      }
    }

    leftPosition += col.width
  }

  if (!foundToday) return null

  return (
    <div
      className="absolute top-0 w-0.5 bg-red-500 z-20 pointer-events-none"
      style={{
        left: leftPosition,
        height,
      }}
    >
      {/* Triangle marker at top */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '6px solid rgb(239, 68, 68)',
        }}
      />
    </div>
  )
}

// ===========================================
// GANTT ROW BACKGROUNDS (for hover states)
// ===========================================

interface GanttRowBackgroundsProps {
  rowCount: number
  rowHeight: number
  totalWidth: number
}

export const GanttRowBackgrounds: FC<GanttRowBackgroundsProps> = ({
  rowCount,
  rowHeight,
  totalWidth,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div
          key={index}
          className="border-b border-border/20"
          style={{
            height: rowHeight,
            width: totalWidth,
          }}
        />
      ))}
    </div>
  )
}
