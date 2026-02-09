// ===========================================
// USER TYPES
// ===========================================

export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  phone?: string | null
  locale?: string
  timezone?: string
  twoFactorEnabled?: boolean
  createdAt: Date
  updatedAt: Date
}

// ===========================================
// SESSION TYPES
// ===========================================

export interface AuthSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  ipAddress?: string | null
  userAgent?: string | null
  currentOrganizationId?: string | null
}

// ===========================================
// ORGANIZATION TYPES
// ===========================================

// Nouveaux rôles: owner (propriétaire), manager (gestionnaire), employee (employé)
// Note: 'admin' et 'member' sont gardés pour rétrocompatibilité mais mappés vers les nouveaux rôles
export type OrganizationRole = 'owner' | 'manager' | 'employee'

// Alias pour rétrocompatibilité (à supprimer après migration complète)
export type LegacyOrganizationRole = 'owner' | 'admin' | 'member'

// Mapping des anciens rôles vers les nouveaux
export const ROLE_MIGRATION_MAP: Record<LegacyOrganizationRole, OrganizationRole> = {
  owner: 'owner',
  admin: 'manager',
  member: 'employee',
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null

  // French business info (custom metadata)
  siret?: string | null
  siren?: string | null
  vatNumber?: string | null
  legalName?: string | null

  // Address (custom metadata)
  addressStreet?: string | null
  addressComplement?: string | null
  addressPostalCode?: string | null
  addressCity?: string | null
  addressCountry?: string | null

  // Contact (custom metadata)
  phone?: string | null
  email?: string | null
  website?: string | null

  // Subscription
  subscriptionPlan?: 'FREE' | 'PRO' | 'ENTERPRISE'
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'

  createdAt: Date
  updatedAt?: Date
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: OrganizationRole
  managerId?: string | null  // ID du manager (pour hiérarchie)
  joinedAt: Date | null
  invitedAt?: Date | null
  invitedBy?: string | null
}

// ===========================================
// PERMISSION TYPES
// ===========================================

// Modules disponibles dans l'application
export type AppModule =
  | 'crm'
  | 'invoices'
  | 'projects'
  | 'tickets'
  | 'hr'
  | 'documents'
  | 'analytics'
  | 'settings'

// Actions possibles sur un module
export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'export'
  | 'manage_team'
  | 'approve'
  | 'send'
  | 'view_financial'
  | 'manage_settings'

// Permissions pour un module
export interface ModulePermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canExport: boolean
  canManageTeam: boolean
  canApprove: boolean
  canSend: boolean
  canViewFinancial: boolean
  canManageSettings: boolean
}

// Toutes les permissions d'un utilisateur
export type UserPermissions = Record<AppModule, ModulePermissions>

// Permission de base dans la DB
export interface RolePermission {
  id: string
  organizationId: string
  role: OrganizationRole
  module: AppModule
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canExport: boolean
  canManageTeam: boolean
  canApprove: boolean
  canSend: boolean
  canViewFinancial: boolean
  canManageSettings: boolean
  createdAt: Date
  updatedAt: Date
}

// ===========================================
// PLAN LIMITS TYPES
// ===========================================

export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE'

export interface PlanLimits {
  plan: SubscriptionPlan

  // CRM
  maxContacts: number | null       // null = illimité
  maxCompanies: number | null
  maxDeals: number | null

  // Facturation
  maxInvoicesPerMonth: number | null
  maxClients: number | null
  maxProducts: number | null

  // Projets
  maxProjects: number | null
  maxTasksPerProject: number | null

  // Tickets
  maxTicketsPerMonth: number | null
  maxKbArticles: number | null

  // RH
  maxEmployees: number | null
  maxLeaveTypes: number | null

  // Documents
  maxStorageMb: number | null
  maxFolders: number | null

  // Membres
  maxUsers: number | null

  // Fonctionnalités
  featureAnalytics: boolean
  featureCustomReports: boolean
  featureApiAccess: boolean
  featureCustomFields: boolean
  featureAutomations: boolean
  featureIntegrations: boolean
  featureWhiteLabel: boolean
  featurePrioritySupport: boolean
  featureSla: boolean
}

// Résultat de vérification de limite
export interface LimitCheckResult {
  allowed: boolean
  limit: number | null
  current: number
  unlimited: boolean
  remaining?: number
}

// Fonctionnalités vérifiables
export type PlanFeature =
  | 'feature_analytics'
  | 'feature_custom_reports'
  | 'feature_api_access'
  | 'feature_custom_fields'
  | 'feature_automations'
  | 'feature_integrations'
  | 'feature_white_label'
  | 'feature_priority_support'
  | 'feature_sla'

// Limites vérifiables
export type PlanLimitName =
  | 'max_contacts'
  | 'max_companies'
  | 'max_deals'
  | 'max_invoices_per_month'
  | 'max_clients'
  | 'max_products'
  | 'max_projects'
  | 'max_tasks_per_project'
  | 'max_tickets_per_month'
  | 'max_kb_articles'
  | 'max_employees'
  | 'max_leave_types'
  | 'max_storage_mb'
  | 'max_folders'
  | 'max_users'

// ===========================================
// USER CONTEXT (pour le contexte React)
// ===========================================

export interface UserContext {
  user: AuthUser
  organization: Organization
  role: OrganizationRole
  permissions: UserPermissions
  planLimits: PlanLimits
  managerId?: string | null
  isOwner: boolean
  isManager: boolean
  isEmployee: boolean
}

// ===========================================
// AUTH STATE TYPES
// ===========================================

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  organization: Organization | null
  organizations: Organization[]
  isLoading: boolean
  isAuthenticated: boolean
}

// ===========================================
// AUTH ACTION TYPES
// ===========================================

export interface SignUpInput {
  email: string
  password: string
  name: string
  organizationName?: string
}

export interface SignInInput {
  email: string
  password: string
  rememberMe?: boolean
}

export interface ResetPasswordInput {
  email: string
}

export interface NewPasswordInput {
  token: string
  password: string
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
  locale?: string
  timezone?: string
}

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
}

// ===========================================
// INVITATION TYPES
// ===========================================

export interface InviteMemberInput {
  email: string
  role: OrganizationRole
  organizationId: string
}

export interface AcceptInvitationInput {
  token: string
  name?: string
  password?: string
}

// ===========================================
// CALLBACK TYPES
// ===========================================

export type AuthCallback = () => void | Promise<void>
export type AuthErrorCallback = (error: Error) => void | Promise<void>
