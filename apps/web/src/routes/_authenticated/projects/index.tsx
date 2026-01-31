// ===========================================
// PROJECTS LIST PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Plus,
  Search,
  FolderKanban,
  MoreHorizontal,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Pause,
  Archive,
  Loader2,
} from 'lucide-react'
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Progress,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import { useOrganization } from '@/lib/auth'
import { useProjects, type ProjectStatus } from '@sedona/projects'

export const Route = createFileRoute('/_authenticated/projects/')({
  component: ProjectsListPage,
})

const statusConfig = {
  active: { label: 'Actif', icon: CheckCircle2, color: 'bg-green-500' },
  paused: { label: 'En pause', icon: Pause, color: 'bg-yellow-500' },
  completed: { label: 'Termine', icon: CheckCircle2, color: 'bg-blue-500' },
  archived: { label: 'Archive', icon: Archive, color: 'bg-gray-500' },
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  if (hours < 1) return `${minutes}min`
  return `${hours}h`
}

function ProjectsListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch projects from Supabase
  const { data: projectsData, isLoading, error } = useProjects(
    organizationId,
    {
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter as ProjectStatus : undefined,
    },
    { page: 1, pageSize: 50 }
  )

  const projects = projectsData?.data || []

  // Stats from fetched data
  const stats = {
    total: projectsData?.total || 0,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalTime: projects.reduce((sum, p) => sum + (p.totalTimeMinutes || 0), 0),
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement des projets</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total projets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projets actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Termines</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <Archive className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps total</p>
                <p className="text-2xl font-bold">{formatDuration(stats.totalTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un projet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="paused">En pause</SelectItem>
              <SelectItem value="completed">Termines</SelectItem>
              <SelectItem value="archived">Archives</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link to="/projects/new" className="[&>button]:w-full sm:[&>button]:w-auto">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const statusInfo = statusConfig[project.status]
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: (project.color || '#6B7280') + '20' }}
                      >
                        <FolderKanban className="h-5 w-5" style={{ color: project.color || '#6B7280' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to="/projects/$projectId"
                          params={{ projectId: project.id }}
                          className="font-semibold hover:text-primary truncate block"
                        >
                          {project.name}
                        </Link>
                        <Badge
                          variant="outline"
                          className="mt-1"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.color} mr-1.5`} />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                            Voir le projet
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Archiver</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{Math.round(project.progressPercentage || 0)}%</span>
                    </div>
                    <Progress value={project.progressPercentage || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {project.completedTasks || 0} / {project.totalTasks || 0} taches
                    </p>
                  </div>

                  {/* Footer stats */}
                  <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project.membersCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(project.totalTimeMinutes || 0)}</span>
                      </div>
                    </div>
                    {project.endDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(project.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {projects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">Aucun projet trouve</p>
              <p className="text-sm text-muted-foreground">
                Modifiez votre recherche ou creez un nouveau projet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
