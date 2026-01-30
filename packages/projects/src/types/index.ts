// ===========================================
// PROJECT TYPES
// ===========================================

import { z } from 'zod'

// ===========================================
// ENUMS
// ===========================================

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'
export type ProjectRole = 'owner' | 'manager' | 'member' | 'viewer'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'

// ===========================================
// PROJECT
// ===========================================

export interface Project {
  id: string
  organizationId: string
  name: string
  description: string | null
  color: string
  icon: string
  status: ProjectStatus
  startDate: string | null
  endDate: string | null
  budgetAmount: number | null
  budgetCurrency: string
  isPublic: boolean
  allowTimeTracking: boolean
  dealId: string | null
  clientId: string | null
  customFields: Record<string, unknown>
  createdBy: string | null
  createdAt: string
  updatedAt: string
  archivedAt: string | null
}

export interface ProjectWithStats extends Project {
  totalTasks: number
  completedTasks: number
  progressPercentage: number
  totalTimeMinutes: number
  totalEstimatedMinutes: number
  membersCount: number
}

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budgetAmount: z.number().positive().optional(),
  budgetCurrency: z.string().length(3).optional(),
  isPublic: z.boolean().optional(),
  allowTimeTracking: z.boolean().optional(),
  dealId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  customFields: z.record(z.unknown()).optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string
}

// ===========================================
// PROJECT MEMBER
// ===========================================

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: ProjectRole
  canEditProject: boolean
  canManageMembers: boolean
  canDeleteTasks: boolean
  joinedAt: string
  invitedBy: string | null
  // Joined data
  user?: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
  }
}

export interface AddProjectMemberInput {
  projectId: string
  userId: string
  role?: ProjectRole
  canEditProject?: boolean
  canManageMembers?: boolean
  canDeleteTasks?: boolean
}

export interface UpdateProjectMemberInput {
  id: string
  role?: ProjectRole
  canEditProject?: boolean
  canManageMembers?: boolean
  canDeleteTasks?: boolean
}

// ===========================================
// TASK STATUS
// ===========================================

export interface TaskStatus {
  id: string
  projectId: string
  name: string
  color: string
  position: number
  isDefault: boolean
  isCompleted: boolean
  createdAt: string
}

export interface CreateTaskStatusInput {
  projectId: string
  name: string
  color?: string
  position?: number
  isDefault?: boolean
  isCompleted?: boolean
}

export interface UpdateTaskStatusInput {
  id: string
  name?: string
  color?: string
  position?: number
  isDefault?: boolean
  isCompleted?: boolean
}

// ===========================================
// TASK
// ===========================================

export interface Task {
  id: string
  projectId: string
  parentTaskId: string | null
  title: string
  description: string | null
  statusId: string | null
  priority: TaskPriority
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  estimatedHours: number | null
  position: number
  customFields: Record<string, unknown>
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskWithRelations extends Task {
  status?: TaskStatus | null
  assignees?: TaskAssignee[]
  labels?: Label[]
  checklistItems?: TaskChecklistItem[]
  subtasks?: Task[]
  commentsCount?: number
  attachmentsCount?: number
}

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  parentTaskId: z.string().uuid().optional(),
  title: z.string().min(1, 'Le titre est requis').max(500),
  description: z.string().optional(),
  statusId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  position: z.number().optional(),
  customFields: z.record(z.unknown()).optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export interface UpdateTaskInput extends Partial<Omit<CreateTaskInput, 'projectId'>> {
  id: string
}

// ===========================================
// TASK ASSIGNEE
// ===========================================

export interface TaskAssignee {
  id: string
  taskId: string
  userId: string
  assignedAt: string
  assignedBy: string | null
  // Joined data
  user?: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
  }
}

// ===========================================
// TASK DEPENDENCY
// ===========================================

export interface TaskDependency {
  id: string
  taskId: string
  dependsOnTaskId: string
  dependencyType: DependencyType
  createdAt: string
}

export interface CreateTaskDependencyInput {
  taskId: string
  dependsOnTaskId: string
  dependencyType?: DependencyType
}

// ===========================================
// TASK COMMENT
// ===========================================

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  parentCommentId: string | null
  createdAt: string
  updatedAt: string
  editedAt: string | null
  // Joined data
  user?: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
  }
  replies?: TaskComment[]
}

export interface CreateTaskCommentInput {
  taskId: string
  content: string
  parentCommentId?: string
}

export interface UpdateTaskCommentInput {
  id: string
  content: string
}

// ===========================================
// TASK ATTACHMENT
// ===========================================

export interface TaskAttachment {
  id: string
  taskId: string
  fileName: string
  fileSize: number
  fileType: string | null
  storagePath: string
  uploadedBy: string | null
  uploadedAt: string
}

export interface CreateTaskAttachmentInput {
  taskId: string
  fileName: string
  fileSize: number
  fileType?: string
  storagePath: string
}

// ===========================================
// TASK CHECKLIST ITEM
// ===========================================

export interface TaskChecklistItem {
  id: string
  taskId: string
  title: string
  isCompleted: boolean
  position: number
  completedAt: string | null
  completedBy: string | null
  createdAt: string
}

export interface CreateTaskChecklistItemInput {
  taskId: string
  title: string
  position?: number
}

export interface UpdateTaskChecklistItemInput {
  id: string
  title?: string
  isCompleted?: boolean
  position?: number
}

// ===========================================
// TIME ENTRY
// ===========================================

export interface TimeEntry {
  id: string
  projectId: string
  taskId: string | null
  userId: string
  description: string | null
  startTime: string
  endTime: string | null
  durationMinutes: number | null
  isBillable: boolean
  hourlyRate: number | null
  isRunning: boolean
  createdAt: string
  updatedAt: string
  // Joined data
  task?: Task | null
  user?: {
    id: string
    email: string
    fullName: string | null
  }
}

export const createTimeEntrySchema = z.object({
  projectId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  durationMinutes: z.number().positive().optional(),
  isBillable: z.boolean().optional(),
  hourlyRate: z.number().positive().optional(),
})

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>

export interface UpdateTimeEntryInput extends Partial<Omit<CreateTimeEntryInput, 'projectId'>> {
  id: string
}

// ===========================================
// LABEL
// ===========================================

export interface Label {
  id: string
  projectId: string
  name: string
  color: string
  createdAt: string
}

export interface CreateLabelInput {
  projectId: string
  name: string
  color?: string
}

export interface UpdateLabelInput {
  id: string
  name?: string
  color?: string
}

// ===========================================
// FILTERS
// ===========================================

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus
  hasTimeTracking?: boolean
}

export interface TaskFilters {
  search?: string
  statusId?: string
  priority?: TaskPriority
  assigneeId?: string
  labelId?: string
  hasDueDate?: boolean
  isOverdue?: boolean
  isCompleted?: boolean
}

export interface TimeEntryFilters {
  taskId?: string
  userId?: string
  startDate?: string
  endDate?: string
  isBillable?: boolean
}

// ===========================================
// PAGINATION
// ===========================================

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ===========================================
// STATISTICS
// ===========================================

export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  totalTimeMinutes: number
}

export interface MemberWorkload {
  userId: string
  projectId: string
  assignedTasks: number
  openTasks: number
  totalTimeMinutes: number
  user?: {
    id: string
    email: string
    fullName: string | null
  }
}

// ===========================================
// GANTT VIEW TYPES
// ===========================================

export interface GanttTask {
  id: string
  title: string
  startDate: string
  endDate: string
  progress: number
  dependencies: string[]
  assignees: string[]
  color?: string
}

export interface GanttViewOptions {
  scale: 'day' | 'week' | 'month' | 'quarter'
  showDependencies: boolean
  showProgress: boolean
}

// ===========================================
// CLIENT PORTAL TYPES
// ===========================================

export type ClientAccessType = 'account' | 'link'

export interface ClientAccess {
  id: string
  projectId: string
  accessType: ClientAccessType
  clientEmail: string | null
  clientName: string | null
  shareToken: string | null
  passwordProtected: boolean
  expiresAt: string | null
  canComment: boolean
  canUploadFiles: boolean
  canSeeTimeTracking: boolean
  canSeeBudget: boolean
  canSeeTeamMembers: boolean
  notifyOnUpdates: boolean
  lastAccessedAt: string | null
  accessCount: number
  isActive: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientPermissions {
  canComment: boolean
  canUploadFiles: boolean
  canSeeTimeTracking: boolean
  canSeeBudget: boolean
  canSeeTeamMembers: boolean
}

export interface InviteClientInput {
  projectId: string
  clientEmail: string
  clientName: string
  message?: string
  permissions?: Partial<ClientPermissions>
}

export interface CreateShareLinkInput {
  projectId: string
  name?: string
  password?: string
  expiresAt?: string
  permissions?: Partial<ClientPermissions>
}

export interface ClientSession {
  id: string
  clientAccessId: string
  token: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface ProjectComment {
  id: string
  projectId: string
  taskId: string | null
  content: string
  userId: string | null
  clientAccessId: string | null
  parentId: string | null
  isInternal: boolean
  attachmentUrl: string | null
  attachmentName: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  // Joined data
  user?: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
  } | null
  clientAccess?: {
    id: string
    clientName: string | null
    clientEmail: string | null
  } | null
  replies?: ProjectComment[]
}

export interface CreateCommentInput {
  projectId: string
  taskId?: string
  content: string
  parentId?: string
  isInternal?: boolean
  attachmentUrl?: string
  attachmentName?: string
}

export interface ClientQuestion {
  id: string
  projectId: string
  clientAccessId: string
  subject: string
  message: string
  status: 'open' | 'answered' | 'closed'
  answeredBy: string | null
  answeredAt: string | null
  answer: string | null
  createdAt: string
  updatedAt: string
  // Joined data
  clientAccess?: {
    id: string
    clientName: string | null
    clientEmail: string | null
  } | null
  answeredByUser?: {
    id: string
    email: string
    fullName: string | null
  } | null
}

export interface CreateClientQuestionInput {
  projectId: string
  subject: string
  message: string
}

export interface AnswerClientQuestionInput {
  id: string
  answer: string
}

export interface ClientValidation {
  id: string
  projectId: string
  title: string
  description: string | null
  taskIds: string[]
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  validatedByClientId: string | null
  validatedAt: string | null
  clientFeedback: string | null
  changeRequests: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  // Joined data
  tasks?: Task[]
  validatedByClient?: {
    id: string
    clientName: string | null
    clientEmail: string | null
  } | null
}

export interface CreateValidationInput {
  projectId: string
  title: string
  description?: string
  taskIds: string[]
}

export interface RespondToValidationInput {
  id: string
  status: 'approved' | 'rejected' | 'changes_requested'
  feedback?: string
  changeRequests?: string
}

export interface ActivityLogEntry {
  id: string
  projectId: string
  action: string
  taskId: string | null
  userId: string | null
  clientAccessId: string | null
  details: Record<string, unknown>
  visibleToClient: boolean
  createdAt: string
  // Joined data
  user?: {
    id: string
    email: string
    fullName: string | null
  } | null
  clientAccess?: {
    id: string
    clientName: string | null
  } | null
  task?: {
    id: string
    title: string
  } | null
}

// ===========================================
// PROJECT EXTENDED WITH CLIENT PORTAL
// ===========================================

export interface ProjectWithClientAccess extends Project {
  clientAccess?: ClientAccess[]
  hasClientPortal: boolean
  activeClientsCount: number
}

// ===========================================
// PLAN LIMITS
// ===========================================

export const PROJECT_PLAN_LIMITS = {
  FREE: {
    maxProjects: 3,
    maxMembersPerProject: 3,
    maxStorageGB: 1,
    ganttView: false,
    timeTracking: false,
    clientPortalProjects: 1,
    maxClientsPerProject: 2,
    advancedReports: false,
  },
  PRO: {
    maxProjects: 50,
    maxMembersPerProject: 20,
    maxStorageGB: 50,
    ganttView: true,
    timeTracking: true,
    clientPortalProjects: Infinity,
    maxClientsPerProject: Infinity,
    advancedReports: true,
  },
} as const
