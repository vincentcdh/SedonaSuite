import { useState, useEffect, useCallback } from 'react'
import type { PlanId } from '../server/plans'

// ===========================================
// SUBSCRIPTION TYPES
// ===========================================

export interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  planId: PlanId
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export interface UseSubscriptionResult {
  subscription: Subscription | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// ===========================================
// SUBSCRIPTION HOOK
// ===========================================

/**
 * Hook to get the current subscription status
 * This should be connected to your API to fetch real data
 */
export function useSubscription(organizationId: string | null): UseSubscriptionResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSubscription = useCallback(async () => {
    if (!organizationId) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/billing/subscription?organizationId=${organizationId}`)
      // const data = await response.json()
      // setSubscription(data.subscription)

      // For now, return a mock FREE subscription
      setSubscription({
        id: 'sub_mock',
        status: 'active',
        planId: 'FREE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'))
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return {
    subscription,
    isLoading,
    error,
    refetch: fetchSubscription,
  }
}

/**
 * Hook to check if subscription is active
 */
export function useIsSubscriptionActive(organizationId: string | null): boolean {
  const { subscription, isLoading } = useSubscription(organizationId)

  if (isLoading || !subscription) return false

  return subscription.status === 'active' || subscription.status === 'trialing'
}

/**
 * Hook to get current plan ID
 */
export function useCurrentPlan(organizationId: string | null): PlanId {
  const { subscription } = useSubscription(organizationId)
  return subscription?.planId || 'FREE'
}
