// ===========================================
// KANBAN VIEW PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, MoreHorizontal, GripVertical, Calendar } from 'lucide-react'
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

export const Route = createFileRoute('/_authenticated/projects/kanban/')({
  component: KanbanPage,
})

// Mock projects for selector
const mockProjects = [
  { id: '1', name: 'Refonte Site Web Client A', color: '#3B82F6' },
  { id: '2', name: 'Application Mobile E-commerce', color: '#10B981' },
  { id: '3', name: 'Migration Infrastructure Cloud', color: '#F59E0B' },
]

// Mock kanban data
const mockColumns = [
  {
    id: '1',
    name: 'A faire',
    color: '#6B7280',
    tasks: [
      { id: '1', title: 'Formulaire contact', priority: 'low', dueDate: '2024-02-25', assignee: null },
      { id: '2', title: 'Tests unitaires', priority: 'medium', dueDate: '2024-02-28', assignee: 'David' },
      { id: '3', title: 'Documentation API', priority: 'low', dueDate: null, assignee: null },
    ],
  },
  {
    id: '2',
    name: 'En cours',
    color: '#3B82F6',
    tasks: [
      { id: '4', title: 'Page produits - liste', priority: 'high', dueDate: '2024-02-15', assignee: 'Claire' },
      { id: '5', title: 'Page produits - detail', priority: 'medium', dueDate: '2024-02-18', assignee: 'David' },
      { id: '6', title: 'Optimisation images', priority: 'medium', dueDate: '2024-02-20', assignee: 'Bob' },
    ],
  },
  {
    id: '3',
    name: 'En revue',
    color: '#F59E0B',
    tasks: [
      { id: '7', title: 'Integration CMS', priority: 'high', dueDate: '2024-02-20', assignee: 'Alice' },
    ],
  },
  {
    id: '4',
    name: 'Termine',
    color: '#10B981',
    tasks: [
      { id: '8', title: 'Design maquettes', priority: 'high', dueDate: '2024-02-01', assignee: 'Alice' },
      { id: '9', title: 'Integration header/footer', priority: 'medium', dueDate: '2024-02-10', assignee: 'Bob' },
      { id: '10', title: 'Setup projet', priority: 'medium', dueDate: '2024-01-20', assignee: 'Alice' },
    ],
  },
]

const priorityColors: Record<string, string> = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-400',
}

function KanbanPage() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]?.id ?? '')

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selectionner un projet" />
            </SelectTrigger>
            <SelectContent>
              {mockProjects.map(project => (
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tache
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {mockColumns.map(column => (
            <div key={column.id} className="flex flex-col w-[300px] flex-shrink-0">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-semibold">{column.name}</h3>
                  <Badge variant="secondary" className="ml-1">
                    {column.tasks.length}
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
                {column.tasks.map(task => (
                  <Card
                    key={task.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${priorityColors[task.priority] || ''}`}
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
                            {task.assignee && (
                              <Avatar className="h-5 w-5 ml-auto">
                                <AvatarFallback className="text-[10px]">
                                  {task.assignee.charAt(0)}
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
          ))}

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
    </div>
  )
}
