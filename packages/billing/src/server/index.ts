// Stripe client
export { getStripe, initStripe } from './stripe'

// Plans configuration
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
} from './plans'

// Checkout & Portal
export {
  createCheckoutSession,
  createPortalSession,
  createCustomer,
  getCustomer,
  updateCustomer,
  getActiveSubscription,
  cancelSubscription,
  resumeSubscription,
  changeSubscriptionPlan,
  type CreateCheckoutSessionOptions,
  type CreatePortalSessionOptions,
  type CreateCustomerOptions,
} from './checkout'

// Webhooks
export {
  constructWebhookEvent,
  handleWebhook,
  mapSubscriptionStatus,
  extractPlanId,
  getSubscriptionPeriod,
  type WebhookHandlers,
  type WebhookHandlerContext,
  type WebhookHandler,
} from './webhooks'
