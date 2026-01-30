import type Stripe from 'stripe'
import { getStripe } from './stripe'
import type { PlanId } from './plans'

// ===========================================
// WEBHOOK TYPES
// ===========================================

export interface WebhookHandlerContext {
  event: Stripe.Event
  organizationId: string | null
}

export type WebhookHandler = (ctx: WebhookHandlerContext) => Promise<void>

export interface WebhookHandlers {
  onCheckoutCompleted?: (session: Stripe.Checkout.Session, ctx: WebhookHandlerContext) => Promise<void>
  onSubscriptionCreated?: (subscription: Stripe.Subscription, ctx: WebhookHandlerContext) => Promise<void>
  onSubscriptionUpdated?: (subscription: Stripe.Subscription, ctx: WebhookHandlerContext) => Promise<void>
  onSubscriptionDeleted?: (subscription: Stripe.Subscription, ctx: WebhookHandlerContext) => Promise<void>
  onInvoicePaid?: (invoice: Stripe.Invoice, ctx: WebhookHandlerContext) => Promise<void>
  onInvoicePaymentFailed?: (invoice: Stripe.Invoice, ctx: WebhookHandlerContext) => Promise<void>
  onCustomerUpdated?: (customer: Stripe.Customer, ctx: WebhookHandlerContext) => Promise<void>
}

// ===========================================
// WEBHOOK VERIFICATION
// ===========================================

/**
 * Verify and construct webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

// ===========================================
// WEBHOOK HANDLER
// ===========================================

/**
 * Process a Stripe webhook event
 */
export async function handleWebhook(
  event: Stripe.Event,
  handlers: WebhookHandlers
): Promise<void> {
  // Extract organization ID from metadata
  const getOrgId = (obj: { metadata?: Record<string, string> | null }): string | null => {
    return obj.metadata?.['organizationId'] || null
  }

  const ctx: WebhookHandlerContext = {
    event,
    organizationId: null,
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      ctx.organizationId = session.metadata?.['organizationId'] || null
      await handlers.onCheckoutCompleted?.(session, ctx)
      break
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription
      ctx.organizationId = getOrgId(subscription)
      await handlers.onSubscriptionCreated?.(subscription, ctx)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      ctx.organizationId = getOrgId(subscription)
      await handlers.onSubscriptionUpdated?.(subscription, ctx)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      ctx.organizationId = getOrgId(subscription)
      await handlers.onSubscriptionDeleted?.(subscription, ctx)
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      ctx.organizationId = invoice.subscription_details?.metadata?.['organizationId'] || null
      await handlers.onInvoicePaid?.(invoice, ctx)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      ctx.organizationId = invoice.subscription_details?.metadata?.['organizationId'] || null
      await handlers.onInvoicePaymentFailed?.(invoice, ctx)
      break
    }

    case 'customer.updated': {
      const customer = event.data.object as Stripe.Customer
      ctx.organizationId = getOrgId(customer)
      await handlers.onCustomerUpdated?.(customer, ctx)
      break
    }

    default:
      console.log(`[Billing] Unhandled webhook event: ${event.type}`)
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Map Stripe subscription status to our status
 */
export function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'canceled':
    case 'unpaid':
      return 'canceled'
    case 'past_due':
      return 'past_due'
    case 'trialing':
      return 'trialing'
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete'
    case 'paused':
      return 'canceled'
    default:
      return 'incomplete'
  }
}

/**
 * Extract plan ID from subscription metadata
 */
export function extractPlanId(subscription: Stripe.Subscription): PlanId {
  const planId = subscription.metadata?.['planId'] as PlanId | undefined
  return planId || 'FREE'
}

/**
 * Get subscription period dates
 */
export function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  start: Date
  end: Date
} {
  return {
    start: new Date(subscription.current_period_start * 1000),
    end: new Date(subscription.current_period_end * 1000),
  }
}
