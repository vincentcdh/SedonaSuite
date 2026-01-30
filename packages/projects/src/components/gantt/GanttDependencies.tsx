// ===========================================
// GANTT DEPENDENCIES COMPONENT
// ===========================================

import { type FC, useMemo } from 'react'
import type { GanttTaskRow, GanttColumn, GanttViewConfig } from './types'
import type { TaskDependency } from '../../types'
import { getColumnForDate, getPositionInColumn } from './useGanttColumns'

interface GanttDependenciesProps {
  dependencies: TaskDependency[]
  tasks: GanttTaskRow[]
  columns: GanttColumn[]
  config: GanttViewConfig
  rowHeight: number
}

export const GanttDependencies: FC<GanttDependenciesProps> = ({
  dependencies,
  tasks,
  columns,
  config,
  rowHeight,
}) => {
  const paths = useMemo(() => {
    const result: {
      id: string
      path: string
      startX: number
      startY: number
      endX: number
      endY: number
    }[] = []

    dependencies.forEach((dep) => {
      // Find tasks
      const fromTaskIndex = tasks.findIndex((t) => t.id === dep.dependsOnTaskId)
      const toTaskIndex = tasks.findIndex((t) => t.id === dep.taskId)

      if (fromTaskIndex === -1 || toTaskIndex === -1) return

      const fromTask = tasks[fromTaskIndex]
      const toTask = tasks[toTaskIndex]

      if (!fromTask || !toTask) return
      if (!fromTask.endDate || !toTask.startDate) return

      // Calculate positions
      const fromEndColIndex = getColumnForDate(
        fromTask.endDate,
        columns,
        config.viewMode
      )
      const toStartColIndex = getColumnForDate(
        toTask.startDate,
        columns,
        config.viewMode
      )

      if (fromEndColIndex === -1 || toStartColIndex === -1) return

      const fromCol = columns[fromEndColIndex]
      const toCol = columns[toStartColIndex]

      if (!fromCol || !toCol) return

      // Calculate X positions
      let startX = 0
      for (let i = 0; i <= fromEndColIndex; i++) {
        const col = columns[i]
        if (col) startX += col.width
      }
      // Adjust for position within column
      if (fromTask.endDate) {
        const posInCol = getPositionInColumn(
          fromTask.endDate,
          fromCol,
          config.viewMode
        )
        startX -= (1 - posInCol) * fromCol.width
      }

      let endX = 0
      for (let i = 0; i < toStartColIndex; i++) {
        const col = columns[i]
        if (col) endX += col.width
      }
      // Adjust for position within column
      if (toTask.startDate) {
        const posInCol = getPositionInColumn(
          toTask.startDate,
          toCol,
          config.viewMode
        )
        endX += posInCol * toCol.width
      }

      // Calculate Y positions (center of rows)
      const startY = fromTaskIndex * rowHeight + rowHeight / 2
      const endY = toTaskIndex * rowHeight + rowHeight / 2

      // Create bezier curve path
      const midX = (startX + endX) / 2

      // Different path based on relative positions
      let path: string

      if (endX > startX) {
        // Normal left-to-right connection
        path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
      } else {
        // Right-to-left (task goes backward)
        const offset = 20
        path = `M ${startX} ${startY}
                L ${startX + offset} ${startY}
                Q ${startX + offset + 10} ${startY}, ${startX + offset + 10} ${startY + (endY > startY ? 10 : -10)}
                L ${startX + offset + 10} ${endY - (endY > startY ? 10 : -10)}
                Q ${startX + offset + 10} ${endY}, ${startX + offset} ${endY}
                L ${endX} ${endY}`
      }

      result.push({
        id: dep.id,
        path,
        startX,
        startY,
        endX,
        endY,
      })
    })

    return result
  }, [dependencies, tasks, columns, config.viewMode, rowHeight])

  if (paths.length === 0) return null

  const totalHeight = tasks.length * rowHeight
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0)

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        width: totalWidth,
        height: totalHeight,
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Arrow marker */}
        <marker
          id="gantt-arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
      </defs>

      {paths.map((p) => (
        <g key={p.id}>
          {/* Shadow for better visibility */}
          <path
            d={p.path}
            fill="none"
            stroke="white"
            strokeWidth="3"
            opacity="0.5"
          />
          {/* Main path */}
          <path
            d={p.path}
            fill="none"
            stroke="#6b7280"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            markerEnd="url(#gantt-arrowhead)"
          />
        </g>
      ))}
    </svg>
  )
}
