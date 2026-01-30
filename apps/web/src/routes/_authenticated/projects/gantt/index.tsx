// ===========================================
// GANTT VIEW PAGE (PRO FEATURE)
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  GitBranch,
  MousePointer,
  Layers,
} from 'lucide-react'
import { GanttChart } from '@sedona/projects'
import { ProFeatureMask } from '@/components/pro'

export const Route = createFileRoute('/_authenticated/projects/gantt/')({
  component: GanttPage,
})

// PRO features to display in upgrade card
const ganttFeatures = [
  { icon: Calendar, label: 'Timeline interactive' },
  { icon: GitBranch, label: 'Dependances entre taches' },
  { icon: MousePointer, label: 'Drag & drop pour modifier les dates' },
  { icon: Layers, label: 'Vue semaine/mois/trimestre' },
]

// Mock data for display
const mockTasks = [
  {
    id: '1',
    projectId: '1',
    title: 'Design maquettes',
    description: null,
    statusId: 'status-1',
    priority: 'medium' as const,
    startDate: '2025-01-15',
    dueDate: '2025-02-01',
    completedAt: '2025-02-01',
    estimatedHours: 40,
    position: 0,
    parentTaskId: null,
    customFields: {},
    createdBy: null,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-15',
    status: { id: 'status-1', projectId: '1', name: 'Termine', color: '#10b981', position: 3, isDefault: false, isCompleted: true, createdAt: '2025-01-01' },
    assignees: [
      { id: 'a1', taskId: '1', userId: 'u1', assignedAt: '2025-01-01', assignedBy: null, user: { id: 'u1', email: 'alice@test.com', fullName: 'Alice Martin', avatarUrl: null } },
    ],
    checklistItems: [
      { id: 'c1', taskId: '1', title: 'Maquette desktop', isCompleted: true, position: 0, completedAt: '2025-01-20', completedBy: 'u1', createdAt: '2025-01-01' },
      { id: 'c2', taskId: '1', title: 'Maquette mobile', isCompleted: true, position: 1, completedAt: '2025-01-25', completedBy: 'u1', createdAt: '2025-01-01' },
    ],
  },
  {
    id: '2',
    projectId: '1',
    title: 'Integration frontend',
    description: null,
    statusId: 'status-2',
    priority: 'high' as const,
    startDate: '2025-02-01',
    dueDate: '2025-02-20',
    completedAt: null,
    estimatedHours: 60,
    position: 1,
    parentTaskId: null,
    customFields: {},
    createdBy: null,
    createdAt: '2025-01-01',
    updatedAt: '2025-02-01',
    status: { id: 'status-2', projectId: '1', name: 'En cours', color: '#0c82d6', position: 1, isDefault: false, isCompleted: false, createdAt: '2025-01-01' },
    assignees: [
      { id: 'a2', taskId: '2', userId: 'u2', assignedAt: '2025-02-01', assignedBy: null, user: { id: 'u2', email: 'bob@test.com', fullName: 'Bob Durand', avatarUrl: null } },
    ],
    checklistItems: [
      { id: 'c3', taskId: '2', title: 'Header', isCompleted: true, position: 0, completedAt: '2025-02-05', completedBy: 'u2', createdAt: '2025-02-01' },
      { id: 'c4', taskId: '2', title: 'Footer', isCompleted: true, position: 1, completedAt: '2025-02-08', completedBy: 'u2', createdAt: '2025-02-01' },
      { id: 'c5', taskId: '2', title: 'Pages principales', isCompleted: false, position: 2, completedAt: null, completedBy: null, createdAt: '2025-02-01' },
      { id: 'c6', taskId: '2', title: 'Responsive', isCompleted: false, position: 3, completedAt: null, completedBy: null, createdAt: '2025-02-01' },
    ],
  },
  {
    id: '3',
    projectId: '1',
    title: 'Backend API',
    description: null,
    statusId: 'status-2',
    priority: 'high' as const,
    startDate: '2025-02-05',
    dueDate: '2025-02-25',
    completedAt: null,
    estimatedHours: 80,
    position: 2,
    parentTaskId: null,
    customFields: {},
    createdBy: null,
    createdAt: '2025-01-01',
    updatedAt: '2025-02-05',
    status: { id: 'status-2', projectId: '1', name: 'En cours', color: '#0c82d6', position: 1, isDefault: false, isCompleted: false, createdAt: '2025-01-01' },
    assignees: [
      { id: 'a3', taskId: '3', userId: 'u3', assignedAt: '2025-02-05', assignedBy: null, user: { id: 'u3', email: 'claire@test.com', fullName: 'Claire Petit', avatarUrl: null } },
    ],
    checklistItems: [
      { id: 'c7', taskId: '3', title: 'Auth', isCompleted: true, position: 0, completedAt: '2025-02-10', completedBy: 'u3', createdAt: '2025-02-05' },
      { id: 'c8', taskId: '3', title: 'CRUD utilisateurs', isCompleted: false, position: 1, completedAt: null, completedBy: null, createdAt: '2025-02-05' },
    ],
  },
  {
    id: '4',
    projectId: '1',
    title: 'Tests',
    description: null,
    statusId: 'status-0',
    priority: 'medium' as const,
    startDate: '2025-02-20',
    dueDate: '2025-03-05',
    completedAt: null,
    estimatedHours: 30,
    position: 3,
    parentTaskId: null,
    customFields: {},
    createdBy: null,
    createdAt: '2025-01-01',
    updatedAt: '2025-02-20',
    status: { id: 'status-0', projectId: '1', name: 'A faire', color: '#6b7280', position: 0, isDefault: true, isCompleted: false, createdAt: '2025-01-01' },
    assignees: [],
    checklistItems: [],
  },
  {
    id: '5',
    projectId: '1',
    title: 'Deploiement',
    description: null,
    statusId: 'status-0',
    priority: 'low' as const,
    startDate: '2025-03-05',
    dueDate: '2025-03-15',
    completedAt: null,
    estimatedHours: 10,
    position: 4,
    parentTaskId: null,
    customFields: {},
    createdBy: null,
    createdAt: '2025-01-01',
    updatedAt: '2025-03-05',
    status: { id: 'status-0', projectId: '1', name: 'A faire', color: '#6b7280', position: 0, isDefault: true, isCompleted: false, createdAt: '2025-01-01' },
    assignees: [],
    checklistItems: [],
  },
]

const mockStatuses = [
  { id: 'status-0', projectId: '1', name: 'A faire', color: '#6b7280', position: 0, isDefault: true, isCompleted: false, createdAt: '2025-01-01' },
  { id: 'status-1', projectId: '1', name: 'Termine', color: '#10b981', position: 3, isDefault: false, isCompleted: true, createdAt: '2025-01-01' },
  { id: 'status-2', projectId: '1', name: 'En cours', color: '#0c82d6', position: 1, isDefault: false, isCompleted: false, createdAt: '2025-01-01' },
]

const mockDependencies = [
  { id: 'dep-1', taskId: '2', dependsOnTaskId: '1', dependencyType: 'finish_to_start' as const, createdAt: '2025-01-01' },
  { id: 'dep-2', taskId: '4', dependsOnTaskId: '2', dependencyType: 'finish_to_start' as const, createdAt: '2025-01-01' },
  { id: 'dep-3', taskId: '4', dependsOnTaskId: '3', dependencyType: 'finish_to_start' as const, createdAt: '2025-01-01' },
  { id: 'dep-4', taskId: '5', dependsOnTaskId: '4', dependencyType: 'finish_to_start' as const, createdAt: '2025-01-01' },
]

function GanttPage() {
  return (
    <ProFeatureMask
      requiredPlan="PRO"
      title="Vue Gantt"
      description="La vue Gantt vous permet de visualiser et planifier vos projets avec une timeline interactive et des dependances entre taches."
      features={ganttFeatures}
    >
      <GanttContent />
    </ProFeatureMask>
  )
}

// ===========================================
// ACTUAL GANTT CONTENT
// ===========================================

function GanttContent() {
  return (
    <div className="h-full">
      <GanttChart
        tasks={mockTasks}
        dependencies={mockDependencies}
        statuses={mockStatuses}
        onTaskClick={(taskId: string) => {
          console.log('Task clicked:', taskId)
        }}
      />
    </div>
  )
}
