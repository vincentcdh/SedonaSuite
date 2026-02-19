// ===========================================
// GANTT VIEW PAGE (PRO FEATURE - projects module)
// ===========================================

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { GanttChart, type TaskWithRelations, type TaskStatus } from '@sedona/projects'
import { ModulePaidGuard } from '@sedona/ui'
import { useOrganization } from '@/lib/auth'
import { useModuleAccess, useUpgradeModule } from '@/hooks/useModuleAccess'
import { useProjects, useTasks, useTaskStatuses } from '@sedona/projects'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/projects/gantt/')({
  component: GanttPage,
})

function GanttPage() {
  const { isPaid, isLoading: isLoadingAccess } = useModuleAccess('projects')
  const { upgrade } = useUpgradeModule()

  const handleUpgrade = async () => {
    await upgrade('projects', 'monthly')
  }

  return (
    <ModulePaidGuard
      moduleId="projects"
      isPaid={isPaid}
      isLoading={isLoadingAccess}
      title="Vue Gantt"
      description="La vue Gantt vous permet de visualiser et planifier vos projets avec une timeline interactive et des dependances entre taches."
      onUpgrade={handleUpgrade}
    >
      <GanttContent />
    </ModulePaidGuard>
  )
}

// ===========================================
// ACTUAL GANTT CONTENT
// ===========================================

function GanttContent() {
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

  // Fetch tasks for selected project
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks(
    currentProjectId,
    {},
    { page: 1, pageSize: 200 }
  )
  const tasks = tasksData?.data || []

  // Fetch task statuses
  const { data: statuses = [], isLoading: isLoadingStatuses } = useTaskStatuses(currentProjectId)

  const isLoading = isLoadingProjects || isLoadingTasks || isLoadingStatuses

  // Mock dependencies for now (would need a dedicated hook)
  const dependencies: Array<{
    id: string
    taskId: string
    dependsOnTaskId: string
    dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
    createdAt: string
  }> = []

  if (isLoadingProjects) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Project Selector */}
      <div className="p-4 border-b">
        <Select value={currentProjectId} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[300px]">
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

      {/* Gantt Chart */}
      <div className="flex-1">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Aucune tache avec dates pour ce projet
          </div>
        ) : (
          <GanttChart
            tasks={tasks as TaskWithRelations[]}
            dependencies={dependencies}
            statuses={statuses as TaskStatus[]}
            onTaskClick={(taskId: string) => {
              console.log('Task clicked:', taskId)
            }}
          />
        )}
      </div>
    </div>
  )
}
