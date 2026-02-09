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
  Loader2,
  Pencil,
  Trash2,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Checkbox,
} from '@sedona/ui'
import { useProject, useTasks, useProjectMembers, useTaskStatuses, useCreateTask, useCreateTaskStatus, useUpdateTask, useDeleteTask, type TaskWithRelations } from '@sedona/projects'
import { useAuth } from '@/lib/auth'

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
  const { user } = useAuth()
  const userId = user?.id || ''
  const [activeTab, setActiveTab] = useState('tasks')
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [newTaskStatusId, setNewTaskStatusId] = useState('')
  const [taskError, setTaskError] = useState<string | null>(null)

  // Edit task state
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDescription, setEditTaskDescription] = useState('')
  const [editTaskPriority, setEditTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [editTaskStatusId, setEditTaskStatusId] = useState('')
  const [editTaskError, setEditTaskError] = useState<string | null>(null)

  // Delete task state
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRelations | null>(null)

  // Selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [showDeleteSelectedDialog, setShowDeleteSelectedDialog] = useState(false)

  // New status dialog
  const [isNewStatusOpen, setIsNewStatusOpen] = useState(false)
  const [newStatusName, setNewStatusName] = useState('')
  const [newStatusColor, setNewStatusColor] = useState('#6B7280')

  // Fetch project details from Supabase
  const { data: project, isLoading: isLoadingProject, error: projectError } = useProject(projectId)

  // Fetch tasks
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks(projectId, {}, { page: 1, pageSize: 100 })
  const tasks = tasksData?.data || []

  // Fetch members
  const { data: members = [], isLoading: isLoadingMembers } = useProjectMembers(projectId)

  // Fetch task statuses/columns
  const { data: statuses = [] } = useTaskStatuses(projectId)

  // Mutations
  const createTask = useCreateTask(userId)
  const createTaskStatus = useCreateTaskStatus()
  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)

  const isLoading = isLoadingProject

  // Handle new task creation
  const handleCreateTask = async () => {
    setTaskError(null)
    if (!newTaskTitle.trim()) {
      setTaskError('Le titre est requis')
      return
    }

    try {
      // If no statuses exist, create a default one first
      let statusId = newTaskStatusId
      if (!statusId && statuses.length === 0) {
        const newStatus = await createTaskStatus.mutateAsync({
          projectId,
          name: 'A faire',
          color: '#6B7280',
          position: 0,
          isDefault: true,
        })
        statusId = newStatus.id
      } else if (!statusId && statuses.length > 0) {
        const firstStatus = statuses[0]
        if (firstStatus) {
          statusId = firstStatus.id
        }
      }

      await createTask.mutateAsync({
        projectId,
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        statusId,
      })

      setNewTaskTitle('')
      setNewTaskPriority('medium')
      setNewTaskStatusId('')
      setIsNewTaskOpen(false)
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Erreur lors de la creation de la tache')
    }
  }

  // Open edit dialog
  const openEditTask = (task: TaskWithRelations) => {
    setEditingTask(task)
    setEditTaskTitle(task.title)
    setEditTaskDescription(task.description || '')
    setEditTaskPriority(task.priority as 'low' | 'medium' | 'high' | 'urgent')
    setEditTaskStatusId(task.statusId || '')
    setEditTaskError(null)
  }

  // Handle task update
  const handleUpdateTask = async () => {
    setEditTaskError(null)
    if (!editingTask) return
    if (!editTaskTitle.trim()) {
      setEditTaskError('Le titre est requis')
      return
    }

    try {
      await updateTask.mutateAsync({
        id: editingTask.id,
        title: editTaskTitle.trim(),
        description: editTaskDescription.trim() || undefined,
        priority: editTaskPriority,
        statusId: editTaskStatusId || undefined,
      })
      setEditingTask(null)
    } catch (err) {
      setEditTaskError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour')
    }
  }

  // Quick update priority
  const handleQuickUpdatePriority = async (taskId: string, priority: string) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      })
    } catch (err) {
      console.error('Error updating priority:', err)
    }
  }

  // Quick update status
  const handleQuickUpdateStatus = async (taskId: string, statusId: string) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        statusId,
      })
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!taskToDelete) return
    try {
      await deleteTask.mutateAsync(taskToDelete.id)
      setTaskToDelete(null)
    } catch (err) {
      console.error('Error deleting task:', err)
    }
  }

  // Handle selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedTaskIds.size === tasks.length) {
      setSelectedTaskIds(new Set())
    } else {
      setSelectedTaskIds(new Set(tasks.map(t => t.id)))
    }
  }

  // Delete selected tasks
  const handleDeleteSelectedTasks = async () => {
    try {
      for (const taskId of selectedTaskIds) {
        await deleteTask.mutateAsync(taskId)
      }
      setSelectedTaskIds(new Set())
      setShowDeleteSelectedDialog(false)
    } catch (err) {
      console.error('Error deleting tasks:', err)
    }
  }

  // Create new status
  const handleCreateNewStatus = async () => {
    if (!newStatusName.trim()) return
    try {
      await createTaskStatus.mutateAsync({
        projectId,
        name: newStatusName.trim(),
        color: newStatusColor,
        position: statuses.length,
        isDefault: false,
      })
      setNewStatusName('')
      setNewStatusColor('#6B7280')
      setIsNewStatusOpen(false)
    } catch (err) {
      console.error('Error creating status:', err)
    }
  }

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
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsNewStatusOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel etat
                  </Button>
                  <Button size="sm" onClick={() => setIsNewTaskOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle tache
                  </Button>
                </div>
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

              {/* Selection toolbar */}
              {tasks.length > 0 && (
                <div className="flex items-center gap-4 mb-4 p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedTaskIds.size === tasks.length && tasks.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedTaskIds.size > 0
                        ? `${selectedTaskIds.size} selectionnee(s)`
                        : 'Tout selectionner'}
                    </span>
                  </div>
                  {selectedTaskIds.size > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowDeleteSelectedDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer ({selectedTaskIds.size})
                    </Button>
                  )}
                </div>
              )}

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
                    const isSelected = selectedTaskIds.has(task.id)

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 group ${isSelected ? 'bg-primary/5 border-primary/30' : ''}`}
                      >
                        {/* Selection checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTaskSelection(task.id)}
                        />

                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                          )}
                        </div>

                        {/* Status selector */}
                        <Select
                          value={task.statusId || '__none__'}
                          onValueChange={(value) => {
                            if (value === '__new__') {
                              setIsNewStatusOpen(true)
                            } else if (value !== '__none__') {
                              handleQuickUpdateStatus(task.id, value)
                            }
                          }}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue>
                              {status ? (
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: status.color || '#6B7280' }}
                                  />
                                  <span className="truncate">{status.name}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Etat...</span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {!task.statusId && (
                              <SelectItem value="__none__" disabled>
                                <span className="text-muted-foreground">Selectionner...</span>
                              </SelectItem>
                            )}
                            {statuses.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: s.color || '#6B7280' }}
                                  />
                                  {s.name}
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="__new__">
                              <div className="flex items-center gap-2 text-primary">
                                <Plus className="h-3 w-3" />
                                Creer un etat
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Priority selector */}
                        <Select
                          value={task.priority || 'medium'}
                          onValueChange={(value) => handleQuickUpdatePriority(task.id, value)}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue>
                              <Badge className={priority.color} variant="outline">
                                {priority.label}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              <Badge className={priorityConfig.low.color} variant="outline">Basse</Badge>
                            </SelectItem>
                            <SelectItem value="medium">
                              <Badge className={priorityConfig.medium.color} variant="outline">Moyenne</Badge>
                            </SelectItem>
                            <SelectItem value="high">
                              <Badge className={priorityConfig.high.color} variant="outline">Haute</Badge>
                            </SelectItem>
                            <SelectItem value="urgent">
                              <Badge className={priorityConfig.urgent.color} variant="outline">Urgente</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>

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

                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setTaskToDelete(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditTask(task)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setTaskToDelete(task)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
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

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle tache</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {taskError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {taskError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Titre *</Label>
              <Input
                id="taskTitle"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Ex: Developper la page d'accueil"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priorite</Label>
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as typeof newTaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {statuses.length > 0 && (
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={newTaskStatusId || '__none__'}
                    onValueChange={(v) => v !== '__none__' && setNewTaskStatusId(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {!newTaskStatusId && (
                        <SelectItem value="__none__" disabled>
                          <span className="text-muted-foreground">Selectionner...</span>
                        </SelectItem>
                      )}
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: status.color || '#6B7280' }}
                            />
                            {status.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateTask} disabled={createTask.isPending}>
              {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Creer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la tache</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la tache ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editTaskError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {editTaskError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="editTaskTitle">Titre *</Label>
              <Input
                id="editTaskTitle"
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
                placeholder="Titre de la tache"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTaskDescription">Description</Label>
              <Textarea
                id="editTaskDescription"
                value={editTaskDescription}
                onChange={(e) => setEditTaskDescription(e.target.value)}
                placeholder="Description de la tache (optionnel)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priorite</Label>
                <Select value={editTaskPriority} onValueChange={(v) => setEditTaskPriority(v as typeof editTaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Badge className={priorityConfig.low.color} variant="outline">Basse</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Badge className={priorityConfig.medium.color} variant="outline">Moyenne</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Badge className={priorityConfig.high.color} variant="outline">Haute</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <Badge className={priorityConfig.urgent.color} variant="outline">Urgente</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {statuses.length > 0 && (
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={editTaskStatusId || '__none__'}
                    onValueChange={(v) => v !== '__none__' && setEditTaskStatusId(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {!editTaskStatusId && (
                        <SelectItem value="__none__" disabled>
                          <span className="text-muted-foreground">Selectionner...</span>
                        </SelectItem>
                      )}
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: status.color || '#6B7280' }}
                            />
                            {status.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateTask} disabled={updateTask.isPending}>
              {updateTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la tache</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer la tache "{taskToDelete?.title}" ?
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Selected Tasks Confirmation */}
      <AlertDialog open={showDeleteSelectedDialog} onOpenChange={setShowDeleteSelectedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les taches selectionnees</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer {selectedTaskIds.size} tache(s) ?
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelectedTasks}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer ({selectedTaskIds.size})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Status Dialog */}
      <Dialog open={isNewStatusOpen} onOpenChange={setIsNewStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel etat</DialogTitle>
            <DialogDescription>
              Creez un nouvel etat pour organiser vos taches.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="statusName">Nom de l'etat *</Label>
              <Input
                id="statusName"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                placeholder="Ex: En cours, A valider, Termine..."
              />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex gap-2 flex-wrap">
                {['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'].map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${newStatusColor === color ? 'border-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewStatusColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewStatusOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateNewStatus} disabled={createTaskStatus.isPending || !newStatusName.trim()}>
              {createTaskStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Creer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
