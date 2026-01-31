// ===========================================
// PROJECT DETAIL PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Settings,
  Users,
  Calendar,
  Clock,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  GripVertical,
  Loader2,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Avatar,
  AvatarFallback,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sedona/ui'
import { useProject, useTasks, useProjectMembers, useTaskStatuses } from '@sedona/projects'

export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  component: ProjectDetailPage,
})

const priorityConfig = {
  low: { label: 'Basse', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Moyenne', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Haute', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  if (hours < 1) return `${minutes}min`
  return `${hours}h`
}

function ProjectDetailPage() {
  const { projectId } = Route.useParams()
  const [activeTab, setActiveTab] = useState('tasks')

  // Fetch project details from Supabase
  const { data: project, isLoading: isLoadingProject, error: projectError } = useProject(projectId)

  // Fetch tasks
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks(projectId, {}, { page: 1, pageSize: 100 })
  const tasks = tasksData?.data || []

  // Fetch members
  const { data: members = [], isLoading: isLoadingMembers } = useProjectMembers(projectId)

  // Fetch task statuses/columns
  const { data: statuses = [] } = useTaskStatuses(projectId)

  const isLoading = isLoadingProject

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement du projet</p>
          <p className="text-sm text-muted-foreground mt-2">{projectError?.message || 'Projet non trouvé'}</p>
          <Link to="/projects" className="mt-4 inline-block">
            <Button variant="outline">Retour aux projets</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Calculate status counts from tasks
  const statusCounts = statuses.map(status => ({
    ...status,
    tasks: tasks.filter(t => t.statusId === status.id).length,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: (project.color || '#6B7280') + '20' }}
          >
            <span className="text-xl" style={{ color: project.color || '#6B7280' }}>📁</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description || ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Membres
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Parametres
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">Progression</div>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={project.progressPercentage || 0} className="flex-1 h-2" />
              <span className="font-semibold">{Math.round(project.progressPercentage || 0)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">Taches</div>
            <div className="text-xl font-bold mt-1">
              {project.completedTasks || 0} / {project.totalTasks || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">Temps passe</div>
            <div className="text-xl font-bold mt-1">
              {formatDuration(project.totalTimeMinutes || 0)}
              {project.totalEstimatedMinutes ? (
                <span className="text-sm text-muted-foreground font-normal ml-1">
                  / {formatDuration(project.totalEstimatedMinutes)}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">Echeance</div>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">Budget</div>
            <div className="text-xl font-bold mt-1">
              {project.budgetAmount
                ? project.budgetAmount.toLocaleString('fr-FR', { style: 'currency', currency: project.budgetCurrency || 'EUR' })
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks">Taches</TabsTrigger>
          <TabsTrigger value="members">Membres</TabsTrigger>
          <TabsTrigger value="activity">Activite</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          {/* Task List View */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Taches du projet</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle tache
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Status columns summary */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {statusCounts.map(status => (
                  <Badge
                    key={status.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: status.color || '#6B7280' }}
                    />
                    {status.name} ({status.tasks})
                  </Badge>
                ))}
              </div>

              {/* Task list */}
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune tache pour ce projet
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map(task => {
                    const status = statuses.find(s => s.id === task.statusId)
                    const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium
                    const isCompleted = status?.name?.toLowerCase().includes('termin') || status?.name?.toLowerCase().includes('done')

                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer group"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />

                        <button className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                        </div>

                        <Badge className={priority.color} variant="outline">
                          {priority.label}
                        </Badge>

                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </div>
                        )}

                        {task.assignees && task.assignees.length > 0 && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {(task.assignees[0]?.user?.fullName || '?').split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                            <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Membres du projet</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun membre dans ce projet
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {(member.user?.fullName || member.user?.email || '?').split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.fullName || member.user?.email || 'Utilisateur'}</p>
                          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Modifier le role</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Retirer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activite recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                L'historique d'activite sera disponible prochainement
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
