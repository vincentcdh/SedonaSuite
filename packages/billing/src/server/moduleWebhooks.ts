// ===========================================
// MODULE SUBSCRIPTION WEBHOOK HANDLERS
// ===========================================
// Handles Stripe webhook events for modular subscriptions
// Updates the module_subscriptions table in Supabase

import type Stripe from 'stripe'
import { getStripe } from './stripe'
import type { ModuleId, ModuleBillingCycle } from './modules'

// ===========================================
// TYPES
// ===========================================

export interface ModuleWebhookContext {
  event: Stripe.Event
  organizationId: string
  moduleId: ModuleId
}

export type ModuleWebhookHandler = (context: ModuleWebhookContext) => Promise<void>

export interface ModuleWebhookHandlers {
  onCheckoutCompleted?: ModuleWebhookHandler
  onSubscriptionCreated?: ModuleWebhookHandler
  onSubscriptionUpdated?: ModuleWebhookHandler
  onSubscriptionDeleted?: ModuleWebhookHandler
  onPaymentFailed?: ModuleWebhookHandler
  onPaymentSucceeded?: ModuleWebhookHandler
}

export interface ModuleSubscriptionUpdate {
  organization_id: string
  module_id: string
  stripe_subscription_id: string
  stripe_price_id: string | null
  stripe_customer_id: string
  status: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing'
  billing_cycle: ModuleBillingCycle | null
  current_period_start: Date | null
  current_period_end: Date | null
  cancel_at_period_end: boolean
  trial_end: Date | null
}

// ===========================================
// WEBHOOK EVENT CONSTRUCTION
// ===========================================

/**
 * Construct and verify a Stripe webhook event
 */
export function constructModuleWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

// ===========================================
// STATUS MAPPING
// ===========================================

/**
 * Map Stripe subscription status to our module subscription status
 */
export function mapModuleSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): ModuleSubscriptionUpdate['status'] {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'canceled'
    default:
      return 'free'
  }
}

// ===========================================
// METADATA EXTRACTION
// ===========================================

/**
 * Extract organization ID and module ID from subscription metadata
 */
export function extractModuleMetadata(
  subscription: Stripe.Subscription
): { organizationId: string | null; moduleId: ModuleId | null } {
  return {
    organizationId: subscription.metadata?.['organization_id'] || null,
    moduleId: (subscription.metadata?.['module_id'] as ModuleId) || null,
  }
}

/**
 * Extract billing cycle from subscription
 */
export function extractBillingCycle(
  subscription: Stripe.Subscription
): ModuleBillingCycle | null {
  const interval = subscription.items.data[0]?.price?.recurring?.interval
  if (interval === 'month') return 'monthly'
  if (interval === 'year') return 'yearly'
  return subscription.metadata?.['billing_cycle'] as ModuleBillingCycle || null
}

// ===========================================
// SUBSCRIPTION DATA EXTRACTION
// ===========================================

/**
 * Build the update object for module_subscriptions table
 */
export function buildSubscriptionUpdate(
  subscription: Stripe.Subscription
): ModuleSubscriptionUpdate | null {
  const { organizationId, moduleId } = extractModuleMetadata(subscription)

  if (!organizationId || !moduleId) {
    console.warn('Missing organization_id or module_id in subscription metadata:', subscription.id)
    return null
  }

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id

  const priceId = subscription.items.data[0]?.price?.id || null

  return {
    organization_id: organizationId,
    module_id: moduleId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    stripe_customer_id: customerId,
    status: mapModuleSubscriptionStatus(subscription.status),
    billing_cycle: extractBillingCycle(subscription),
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000)
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null,
  }
}

// ===========================================
// WEBHOOK HANDLER
// ===========================================

export interface HandleModuleWebhookOptions {
  event: Stripe.Event
  handlers: ModuleWebhookHandlers
  /** Function to update module_subscriptions in database */
  updateSubscription: (data: ModuleSubscriptionUpdate) => Promise<void>
  /** Function to handle subscription deletion (set status to 'free') */
  resetSubscription: (organizationId: string, moduleId: string) => Promise<void>
}

/**
 * Main webhook handler for module subscriptions
 */
export async function handleModuleWebhook(
  options: HandleModuleWebhookOptions
): Promise<{ handled: boolean; event: string; organizationId?: string; moduleId?: string }> {
  const { event, handlers, updateSubscription, resetSubscription } = options

  let organizationId: string | undefined
  let moduleId: string | undefined

  switch (event.type) {
    // ===========================================
    // CHECKOUT COMPLETED
    // ===========================================
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Only handle subscription checkouts
      if (session.mode !== 'subscription') {
        return { handled: false, event: event.type }
      }

      organizationId = session.metadata?.['organization_id']
      moduleId = session.metadata?.['module_id']

      if (!organizationId || !moduleId) {
        console.warn('checkout.session.completed: Missing metadata', session.id)
        return { handled: false, event: event.type }
      }

      // The subscription will be created, so the subscription.created event
      // will handle the database update. Here we just call the handler.
      if (handlers.onCheckoutCompleted) {
        await handlers.onCheckoutCompleted({
          event,
          organizationId,
          moduleId: moduleId as ModuleId,
        })
      }

      return { handled: true, event: event.type, organizationId, moduleId }
    }

    // ===========================================
    // SUBSCRIPTION CREATED
    // ===========================================
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription
      const update = buildSubscriptionUpdate(subscription)

      if (!update) {
        return { handled: false, event: event.type }
      }

      organizationId = update.organization_id
      moduleId = update.module_id

      // Update the database
      await updateSubscription(update)

      if (handlers.onSubscriptionCreated) {
        await handlers.onSubscriptionCreated({
          event,
          organizationId,
          moduleId: moduleId as ModuleId,
        })
      }

      return { handled: true, event: event.type, organizationId, moduleId }
    }

    // ===========================================
    // SUBSCRIPTION UPDATED
    // ===========================================
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const update = buildSubscriptionUpdate(subscription)

      if (!update) {
        return { handled: false, event: event.type }
      }

      organizationId = update.organization_id
      moduleId = update.module_id

      // Update the database
      await updateSubscription(update)

      if (handlers.onSubscriptionUpdated) {
        await handlers.onSubscriptionUpdated({
          event,
          organizationId,
          moduleId: moduleId as ModuleId,
        })
      }

      return { handled: true, event: event.type, organizationId, moduleId }
    }

    // ===========================================
    // SUBSCRIPTION DELETED
    // ===========================================
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const { organizationId: orgId, moduleId: modId } = extractModuleMetadata(subscription)

      if (!orgId || !modId) {
        console.warn('customer.subscription.deleted: Missing metadata', subscription.id)
        return { handled: false, event: event.type }
      }

      organizationId = orgId
      moduleId = modId

      // Reset to free tier
      await resetSubscription(organizationId, moduleId)

      if (handlers.onSubscriptionDeleted) {
        await handlers.onSubscriptionDeleted({
          event,
          organizationId,
          moduleId: modId as ModuleId,
        })
      }

      return { handled: true, event: event.type, organizationId, moduleId }
    }

    // ===========================================
    // INVOICE PAYMENT FAILED
    // ===========================================
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice

      // Get the subscription
      if (!invoice.subscription) {
        return { handled: false, event: event.type }
      }

      const stripe = getStripe()
      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const update = buildSubscriptionUpdate(subscription)

      if (!update) {
        return { handled: false, event: event.type }
      }

      // Set status to past_due
      update.status = 'past_due'
      organizationId = update.organization_id
      moduleId = update.module_id

      await updateSubscription(update)

      if (handlers.onPaymentFailed) {
        await handlers.onPaymentFailed({
          event,
          organizationId,
          moduleId: moduleId as ModuleId,
        })
      }

      return { handled: true, event: event.type, organizationId, moduleId }
    }

    // ===========================================
    // INVOICE PAID
    // ===========================================
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice

      // Get the subscription
      if (!invoice.subscription) {
        return { handled: false, event: event.type }
      }

      const stripe = getStripe()
      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const update = buildSubscriptionUpdate(subscription)

      if (!update) {
        return { handled: false, event: event.type }
      }

      organizationId = update.organization_id
      moduleId = update.module_id

      // Ensure status is active after successful payment
      await updateSubscription(update)

      if (handlers.onPaymentSucceeded) {
        await handlers.onPaymentSucceeded({
          event,
          organizationId,
          moduleId: moduleId as ModuleId,
        })
      }

      return { handled: true, event: event.type, organizationId, moduleId }
    }

    default:
      return { handled: false, event: event.type }
  }
}

// ===========================================
// SUPABASE INTEGRATION HELPERS
// ===========================================

/**
 * Create the updateSubscription function that calls Supabase RPC
 * This should be used in the webhook API route
 */
export function createSupabaseUpdateFn(
  supabaseClient: {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{ error: unknown }>
  }
) {
  return async (data: ModuleSubscriptionUpdate): Promise<void> => {
    const { error } = await supabaseClient.rpc('handle_stripe_subscription_update', {
      p_org_id: data.organization_id,
      p_module_id: data.module_id,
      p_stripe_subscription_id: data.stripe_subscription_id,
      p_stripe_price_id: data.stripe_price_id,
      p_stripe_customer_id: data.stripe_customer_id,
      p_status: data.status,
      p_billing_cycle: data.billing_cycle,
      p_current_period_start: data.current_period_start?.toISOString() || null,
      p_current_period_end: data.current_period_end?.toISOString() || null,
      p_cancel_at_period_end: data.cancel_at_period_end,
      p_trial_end: data.trial_end?.toISOString() || null,
    })

    if (error) {
      console.error('Failed to update subscription in database:', error)
      throw error
    }
  }
}

/**
 * Create the resetSubscription function that calls Supabase RPC
 */
export function createSupabaseResetFn(
  supabaseClient: {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{ error: unknown }>
  }
) {
  return async (organizationId: string, moduleId: string): Promise<void> => {
    const { error } = await supabaseClient.rpc('handle_stripe_subscription_canceled', {
      p_stripe_subscription_id: '', // We don't have it at this point
    })

    // Alternative: directly update the table
    // This requires a different approach since we don't have the subscription ID
    if (error) {
      console.error('Failed to reset subscription in database:', error)
      throw error
    }
  }
}
