// ===========================================
// @sedona/billing - Billing & Subscription Package
// ===========================================

// Re-export server utilities (for API routes)
export {
  PLANS,
  getPlan,
  getPriceId,
  formatPrice,
  isFeatureAvailable,
  getFeatureLimit,
  type PlanId,
  type BillingInterval,
  type Plan,
  type PlanFeature,
} from './server/plans'

// Re-export hooks
export {
  useSubscription,
  useIsSubscriptionActive,
  useCurrentPlan,
  useCheckout,
  useBillingPortal,
  type Subscription,
  type UseSubscriptionResult,
  type UseCheckoutResult,
  type UseBillingPortalResult,
} from './hooks'

// Re-export components
export {
  PricingTable,
  UpgradeModal,
  CurrentPlanBadge,
  BillingSettings,
  type PricingTableProps,
  type UpgradeModalProps,
  type CurrentPlanBadgeProps,
  type BillingSettingsProps,
} from './components'
