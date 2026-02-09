// ===========================================
// TIME TRACKING PAGE (PRO FEATURE)
// ===========================================

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Clock,
  BarChart3,
  Download,
  Plus,
  Timer,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@sedona/ui'
import {
  TimeTracker,
  TimeEntriesList,
  TimeStats,
  TimeEntryForm,
} from '@sedona/projects'
import { ProFeatureMask } from '@/components/pro'
import { useOrganization, useAuth } from '@/lib/auth'
import { useProjects, useTasks, useTimeEntries, useRunningTimer, useCreateTimeEntry, useStartTimer, useStopTimer, useDeleteTimeEntry } from '@sedona/projects'

export const Route = createFileRoute('/_authenticated/projects/time/')({
  component: TimeTrackingPage,
})

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

// PRO features to display in upgrade card
const timeFeatures = [
  { icon: Timer, label: 'Chronometre integre' },
  { icon: Clock, label: 'Saisie manuelle du temps' },
  { icon: BarChart3, label: 'Rapports par projet/membre' },
  { icon: FileSpreadsheet, label: 'Export CSV/PDF' },
]

function TimeTrackingPage() {
  return (
    <ProFeatureMask
      requiredPlan="PRO"
      title="Suivi du temps projet"
      description="Le suivi du temps vous permet de tracker le temps passe sur vos projets, avec chronometre integre et rapports detailles."
      features={timeFeatures}
    >
      <TimeTrackingContent />
    </ProFeatureMask>
  )
}

// ===========================================
// ACTUAL TIME TRACKING CONTENT
// ===========================================

function TimeTrackingContent() {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { organization } = useOrganization()
  const { user } = useAuth()
  const organizationId = organization?.id || ''
  const userId = user?.id || ''

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
    { page: 1, pageSize: 100 }
  )
  const tasks = tasksData?.data || []

  // Fetch time entries
  const { data: timeEntriesData, isLoading: isLoadingEntries } = useTimeEntries(
    currentProjectId,
    {},
    { page: 1, pageSize: 50 }
  )
  const timeEntries = timeEntriesData?.data || []

  // Fetch running timer for current user
  const { data: runningTimer } = useRunningTimer(userId)

  // Mutations
  const createTimeEntry = useCreateTimeEntry(currentProjectId, userId)
  const startTimerMutation = useStartTimer(userId)
  const stopTimerMutation = useStopTimer(userId)
  const deleteTimeEntry = useDeleteTimeEntry(currentProjectId)

  const isLoading = isLoadingProjects

  const handleStartTimer = async (data: { projectId: string; taskId?: string; description?: string }) => {
    try {
      await startTimerMutation.mutateAsync(data)
    } catch (err) {
      console.error('Error starting timer:', err)
    }
  }

  const handleStopTimer = async (timerId: string, _isBillable: boolean) => {
    try {
      await stopTimerMutation.mutateAsync(timerId)
    } catch (err) {
      console.error('Error stopping timer:', err)
    }
  }

  const handleCreateEntry = async (data: {
    projectId: string
    taskId?: string
    description?: string
    startTime: string
    durationMinutes: number
    isBillable: boolean
    hourlyRate?: number
  }) => {
    try {
      await createTimeEntry.mutateAsync({
        taskId: data.taskId,
        description: data.description,
        startTime: data.startTime,
        durationMinutes: data.durationMinutes,
        isBillable: data.isBillable,
        hourlyRate: data.hourlyRate,
      })
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Error creating time entry:', err)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteTimeEntry.mutateAsync(entryId)
    } catch (err) {
      console.error('Error deleting time entry:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Calculate stats from fetched data - always use timeEntries for real-time updates
  const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0)
  const billableMinutes = timeEntries.filter(e => e.isBillable).reduce((sum, e) => sum + (e.durationMinutes || 0), 0)

  // Calculate total amount from actual hourly rates
  const totalAmount = timeEntries
    .filter(e => e.isBillable)
    .reduce((sum, e) => {
      const hours = (e.durationMinutes || 0) / 60
      const rate = e.hourlyRate || 75 // Default rate if not specified
      return sum + (hours * rate)
    }, 0)

  // Group time by user for chart
  const timeByUser = timeEntries.reduce((acc: Record<string, { name: string; minutes: number; color: string }>, entry) => {
    const userName = entry.user?.fullName || entry.user?.email || 'Inconnu'
    if (!acc[userName]) {
      acc[userName] = { name: userName, minutes: 0, color: '#3B82F6' }
    }
    acc[userName].minutes += entry.durationMinutes || 0
    return acc
  }, {})
  const userSummary = Object.values(timeByUser)

  return (
    <div className="p-6 h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={currentProjectId} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selectionner un projet" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
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

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Saisie manuelle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une saisie de temps</DialogTitle>
              </DialogHeader>
              <TimeEntryForm
                projectId={currentProjectId}
                tasks={tasks}
                onSubmit={handleCreateEntry}
                onCancel={() => setIsDialogOpen(false)}
                isLoading={createTimeEntry.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <TimeStats
          totalMinutes={totalMinutes}
          billableMinutes={billableMinutes}
          totalAmount={Math.round(totalAmount)}
          targetHours={40}
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left column - Timer and entries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer Card */}
          <TimeTracker
            projectId={currentProjectId}
            userId={userId}
            tasks={tasks}
            runningTimer={runningTimer || null}
            onStart={handleStartTimer}
            onStop={handleStopTimer}
          />

          {/* Time entries list */}
          {isLoadingEntries ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TimeEntriesList
              entries={timeEntries}
              onEdit={(entry: unknown) => console.log('Edit entry:', entry)}
              onDelete={handleDeleteEntry}
            />
          )}
        </div>

        {/* Right column - Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Par membre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userSummary.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune donnee de temps
                </p>
              ) : (
                userSummary.map((user) => (
                  <div key={user.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{user.name}</span>
                      <span className="font-medium tabular-nums">
                        {formatDuration(user.minutes)}
                      </span>
                    </div>
                    <Progress
                      value={totalMinutes > 0 ? (user.minutes / totalMinutes) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Cette semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-bold tabular-nums">
                  {formatDuration(totalMinutes)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  sur 40h prevues
                </p>
                <Progress value={Math.min((totalMinutes / 2400) * 100, 100)} className="mt-4 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
