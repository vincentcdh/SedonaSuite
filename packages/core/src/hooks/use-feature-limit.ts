import { useMemo } from 'react'

import { type ModuleName, type Plan, PLAN_LIMITS, isUnlimited } from '@/constants/limits'

interface FeatureLimitResult {
  /** The maximum allowed value */
  limit: number
  /** Current usage count */
  current: number
  /** Remaining usage before limit */
  remaining: number
  /** Usage percentage (0-100) */
  percentage: number
  /** Whether the limit has been reached */
  isAtLimit: boolean
  /** Whether usage is above 80% */
  isNearLimit: boolean
  /** Whether this feature should be blurred */
  isBlurred: boolean
  /** Whether this feature is enabled for the plan */
  isEnabled: boolean
  /** Whether the user can perform the action */
  canPerformAction: boolean
  /** Whether to show an upgrade prompt */
  showUpgradePrompt: boolean
  /** Whether the limit is unlimited (-1) */
  isUnlimited: boolean
}

interface UseFeatureLimitOptions {
  plan: Plan
  module: ModuleName
  feature: string
  currentUsage: number
}

/**
 * Hook to check feature limits based on the user's plan
 *
 * @example
 * ```tsx
 * const { canPerformAction, remaining, percentage } = useFeatureLimit({
 *   plan: 'FREE',
 *   module: 'crm',
 *   feature: 'contacts',
 *   currentUsage: 87,
 * })
 *
 * if (!canPerformAction) {
 *   showUpgradeModal()
 * }
 * ```
 */
export function useFeatureLimit({
  plan,
  module,
  feature,
  currentUsage,
}: UseFeatureLimitOptions): FeatureLimitResult {
  return useMemo(() => {
    const moduleConfig = PLAN_LIMITS[plan][module] as Record<string, unknown>
    const featureValue = moduleConfig[feature]

    // Handle boolean features (enabled/disabled)
    if (typeof featureValue === 'boolean') {
      return {
        limit: featureValue ? -1 : 0,
        current: currentUsage,
        remaining: featureValue ? -1 : 0,
        percentage: 0,
        isAtLimit: !featureValue,
        isNearLimit: false,
        isBlurred: false,
        isEnabled: featureValue,
        canPerformAction: featureValue,
        showUpgradePrompt: !featureValue,
        isUnlimited: featureValue,
      }
    }

    // Handle numeric limits
    if (typeof featureValue === 'number') {
      const limit = featureValue
      const unlimited = isUnlimited(limit)
      const remaining = unlimited ? -1 : Math.max(0, limit - currentUsage)
      const percentage = unlimited ? 0 : Math.min(100, (currentUsage / limit) * 100)
      const isAtLimit = !unlimited && currentUsage >= limit
      const isNearLimit = !unlimited && percentage >= 80

      return {
        limit,
        current: currentUsage,
        remaining,
        percentage,
        isAtLimit,
        isNearLimit,
        isBlurred: false,
        isEnabled: true,
        canPerformAction: unlimited || currentUsage < limit,
        showUpgradePrompt: isAtLimit || isNearLimit,
        isUnlimited: unlimited,
      }
    }

    // Handle blurred features
    if (feature.endsWith('Blurred') && typeof featureValue === 'boolean') {
      return {
        limit: -1,
        current: 0,
        remaining: -1,
        percentage: 0,
        isAtLimit: false,
        isNearLimit: false,
        isBlurred: featureValue,
        isEnabled: true,
        canPerformAction: true,
        showUpgradePrompt: featureValue,
        isUnlimited: true,
      }
    }

    // Default case
    return {
      limit: -1,
      current: currentUsage,
      remaining: -1,
      percentage: 0,
      isAtLimit: false,
      isNearLimit: false,
      isBlurred: false,
      isEnabled: true,
      canPerformAction: true,
      showUpgradePrompt: false,
      isUnlimited: true,
    }
  }, [plan, module, feature, currentUsage])
}
