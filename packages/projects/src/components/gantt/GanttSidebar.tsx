// ===========================================
// GANTT SIDEBAR COMPONENT
// ===========================================

import { type FC } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, cn } from '@sedona/ui'
import type { GanttTaskRow } from './types'

interface GanttSidebarProps {
  tasks: GanttTaskRow[]
  rowHeight: number
  onTaskClick?: (taskId: string) => void
  onToggleExpand?: (taskId: string) => void
}

export const GanttSidebar: FC<GanttSidebarProps> = ({
  tasks,
  rowHeight,
  onTaskClick,
  onToggleExpand,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-[280px] border-r bg-muted/30 flex-shrink-0 flex flex-col">
      {/* Header */}
      <div
        className="border-b px-4 flex items-center font-medium text-sm bg-muted/50"
        style={{ height: `${rowHeight + 20}px` }}
      >
        Tâches ({tasks.length})
      </div>

      {/* Liste des tâches */}
      <div className="flex-1 overflow-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'flex items-center border-b hover:bg-muted/50 cursor-pointer transition-colors',
              'group'
            )}
            style={{
              height: `${rowHeight}px`,
              paddingLeft: `${8 + task.depth * 20}px`,
            }}
            onClick={() => onTaskClick?.(task.id)}
          >
            {/* Bouton expand si sous-tâches */}
            {task.hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpand?.(task.id)
                }}
                className="p-1 hover:bg-muted rounded mr-1"
              >
                {task.isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <span className="w-5 mr-1" />
            )}

            {/* Indicateur de statut */}
            <div
              className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: task.statusColor }}
            />

            {/* Titre */}
            <span className="flex-1 truncate text-sm pr-2">
              {task.title}
            </span>

            {/* Assignés (avatars miniatures) */}
            {task.assignees.length > 0 && (
              <div className="flex -space-x-1 flex-shrink-0">
                {task.assignees.slice(0, 2).map((assignee) => (
                  <Avatar
                    key={assignee.id}
                    className="h-5 w-5 border-2 border-background"
                  >
                    <AvatarImage src={assignee.avatarUrl || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.assignees.length > 2 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{task.assignees.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            Aucune tâche avec des dates
          </div>
        )}
      </div>
    </div>
  )
}
