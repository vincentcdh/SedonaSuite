import type Stripe from 'stripe'
import { getStripe } from './stripe'
import { getPriceId, type PlanId, type BillingInterval } from './plans'

// ===========================================
// CHECKOUT SESSION
// ===========================================

export interface CreateCheckoutSessionOptions {
  organizationId: string
  planId: PlanId
  interval: BillingInterval
  customerId?: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(
  options: CreateCheckoutSessionOptions
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()

  const priceId = getPriceId(options.planId, options.interval)
  if (!priceId) {
    throw new Error(`No price found for plan ${options.planId} with interval ${options.interval}`)
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: {
      organizationId: options.organizationId,
      planId: options.planId,
      interval: options.interval,
      ...options.metadata,
    },
    subscription_data: {
      metadata: {
        organizationId: options.organizationId,
        planId: options.planId,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: {
      enabled: true,
    },
    locale: 'fr',
  }

  // Use existing customer or email for new customer
  if (options.customerId) {
    sessionParams.customer = options.customerId
  } else if (options.customerEmail) {
    sessionParams.customer_email = options.customerEmail
  }

  const session = await stripe.checkout.sessions.create(sessionParams)
  return session
}

// ===========================================
// CUSTOMER PORTAL
// ===========================================

export interface CreatePortalSessionOptions {
  customerId: string
  returnUrl: string
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(
  options: CreatePortalSessionOptions
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe()

  const session = await stripe.billingPortal.sessions.create({
    customer: options.customerId,
    return_url: options.returnUrl,
    locale: 'fr',
  })

  return session
}

// ===========================================
// CUSTOMER MANAGEMENT
// ===========================================

export interface CreateCustomerOptions {
  email: string
  name?: string
  organizationId: string
  metadata?: Record<string, string>
}

/**
 * Create a Stripe Customer
 */
export async function createCustomer(
  options: CreateCustomerOptions
): Promise<Stripe.Customer> {
  const stripe = getStripe()

  const customer = await stripe.customers.create({
    email: options.email,
    name: options.name,
    metadata: {
      organizationId: options.organizationId,
      ...options.metadata,
    },
    preferred_locales: ['fr'],
  })

  return customer
}

/**
 * Get a Stripe Customer by ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  const stripe = getStripe()

  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return null
    return customer as Stripe.Customer
  } catch {
    return null
  }
}

/**
 * Update a Stripe Customer
 */
export async function updateCustomer(
  customerId: string,
  data: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  const stripe = getStripe()
  return stripe.customers.update(customerId, data)
}

// ===========================================
// SUBSCRIPTION MANAGEMENT
// ===========================================

/**
 * Get active subscription for a customer
 */
export async function getActiveSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe()

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  })

  return subscriptions.data[0] || null
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  }

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

/**
 * Change subscription plan
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const itemId = subscription.items.data[0]?.id

  if (!itemId) {
    throw new Error('Subscription has no items')
  }

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: itemId,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}
