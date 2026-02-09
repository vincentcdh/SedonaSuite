// ===========================================
// PERMISSIONS CONTEXT & HOOKS
// ===========================================

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type {
  OrganizationRole,
  AppModule,
  PermissionAction,
  ModulePermissions,
  UserPermissions,
  PlanLimits,
  LimitCheckResult,
  PlanFeature,
  PlanLimitName,
  SubscriptionPlan,
} from '../types'

// ===========================================
// DEFAULT PERMISSIONS BY ROLE
// ===========================================

const DEFAULT_MODULE_PERMISSIONS: ModulePermissions = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canExport: false,
  canManageTeam: false,
  canApprove: false,
  canSend: false,
  canViewFinancial: false,
  canManageSettings: false,
}

const FULL_PERMISSIONS: ModulePermissions = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canExport: true,
  canManageTeam: true,
  canApprove: true,
  canSend: true,
  canViewFinancial: true,
  canManageSettings: true,
}

// Permissions par défaut pour les managers
function getManagerPermissions(module: AppModule): ModulePermissions {
  // Manager a presque tous les droits sauf la gestion des settings globaux
  if (module === 'settings') {
    return {
      ...FULL_PERMISSIONS,
      canManageSettings: false,
    }
  }
  return FULL_PERMISSIONS
}

// Permissions par défaut pour les employees
function getEmployeePermissions(module: AppModule): ModulePermissions {
  switch (module) {
    case 'crm':
    case 'projects':
    case 'tickets':
    case 'documents':
      return {
        ...DEFAULT_MODULE_PERMISSIONS,
        canView: true,
        canCreate: true,
        canEdit: true, // Seulement ses propres éléments (géré au niveau RLS)
      }
    case 'invoices':
      return {
        ...DEFAULT_MODULE_PERMISSIONS,
        canView: true,
      }
    case 'hr':
      return {
        ...DEFAULT_MODULE_PERMISSIONS,
        canView: true, // Voir ses propres congés, etc.
      }
    case 'analytics':
      return {
        ...DEFAULT_MODULE_PERMISSIONS,
        canView: true, // Voir les dashboards basiques
      }
    case 'settings':
      return DEFAULT_MODULE_PERMISSIONS // Pas d'accès
    default:
      return DEFAULT_MODULE_PERMISSIONS
  }
}

// Générer les permissions par défaut pour un rôle
export function getDefaultPermissions(role: OrganizationRole): UserPermissions {
  const modules: AppModule[] = ['crm', 'invoices', 'projects', 'tickets', 'hr', 'documents', 'analytics', 'settings']

  const permissions: Partial<UserPermissions> = {}

  for (const module of modules) {
    switch (role) {
      case 'owner':
        permissions[module] = FULL_PERMISSIONS
        break
      case 'manager':
        permissions[module] = getManagerPermissions(module)
        break
      case 'employee':
        permissions[module] = getEmployeePermissions(module)
        break
      default:
        permissions[module] = DEFAULT_MODULE_PERMISSIONS
    }
  }

  return permissions as UserPermissions
}

// ===========================================
// DEFAULT PLAN LIMITS
// ===========================================

const FREE_LIMITS: PlanLimits = {
  plan: 'FREE',
  maxContacts: 100,
  maxCompanies: 50,
  maxDeals: 25,
  maxInvoicesPerMonth: 10,
  maxClients: 20,
  maxProducts: 50,
  maxProjects: 3,
  maxTasksPerProject: 50,
  maxTicketsPerMonth: 50,
  maxKbArticles: 10,
  maxEmployees: 5,
  maxLeaveTypes: 3,
  maxStorageMb: 500,
  maxFolders: 10,
  maxUsers: 3,
  featureAnalytics: false,
  featureCustomReports: false,
  featureApiAccess: false,
  featureCustomFields: false,
  featureAutomations: false,
  featureIntegrations: false,
  featureWhiteLabel: false,
  featurePrioritySupport: false,
  featureSla: false,
}

const PRO_LIMITS: PlanLimits = {
  plan: 'PRO',
  maxContacts: null,
  maxCompanies: null,
  maxDeals: null,
  maxInvoicesPerMonth: null,
  maxClients: null,
  maxProducts: null,
  maxProjects: null,
  maxTasksPerProject: null,
  maxTicketsPerMonth: null,
  maxKbArticles: null,
  maxEmployees: null,
  maxLeaveTypes: null,
  maxStorageMb: 10000,
  maxFolders: null,
  maxUsers: null,
  featureAnalytics: true,
  featureCustomReports: true,
  featureApiAccess: true,
  featureCustomFields: true,
  featureAutomations: true,
  featureIntegrations: true,
  featureWhiteLabel: false,
  featurePrioritySupport: true,
  featureSla: false,
}

const ENTERPRISE_LIMITS: PlanLimits = {
  plan: 'ENTERPRISE',
  maxContacts: null,
  maxCompanies: null,
  maxDeals: null,
  maxInvoicesPerMonth: null,
  maxClients: null,
  maxProducts: null,
  maxProjects: null,
  maxTasksPerProject: null,
  maxTicketsPerMonth: null,
  maxKbArticles: null,
  maxEmployees: null,
  maxLeaveTypes: null,
  maxStorageMb: null,
  maxFolders: null,
  maxUsers: null,
  featureAnalytics: true,
  featureCustomReports: true,
  featureApiAccess: true,
  featureCustomFields: true,
  featureAutomations: true,
  featureIntegrations: true,
  featureWhiteLabel: true,
  featurePrioritySupport: true,
  featureSla: true,
}

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  switch (plan) {
    case 'FREE':
      return FREE_LIMITS
    case 'PRO':
      return PRO_LIMITS
    case 'ENTERPRISE':
      return ENTERPRISE_LIMITS
    default:
      return FREE_LIMITS
  }
}

// ===========================================
// PERMISSION CONTEXT
// ===========================================

interface PermissionContextValue {
  role: OrganizationRole
  permissions: UserPermissions
  planLimits: PlanLimits
  plan: SubscriptionPlan

  // Permission checks
  can: (module: AppModule, action: PermissionAction) => boolean
  canAny: (module: AppModule, actions: PermissionAction[]) => boolean
  canAll: (module: AppModule, actions: PermissionAction[]) => boolean

  // Plan limit checks
  checkLimit: (limitName: PlanLimitName, currentCount: number) => LimitCheckResult
  hasFeature: (feature: PlanFeature) => boolean
  isUnlimited: (limitName: PlanLimitName) => boolean

  // Role checks
  isOwner: boolean
  isManager: boolean
  isEmployee: boolean
  isManagerOrAbove: boolean
}

const PermissionContext = createContext<PermissionContextValue | null>(null)

// ===========================================
// PERMISSION PROVIDER
// ===========================================

interface PermissionProviderProps {
  children: ReactNode
  role: OrganizationRole
  plan: SubscriptionPlan
  customPermissions?: Partial<UserPermissions>
  customLimits?: Partial<PlanLimits>
}

export function PermissionProvider({
  children,
  role,
  plan,
  customPermissions,
  customLimits,
}: PermissionProviderProps) {
  const value = useMemo<PermissionContextValue>(() => {
    // Fusionner les permissions par défaut avec les personnalisées
    const defaultPerms = getDefaultPermissions(role)
    const permissions = customPermissions
      ? { ...defaultPerms, ...customPermissions }
      : defaultPerms

    // Fusionner les limites par défaut avec les personnalisées
    const defaultLimits = getPlanLimits(plan)
    const planLimits = customLimits
      ? { ...defaultLimits, ...customLimits }
      : defaultLimits

    // Fonction pour vérifier une permission
    const can = (module: AppModule, action: PermissionAction): boolean => {
      // Owner a toujours tous les droits
      if (role === 'owner') return true

      const modulePerms = permissions[module]
      if (!modulePerms) return false

      const actionMap: Record<PermissionAction, keyof ModulePermissions> = {
        view: 'canView',
        create: 'canCreate',
        edit: 'canEdit',
        delete: 'canDelete',
        export: 'canExport',
        manage_team: 'canManageTeam',
        approve: 'canApprove',
        send: 'canSend',
        view_financial: 'canViewFinancial',
        manage_settings: 'canManageSettings',
      }

      return modulePerms[actionMap[action]] ?? false
    }

    const canAny = (module: AppModule, actions: PermissionAction[]): boolean => {
      return actions.some((action) => can(module, action))
    }

    const canAll = (module: AppModule, actions: PermissionAction[]): boolean => {
      return actions.every((action) => can(module, action))
    }

    // Fonction pour vérifier une limite
    const checkLimit = (limitName: PlanLimitName, currentCount: number): LimitCheckResult => {
      const limitKeyMap: Record<PlanLimitName, keyof PlanLimits> = {
        max_contacts: 'maxContacts',
        max_companies: 'maxCompanies',
        max_deals: 'maxDeals',
        max_invoices_per_month: 'maxInvoicesPerMonth',
        max_clients: 'maxClients',
        max_products: 'maxProducts',
        max_projects: 'maxProjects',
        max_tasks_per_project: 'maxTasksPerProject',
        max_tickets_per_month: 'maxTicketsPerMonth',
        max_kb_articles: 'maxKbArticles',
        max_employees: 'maxEmployees',
        max_leave_types: 'maxLeaveTypes',
        max_storage_mb: 'maxStorageMb',
        max_folders: 'maxFolders',
        max_users: 'maxUsers',
      }

      const limit = planLimits[limitKeyMap[limitName]] as number | null

      if (limit === null) {
        return {
          allowed: true,
          limit: null,
          current: currentCount,
          unlimited: true,
        }
      }

      return {
        allowed: currentCount < limit,
        limit,
        current: currentCount,
        unlimited: false,
        remaining: Math.max(0, limit - currentCount),
      }
    }

    const hasFeature = (feature: PlanFeature): boolean => {
      const featureKeyMap: Record<PlanFeature, keyof PlanLimits> = {
        feature_analytics: 'featureAnalytics',
        feature_custom_reports: 'featureCustomReports',
        feature_api_access: 'featureApiAccess',
        feature_custom_fields: 'featureCustomFields',
        feature_automations: 'featureAutomations',
        feature_integrations: 'featureIntegrations',
        feature_white_label: 'featureWhiteLabel',
        feature_priority_support: 'featurePrioritySupport',
        feature_sla: 'featureSla',
      }

      return planLimits[featureKeyMap[feature]] as boolean
    }

    const isUnlimited = (limitName: PlanLimitName): boolean => {
      const result = checkLimit(limitName, 0)
      return result.unlimited
    }

    return {
      role,
      permissions,
      planLimits,
      plan,
      can,
      canAny,
      canAll,
      checkLimit,
      hasFeature,
      isUnlimited,
      isOwner: role === 'owner',
      isManager: role === 'manager',
      isEmployee: role === 'employee',
      isManagerOrAbove: role === 'owner' || role === 'manager',
    }
  }, [role, plan, customPermissions, customLimits])

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

// ===========================================
// HOOKS
// ===========================================

/**
 * Hook principal pour accéder au contexte de permissions
 */
export function usePermissions(): PermissionContextValue {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

/**
 * Hook pour vérifier si l'utilisateur peut effectuer une action
 */
export function useCanPerform(module: AppModule, action: PermissionAction): boolean {
  const { can } = usePermissions()
  return can(module, action)
}

/**
 * Hook pour vérifier si l'utilisateur peut effectuer au moins une des actions
 */
export function useCanPerformAny(module: AppModule, actions: PermissionAction[]): boolean {
  const { canAny } = usePermissions()
  return canAny(module, actions)
}

/**
 * Hook pour vérifier une limite du plan
 */
export function usePlanLimit(limitName: PlanLimitName, currentCount: number): LimitCheckResult {
  const { checkLimit } = usePermissions()
  return checkLimit(limitName, currentCount)
}

/**
 * Hook pour vérifier si une fonctionnalité est disponible
 */
export function useHasFeature(feature: PlanFeature): boolean {
  const { hasFeature } = usePermissions()
  return hasFeature(feature)
}

/**
 * Hook pour obtenir les limites du plan actuel
 */
export function usePlanLimits(): PlanLimits {
  const { planLimits } = usePermissions()
  return planLimits
}

/**
 * Hook pour vérifier le rôle de l'utilisateur
 */
export function useRole(): {
  role: OrganizationRole
  isOwner: boolean
  isManager: boolean
  isEmployee: boolean
  isManagerOrAbove: boolean
} {
  const { role, isOwner, isManager, isEmployee, isManagerOrAbove } = usePermissions()
  return { role, isOwner, isManager, isEmployee, isManagerOrAbove }
}

// ===========================================
// EXPORTS
// ===========================================

export type { PermissionContextValue, PermissionProviderProps }
