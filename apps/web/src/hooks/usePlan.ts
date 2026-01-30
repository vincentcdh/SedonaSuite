// ===========================================
// USE PLAN HOOK
// ===========================================
// Hook to check subscription plan and feature access

import { useOrganization } from '@/lib/auth'

export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE'

export interface PlanInfo {
  plan: PlanType
  isPro: boolean
  isEnterprise: boolean
  isFree: boolean
  hasAccess: (requiredPlan: PlanType) => boolean
}

/**
 * Hook to get current organization's plan info
 * and check feature access based on plan level
 */
export function usePlan(): PlanInfo {
  const { organization } = useOrganization()

  const plan = (organization?.subscriptionPlan || 'FREE') as PlanType

  const isFree = plan === 'FREE'
  const isPro = plan === 'PRO' || plan === 'ENTERPRISE'
  const isEnterprise = plan === 'ENTERPRISE'

  /**
   * Check if current plan has access to a feature
   * Plan hierarchy: FREE < PRO < ENTERPRISE
   */
  const hasAccess = (requiredPlan: PlanType): boolean => {
    if (requiredPlan === 'FREE') return true
    if (requiredPlan === 'PRO') return isPro || isEnterprise
    if (requiredPlan === 'ENTERPRISE') return isEnterprise
    return false
  }

  return {
    plan,
    isPro,
    isEnterprise,
    isFree,
    hasAccess,
  }
}
