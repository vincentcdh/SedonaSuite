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

export const Route = createFileRoute('/_authenticated/projects/time/')({
  component: TimeTrackingPage,
})

// Mock projects
const mockProjects = [
  { id: '1', name: 'Refonte Site Web Client A', color: '#3B82F6' },
  { id: '2', name: 'Application Mobile E-commerce', color: '#10B981' },
]

// Mock tasks
const mockTasks = [
  { id: 't1', projectId: '1', parentTaskId: null, title: 'Page produits - liste', description: null, statusId: null, priority: 'medium' as const, startDate: null, dueDate: null, completedAt: null, estimatedHours: null, position: 0, customFields: {}, createdBy: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 't2', projectId: '1', parentTaskId: null, title: 'Integration CMS', description: null, statusId: null, priority: 'medium' as const, startDate: null, dueDate: null, completedAt: null, estimatedHours: null, position: 1, customFields: {}, createdBy: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 't3', projectId: '1', parentTaskId: null, title: 'Tests unitaires', description: null, statusId: null, priority: 'medium' as const, startDate: null, dueDate: null, completedAt: null, estimatedHours: null, position: 2, customFields: {}, createdBy: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
]

// Mock time entries
const mockTimeEntries = [
  {
    id: 'te1',
    projectId: '1',
    taskId: 't1',
    userId: 'u3',
    description: 'Implementation de la grille',
    startTime: '2025-01-29T09:00:00Z',
    endTime: '2025-01-29T11:30:00Z',
    durationMinutes: 150,
    isBillable: true,
    hourlyRate: 75,
    isRunning: false,
    createdAt: '2025-01-29T09:00:00Z',
    updatedAt: '2025-01-29T11:30:00Z',
    task: { id: 't1', projectId: '1', parentTaskId: null, title: 'Page produits - liste', description: null, statusId: null, priority: 'medium' as const, startDate: null, dueDate: null, completedAt: null, estimatedHours: null, position: 0, customFields: {}, createdBy: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    user: { id: 'u3', email: 'claire@test.com', fullName: 'Claire Petit' },
  },
  {
    id: 'te2',
    projectId: '1',
    taskId: 't2',
    userId: 'u1',
    description: 'Configuration Strapi',
    startTime: '2025-01-29T14:00:00Z',
    endTime: '2025-01-29T15:30:00Z',
    durationMinutes: 90,
    isBillable: true,
    hourlyRate: 75,
    isRunning: false,
    createdAt: '2025-01-29T14:00:00Z',
    updatedAt: '2025-01-29T15:30:00Z',
    task: { id: 't2', projectId: '1', parentTaskId: null, title: 'Integration CMS', description: null, statusId: null, priority: 'medium' as const, startDate: null, dueDate: null, completedAt: null, estimatedHours: null, position: 1, customFields: {}, createdBy: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    user: { id: 'u1', email: 'alice@test.com', fullName: 'Alice Martin' },
  },
  {
    id: 'te3',
    projectId: '1',
    taskId: null,
    userId: 'u2',
    description: 'Optimisation images',
    startTime: '2025-01-28T10:00:00Z',
    endTime: '2025-01-28T11:00:00Z',
    durationMinutes: 60,
    isBillable: false,
    hourlyRate: null,
    isRunning: false,
    createdAt: '2025-01-28T10:00:00Z',
    updatedAt: '2025-01-28T11:00:00Z',
    task: null,
    user: { id: 'u2', email: 'bob@test.com', fullName: 'Bob Durand' },
  },
  {
    id: 'te4',
    projectId: '1',
    taskId: 't3',
    userId: 'u4',
    description: null,
    startTime: '2025-01-28T14:00:00Z',
    endTime: '2025-01-28T16:00:00Z',
    durationMinutes: 120,
    isBillable: true,
    hourlyRate: 75,
    isRunning: false,
    createdAt: '2025-01-28T14:00:00Z',
    updatedAt: '2025-01-28T16:00:00Z',
    task: { id: 't3', projectId: '1', parentTaskId: null, title: 'Tests unitaires', description: null, statusId: null, priority: 'medium' as const, startDate: null, dueDate: null, completedAt: null, estimatedHours: null, position: 2, customFields: {}, createdBy: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    user: { id: 'u4', email: 'david@test.com', fullName: 'David Lambert' },
  },
]

// Mock summary
const mockSummary = {
  totalMinutes: 4500,
  billableMinutes: 4000,
  byUser: [
    { name: 'Alice', minutes: 1200, color: '#3B82F6' },
    { name: 'Bob', minutes: 900, color: '#10B981' },
    { name: 'Claire', minutes: 1400, color: '#F59E0B' },
    { name: 'David', minutes: 1000, color: '#8B5CF6' },
  ],
}

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
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]?.id ?? '')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleStartTimer = (data: { projectId: string; taskId?: string; description?: string }) => {
    console.log('Starting timer:', data)
  }

  const handleStopTimer = (timerId: string, isBillable: boolean) => {
    console.log('Stopping timer:', timerId, isBillable)
  }

  const handleCreateEntry = (data: any) => {
    console.log('Creating entry:', data)
    setIsDialogOpen(false)
  }

  return (
    <div className="p-6 h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selectionner un projet" />
            </SelectTrigger>
            <SelectContent>
              {mockProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: project.color }}
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
                projectId={selectedProject}
                tasks={mockTasks}
                onSubmit={handleCreateEntry}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <TimeStats
          totalMinutes={mockSummary.totalMinutes}
          billableMinutes={mockSummary.billableMinutes}
          totalAmount={5000}
          targetHours={40}
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left column - Timer and entries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer Card */}
          <TimeTracker
            projectId={selectedProject}
            userId="current-user"
            tasks={mockTasks}
            runningTimer={null}
            onStart={handleStartTimer}
            onStop={handleStopTimer}
          />

          {/* Time entries list */}
          <TimeEntriesList
            entries={mockTimeEntries}
            onEdit={(entry: unknown) => console.log('Edit entry:', entry)}
            onDelete={(entryId: string) => console.log('Delete entry:', entryId)}
          />
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
              {mockSummary.byUser.map((user) => (
                <div key={user.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{user.name}</span>
                    <span className="font-medium tabular-nums">
                      {formatDuration(user.minutes)}
                    </span>
                  </div>
                  <Progress
                    value={(user.minutes / mockSummary.totalMinutes) * 100}
                    className="h-2"
                  />
                </div>
              ))}
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
                  {formatDuration(1200)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  sur 40h prevues
                </p>
                <Progress value={30} className="mt-4 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
