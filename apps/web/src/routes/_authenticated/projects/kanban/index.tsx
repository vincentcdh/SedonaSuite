// ===========================================
// KANBAN VIEW PAGE WITH DRAG & DROP
// ===========================================

import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, MoreHorizontal, GripVertical, Calendar, Loader2, Kanban } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
} from '@sedona/ui'
import { useOrganization, useAuth } from '@/lib/auth'
import {
  useProjects,
  useTasksByStatus,
  useTaskStatuses,
  useCreateTaskStatus,
  useCreateTask,
  useMoveTask,
  useUpdateTaskStatus,
  type TaskWithRelations,
  type TaskStatus,
} from '@sedona/projects'

export const Route = createFileRoute('/_authenticated/projects/kanban/')({
  component: KanbanPage,
})

const priorityColors: Record<string, string> = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-400',
}

const columnColors = [
  { value: '#6B7280', label: 'Gris' },
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#10B981', label: 'Vert' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#EC4899', label: 'Rose' },
]

// ===========================================
// SORTABLE TASK CARD
// ===========================================

interface SortableTaskProps {
  task: TaskWithRelations
  onAddTask: (statusId: string) => void
}

function SortableTask({ task }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-4 touch-none select-none ${priorityColors[task.priority] || 'border-l-gray-400'} ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
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
  )
}

// ===========================================
// TASK CARD OVERLAY (for drag)
// ===========================================

function TaskOverlay({ task }: { task: TaskWithRelations }) {
  return (
    <Card
      className={`cursor-grabbing shadow-lg border-l-4 w-[280px] ${priorityColors[task.priority] || 'border-l-gray-400'}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{task.title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ===========================================
// SORTABLE COLUMN
// ===========================================

interface SortableColumnProps {
  column: TaskStatus
  tasks: TaskWithRelations[]
  onAddTask: (statusId: string) => void
}

function SortableColumn({ column, tasks, onAddTask }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: 'column', column } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-[300px] flex-shrink-0"
    >
      {/* Column Header - draggable area */}
      <div
        className={`flex items-center justify-between mb-3 px-2 py-2 rounded-lg cursor-grab active:cursor-grabbing touch-none select-none transition-colors ${isDragging ? 'bg-muted' : 'hover:bg-muted/50'}`}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color || '#6B7280' }}
          />
          <h3 className="font-semibold">{column.name}</h3>
          <Badge variant="secondary" className="ml-1">
            {tasks.length}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
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

      {/* Tasks - drop zone */}
      <div className="flex-1 space-y-2 overflow-y-auto min-h-[200px] bg-muted/30 rounded-lg p-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} onAddTask={onAddTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Deposez une tache ici
          </div>
        )}

        {/* Add task button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => onAddTask(column.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une tache
        </Button>
      </div>
    </div>
  )
}

// ===========================================
// COLUMN OVERLAY (for drag)
// ===========================================

function ColumnOverlay({ column, taskCount }: { column: TaskStatus; taskCount: number }) {
  return (
    <div className="flex flex-col w-[300px] bg-background shadow-lg rounded-lg p-3">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: column.color || '#6B7280' }}
        />
        <h3 className="font-semibold">{column.name}</h3>
        <Badge variant="secondary" className="ml-1">
          {taskCount}
        </Badge>
      </div>
    </div>
  )
}

// ===========================================
// MAIN KANBAN PAGE
// ===========================================

function KanbanPage() {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [isNewColumnOpen, setIsNewColumnOpen] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnColor, setNewColumnColor] = useState('#6B7280')
  const [columnError, setColumnError] = useState<string | null>(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskStatusId, setNewTaskStatusId] = useState('')
  const [taskError, setTaskError] = useState<string | null>(null)

  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'task' | 'column' | null>(null)

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

  // Fetch task statuses/columns for selected project
  const { data: statuses = [], isLoading: isLoadingStatuses } = useTaskStatuses(currentProjectId)

  // Fetch tasks grouped by status
  const { data: tasksByStatus = {}, isLoading: isLoadingTasks } = useTasksByStatus(currentProjectId)

  // Mutations
  const createTaskStatus = useCreateTaskStatus()
  const createTask = useCreateTask(userId)
  const moveTask = useMoveTask(currentProjectId)
  const updateTaskStatus = useUpdateTaskStatus(currentProjectId)

  const isLoading = isLoadingProjects || isLoadingStatuses || isLoadingTasks

  // DnD sensors - more responsive configuration
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // Start drag after 5px movement
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Touch delay before drag starts
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Custom collision detection - better for nested sortable contexts
  const collisionDetection: CollisionDetection = (args) => {
    // First check for pointer within containers
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }
    // Fall back to rect intersection
    return rectIntersection(args)
  }

  // Column IDs for sortable context
  const columnIds = useMemo(() => statuses.map(s => s.id), [statuses])

  // Find active items
  const activeTask = useMemo(() => {
    if (activeType !== 'task' || !activeId) return null
    for (const tasks of Object.values(tasksByStatus)) {
      const task = tasks.find(t => t.id === activeId)
      if (task) return task
    }
    return null
  }, [activeId, activeType, tasksByStatus])

  const activeColumn = useMemo(() => {
    if (activeType !== 'column' || !activeId) return null
    return statuses.find(s => s.id === activeId) || null
  }, [activeId, activeType, statuses])

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeData = active.data.current as any
    const type = activeData?.type as 'task' | 'column'
    setActiveId(active.id as string)
    setActiveType(type)
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // We handle everything in dragEnd for simplicity
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setActiveType(null)

    if (!over) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeData = active.data.current as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const overData = over.data.current as any

    // Handle column reordering
    if (activeData?.type === 'column') {
      if (active.id !== over.id) {
        const oldIndex = statuses.findIndex(s => s.id === active.id)
        const newIndex = statuses.findIndex(s => s.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          // Reorder columns
          const newStatuses = arrayMove(statuses, oldIndex, newIndex)
          // Update positions in DB
          for (let i = 0; i < newStatuses.length; i++) {
            const status = newStatuses[i]
            if (status && status.position !== i) {
              await updateTaskStatus.mutateAsync({
                id: status.id,
                position: i,
              })
            }
          }
        }
      }
      return
    }

    // Handle task movement
    if (activeData?.type === 'task') {
      const task = activeData.task as TaskWithRelations

      // Determine target column
      let targetColumnId: string | null = null
      let targetPosition = 0

      if (overData?.type === 'column') {
        // Dropped on a column directly
        targetColumnId = over.id as string
        targetPosition = (tasksByStatus[targetColumnId] || []).length
      } else if (overData?.type === 'task') {
        // Dropped on another task
        const overTask = overData.task as TaskWithRelations
        targetColumnId = overTask.statusId
        const tasksInColumn = tasksByStatus[targetColumnId!] || []
        const overIndex = tasksInColumn.findIndex(t => t.id === over.id)
        targetPosition = overIndex >= 0 ? overIndex : tasksInColumn.length
      }

      if (targetColumnId && (targetColumnId !== task.statusId || targetPosition !== task.position)) {
        try {
          await moveTask.mutateAsync({
            taskId: task.id,
            statusId: targetColumnId,
            position: targetPosition,
          })
        } catch (err) {
          console.error('Failed to move task:', err)
        }
      }
    }
  }

  // Handle new column creation
  const handleCreateColumn = async () => {
    setColumnError(null)
    if (!newColumnName.trim()) {
      setColumnError('Le nom est requis')
      return
    }
    if (!currentProjectId) {
      setColumnError('Aucun projet selectionne')
      return
    }

    try {
      await createTaskStatus.mutateAsync({
        projectId: currentProjectId,
        name: newColumnName.trim(),
        color: newColumnColor,
        position: statuses.length,
      })
      setNewColumnName('')
      setNewColumnColor('#6B7280')
      setIsNewColumnOpen(false)
    } catch (err) {
      setColumnError(err instanceof Error ? err.message : 'Erreur lors de la creation de la colonne')
    }
  }

  // Handle new task creation
  const handleCreateTask = async () => {
    setTaskError(null)
    if (!newTaskTitle.trim()) {
      setTaskError('Le titre est requis')
      return
    }
    if (!newTaskStatusId) {
      setTaskError('Selectionnez une colonne')
      return
    }

    try {
      await createTask.mutateAsync({
        projectId: currentProjectId,
        title: newTaskTitle.trim(),
        statusId: newTaskStatusId,
        priority: 'medium',
      })
      setNewTaskTitle('')
      setNewTaskStatusId('')
      setIsNewTaskOpen(false)
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Erreur lors de la creation de la tache')
    }
  }

  // Open task dialog with pre-selected column
  const openNewTaskDialog = (statusId?: string) => {
    setNewTaskStatusId(statusId || '')
    setIsNewTaskOpen(true)
  }

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
        <Button onClick={() => openNewTaskDialog()} disabled={statuses.length === 0}>
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
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-max pb-4">
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {statuses.map(column => (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    tasks={tasksByStatus[column.id] || []}
                    onAddTask={openNewTaskDialog}
                  />
                ))}
              </SortableContext>

              {/* Add column button */}
              <div className="w-[300px] flex-shrink-0">
                <Button
                  variant="outline"
                  className="w-full h-12 border-dashed"
                  onClick={() => setIsNewColumnOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une colonne
                </Button>
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'ease-out',
          }}>
            {activeTask && <TaskOverlay task={activeTask} />}
            {activeColumn && (
              <ColumnOverlay
                column={activeColumn}
                taskCount={(tasksByStatus[activeColumn.id] || []).length}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* New Column Dialog */}
      <Dialog open={isNewColumnOpen} onOpenChange={setIsNewColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle colonne</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {columnError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {columnError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="columnName">Nom *</Label>
              <Input
                id="columnName"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Ex: A faire, En cours, Termine..."
              />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex gap-2 flex-wrap">
                {columnColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newColumnColor === c.value ? 'border-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setNewColumnColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewColumnOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateColumn} disabled={createTaskStatus.isPending}>
              {createTaskStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Creer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="space-y-2">
              <Label>Colonne</Label>
              <Select value={newTaskStatusId} onValueChange={setNewTaskStatusId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner..." />
                </SelectTrigger>
                <SelectContent>
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
    </div>
  )
}
