// ===========================================
// CRM TYPES
// ===========================================

// ===========================================
// CONTACT TYPES
// ===========================================

export interface Contact {
  id: string
  organizationId: string

  // Infos principales
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  jobTitle: string | null

  // Rattachements
  companyId: string | null
  company?: Company | null

  // Source & Acquisition
  source: ContactSource | null
  sourceDetails: string | null

  // Adresse
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  postalCode: string | null
  country: string

  // Custom fields
  customFields: Record<string, unknown>

  // Tags
  tags: string[]

  // Metadata
  ownerId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ContactSource =
  | 'website'
  | 'referral'
  | 'linkedin'
  | 'facebook'
  | 'google'
  | 'trade_show'
  | 'cold_call'
  | 'email_campaign'
  | 'partner'
  | 'manual'
  | 'import'
  | 'other'

export interface CreateContactInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  mobile?: string
  jobTitle?: string
  companyId?: string
  source?: ContactSource
  sourceDetails?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postalCode?: string
  country?: string
  customFields?: Record<string, unknown>
  tags?: string[]
  ownerId?: string
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string
}

export interface ContactFilters {
  search?: string
  companyId?: string
  tags?: string[]
  source?: ContactSource
  ownerId?: string
  createdAfter?: string
  createdBefore?: string
}

// ===========================================
// COMPANY TYPES
// ===========================================

export interface Company {
  id: string
  organizationId: string

  name: string
  siret: string | null
  website: string | null
  industry: string | null
  size: CompanySize | null

  // Adresse
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  postalCode: string | null
  country: string

  // Contact principal
  phone: string | null
  email: string | null

  // Metadata
  customFields: Record<string, unknown>
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Relations
  contactsCount?: number
  dealsCount?: number
}

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+'

export interface CreateCompanyInput {
  name: string
  siret?: string
  website?: string
  industry?: string
  size?: CompanySize
  addressLine1?: string
  addressLine2?: string
  city?: string
  postalCode?: string
  country?: string
  phone?: string
  email?: string
  customFields?: Record<string, unknown>
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  id: string
}

export interface CompanyFilters {
  search?: string
  industry?: string
  size?: CompanySize
  city?: string
}

// ===========================================
// PIPELINE TYPES
// ===========================================

export interface Pipeline {
  id: string
  organizationId: string

  name: string
  description: string | null
  isDefault: boolean

  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Relations
  stages?: PipelineStage[]
  dealsCount?: number
  totalValue?: number
}

export interface PipelineStage {
  id: string
  pipelineId: string

  name: string
  color: string
  position: number
  probability: number // 0-100

  createdAt: string
  updatedAt: string

  // Relations
  deals?: Deal[]
  dealsCount?: number
}

export interface CreatePipelineInput {
  name: string
  description?: string
  isDefault?: boolean
  stages?: CreatePipelineStageInput[]
}

export interface UpdatePipelineInput extends Partial<Omit<CreatePipelineInput, 'stages'>> {
  id: string
}

export interface CreatePipelineStageInput {
  name: string
  color?: string
  position: number
  probability?: number
}

export interface UpdatePipelineStageInput extends Partial<CreatePipelineStageInput> {
  id: string
}

// ===========================================
// DEAL TYPES
// ===========================================

// Lightweight contact info for Kanban views
export interface DealContactSummary {
  id: string
  firstName: string | null
  lastName: string | null
}

// Lightweight company info for Kanban views
export interface DealCompanySummary {
  id: string
  name: string
}

export interface Deal {
  id: string
  organizationId: string
  pipelineId: string
  stageId: string

  name: string
  amount: number | null
  currency: string
  probability: number | null
  expectedCloseDate: string | null

  // Rattachements
  contactId: string | null
  companyId: string | null
  contact?: Contact | DealContactSummary | null
  company?: Company | DealCompanySummary | null

  // Status
  status: DealStatus
  wonAt: string | null
  lostAt: string | null
  lostReason: string | null

  // Metadata
  ownerId: string | null
  customFields: Record<string, unknown>
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Relations
  pipeline?: Pipeline
  stage?: PipelineStage
}

export type DealStatus = 'open' | 'won' | 'lost'

export interface CreateDealInput {
  pipelineId: string
  stageId: string
  name: string
  amount?: number
  currency?: string
  probability?: number
  expectedCloseDate?: string
  contactId?: string
  companyId?: string
  ownerId?: string
  customFields?: Record<string, unknown>
}

export interface UpdateDealInput extends Partial<CreateDealInput> {
  id: string
  status?: DealStatus
  lostReason?: string
}

export interface MoveDealInput {
  id: string
  stageId: string
  position?: number
}

export interface DealFilters {
  pipelineId?: string
  stageId?: string
  status?: DealStatus
  contactId?: string
  companyId?: string
  ownerId?: string
  minAmount?: number
  maxAmount?: number
  closeDateAfter?: string
  closeDateBefore?: string
}

// ===========================================
// ACTIVITY TYPES
// ===========================================

export interface Activity {
  id: string
  organizationId: string

  type: ActivityType
  subject: string
  description: string | null

  // Rattachements
  contactId: string | null
  companyId: string | null
  dealId: string | null

  // Pour les taches/reunions
  dueDate: string | null
  completedAt: string | null
  durationMinutes: number | null

  // Metadata
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Relations
  contact?: Contact | null
  company?: Company | null
  deal?: Deal | null
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note'

export interface CreateActivityInput {
  type: ActivityType
  subject: string
  description?: string
  contactId?: string
  companyId?: string
  dealId?: string
  dueDate?: string
  durationMinutes?: number
}

export interface UpdateActivityInput extends Partial<CreateActivityInput> {
  id: string
  completedAt?: string | null
}

export interface ActivityFilters {
  type?: ActivityType
  contactId?: string
  companyId?: string
  dealId?: string
  createdBy?: string
  completed?: boolean
  dueBefore?: string
  dueAfter?: string
}

// ===========================================
// TAG TYPES
// ===========================================

export interface Tag {
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

export interface UpdateTagInput extends Partial<CreateTagInput> {
  id: string
}

// ===========================================
// CUSTOM FIELD TYPES
// ===========================================

export interface CustomFieldDefinition {
  id: string
  organizationId: string
  entityType: 'contact' | 'company' | 'deal'
  name: string
  fieldKey: string
  fieldType: CustomFieldType
  options: string[] | null
  isRequired: boolean
  position: number
  createdAt: string
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean'

export interface CreateCustomFieldInput {
  entityType: 'contact' | 'company' | 'deal'
  name: string
  fieldKey: string
  fieldType: CustomFieldType
  options?: string[]
  isRequired?: boolean
  position?: number
}

// ===========================================
// STATS TYPES
// ===========================================

export interface CrmStats {
  contacts: {
    total: number
    newThisMonth: number
    newThisWeek: number
    bySource: Record<ContactSource, number>
  }
  companies: {
    total: number
    newThisMonth: number
  }
  deals: {
    open: number
    won: number
    lost: number
    totalValue: number
    wonValue: number
    conversionRate: number
    averageDealSize: number
  }
  activities: {
    total: number
    completedThisWeek: number
    overdue: number
  }
}

// ===========================================
// PAGINATION TYPES
// ===========================================

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
