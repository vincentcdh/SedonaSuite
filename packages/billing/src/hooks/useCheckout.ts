import { useState, useCallback } from 'react'
import type { PlanId, BillingInterval } from '../server/plans'

// ===========================================
// CHECKOUT HOOK
// ===========================================

export interface UseCheckoutResult {
  startCheckout: (planId: PlanId, interval: BillingInterval) => Promise<void>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to start a checkout session
 */
export function useCheckout(organizationId: string | null): UseCheckoutResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const startCheckout = useCallback(
    async (planId: PlanId, interval: BillingInterval) => {
      if (!organizationId) {
        setError(new Error('Organization ID is required'))
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId,
            planId,
            interval,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create checkout session')
        }

        const data = await response.json()

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to start checkout'))
      } finally {
        setIsLoading(false)
      }
    },
    [organizationId]
  )

  return {
    startCheckout,
    isLoading,
    error,
  }
}
