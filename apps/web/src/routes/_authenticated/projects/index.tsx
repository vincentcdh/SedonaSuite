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

export const Route = createFileRoute('/_authenticated/projects/')({
  component: ProjectsListPage,
})

// Mock data for development
const mockProjects = [
  {
    id: '1',
    name: 'Refonte Site Web Client A',
    description: 'Refonte complete du site web avec nouvelle charte graphique',
    color: '#3B82F6',
    status: 'active' as const,
    startDate: '2024-01-15',
    endDate: '2024-03-30',
    totalTasks: 24,
    completedTasks: 16,
    progressPercentage: 66.7,
    membersCount: 4,
    totalTimeMinutes: 4500,
  },
  {
    id: '2',
    name: 'Application Mobile E-commerce',
    description: 'Developpement d\'une application mobile React Native',
    color: '#10B981',
    status: 'active' as const,
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    totalTasks: 45,
    completedTasks: 12,
    progressPercentage: 26.7,
    membersCount: 6,
    totalTimeMinutes: 7200,
  },
  {
    id: '3',
    name: 'Migration Infrastructure Cloud',
    description: 'Migration des services vers AWS',
    color: '#F59E0B',
    status: 'paused' as const,
    startDate: '2024-01-01',
    endDate: '2024-04-15',
    totalTasks: 18,
    completedTasks: 8,
    progressPercentage: 44.4,
    membersCount: 3,
    totalTimeMinutes: 2100,
  },
  {
    id: '4',
    name: 'Audit Securite 2024',
    description: 'Audit complet de la securite du SI',
    color: '#EF4444',
    status: 'completed' as const,
    startDate: '2023-11-01',
    endDate: '2024-01-15',
    totalTasks: 15,
    completedTasks: 15,
    progressPercentage: 100,
    membersCount: 2,
    totalTimeMinutes: 3600,
  },
]

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

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: mockProjects.length,
    active: mockProjects.filter(p => p.status === 'active').length,
    completed: mockProjects.filter(p => p.status === 'completed').length,
    totalTime: mockProjects.reduce((sum, p) => sum + p.totalTimeMinutes, 0),
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const statusInfo = statusConfig[project.status]
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: project.color + '20' }}
                    >
                      <FolderKanban className="h-5 w-5" style={{ color: project.color }} />
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
                    <span className="font-medium">{Math.round(project.progressPercentage)}%</span>
                  </div>
                  <Progress value={project.progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {project.completedTasks} / {project.totalTasks} taches
                  </p>
                </div>

                {/* Footer stats */}
                <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.membersCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(project.totalTimeMinutes)}</span>
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

        {filteredProjects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Aucun projet trouve</p>
            <p className="text-sm text-muted-foreground">
              Modifiez votre recherche ou creez un nouveau projet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
