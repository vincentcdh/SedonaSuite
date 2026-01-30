import { useState, useCallback } from 'react'

// ===========================================
// BILLING PORTAL HOOK
// ===========================================

export interface UseBillingPortalResult {
  openPortal: () => Promise<void>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to open the Stripe Customer Portal
 */
export function useBillingPortal(organizationId: string | null): UseBillingPortalResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const openPortal = useCallback(async () => {
    if (!organizationId) {
      setError(new Error('Organization ID is required'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const data = await response.json()

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to open billing portal'))
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  return {
    openPortal,
    isLoading,
    error,
  }
}
