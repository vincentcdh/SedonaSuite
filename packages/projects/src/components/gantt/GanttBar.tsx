// ===========================================
// GANTT BAR COMPONENT
// ===========================================

import { type FC, useMemo, useRef, useState } from 'react'
import { cn } from '@sedona/ui'
import { format, isBefore, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { GanttTaskRow, GanttColumn, GanttViewConfig } from './types'
import { getColumnForDate, getPositionInColumn } from './useGanttColumns'
import { GANTT_COLORS } from './types'

interface GanttBarProps {
  task: GanttTaskRow
  columns: GanttColumn[]
  config: GanttViewConfig
  rowIndex: number
  rowHeight: number
  onDrag?: (taskId: string, newStart: Date, newEnd: Date) => void
  onResize?: (taskId: string, edge: 'start' | 'end', newDate: Date) => void
}

export const GanttBar: FC<GanttBarProps> = ({
  task,
  columns,
  config,
  rowIndex,
  rowHeight,
}) => {
  const barRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<'start' | 'end' | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  // Calculate position and width
  const barPosition = useMemo(() => {
    if (!task.startDate || !task.endDate) {
      return null
    }

    const startColIndex = getColumnForDate(task.startDate, columns, config.viewMode)
    const endColIndex = getColumnForDate(task.endDate, columns, config.viewMode)

    if (startColIndex === -1 && endColIndex === -1) {
      return null
    }

    const effectiveStartIndex = Math.max(0, startColIndex)
    const effectiveEndIndex = Math.min(columns.length - 1, endColIndex === -1 ? columns.length - 1 : endColIndex)

    if (effectiveStartIndex > effectiveEndIndex) {
      return null
    }

    const startCol = columns[effectiveStartIndex]
    const endCol = columns[effectiveEndIndex]

    if (!startCol || !endCol) return null

    // Calculate pixel positions
    let left = 0
    for (let i = 0; i < effectiveStartIndex; i++) {
      const col = columns[i]
      if (col) left += col.width
    }

    // Add offset within start column if task starts mid-column
    if (startColIndex >= 0 && task.startDate) {
      const posInCol = getPositionInColumn(task.startDate, startCol, config.viewMode)
      left += posInCol * startCol.width
    }

    // Calculate width
    let width = 0
    for (let i = effectiveStartIndex; i <= effectiveEndIndex; i++) {
      const col = columns[i]
      if (col) width += col.width
    }

    // Adjust width for start position offset
    if (startColIndex >= 0 && task.startDate) {
      const posInCol = getPositionInColumn(task.startDate, startCol, config.viewMode)
      width -= posInCol * startCol.width
    }

    // Adjust width for end position
    if (endColIndex >= 0 && endColIndex < columns.length && task.endDate) {
      const posInCol = getPositionInColumn(task.endDate, endCol, config.viewMode)
      width -= (1 - posInCol) * endCol.width
    }

    // Minimum width
    width = Math.max(width, 20)

    return { left, width }
  }, [task, columns, config.viewMode])

  // Check if task is overdue
  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.progress === 100) return false
    return isBefore(task.dueDate, startOfDay(new Date()))
  }, [task.dueDate, task.progress])

  // Determine bar color
  const barColor = useMemo(() => {
    if (isOverdue) return GANTT_COLORS.overdue
    return task.statusColor || GANTT_COLORS.todo
  }, [isOverdue, task.statusColor])

  // If no dates or position couldn't be calculated
  if (!task.startDate || !task.endDate || !barPosition) {
    return (
      <div
        className="absolute flex items-center px-2"
        style={{
          top: rowIndex * rowHeight + 4,
          height: rowHeight - 8,
          left: 0,
        }}
      >
        <span className="text-xs text-muted-foreground italic">
          Dates non définies
        </span>
      </div>
    )
  }

  const { left, width } = barPosition

  return (
    <div
      ref={barRef}
      className={cn(
        'absolute flex items-center rounded cursor-grab group',
        isDragging && 'cursor-grabbing opacity-80 shadow-lg',
        isResizing && 'cursor-ew-resize'
      )}
      style={{
        top: rowIndex * rowHeight + 4,
        height: rowHeight - 8,
        left: `${left}px`,
        width: `${width}px`,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Handle resize gauche */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white/30 rounded-l z-10"
        onMouseDown={(e) => {
          e.stopPropagation()
          setIsResizing('start')
        }}
      />

      {/* Barre principale */}
      <div
        className="absolute inset-0 rounded overflow-hidden transition-shadow"
        style={{ backgroundColor: barColor }}
      >
        {/* Progression */}
        {config.showProgress && task.progress > 0 && (
          <div
            className="absolute inset-y-0 left-0 bg-white/30"
            style={{ width: `${task.progress}%` }}
          />
        )}
      </div>

      {/* Contenu de la barre */}
      <div className="relative z-10 flex items-center px-2 w-full overflow-hidden">
        <span className="text-xs text-white font-medium truncate">
          {width > 100 ? task.title : ''}
        </span>

        {/* Pourcentage si assez de place */}
        {config.showProgress && width > 120 && (
          <span className="ml-auto text-xs text-white/80 flex-shrink-0">
            {task.progress}%
          </span>
        )}
      </div>

      {/* Handle resize droite */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-white/30 rounded-r z-10"
        onMouseDown={(e) => {
          e.stopPropagation()
          setIsResizing('end')
        }}
      />

      {/* Tooltip simple */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border whitespace-nowrap">
          <p className="font-medium">{task.title}</p>
          <p className="text-muted-foreground mt-1">
            {format(task.startDate, 'dd MMM', { locale: fr })} - {format(task.endDate, 'dd MMM yyyy', { locale: fr })}
          </p>
          <p className="text-muted-foreground">Progression: {task.progress}%</p>
          {isOverdue && (
            <p className="text-red-500 font-medium mt-1">⚠️ En retard</p>
          )}
        </div>
      )}
    </div>
  )
}
