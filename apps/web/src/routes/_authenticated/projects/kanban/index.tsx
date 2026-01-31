// ===========================================
// KANBAN VIEW PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, MoreHorizontal, GripVertical, Calendar, Loader2, Kanban } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sedona/ui'
import { useOrganization } from '@/lib/auth'
import { useProjects, useTasksByStatus, useTaskStatuses } from '@sedona/projects'

export const Route = createFileRoute('/_authenticated/projects/kanban/')({
  component: KanbanPage,
})

const priorityColors: Record<string, string> = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-400',
}

function KanbanPage() {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch projects list
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects(
    organizationId,
    { status: 'active' },
    { page: 1, pageSize: 50 }
  )
  const projects = projectsData?.data || []

  // Auto-select first project if none selected
  const currentProjectId = selectedProject || projects[0]?.id || ''

  // Fetch task statuses/columns for selected project
  const { data: statuses = [], isLoading: isLoadingStatuses } = useTaskStatuses(currentProjectId)

  // Fetch tasks grouped by status
  const { data: tasksByStatus = {}, isLoading: isLoadingTasks } = useTasksByStatus(currentProjectId)

  const isLoading = isLoadingProjects || isLoadingStatuses || isLoadingTasks

  if (isLoadingProjects) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <Kanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Aucun projet actif</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Creez un projet pour commencer a utiliser le tableau Kanban.
          </p>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Creer un projet
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={currentProjectId} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selectionner un projet" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: project.color || '#6B7280' }}
                    />
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tache
        </Button>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {statuses.map(column => {
              const columnTasks = tasksByStatus[column.id] || []
              return (
                <div key={column.id} className="flex flex-col w-[300px] flex-shrink-0">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color || '#6B7280' }}
                      />
                      <h3 className="font-semibold">{column.name}</h3>
                      <Badge variant="secondary" className="ml-1">
                        {columnTasks.length}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Renommer</DropdownMenuItem>
                        <DropdownMenuItem>Modifier la couleur</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Tasks */}
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {columnTasks.map(task => (
                      <Card
                        key={task.id}
                        className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${priorityColors[task.priority] || 'border-l-gray-400'}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 cursor-grab" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{task.title}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {task.dueDate && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                  </div>
                                )}
                                {task.assignees && task.assignees.length > 0 && (
                                  <Avatar className="h-5 w-5 ml-auto">
                                    <AvatarFallback className="text-[10px]">
                                      {(task.assignees[0]?.user?.fullName || '?').charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Add task button */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une tache
                    </Button>
                  </div>
                </div>
              )
            })}

            {/* Add column button */}
            <div className="w-[300px] flex-shrink-0">
              <Button
                variant="outline"
                className="w-full h-12 border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une colonne
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
