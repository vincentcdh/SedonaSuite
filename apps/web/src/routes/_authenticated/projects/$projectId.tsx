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
  AlertCircle,
  GripVertical,
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

export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  component: ProjectDetailPage,
})

// Mock data
const mockProject = {
  id: '1',
  name: 'Refonte Site Web Client A',
  description: 'Refonte complete du site web avec nouvelle charte graphique et optimisation SEO',
  color: '#3B82F6',
  status: 'active' as const,
  startDate: '2024-01-15',
  endDate: '2024-03-30',
  budgetAmount: 25000,
  totalTasks: 24,
  completedTasks: 16,
  progressPercentage: 66.7,
  totalTimeMinutes: 4500,
  totalEstimatedMinutes: 6000,
}

const mockMembers = [
  { id: '1', name: 'Alice Martin', role: 'owner', avatar: null },
  { id: '2', name: 'Bob Dupont', role: 'manager', avatar: null },
  { id: '3', name: 'Claire Bernard', role: 'member', avatar: null },
  { id: '4', name: 'David Leroy', role: 'member', avatar: null },
]

const mockStatuses = [
  { id: '1', name: 'A faire', color: '#6B7280', tasks: 4 },
  { id: '2', name: 'En cours', color: '#3B82F6', tasks: 3 },
  { id: '3', name: 'En revue', color: '#F59E0B', tasks: 1 },
  { id: '4', name: 'Termine', color: '#10B981', tasks: 16 },
]

const mockTasks = [
  { id: '1', title: 'Design maquettes pages principales', statusId: '4', priority: 'high', dueDate: '2024-02-01', assignee: 'Alice' },
  { id: '2', title: 'Integration header/footer', statusId: '4', priority: 'medium', dueDate: '2024-02-10', assignee: 'Bob' },
  { id: '3', title: 'Page produits - liste', statusId: '2', priority: 'high', dueDate: '2024-02-15', assignee: 'Claire' },
  { id: '4', title: 'Page produits - detail', statusId: '2', priority: 'medium', dueDate: '2024-02-18', assignee: 'David' },
  { id: '5', title: 'Formulaire contact', statusId: '1', priority: 'low', dueDate: '2024-02-25', assignee: null },
  { id: '6', title: 'Integration CMS', statusId: '3', priority: 'high', dueDate: '2024-02-20', assignee: 'Alice' },
]

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
            style={{ backgroundColor: mockProject.color + '20' }}
          >
            <span className="text-xl" style={{ color: mockProject.color }}>📁</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{mockProject.name}</h1>
            <p className="text-muted-foreground">{mockProject.description}</p>
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
              <Progress value={mockProject.progressPercentage} className="flex-1 h-2" />
              <span className="font-semibold">{Math.round(mockProject.progressPercentage)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">Taches</div>
            <div className="text-xl font-bold mt-1">
              {mockProject.completedTasks} / {mockProject.totalTasks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">Temps passe</div>
            <div className="text-xl font-bold mt-1">
              {formatDuration(mockProject.totalTimeMinutes)}
              <span className="text-sm text-muted-foreground font-normal ml-1">
                / {formatDuration(mockProject.totalEstimatedMinutes)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">Echeance</div>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {new Date(mockProject.endDate).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">Budget</div>
            <div className="text-xl font-bold mt-1">
              {mockProject.budgetAmount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
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
                {mockStatuses.map(status => (
                  <Badge
                    key={status.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: status.color }}
                    />
                    {status.name} ({status.tasks})
                  </Badge>
                ))}
              </div>

              {/* Task list */}
              <div className="space-y-2">
                {mockTasks.map(task => {
                  const status = mockStatuses.find(s => s.id === task.statusId)
                  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
                  const isCompleted = status?.name === 'Termine'

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

                      {task.assignee && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
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
              <div className="space-y-3">
                {mockMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activite recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Alice</span> a termine la tache{' '}
                      <span className="font-medium">"Integration header/footer"</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Bob</span> a enregistre 2h30 de travail sur{' '}
                      <span className="font-medium">"Page produits - liste"</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Claire</span> a commente{' '}
                      <span className="font-medium">"Integration CMS"</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Hier</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
