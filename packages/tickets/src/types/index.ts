// ===========================================
// TICKET TYPES
// ===========================================

import { z } from 'zod'

// ===========================================
// ENUMS
// ===========================================

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TicketSource = 'web' | 'email' | 'api' | 'phone' | 'chat'
export type MessageType = 'reply' | 'note' | 'status_change' | 'assignment'
export type AuthorType = 'agent' | 'customer' | 'system'
export type ArticleStatus = 'draft' | 'published' | 'archived'

// ===========================================
// CATEGORY
// ===========================================

export interface TicketCategory {
  id: string
  organizationId: string
  name: string
  description: string | null
  color: string
  icon: string
  parentId: string | null
  isActive: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryInput {
  name: string
  description?: string
  color?: string
  icon?: string
  parentId?: string
  isActive?: boolean
  position?: number
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string
}

// ===========================================
// SLA POLICY
// ===========================================

export interface SlaPolicy {
  id: string
  organizationId: string
  name: string
  description: string | null
  firstResponseTime: number | null
  resolutionTime: number | null
  urgentFirstResponse: number | null
  urgentResolution: number | null
  highFirstResponse: number | null
  highResolution: number | null
  normalFirstResponse: number | null
  normalResolution: number | null
  lowFirstResponse: number | null
  lowResolution: number | null
  businessHoursOnly: boolean
  businessHoursStart: string
  businessHoursEnd: string
  businessDays: number[]
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSlaPolicyInput {
  name: string
  description?: string
  firstResponseTime?: number
  resolutionTime?: number
  urgentFirstResponse?: number
  urgentResolution?: number
  highFirstResponse?: number
  highResolution?: number
  normalFirstResponse?: number
  normalResolution?: number
  lowFirstResponse?: number
  lowResolution?: number
  businessHoursOnly?: boolean
  businessHoursStart?: string
  businessHoursEnd?: string
  businessDays?: number[]
  isDefault?: boolean
}

export interface UpdateSlaPolicyInput extends Partial<CreateSlaPolicyInput> {
  id: string
}

// ===========================================
// TICKET
// ===========================================

export interface Ticket {
  id: string
  organizationId: string
  ticketNumber: string
  subject: string
  description: string | null
  status: TicketStatus
  priority: TicketPriority
  assignedTo: string | null
  assignedAt: string | null
  categoryId: string | null
  slaPolicyId: string | null
  slaFirstResponseDue: string | null
  slaResolutionDue: string | null
  slaFirstResponseAt: string | null
  slaResolvedAt: string | null
  slaBreached: boolean
  source: TicketSource
  sourceEmail: string | null
  sourceMessageId: string | null
  requesterName: string | null
  requesterEmail: string | null
  requesterPhone: string | null
  contactId: string | null
  companyId: string | null
  satisfactionRating: number | null
  satisfactionComment: string | null
  satisfactionRatedAt: string | null
  customFields: Record<string, unknown>
  tags: string[]
  createdBy: string | null
  createdAt: string
  updatedAt: string
  firstResponseAt: string | null
  resolvedAt: string | null
  closedAt: string | null
}

export interface TicketWithRelations extends Ticket {
  category?: TicketCategory | null
  assignee?: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
  } | null
  messagesCount?: number
  lastMessage?: TicketMessage | null
}

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Le sujet est requis').max(500),
  description: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  categoryId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  source: z.enum(['web', 'email', 'api', 'phone', 'chat']).optional(),
  requesterName: z.string().optional(),
  requesterEmail: z.string().email().optional(),
  requesterPhone: z.string().optional(),
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>

export interface UpdateTicketInput extends Partial<CreateTicketInput> {
  id: string
  status?: TicketStatus
}

// ===========================================
// TICKET MESSAGE
// ===========================================

export interface TicketMessage {
  id: string
  ticketId: string
  authorType: AuthorType
  authorId: string | null
  authorName: string | null
  authorEmail: string | null
  content: string
  contentType: 'text' | 'html'
  messageType: MessageType
  isInternal: boolean
  emailMessageId: string | null
  emailInReplyTo: string | null
  createdAt: string
  updatedAt: string
  editedAt: string | null
  // Joined data
  author?: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
  } | null
  attachments?: TicketAttachment[]
}

export interface CreateMessageInput {
  ticketId: string
  content: string
  contentType?: 'text' | 'html'
  messageType?: MessageType
  isInternal?: boolean
  authorName?: string
  authorEmail?: string
}

export interface UpdateMessageInput {
  id: string
  content: string
}

// ===========================================
// TICKET ATTACHMENT
// ===========================================

export interface TicketAttachment {
  id: string
  ticketId: string
  messageId: string | null
  fileName: string
  fileSize: number
  fileType: string | null
  storagePath: string
  uploadedBy: string | null
  uploadedAt: string
}

export interface CreateAttachmentInput {
  ticketId: string
  messageId?: string
  fileName: string
  fileSize: number
  fileType?: string
  storagePath: string
}

// ===========================================
// TAG
// ===========================================

export interface TicketTag {
  id: string
  organizationId: string
  name: string
  color: string
  createdAt: string
}

export interface CreateTagInput {
  name: string
  color?: string
}

export interface UpdateTagInput {
  id: string
  name?: string
  color?: string
}

// ===========================================
// CANNED RESPONSE
// ===========================================

export interface CannedResponse {
  id: string
  organizationId: string
  name: string
  content: string
  category: string | null
  isPersonal: boolean
  createdBy: string | null
  shortcut: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCannedResponseInput {
  name: string
  content: string
  category?: string
  isPersonal?: boolean
  shortcut?: string
}

export interface UpdateCannedResponseInput extends Partial<CreateCannedResponseInput> {
  id: string
}

// ===========================================
// AUTOMATION RULE
// ===========================================

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than'
  value: string | number | boolean
}

export interface AutomationAction {
  type: 'set_status' | 'set_priority' | 'assign_to' | 'add_tag' | 'send_reply' | 'send_notification'
  value: string | number | boolean
}

export interface AutomationRule {
  id: string
  organizationId: string
  name: string
  description: string | null
  triggerType: 'ticket_created' | 'ticket_updated' | 'message_received' | 'sla_breach' | 'schedule'
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  isActive: boolean
  priority: number
  timesTriggered: number
  lastTriggeredAt: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAutomationRuleInput {
  name: string
  description?: string
  triggerType: AutomationRule['triggerType']
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  isActive?: boolean
  priority?: number
}

export interface UpdateAutomationRuleInput extends Partial<CreateAutomationRuleInput> {
  id: string
}

// ===========================================
// ACTIVITY LOG
// ===========================================

export interface TicketActivity {
  id: string
  ticketId: string
  activityType: string
  description: string | null
  oldValue: string | null
  newValue: string | null
  fieldName: string | null
  actorId: string | null
  actorType: 'user' | 'system' | 'automation'
  createdAt: string
  // Joined data
  actor?: {
    id: string
    email: string
    fullName: string | null
  } | null
}

// ===========================================
// KNOWLEDGE BASE ARTICLE
// ===========================================

export interface KbArticle {
  id: string
  organizationId: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  categoryId: string | null
  status: ArticleStatus
  publishedAt: string | null
  metaTitle: string | null
  metaDescription: string | null
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  tags: string[]
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateKbArticleInput {
  title: string
  slug?: string
  content: string
  excerpt?: string
  categoryId?: string
  status?: ArticleStatus
  metaTitle?: string
  metaDescription?: string
  tags?: string[]
}

export interface UpdateKbArticleInput extends Partial<CreateKbArticleInput> {
  id: string
}

// ===========================================
// FILTERS
// ===========================================

export interface TicketFilters {
  search?: string
  status?: TicketStatus | TicketStatus[]
  priority?: TicketPriority | TicketPriority[]
  assignedTo?: string | null
  categoryId?: string
  tags?: string[]
  slaBreached?: boolean
  source?: TicketSource
  createdFrom?: string
  createdTo?: string
}

export interface MessageFilters {
  isInternal?: boolean
  authorType?: AuthorType
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

export interface TicketStats {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  waitingTickets: number
  resolvedTickets: number
  closedTickets: number
  slaBreachedTickets: number
  createdLast24h: number
  resolvedLast24h: number
  avgFirstResponseMinutes: number | null
  avgResolutionMinutes: number | null
  avgSatisfaction: number | null
}

export interface AgentWorkload {
  agentId: string
  totalAssigned: number
  openAssigned: number
  urgentTickets: number
  breachedTickets: number
  avgResolutionMinutes: number | null
  agent?: {
    id: string
    email: string
    fullName: string | null
  }
}
