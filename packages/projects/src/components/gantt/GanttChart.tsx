// ===========================================
// GANTT CHART MAIN COMPONENT
// ===========================================

import { useState, useMemo, useRef, useCallback } from 'react'
import { startOfWeek, addWeeks, parseISO, startOfDay } from 'date-fns'
import { Skeleton } from '@sedona/ui'
import type { TaskWithRelations, TaskDependency, TaskStatus } from '../../types'
import type { GanttViewConfig, GanttTaskRow } from './types'
import { DEFAULT_CONFIG, GANTT_COLORS } from './types'
import { GanttHeader } from './GanttHeader'
import { GanttSidebar } from './GanttSidebar'
import { GanttGrid, GanttTimelineHeader, TodayLine, GanttRowBackgrounds } from './GanttGrid'
import { GanttBar } from './GanttBar'
import { GanttDependencies } from './GanttDependencies'
import { useGanttColumns } from './useGanttColumns'

const ROW_HEIGHT = 40

interface GanttChartProps {
  tasks: TaskWithRelations[]
  dependencies: TaskDependency[]
  statuses: TaskStatus[]
  isLoading?: boolean
  onTaskClick?: (taskId: string) => void
  onTaskUpdate?: (taskId: string, updates: { startDate?: string; dueDate?: string }) => void
}

export function GanttChart({
  tasks,
  dependencies,
  statuses,
  isLoading = false,
  onTaskClick,
  onTaskUpdate,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Initialize config with date range based on tasks
  const [config, setConfig] = useState<GanttViewConfig>(() => {
    const today = startOfDay(new Date())
    const startDate = startOfWeek(today, { weekStartsOn: 1 })
    const endDate = addWeeks(startDate, 8)

    return {
      ...DEFAULT_CONFIG,
      startDate,
      endDate,
    }
  })

  // Get columns for timeline
  const { columns, totalWidth, colWidth } = useGanttColumns(config)

  // Process tasks into GanttTaskRows
  const processedTasks = useMemo(() => {
    const getTaskDepth = (task: TaskWithRelations, allTasks: TaskWithRelations[]): number => {
      if (!task.parentTaskId) return 0
      const parent = allTasks.find((t) => t.id === task.parentTaskId)
      return parent ? getTaskDepth(parent, allTasks) + 1 : 0
    }

    const getStatusColor = (statusId: string | null): string => {
      if (!statusId) return GANTT_COLORS.todo
      const status = statuses.find((s) => s.id === statusId)
      return status?.color || GANTT_COLORS.todo
    }

    const calculateProgress = (task: TaskWithRelations): number => {
      if (!task.checklistItems || task.checklistItems.length === 0) {
        // Check if task is completed based on status
        const status = statuses.find((s) => s.id === task.statusId)
        return status?.isCompleted ? 100 : 0
      }

      const completed = task.checklistItems.filter((item) => item.isCompleted).length
      return Math.round((completed / task.checklistItems.length) * 100)
    }

    const hasVisibleChildren = (taskId: string): boolean => {
      return tasks.some((t) => t.parentTaskId === taskId)
    }

    const isTaskVisible = (task: TaskWithRelations): boolean => {
      if (!task.parentTaskId) return true

      let currentParentId: string | null = task.parentTaskId
      while (currentParentId) {
        if (!expandedIds.has(currentParentId)) return false
        const parent = tasks.find((t) => t.id === currentParentId)
        currentParentId = parent?.parentTaskId || null
      }
      return true
    }

    // Filter to only tasks with dates and visible in hierarchy
    const visibleTasks = tasks
      .filter((task) => {
        // Must have at least start date or due date
        const hasDate = task.startDate || task.dueDate
        return hasDate && isTaskVisible(task)
      })
      .sort((a, b) => {
        // Sort by position, then by date
        if (a.position !== b.position) return a.position - b.position
        const dateA = a.startDate || a.dueDate || ''
        const dateB = b.startDate || b.dueDate || ''
        return dateA.localeCompare(dateB)
      })

    return visibleTasks.map((task): GanttTaskRow => {
      const startDate = task.startDate ? parseISO(task.startDate) : null
      const endDate = task.dueDate ? parseISO(task.dueDate) : startDate
      const dueDate = task.dueDate ? parseISO(task.dueDate) : null

      return {
        id: task.id,
        title: task.title,
        startDate,
        endDate,
        dueDate,
        status: task.status?.name || 'À faire',
        statusColor: getStatusColor(task.statusId),
        priority: task.priority,
        progress: calculateProgress(task),
        assignees:
          task.assignees?.map((a) => ({
            id: a.userId,
            name: a.user?.fullName || a.user?.email || 'Unknown',
            avatarUrl: a.user?.avatarUrl || null,
          })) || [],
        dependencies: dependencies
          .filter((d) => d.taskId === task.id)
          .map((d) => d.dependsOnTaskId),
        parentTaskId: task.parentTaskId,
        depth: getTaskDepth(task, tasks),
        isExpanded: expandedIds.has(task.id),
        hasChildren: hasVisibleChildren(task.id),
      }
    })
  }, [tasks, dependencies, statuses, expandedIds])

  // Handle toggle expand
  const handleToggleExpand = useCallback((taskId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }, [])

  // Scroll to today
  const scrollToToday = useCallback(() => {
    if (!containerRef.current) return

    const today = startOfDay(new Date())
    let leftPosition = 0

    for (const col of columns) {
      if (col.isToday) {
        break
      }
      leftPosition += col.width
    }

    // Center today in the viewport
    const viewportWidth = containerRef.current.clientWidth
    const scrollLeft = Math.max(0, leftPosition - viewportWidth / 2)
    containerRef.current.scrollLeft = scrollLeft
  }, [columns])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-1">
          <div className="w-[280px] border-r p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    )
  }

  const totalHeight = processedTasks.length * ROW_HEIGHT

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with controls */}
      <GanttHeader
        config={config}
        onConfigChange={setConfig}
        onTodayClick={scrollToToday}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden border rounded-lg m-4 mt-0">
        {/* Sidebar with task list */}
        <GanttSidebar
          tasks={processedTasks}
          rowHeight={ROW_HEIGHT}
          onTaskClick={onTaskClick}
          onToggleExpand={handleToggleExpand}
        />

        {/* Timeline area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto relative"
        >
          {/* Timeline header (dates) */}
          <GanttTimelineHeader
            columns={columns}
            config={config}
            rowHeight={ROW_HEIGHT}
          />

          {/* Scrollable content area */}
          <div
            className="relative"
            style={{
              width: totalWidth,
              height: totalHeight,
              minHeight: '200px',
            }}
          >
            {/* Background grid */}
            <GanttGrid
              columns={columns}
              config={config}
              rowCount={processedTasks.length}
              rowHeight={ROW_HEIGHT}
            />

            {/* Row backgrounds */}
            <GanttRowBackgrounds
              rowCount={processedTasks.length}
              rowHeight={ROW_HEIGHT}
              totalWidth={totalWidth}
            />

            {/* Today line */}
            <TodayLine
              columns={columns}
              config={config}
              height={totalHeight}
            />

            {/* Task bars */}
            {processedTasks.map((task, index) => (
              <GanttBar
                key={task.id}
                task={task}
                columns={columns}
                config={config}
                rowIndex={index}
                rowHeight={ROW_HEIGHT}
              />
            ))}

            {/* Dependency arrows */}
            {config.showDependencies && (
              <GanttDependencies
                dependencies={dependencies}
                tasks={processedTasks}
                columns={columns}
                config={config}
                rowHeight={ROW_HEIGHT}
              />
            )}
          </div>

          {/* Empty state */}
          {processedTasks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Aucune tâche à afficher</p>
                <p className="text-sm mt-1">
                  Ajoutez des dates de début et de fin à vos tâches pour les voir apparaître ici
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
