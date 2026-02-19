// ===========================================
// MODULE SUBSCRIPTION HOOKS
// ===========================================
// React hooks for managing per-module subscriptions

import { useState, useEffect, useCallback } from 'react'

// ===========================================
// TYPES
// ===========================================

export type ModuleId = 'crm' | 'invoice' | 'projects' | 'tickets' | 'hr' | 'docs' | 'analytics'
export type ModuleBillingCycle = 'monthly' | 'yearly'
export type ModuleStatus = 'free' | 'active' | 'past_due' | 'canceled' | 'trialing'

export interface ModuleSubscription {
  id: string
  moduleId: ModuleId
  name: string
  description: string
  icon: string
  color: string
  status: ModuleStatus
  isPaid: boolean
  billingCycle: ModuleBillingCycle | null
  priceMonthly: number  // in cents
  priceYearly: number   // in cents
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  trialEnd: Date | null
  limits: Record<string, number>
  usage: Record<string, number>
}

export interface ModuleSubscriptionsState {
  modules: ModuleSubscription[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export interface UseModuleSubscriptionState {
  subscription: ModuleSubscription | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// ===========================================
// useModuleSubscriptions
// ===========================================

/**
 * Hook to fetch all module subscriptions for an organization
 */
export function useModuleSubscriptions(organizationId: string | undefined): ModuleSubscriptionsState {
  const [modules, setModules] = useState<ModuleSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchModules = useCallback(async () => {
    if (!organizationId) {
      setModules([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/billing/modules?organizationId=${organizationId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch module subscriptions')
      }

      const data = await response.json()
      setModules(data.modules || [])
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching module subscriptions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  return {
    modules,
    isLoading,
    error,
    refetch: fetchModules,
  }
}

// ===========================================
// useModuleSubscription
// ===========================================

/**
 * Hook to fetch a single module subscription
 */
export function useModuleSubscription(
  organizationId: string | undefined,
  moduleId: ModuleId
): UseModuleSubscriptionState {
  const { modules, isLoading, error, refetch } = useModuleSubscriptions(organizationId)

  const subscription = modules.find(m => m.moduleId === moduleId) || null

  return {
    subscription,
    isLoading,
    error,
    refetch,
  }
}

// ===========================================
// useSubscribeToModule
// ===========================================

export interface SubscribeToModuleOptions {
  organizationId: string
  moduleId: ModuleId
  billingCycle: ModuleBillingCycle
}

export interface UseSubscribeToModuleState {
  subscribe: (options: SubscribeToModuleOptions) => Promise<void>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to initiate a subscription checkout for a module
 */
export function useSubscribeToModule(): UseSubscribeToModuleState {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const subscribe = useCallback(async (options: SubscribeToModuleOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/modules/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: options.organizationId,
          moduleId: options.moduleId,
          billingCycle: options.billingCycle,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    subscribe,
    isLoading,
    error,
  }
}

// ===========================================
// useCancelModule
// ===========================================

export interface CancelModuleOptions {
  organizationId: string
  moduleId: ModuleId
}

export interface UseCancelModuleState {
  cancel: (options: CancelModuleOptions) => Promise<{ success: boolean }>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to cancel a module subscription (at period end)
 */
export function useCancelModule(): UseCancelModuleState {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const cancel = useCallback(async (options: CancelModuleOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/modules/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: options.organizationId,
          moduleId: options.moduleId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      return { success: true }
    } catch (err) {
      setError(err as Error)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    cancel,
    isLoading,
    error,
  }
}

// ===========================================
// useResumeModule
// ===========================================

export interface ResumeModuleOptions {
  organizationId: string
  moduleId: ModuleId
}

export interface UseResumeModuleState {
  resume: (options: ResumeModuleOptions) => Promise<{ success: boolean }>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to resume a cancelled module subscription
 */
export function useResumeModule(): UseResumeModuleState {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const resume = useCallback(async (options: ResumeModuleOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/modules/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: options.organizationId,
          moduleId: options.moduleId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to resume subscription')
      }

      return { success: true }
    } catch (err) {
      setError(err as Error)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    resume,
    isLoading,
    error,
  }
}

// ===========================================
// useSwitchModuleBillingCycle
// ===========================================

export interface SwitchBillingCycleOptions {
  organizationId: string
  moduleId: ModuleId
  newCycle: ModuleBillingCycle
}

export interface UseSwitchBillingCycleState {
  switchCycle: (options: SwitchBillingCycleOptions) => Promise<{ success: boolean }>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to switch billing cycle for a module (monthly <-> yearly)
 */
export function useSwitchModuleBillingCycle(): UseSwitchBillingCycleState {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const switchCycle = useCallback(async (options: SwitchBillingCycleOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/modules/switch-cycle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: options.organizationId,
          moduleId: options.moduleId,
          newCycle: options.newCycle,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to switch billing cycle')
      }

      return { success: true }
    } catch (err) {
      setError(err as Error)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    switchCycle,
    isLoading,
    error,
  }
}

// ===========================================
// useModuleBillingPortal
// ===========================================

export interface UseModuleBillingPortalState {
  openPortal: (organizationId: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to open Stripe Customer Portal (shows all module subscriptions)
 */
export function useModuleBillingPortal(): UseModuleBillingPortalState {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const openPortal = useCallback(async (organizationId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/modules/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create portal session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Portal
      window.location.href = url
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    openPortal,
    isLoading,
    error,
  }
}

// ===========================================
// useCheckModuleDowngrade
// ===========================================

export interface DowngradeCheck {
  canDowngrade: boolean
  exceedingLimits: Array<{
    key: string
    current: number
    freeLimit: number
    description: string
  }>
  warningMessage: string | null
}

export interface UseCheckModuleDowngradeState {
  check: (organizationId: string, moduleId: ModuleId) => Promise<DowngradeCheck>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to check if a module can be safely downgraded to free tier
 */
export function useCheckModuleDowngrade(): UseCheckModuleDowngradeState {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const check = useCallback(async (organizationId: string, moduleId: ModuleId): Promise<DowngradeCheck> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/billing/modules/check-downgrade?organizationId=${organizationId}&moduleId=${moduleId}`
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to check downgrade')
      }

      return await response.json()
    } catch (err) {
      setError(err as Error)
      return {
        canDowngrade: false,
        exceedingLimits: [],
        warningMessage: 'Erreur lors de la verification',
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    check,
    isLoading,
    error,
  }
}

// ===========================================
// HELPER HOOKS
// ===========================================

/**
 * Check if a specific module is in paid status
 */
export function useIsModulePaid(
  organizationId: string | undefined,
  moduleId: ModuleId
): { isPaid: boolean; isLoading: boolean } {
  const { subscription, isLoading } = useModuleSubscription(organizationId, moduleId)

  return {
    isPaid: subscription?.isPaid || false,
    isLoading,
  }
}

/**
 * Get the limit for a specific module feature
 */
export function useModuleLimit(
  organizationId: string | undefined,
  moduleId: ModuleId,
  limitKey: string
): { limit: number; usage: number; isLoading: boolean; remaining: number; isUnlimited: boolean } {
  const { subscription, isLoading } = useModuleSubscription(organizationId, moduleId)

  const limit = subscription?.limits[limitKey] ?? 0
  const usage = subscription?.usage[limitKey] ?? 0
  const isUnlimited = limit === -1

  return {
    limit,
    usage,
    isLoading,
    remaining: isUnlimited ? Infinity : Math.max(0, limit - usage),
    isUnlimited,
  }
}

/**
 * Check if an action is allowed based on module limits
 */
export function useCanPerformAction(
  organizationId: string | undefined,
  moduleId: ModuleId,
  limitKey: string
): { canPerform: boolean; isLoading: boolean; reason?: string } {
  const { limit, usage, isLoading, isUnlimited } = useModuleLimit(organizationId, moduleId, limitKey)

  if (isLoading) {
    return { canPerform: false, isLoading: true }
  }

  if (isUnlimited) {
    return { canPerform: true, isLoading: false }
  }

  if (usage >= limit) {
    return {
      canPerform: false,
      isLoading: false,
      reason: `Limite atteinte (${usage}/${limit}). Passez au plan payant pour debloquer.`,
    }
  }

  return { canPerform: true, isLoading: false }
}
