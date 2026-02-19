// ===========================================
// USE MODULE ACCESS HOOK
// ===========================================
// Hooks to check module subscription status and limits
// Wraps @sedona/billing hooks with organization context

import { useOrganization } from '@/lib/auth'
import {
  useModuleSubscriptions,
  useModuleSubscription,
  useSubscribeToModule,
  type ModuleId,
  type ModuleBillingCycle,
} from '@sedona/billing'

// Re-export types
export type { ModuleId } from '@sedona/billing'

// ===========================================
// useModuleAccess
// ===========================================

export interface UseModuleAccessResult {
  /** Whether the module has a paid subscription */
  isPaid: boolean
  /** Whether the module subscription is loading */
  isLoading: boolean
  /** The module's current status */
  status: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing' | null
  /** Current usage for all limit keys */
  usage: Record<string, number>
  /** Current limits for all limit keys */
  limits: Record<string, number>
  /** Check if a specific limit is reached */
  isLimitReached: (limitKey: string) => boolean
  /** Check remaining capacity for a limit */
  getRemaining: (limitKey: string) => number
  /** Check if a limit is unlimited */
  isUnlimited: (limitKey: string) => boolean
  /** Get usage percentage for a limit */
  getPercentage: (limitKey: string) => number
}

/**
 * Hook to check module access for the current organization
 *
 * @example
 * ```tsx
 * const { isPaid, isLimitReached, getRemaining } = useModuleAccess('crm')
 *
 * if (!isPaid) {
 *   return <UpgradePrompt />
 * }
 *
 * if (isLimitReached('max_contacts')) {
 *   return <LimitReachedMessage />
 * }
 * ```
 */
export function useModuleAccess(moduleId: ModuleId): UseModuleAccessResult {
  const { organization } = useOrganization()
  const { subscription, isLoading } = useModuleSubscription(organization?.id, moduleId)

  const usage = subscription?.usage || {}
  const limits = subscription?.limits || {}

  const isLimitReached = (limitKey: string): boolean => {
    const limit = limits[limitKey]
    const used = usage[limitKey] || 0
    if (limit === undefined || limit === -1) return false
    return used >= limit
  }

  const getRemaining = (limitKey: string): number => {
    const limit = limits[limitKey]
    const used = usage[limitKey] || 0
    if (limit === undefined || limit === -1) return Infinity
    return Math.max(0, limit - used)
  }

  const isUnlimited = (limitKey: string): boolean => {
    const limit = limits[limitKey]
    return limit === undefined || limit === -1
  }

  const getPercentage = (limitKey: string): number => {
    const limit = limits[limitKey]
    const used = usage[limitKey] || 0
    if (limit === undefined || limit === -1 || limit === 0) return 0
    return Math.min(100, (used / limit) * 100)
  }

  return {
    isPaid: subscription?.isPaid || false,
    isLoading,
    status: subscription?.status || null,
    usage,
    limits,
    isLimitReached,
    getRemaining,
    isUnlimited,
    getPercentage,
  }
}

// ===========================================
// useAllModulesAccess
// ===========================================

export interface ModuleAccessInfo {
  moduleId: ModuleId
  name: string
  isPaid: boolean
  status: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing'
  priceMonthly: number
  priceYearly: number
}

export interface UseAllModulesAccessResult {
  modules: ModuleAccessInfo[]
  isLoading: boolean
  refetch: () => Promise<void>
}

/**
 * Hook to get access info for all modules
 */
export function useAllModulesAccess(): UseAllModulesAccessResult {
  const { organization } = useOrganization()
  const { modules, isLoading, refetch } = useModuleSubscriptions(organization?.id)

  return {
    modules: modules.map((m): ModuleAccessInfo => ({
      moduleId: m.moduleId,
      name: m.name,
      isPaid: m.isPaid,
      status: m.status,
      priceMonthly: m.priceMonthly,
      priceYearly: m.priceYearly,
    })),
    isLoading,
    refetch,
  }
}

// ===========================================
// useUpgradeModule
// ===========================================

export interface UseUpgradeModuleResult {
  upgrade: (moduleId: ModuleId, billingCycle?: ModuleBillingCycle) => Promise<void>
  isLoading: boolean
}

/**
 * Hook to trigger module upgrade checkout
 */
export function useUpgradeModule(): UseUpgradeModuleResult {
  const { organization } = useOrganization()
  const { subscribe, isLoading } = useSubscribeToModule()

  const upgrade = async (moduleId: ModuleId, billingCycle: ModuleBillingCycle = 'monthly') => {
    if (!organization?.id) {
      throw new Error('Organization not found')
    }

    await subscribe({
      organizationId: organization.id,
      moduleId,
      billingCycle,
    })
  }

  return { upgrade, isLoading }
}
