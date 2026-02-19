// ===========================================
// CROSS-MODULE ACCESS HOOKS
// ===========================================
// Hooks for checking access when operations span multiple modules
// Used for features like creating invoice from deal, linking CRM to invoice clients

import { useModuleSubscriptions, type ModuleId } from './useModuleSubscriptions'

// ===========================================
// TYPES
// ===========================================

export interface CrossModuleAccessResult {
  /** Whether the cross-module operation is allowed */
  isAllowed: boolean
  /** Whether data is still loading */
  isLoading: boolean
  /** Source module status */
  sourceModule: {
    moduleId: ModuleId
    isAvailable: boolean
    isPaid: boolean
  }
  /** Target module status */
  targetModule: {
    moduleId: ModuleId
    isAvailable: boolean
    isPaid: boolean
  }
  /** Reason why operation is not allowed (if applicable) */
  reason?: string
}

export interface ModuleAccessInfo {
  moduleId: ModuleId
  isAvailable: boolean
  isPaid: boolean
  name: string
}

// ===========================================
// MODULE NAMES (French)
// ===========================================

const MODULE_NAMES: Record<ModuleId, string> = {
  crm: 'CRM',
  invoice: 'Facturation',
  projects: 'Projets',
  tickets: 'Support',
  hr: 'RH',
  docs: 'Documents',
  analytics: 'Analytics',
}

// ===========================================
// CROSS-MODULE ACCESS HOOK
// ===========================================

/**
 * Check if a cross-module operation is allowed
 * Both modules must be accessible (either free tier or paid)
 *
 * @example
 * // Check if we can create invoice from a deal
 * const { isAllowed, reason } = useCrossModuleAccess(orgId, 'crm', 'invoice')
 */
export function useCrossModuleAccess(
  organizationId: string | undefined,
  sourceModuleId: ModuleId,
  targetModuleId: ModuleId
): CrossModuleAccessResult {
  const { modules, isLoading } = useModuleSubscriptions(organizationId)

  if (isLoading || !organizationId) {
    return {
      isAllowed: false,
      isLoading: true,
      sourceModule: {
        moduleId: sourceModuleId,
        isAvailable: false,
        isPaid: false,
      },
      targetModule: {
        moduleId: targetModuleId,
        isAvailable: false,
        isPaid: false,
      },
    }
  }

  const sourceModule = modules.find(m => m.moduleId === sourceModuleId)
  const targetModule = modules.find(m => m.moduleId === targetModuleId)

  // A module is available if it exists in subscriptions (free or paid)
  const sourceAvailable = sourceModule !== undefined
  const targetAvailable = targetModule !== undefined

  const sourceIsPaid = sourceModule?.isPaid || false
  const targetIsPaid = targetModule?.isPaid || false

  // Both modules must be available (subscription exists)
  const isAllowed = sourceAvailable && targetAvailable

  let reason: string | undefined
  if (!sourceAvailable) {
    reason = `Le module ${MODULE_NAMES[sourceModuleId]} n'est pas disponible`
  } else if (!targetAvailable) {
    reason = `Le module ${MODULE_NAMES[targetModuleId]} n'est pas disponible`
  }

  return {
    isAllowed,
    isLoading: false,
    sourceModule: {
      moduleId: sourceModuleId,
      isAvailable: sourceAvailable,
      isPaid: sourceIsPaid,
    },
    targetModule: {
      moduleId: targetModuleId,
      isAvailable: targetAvailable,
      isPaid: targetIsPaid,
    },
    reason,
  }
}

// ===========================================
// SPECIFIC CROSS-MODULE HOOKS
// ===========================================

/**
 * Check if we can create an invoice from a deal (CRM -> Invoice)
 */
export function useCanCreateInvoiceFromDeal(
  organizationId: string | undefined
): CrossModuleAccessResult {
  return useCrossModuleAccess(organizationId, 'crm', 'invoice')
}

/**
 * Check if we can create a quote from a deal (CRM -> Invoice)
 */
export function useCanCreateQuoteFromDeal(
  organizationId: string | undefined
): CrossModuleAccessResult {
  return useCrossModuleAccess(organizationId, 'crm', 'invoice')
}

/**
 * Check if we can link an invoice client to a CRM contact/company
 */
export function useCanLinkClientToCrm(
  organizationId: string | undefined
): CrossModuleAccessResult {
  return useCrossModuleAccess(organizationId, 'invoice', 'crm')
}

/**
 * Check if we can create a project from a deal (CRM -> Projects)
 */
export function useCanCreateProjectFromDeal(
  organizationId: string | undefined
): CrossModuleAccessResult {
  return useCrossModuleAccess(organizationId, 'crm', 'projects')
}

/**
 * Check if we can create a ticket from a contact (CRM -> Tickets)
 */
export function useCanCreateTicketFromContact(
  organizationId: string | undefined
): CrossModuleAccessResult {
  return useCrossModuleAccess(organizationId, 'crm', 'tickets')
}

/**
 * Check if we can view deal analytics (CRM -> Analytics)
 */
export function useCanViewDealAnalytics(
  organizationId: string | undefined
): CrossModuleAccessResult {
  return useCrossModuleAccess(organizationId, 'crm', 'analytics')
}

/**
 * Check if we can view invoice analytics (Invoice -> Analytics)
 */
export function useCanViewInvoiceAnalytics(
  organizationId: string | undefined
): CrossModuleAccessResult {
  return useCrossModuleAccess(organizationId, 'invoice', 'analytics')
}

/**
 * Check if we can link employee to HR documents (HR -> Docs)
 */
export function useCanLinkEmployeeDocuments(
  organizationId: string | undefined
): CrossModuleAccessResult {
  return useCrossModuleAccess(organizationId, 'hr', 'docs')
}

// ===========================================
// SINGLE MODULE AVAILABILITY HOOK
// ===========================================

/**
 * Check if a single module is available (free or paid)
 * Since all modules have a free tier, this always returns true when org is valid
 *
 * @example
 * const isAvailable = useIsModuleAvailable(orgId, 'crm')
 */
export function useIsModuleAvailable(
  organizationId: string | undefined,
  moduleId: ModuleId
): { isAvailable: boolean; isPaid: boolean; isLoading: boolean } {
  const { modules, isLoading } = useModuleSubscriptions(organizationId)

  if (isLoading || !organizationId) {
    return { isAvailable: false, isPaid: false, isLoading: true }
  }

  const module = modules.find(m => m.moduleId === moduleId)

  // All modules have a free tier, so they're always available if the org exists
  // A module is considered "available" if the subscription exists
  return {
    isAvailable: module !== undefined,
    isPaid: module?.isPaid || false,
    isLoading: false,
  }
}

// ===========================================
// MULTIPLE MODULE ACCESS HOOK
// ===========================================

/**
 * Check access across multiple modules
 * Useful for features that span several modules
 */
export function useMultiModuleAccess(
  organizationId: string | undefined,
  moduleIds: ModuleId[]
): {
  isAllowed: boolean
  isLoading: boolean
  modules: ModuleAccessInfo[]
  unavailableModules: ModuleId[]
} {
  const { modules, isLoading } = useModuleSubscriptions(organizationId)

  if (isLoading || !organizationId) {
    return {
      isAllowed: false,
      isLoading: true,
      modules: moduleIds.map(id => ({
        moduleId: id,
        isAvailable: false,
        isPaid: false,
        name: MODULE_NAMES[id],
      })),
      unavailableModules: [],
    }
  }

  const moduleAccessInfo: ModuleAccessInfo[] = moduleIds.map(moduleId => {
    const module = modules.find(m => m.moduleId === moduleId)
    return {
      moduleId,
      isAvailable: module !== undefined,
      isPaid: module?.isPaid || false,
      name: MODULE_NAMES[moduleId],
    }
  })

  const unavailableModules = moduleAccessInfo
    .filter(m => !m.isAvailable)
    .map(m => m.moduleId)

  return {
    isAllowed: unavailableModules.length === 0,
    isLoading: false,
    modules: moduleAccessInfo,
    unavailableModules,
  }
}

// ===========================================
// CROSS-MODULE ENTITY TYPES
// ===========================================

/**
 * Entity types that can be referenced across modules
 */
export type CrossModuleEntityType =
  // CRM entities
  | 'contact'
  | 'company'
  | 'deal'
  // Invoice entities
  | 'invoice'
  | 'quote'
  | 'client'
  // Projects entities
  | 'project'
  | 'task'
  // Tickets entities
  | 'ticket'
  // HR entities
  | 'employee'
  // Docs entities
  | 'file'
  | 'folder'

/**
 * Map entity types to their module
 */
const ENTITY_TO_MODULE: Record<CrossModuleEntityType, ModuleId> = {
  contact: 'crm',
  company: 'crm',
  deal: 'crm',
  invoice: 'invoice',
  quote: 'invoice',
  client: 'invoice',
  project: 'projects',
  task: 'projects',
  ticket: 'tickets',
  employee: 'hr',
  file: 'docs',
  folder: 'docs',
}

/**
 * Entity type display names (French)
 */
const ENTITY_TYPE_NAMES: Record<CrossModuleEntityType, string> = {
  contact: 'Contact',
  company: 'Entreprise',
  deal: 'Opportunité',
  invoice: 'Facture',
  quote: 'Devis',
  client: 'Client',
  project: 'Projet',
  task: 'Tâche',
  ticket: 'Ticket',
  employee: 'Employé',
  file: 'Fichier',
  folder: 'Dossier',
}

export interface CrossModuleEntityResult<T = unknown> {
  /** The entity data (if accessible and found) */
  data: T | null
  /** Whether the entity is accessible (module available) */
  isAccessible: boolean
  /** Whether the entity exists */
  exists: boolean
  /** Module information */
  module: {
    moduleId: ModuleId
    moduleName: string
    isAvailable: boolean
    isPaid: boolean
  }
  /** Entity type information */
  entityType: {
    type: CrossModuleEntityType
    displayName: string
  }
  /** Loading state */
  isLoading: boolean
  /** Error if any */
  error: Error | null
}

/**
 * Get module ID from entity type
 */
export function getModuleFromEntityType(entityType: CrossModuleEntityType): ModuleId {
  return ENTITY_TO_MODULE[entityType]
}

/**
 * Get entity type display name
 */
export function getEntityTypeName(entityType: CrossModuleEntityType): string {
  return ENTITY_TYPE_NAMES[entityType]
}

// ===========================================
// CROSS-MODULE ENTITY RESOLUTION HOOK
// ===========================================

/**
 * Combine entity data with module availability information
 * The consumer should fetch the entity data themselves and pass it here
 *
 * @example
 * // In a ticket, combine the linked CRM contact with module info
 * const { data: contact, isLoading } = useContactById(ticket.contactId)
 * const result = useCrossModuleEntity(
 *   orgId,
 *   'contact',
 *   contact,
 *   isLoading
 * )
 */
export function useCrossModuleEntity<T>(
  organizationId: string | undefined,
  entityType: CrossModuleEntityType,
  entityData: T | null | undefined,
  entityLoading: boolean = false,
  entityError: Error | null = null
): CrossModuleEntityResult<T> {
  const moduleId = ENTITY_TO_MODULE[entityType]
  const { modules, isLoading: modulesLoading } = useModuleSubscriptions(organizationId)

  const module = modules.find(m => m.moduleId === moduleId)
  const isModuleAvailable = module !== undefined
  const isModulePaid = module?.isPaid || false

  const isLoading = modulesLoading || entityLoading

  return {
    data: entityData ?? null,
    isAccessible: isModuleAvailable,
    exists: entityData !== null && entityData !== undefined,
    module: {
      moduleId,
      moduleName: MODULE_NAMES[moduleId],
      isAvailable: isModuleAvailable,
      isPaid: isModulePaid,
    },
    entityType: {
      type: entityType,
      displayName: ENTITY_TYPE_NAMES[entityType],
    },
    isLoading,
    error: entityError,
  }
}

// ===========================================
// CROSS-MODULE ENTITY INFO (Without Fetching)
// ===========================================

/**
 * Get module info for an entity type without fetching the entity
 * Useful for displaying link state before navigation
 */
export function useCrossModuleEntityInfo(
  organizationId: string | undefined,
  entityType: CrossModuleEntityType
): {
  moduleId: ModuleId
  moduleName: string
  entityTypeName: string
  isModuleAvailable: boolean
  isModulePaid: boolean
  isLoading: boolean
} {
  const moduleId = ENTITY_TO_MODULE[entityType]
  const { modules, isLoading } = useModuleSubscriptions(organizationId)

  const module = modules.find(m => m.moduleId === moduleId)

  return {
    moduleId,
    moduleName: MODULE_NAMES[moduleId],
    entityTypeName: ENTITY_TYPE_NAMES[entityType],
    isModuleAvailable: module !== undefined,
    isModulePaid: module?.isPaid || false,
    isLoading,
  }
}
