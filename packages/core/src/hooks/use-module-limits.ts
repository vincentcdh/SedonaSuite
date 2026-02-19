// ===========================================
// MODULE LIMITS HOOKS
// ===========================================
// Hooks to check module subscription status and limits
// Works with the modular subscription system from @sedona/billing

import { useMemo, useCallback, useState } from 'react'

// ===========================================
// TYPES
// ===========================================

export type ModuleId = 'crm' | 'invoice' | 'projects' | 'tickets' | 'hr' | 'docs' | 'analytics'

export interface ModuleLimitInfo {
  /** Maximum allowed value for this limit */
  limit: number
  /** Current usage */
  used: number
  /** Remaining capacity */
  remaining: number
  /** Whether this limit is unlimited (-1) */
  isUnlimited: boolean
  /** Usage percentage (0-100) */
  percentage: number
}

export interface UseIsModulePaidResult {
  /** Whether the module has a paid subscription */
  isPaid: boolean
  /** Loading state */
  isLoading: boolean
}

export interface UseModuleLimitsResult {
  /** All limits for this module with usage info */
  limits: Record<string, ModuleLimitInfo>
  /** Loading state */
  isLoading: boolean
  /** Refetch limits */
  refetch: () => Promise<void>
}

export interface UseCanPerformModuleActionResult {
  /** Whether the action is allowed */
  allowed: boolean
  /** Remaining capacity for this limit */
  remaining: number
  /** Maximum limit value */
  limit: number
  /** Whether the module is paid */
  isPaid: boolean
  /** Loading state */
  isLoading: boolean
  /** Human-readable reason if not allowed */
  reason?: string
}

// ===========================================
// MODULE INFO CACHE
// ===========================================

// Simple in-memory cache for module subscriptions
// In production, this would be managed by TanStack Query
const moduleCache = new Map<string, {
  data: ModuleSubscriptionData
  timestamp: number
}>()

const CACHE_TTL = 30000 // 30 seconds

interface ModuleSubscriptionData {
  moduleId: ModuleId
  isPaid: boolean
  status: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing'
  limits: Record<string, number>
  usage: Record<string, number>
}

async function fetchModuleSubscription(
  organizationId: string,
  moduleId: ModuleId
): Promise<ModuleSubscriptionData | null> {
  const cacheKey = `${organizationId}:${moduleId}`
  const cached = moduleCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    const response = await fetch(
      `/api/billing/modules/${moduleId}?organizationId=${organizationId}`
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    moduleCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })

    return data
  } catch {
    return null
  }
}

// Clear cache for a specific org/module
export function invalidateModuleCache(organizationId: string, moduleId?: ModuleId): void {
  if (moduleId) {
    moduleCache.delete(`${organizationId}:${moduleId}`)
  } else {
    // Clear all cache for this org
    for (const key of moduleCache.keys()) {
      if (key.startsWith(`${organizationId}:`)) {
        moduleCache.delete(key)
      }
    }
  }
}

// ===========================================
// useIsModulePaid
// ===========================================

/**
 * Hook to check if a module has a paid subscription
 *
 * @example
 * ```tsx
 * const { isPaid, isLoading } = useIsModulePaid('crm')
 *
 * if (isPaid) {
 *   // Show paid features
 * }
 * ```
 */
export function useIsModulePaid(
  organizationId: string | undefined,
  moduleId: ModuleId
): UseIsModulePaidResult {
  const [isPaid, setIsPaid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useMemo(() => {
    if (!organizationId) {
      setIsPaid(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    fetchModuleSubscription(organizationId, moduleId)
      .then((data) => {
        setIsPaid(data?.isPaid || false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [organizationId, moduleId])

  return { isPaid, isLoading }
}

// ===========================================
// useModuleLimits
// ===========================================

/**
 * Hook to get all limits and usage for a module
 *
 * @example
 * ```tsx
 * const { limits, isLoading } = useModuleLimits('crm')
 *
 * const contactsLimit = limits.max_contacts
 * if (contactsLimit && !contactsLimit.isUnlimited) {
 *   console.log(`${contactsLimit.remaining} contacts remaining`)
 * }
 * ```
 */
export function useModuleLimits(
  organizationId: string | undefined,
  moduleId: ModuleId
): UseModuleLimitsResult {
  const [limits, setLimits] = useState<Record<string, ModuleLimitInfo>>({})
  const [isLoading, setIsLoading] = useState(true)

  const buildLimits = useCallback((data: ModuleSubscriptionData | null): Record<string, ModuleLimitInfo> => {
    if (!data) return {}

    const result: Record<string, ModuleLimitInfo> = {}

    for (const [key, limitValue] of Object.entries(data.limits)) {
      const used = data.usage[key] || 0
      const isUnlimited = limitValue === -1
      const remaining = isUnlimited ? Infinity : Math.max(0, limitValue - used)
      const percentage = isUnlimited ? 0 : Math.min(100, (used / limitValue) * 100)

      result[key] = {
        limit: limitValue,
        used,
        remaining,
        isUnlimited,
        percentage,
      }
    }

    return result
  }, [])

  const refetch = useCallback(async () => {
    if (!organizationId) return

    invalidateModuleCache(organizationId, moduleId)
    setIsLoading(true)

    const data = await fetchModuleSubscription(organizationId, moduleId)
    setLimits(buildLimits(data))
    setIsLoading(false)
  }, [organizationId, moduleId, buildLimits])

  useMemo(() => {
    if (!organizationId) {
      setLimits({})
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    fetchModuleSubscription(organizationId, moduleId)
      .then((data) => {
        setLimits(buildLimits(data))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [organizationId, moduleId, buildLimits])

  return { limits, isLoading, refetch }
}

// ===========================================
// useCanPerformModuleAction
// ===========================================

/**
 * Hook to check if an action is allowed based on module limits
 *
 * @example
 * ```tsx
 * const { allowed, remaining, reason } = useCanPerformModuleAction(
 *   'crm',
 *   'max_contacts'
 * )
 *
 * if (!allowed) {
 *   showUpgradeModal(reason)
 * }
 * ```
 */
export function useCanPerformModuleAction(
  organizationId: string | undefined,
  moduleId: ModuleId,
  limitKey: string
): UseCanPerformModuleActionResult {
  const [result, setResult] = useState<UseCanPerformModuleActionResult>({
    allowed: false,
    remaining: 0,
    limit: 0,
    isPaid: false,
    isLoading: true,
  })

  useMemo(() => {
    if (!organizationId) {
      setResult({
        allowed: false,
        remaining: 0,
        limit: 0,
        isPaid: false,
        isLoading: false,
        reason: 'Organisation non definie',
      })
      return
    }

    setResult(prev => ({ ...prev, isLoading: true }))

    fetchModuleSubscription(organizationId, moduleId)
      .then((data) => {
        if (!data) {
          setResult({
            allowed: false,
            remaining: 0,
            limit: 0,
            isPaid: false,
            isLoading: false,
            reason: 'Module non trouve',
          })
          return
        }

        const limit = data.limits[limitKey] ?? -1
        const used = data.usage[limitKey] ?? 0
        const isUnlimited = limit === -1
        const remaining = isUnlimited ? Infinity : Math.max(0, limit - used)
        const allowed = isUnlimited || used < limit

        setResult({
          allowed,
          remaining: isUnlimited ? Infinity : remaining,
          limit,
          isPaid: data.isPaid,
          isLoading: false,
          reason: allowed
            ? undefined
            : `Limite atteinte (${used}/${limit}). Passez a la version payante pour debloquer.`,
        })
      })
      .catch(() => {
        setResult({
          allowed: false,
          remaining: 0,
          limit: 0,
          isPaid: false,
          isLoading: false,
          reason: 'Erreur lors de la verification',
        })
      })
  }, [organizationId, moduleId, limitKey])

  return result
}

// ===========================================
// useIncrementModuleUsage
// ===========================================

interface UseIncrementModuleUsageResult {
  increment: () => Promise<boolean>
  decrement: () => Promise<boolean>
  isLoading: boolean
}

/**
 * Hook to increment/decrement module usage counters
 * Call increment after creating an entity, decrement after deleting
 *
 * @example
 * ```tsx
 * const { increment, decrement } = useIncrementModuleUsage(orgId, 'crm', 'max_contacts')
 *
 * const handleCreate = async () => {
 *   await createContact(data)
 *   await increment()
 * }
 * ```
 */
export function useIncrementModuleUsage(
  organizationId: string | undefined,
  moduleId: ModuleId,
  limitKey: string
): UseIncrementModuleUsageResult {
  const [isLoading, setIsLoading] = useState(false)

  const increment = useCallback(async (): Promise<boolean> => {
    if (!organizationId) return false

    setIsLoading(true)
    try {
      const response = await fetch('/api/billing/modules/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          moduleId,
          limitKey,
          action: 'increment',
        }),
      })

      if (response.ok) {
        invalidateModuleCache(organizationId, moduleId)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [organizationId, moduleId, limitKey])

  const decrement = useCallback(async (): Promise<boolean> => {
    if (!organizationId) return false

    setIsLoading(true)
    try {
      const response = await fetch('/api/billing/modules/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          moduleId,
          limitKey,
          action: 'decrement',
        }),
      })

      if (response.ok) {
        invalidateModuleCache(organizationId, moduleId)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [organizationId, moduleId, limitKey])

  return { increment, decrement, isLoading }
}
